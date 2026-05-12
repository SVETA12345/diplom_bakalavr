const ForbiddenError = require('../errors/forbidden-error');
const Survey = require('../models/survey');
const SurveyAttempt = require('../models/surveyAttempt');
const SurveyQuestion = require('../models/surveyQuestion');
const User = require('../models/user');
const httpConstants = require('http2').constants;
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');

// Возвращаем одну попытку анкетирования по ID
const getSurveyAttempt = (req, res, next) => {
  const id = req.params.attemptId;
  SurveyAttempt.findById(id)
    .then((attempt) => res.status(httpConstants.HTTP_STATUS_OK).send(attempt))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('попытка анкетирования не найдена'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Возвращаем все попытки анкетирования по ID анкеты
const getSurveyAttemptsBySurvey = (req, res, next) => {
  const surveyId = req.params.surveyId;
  SurveyAttempt.find({ surveyId })
    .then((attempts) => res.status(httpConstants.HTTP_STATUS_OK).send(attempts))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('анкета не найдена'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Обновление попытки анкетирования (например, если пользователь меняет ответы)
const updateSurveyAttemptById = (req, res, next) => {
  const attemptId = req.body._id;
  SurveyAttempt.findByIdAndUpdate(attemptId, req.body, { new: true, runValidators: true })
    .orFail()
    .then((attempt) => res.send(attempt))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('попытка анкетирования не найдена'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Валидация ответа на вопрос анкеты (проверяет соответствие типа)
const validateSurveyAnswer = (userAnswer, questionType) => {
  switch (questionType) {
    case 'text_short':
      return typeof userAnswer === 'string' && userAnswer.trim().length > 0;
    case 'text_long':
      return typeof userAnswer === 'string' && userAnswer.trim().length > 0;
    case 'rating':
    case 'scale':
      const rating = Number(userAnswer);
      return !isNaN(rating) && rating >= 0 && rating <= 10;
    
    case 'boolean':
      return typeof userAnswer === 'boolean';
    
    case 'choice':
      // Один выбранный вариант (должен быть объектом с optionId)
      return userAnswer && typeof userAnswer === 'object' && userAnswer.optionId;
    
    case 'multiple_choice':
      // Массив выбранных вариантов
      return Array.isArray(userAnswer) && userAnswer.length > 0;
    
    default:
      return false;
  }
};

// Форматирование ответа для сохранения в базу
const formatAnswerForStorage = (answer, questionType) => {
  const baseAnswer = {
    questionId: answer.questionId,
    questionType,
  };

  switch (questionType) {
    case 'text':
      baseAnswer.textAnswer = answer.userAnswer;
      baseAnswer.userAnswer = answer.userAnswer;
      break;
    
    case 'rating':
    case 'scale':
      baseAnswer.ratingValue = Number(answer.userAnswer);
      baseAnswer.userAnswer = Number(answer.userAnswer);
      break;
    
    case 'boolean':
      baseAnswer.userAnswer = answer.userAnswer;
      break;
    
    case 'choice':
      baseAnswer.selectedOptions = [{
        optionId: answer.userAnswer.optionId,
        optionText: answer.userAnswer.optionText || '',
      }];
      baseAnswer.userAnswer = answer.userAnswer.optionId;
      break;
    
    case 'multiple_choice':
      baseAnswer.selectedOptions = answer.userAnswer.map(opt => ({
        optionId: opt.optionId,
        optionText: opt.optionText || '',
      }));
      baseAnswer.userAnswer = answer.userAnswer.map(opt => opt.optionId);
      break;
    
    default:
      baseAnswer.userAnswer = answer.userAnswer;
  }

  if (answer.comment) {
    baseAnswer.comment = answer.comment;
  }

  return baseAnswer;
};

// Создание новой попытки анкетирования
const createSurveyAttempt = (req, res, next) => {
  const { answers, startedAt, totalTimeSpent, sessionId, isAnonymous } = req.body;
  const { surveyId } = req.params;
  
  let userId = null;
  
  // Если анкета НЕ анонимная — берем пользователя из аутентификации
  if (!isAnonymous) {
    userId = req.user._id;
  }
  
  const processCreation = (studentId) => {
    return createSurveySubmission(studentId, surveyId, answers, startedAt, totalTimeSpent, sessionId, isAnonymous);
  };
  
  // Если есть userId, проверяем пользователя
  if (userId) {
    User.findById(userId)
      .orFail()
      .then((user) => {
        return processCreation(user._id);
      })
      .then((createdAttempt) => {
        res.status(201).send({
          message: 'Попытка анкетирования сохранена',
          attempt: createdAttempt
        });
      })
      .catch((err) => {
        if (err.name === 'DocumentNotFoundError') {
          next(new NotFoundError('пользователь не найден'));
        } else if (err.name === 'ValidationError' || err.name === 'CastError') {
          next(new BadRequestError('переданы некорректные данные'));
        } else {
          next(err);
        }
      });
  } else {
    // Анонимное анкетирование — без проверки пользователя
    processCreation(null)
      .then((createdAttempt) => {
        res.status(201).send({
          message: 'Попытка анкетирования сохранена',
          attempt: createdAttempt
        });
      })
      .catch(next);
  }
};

// Основная логика создания попытки анкетирования (без подсчёта баллов)
const createSurveySubmission = (studentId, surveyId, answers, startedAt, totalTimeSpent, sessionId, isAnonymous) => {
  
  // 1. Находим анкету
  return Survey.findById(surveyId)
    .orFail()
    .then((surveyDoc) => {
          
          // 2. Находим все вопросы
          const questionIds = answers.map(a => a.questionId);
          return SurveyQuestion.find({ _id: { $in: questionIds } });
        })
    .then((questionsDocs) => {
        questions = questionsDocs;
      console.log('questions', questions)
      // 2. Создаём мапу вопросов анкеты для быстрого доступа
      const questionMap = {};
      questions.forEach(q => {
        questionMap[q._id.toString()] = q;
      });
      
      
      
      // 4. Определяем номер ответа
      const filter = studentId 
        ? { studentId, surveyId }
        : { sessionId, surveyId, studentId: null };
      
      return SurveyAttempt.countDocuments(filter);
    })
    .then((count) => {
      const responseNumber = count + 1; 
      // 6. Формируем данные для создания
      const startedAtDate = startedAt ? new Date(startedAt) : new Date();
      const attemptData = {
        responseNumber,
        surveyId,
        answers: answers,
        startedAt: startedAtDate,
        isCompleted: true,
        submittedAt: new Date(),
      };
      
      // Добавляем данные о студенте (если не анонимно)
      if (studentId) {
        attemptData.studentId = studentId;
      }
      
      // Добавляем sessionId (анонимная сессия)
      if (sessionId) {
        attemptData.sessionId = sessionId;
      }
      
      // Добавляем время прохождения
      if (totalTimeSpent !== undefined) {
        attemptData.totalTimeSpent = totalTimeSpent;
        attemptData.finishedAt = new Date(startedAtDate.getTime() + totalTimeSpent * 1000);
      }
      
      // 7. Создаём попытку
      return SurveyAttempt.create(attemptData);
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Анкета не найдена');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Некорректные данные при создании попытки анкетирования');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный ID анкеты');
      }
      throw err;
    });
};

// Получить попытки конкретного пользователя по анкете
const getMySurveyAttempts = (req, res, next) => {
  const userId = req.user._id;
  const { surveyId } = req.params;
  
  const filter = { studentId: userId };
  if (surveyId) {
    filter.surveyId = surveyId;
  }
  
  SurveyAttempt.find(filter)
    .sort({ startedAt: -1 })
    .then((attempts) => res.status(httpConstants.HTTP_STATUS_OK).send(attempts))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

// Получить анонимные попытки по sessionId
const getAnonymousSurveyAttempts = (req, res, next) => {
  const { sessionId, surveyId } = req.params;
  
  const filter = { sessionId };
  if (surveyId) {
    filter.surveyId = surveyId;
  }
  
  SurveyAttempt.find(filter)
    .sort({ startedAt: -1 })
    .then((attempts) => res.status(httpConstants.HTTP_STATUS_OK).send(attempts))
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};

module.exports = {
  createSurveyAttempt,
  getSurveyAttempt,
  getSurveyAttemptsBySurvey,
  updateSurveyAttemptById,
  getMySurveyAttempts,
  getAnonymousSurveyAttempts,
};