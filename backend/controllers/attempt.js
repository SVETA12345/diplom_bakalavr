const ForbiddenError = require('../errors/forbidden-error');
const Question = require('../models/question');
const Attempt = require('../models/attempt')
const Test = require('../models/test')
const User = require('../models/user')
const httpConstants = require('http2').constants;
const NotFoundError = require('../errors/not-found-err');
const BadRequestError = require('../errors/bad-request-error');

//возвращаем все вопросы теста
const getAttempt = (req, res, next) => {
  const id = req.params.attemptId;
  Attempt.findById(id)
    .then((attempt) => res.status(httpConstants.HTTP_STATUS_OK).send(attempt))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
//возвращаем все попытки теста
const getAttemptsByTest = (req, res, next) => {
  const testId = req.params.testId;
  Attempt.find({ testId })
    .then((attempts) => res.status(httpConstants.HTTP_STATUS_OK).send(attempts))
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('тест или пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
const updateAttemptById = (req, res, next) => {
  const attemptId = req.body._id;
  Attempt.findByIdAndUpdate(attemptId, req.body, { new: true, runValidators: true })
    .orFail()
    .then((attempt) => res.send(attempt))
    .catch((err) => {
      if (err.code === 11000) {
        next(new ConflictError('Вопрос уже существеут'));
      } else if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('попытка не найдена'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные'));
      } else {
        next(err);
      }
    });
};
// Функция проверки ответа
const gradeAnswer = (userAnswer, question) => {
  switch (question.type) {
    case 'single':
      // userAnswer должен быть Number (индекс)
      const selectedOption = question.options[userAnswer];
      return {
        isCorrect: selectedOption ? selectedOption.isCorrect === true : false
      };
    case 'text':
        return {
            isCorrect: userAnswer === question.correctAnswerText
        }  
    case 'multiple':
      // userAnswer должен быть массивом индексов [Number]
      if (!Array.isArray(userAnswer)) {
        return { isCorrect: false };
      }
      
      const selectedOptions = userAnswer
        .map(idx => question.options[idx])
        .filter(opt => opt !== undefined);
      
      // Все выбранные должны быть правильными
      const allSelectedCorrect = selectedOptions.every(opt => opt.isCorrect === true);
      
      // Все правильные должны быть выбраны
      const allCorrectSelected = question.options
        .every((opt, idx) => !opt.isCorrect || userAnswer.includes(idx));
      return {
        isCorrect: allSelectedCorrect && allCorrectSelected && selectedOptions.length > 0
      };
      
    default:
      return { isCorrect: false };
  }
};

// Функция получения правильного ответа для отображения
const getCorrectAnswerForDisplay = (question) => {
  switch (question.type) {
    case 'single':
      const correctOption = question.options.find(opt => opt.isCorrect === true);
      return correctOption ? correctOption.text : null;
      
    case 'multiple':
      return question.options
        .filter(opt => opt.isCorrect === true)
        .map(opt => opt.text);
        
    case 'text':
      return question.correctAnswerText;
      
    default:
      return null;
  }
};


const createAttempt = (req, res, next) => {
  const { answers, startedAt, totalTimeSpent } = req.body;
  const { testId } = req.params;
  const userId = req.user._id; // Из аутентификации
  User.findById(userId)
  .orFail()
  .then((user)=>{
    console.log('user', user)
    gradeAndCreateSubmission(user, testId, answers, startedAt, totalTimeSpent)
    .then((createdSubmission) => {
      res.status(201).send({
        message: 'Попытка создана и проверена',
        submission: createdSubmission
      });
    })
    .catch(next);
  })
  .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        next(new NotFoundError('пользователь не найден'));
      } else if (err.name === 'ValidationError' || err.name === 'CastError') {
        next(new BadRequestError('переданы некорректные данные в методы создания пользователя'));
      } else {
        next(err);
      }
    });
};

const gradeAndCreateSubmission = (user, testId, answers, startedAt, totalTimeSpent) => {
  let test, questions;
  let totalScore = 0;
  let maxPossibleScore = 0;
  
  // 1. Находим тест
  return Test.findById(testId)
    .orFail()
    .then((testDoc) => {
      test = testDoc;
      
      // 2. Находим все вопросы
      const questionIds = answers.map(a => a.questionId);
      return Question.find({ _id: { $in: questionIds } });
    })
    .then((questionsDocs) => {
      questions = questionsDocs;
      
      // Создаем мапу для быстрого доступа к вопросам
      const questionMap = {};
      questions.forEach(q => questionMap[q._id.toString()] = q);
      
      // 3. Подготавливаем структуру submission
      const processedAnswers = [];
      
      answers.forEach(answer => {
        const question = questionMap[answer.questionId];
        if (!question) {
          throw new BadRequestError(`Вопрос с ID ${answer.questionId} не найден`);
        }
        
        // Вычисляем максимальный балл за тест
        maxPossibleScore += question.points;
        
        // Подготавливаем объект ответа
        const processedAnswer = {
          questionId: answer.questionId,
          userAnswer: answer.userAnswer,
          answeredAtSec: answer.answeredAtSec,
          maxPoints: question.points
        };
        
        // Автопроверка для single/multiple

          const result = gradeAnswer(answer.userAnswer, question);
          processedAnswer.isCorrect = result.isCorrect;
          processedAnswer.awardedPoints = result.isCorrect ? question.points : 0;
          processedAnswer.correctAnswer = getCorrectAnswerForDisplay(question);
          processedAnswer.explanation = question.explanation;
          
          totalScore += processedAnswer.awardedPoints;
        
        processedAnswers.push(processedAnswer);
      });
      
      // 4. Определяем номер попытки
      return Attempt.countDocuments({ studentId:user._id, testId })
        .then((count) => {
          const attemptNumber = count + 1;
          // 5. Проверяем лимит попыток
          if (test.maxAttempts && attemptNumber > test.maxAttempts) {
            throw new ForbiddenError('Превышено максимальное количество попыток')
          }
          
          // 6. Рассчитываем результаты
          const percentage = (totalScore / maxPossibleScore) * 100;
          const isPassed = percentage >= test.passingScore;
          //const status = allGraded ? 'graded' : 'partially_graded';
          // 7. Создаем новую попытку
          const startedAtDate = new Date(startedAt); 
          return Attempt.create({
            studentId: user._id,
            studentName: user.name || '',
            studentSurname: user.surname || '',
            studentGroup: user.group || '',
            testId,
            attemptNumber,
            answers: processedAnswers,
            startedAt : startedAtDate,
            finishedAt: new Date(startedAtDate.getTime() + totalTimeSpent * 1000),
            totalTimeSpent,
            totalScore,
            maxPossibleScore,
            percentage: percentage,
            passed: isPassed,
          });
        });
    })
    .catch((err) => {
      if (err.name === 'DocumentNotFoundError') {
        throw new NotFoundError('Тест не найден');
      } else if (err.name === 'ValidationError') {
        throw new BadRequestError('Некорректные данные при создании попытки');
      } else if (err.name === 'CastError') {
        throw new BadRequestError('Некорректный ID теста');
      }
      throw err;
    });
};
module.exports={
    createAttempt,
    getAttempt,
    getAttemptsByTest,
    updateAttemptById
}