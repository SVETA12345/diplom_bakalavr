import React, { useState, useEffect } from 'react';
import { attemptsApi } from '../../utils/attemptsApi';
import {
  Container,
  Paper,
  Typography,
  Button,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  FormGroup,
  LinearProgress,
  Box,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@material-ui/core';
import ModalStatus from '../../components/ModalStatus/ModalStatus';
import { Alert } from "@material-ui/lab";
import { useStyles } from './styles';
import { useParams, useNavigate } from 'react-router-dom';
import { testsApi } from '../../utils/testsApi';
import { questionsApi } from '../../utils/questionsApi';


const QuestionsStudent = () => {
  const classes = useStyles();
  const { testId } = useParams();
  const navigate = useNavigate();
  const [attemptId, setAttemptId] = useState(null)
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [startedAt, setStartedAt] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [questionErrors, setQuestionErrors] = useState({});
  const [modal, setModal] = useState({
    titleDialog: '',
    openDialog: false,
    dialogMessage:''
  })

  // Загрузка теста и вопросов
  useEffect(() => {
    fetchTestData();
    fetchQuestions();
  }, [testId]);

  // Таймер
  useEffect(() => {
    if (!test || !test.duration || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitTest();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, test]);

  const fetchTestData = async () => {
    testsApi.getTestById(testId).then((data) => {
      setTest(data);
      setStartedAt(new Date());
      if (data.duration > 0) {
        setTimeLeft(data.duration * 60);
      }
    }).catch(err => {
      console.log(err);
      navigate(`/test_take/${testId}`);
    });
  };

  const fetchQuestions = async () => {
    questionsApi.getQuestions(testId).then(data => {
      const sortedQuestions = data.sort((a, b) => a.order - b.order);
      setQuestions(sortedQuestions);
      // Инициализируем ошибки для всех вопросов
      const initialErrors = {};
      sortedQuestions.forEach(q => {
        initialErrors[q._id] = false;
      });
      setQuestionErrors(initialErrors);
    })
    .catch(err => console.log(err));
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
    
    // Сбрасываем ошибку при ответе на вопрос
    if (questionErrors[questionId]) {
      setQuestionErrors(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const handleMultipleChoiceChange = (questionId, optionIndex, checked) => {
    const currentAnswers = answers[questionId] || [];
    let newAnswers;
    
    if (checked) {
      newAnswers = [...currentAnswers, optionIndex];
    } else {
      newAnswers = currentAnswers.filter(idx => idx !== optionIndex);
    }
    
    handleAnswerChange(questionId, newAnswers);
  };

  const handleNextQuestion = () => {
    // Проверяем, отвечен ли текущий вопрос
    const currentQuestionId = questions[currentQuestionIndex]._id;
    if (!isQuestionAnswered(currentQuestionId)) {
      setQuestionErrors(prev => ({
        ...prev,
        [currentQuestionId]: true
      }));
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    // Проверяем, отвечен ли текущий вопрос перед переходом назад
    const currentQuestionId = questions[currentQuestionIndex]._id;
    if (!isQuestionAnswered(currentQuestionId)) {
      setQuestionErrors(prev => ({
        ...prev,
        [currentQuestionId]: true
      }));
      return;
    }
    
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    if (answer === undefined || answer === null) return false;
    
    // Проверяем тип вопроса
    const question = questions.find(q => q._id === questionId);
    if (!question) return false;
    
    switch (question.type) {
      case 'single':
        return answer !== '';
      case 'multiple':
        return Array.isArray(answer) && answer.length > 0;
      case 'text':
        return typeof answer === 'string' && answer.trim() !== '';
      default:
        return false;
    }
  };

  const checkAllQuestionsAnswered = () => {
    const unanswered = questions.filter(q => !isQuestionAnswered(q._id));
    return unanswered.length === 0;
  };

  const getUnansweredQuestions = () => {
    return questions.filter(q => !isQuestionAnswered(q._id));
  };

  const isNumericString = (str) => {
    return !isNaN(parseFloat(str)) && !isNaN(Number(str));
  };

  const handleSubmitTest = async () => {
    // Проверяем все ли вопросы отвечены
    const unanswered = getUnansweredQuestions();
    
    if (unanswered.length > 0) {
      // Помечаем все неотвеченные вопросы как ошибочные
      const newErrors = { ...questionErrors };
      unanswered.forEach(q => {
        newErrors[q._id] = true;
      });
      setQuestionErrors(newErrors);
      
      // Показываем предупреждение
      setUnansweredCount(unanswered.length);
      setShowWarning(true);
      
      // Переходим к первому неотвеченному вопросу
      const firstUnansweredIndex = questions.findIndex(q => q._id === unanswered[0]._id);
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    let totalTimeSpent = null;
    if (test.duration !== 0) {
      const totalTime = test.duration * 60;
      totalTimeSpent = totalTime - timeLeft;
    }
    
    let answersData = [];
    for (let key in answers) {
      if (typeof answers[key] === 'string' && isNumericString(answers[key])) {
        answersData = [...answersData, {
          questionId: key,
          userAnswer: Number(answers[key])
        }];
      } else {
        answersData = [...answersData, {
          questionId: key,
          userAnswer: answers[key]
        }];
      }
    }
    
    const dataAttempt = {
      answers: answersData,
      startedAt: startedAt,
      totalTimeSpent: totalTimeSpent
    };
    
    attemptsApi.addAttempt(dataAttempt, testId).then((data) => {
      setIsSubmitting(false);
      setScore(data.submission.percentage);
      setTestCompleted(true);
      setAttemptId(data.submission._id)
    }).catch(err => {
      console.log(err);
      setModal({
         titleDialog: 'Ошибка',
        openDialog: true,
        dialogMessage: err.message
      })
      setIsSubmitting(false);
    });
  };
  const handleCloseDialog = () =>{
    setModal({
         titleDialog: '',
        openDialog: false,
        dialogMessage: ''
      })
  }
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateProgress = () => {
    if (!questions.length) return 0;
    const answeredCount = questions.filter(q => isQuestionAnswered(q._id)).length;
    return (answeredCount / questions.length) * 100;
  };

  const renderQuestion = (question) => {
    const isAnswered = isQuestionAnswered(question._id);
    const hasError = questionErrors[question._id] && !isAnswered;

    switch (question.type) {
      case 'single':
        return (
          <FormControl component="fieldset" required error={hasError}>
            <RadioGroup
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            >
              {question.options.sort((a, b) => a.order - b.order).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio required />}
                  label={option.text}
                />
              ))}
            </RadioGroup>
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Это обязательный вопрос
              </Typography>
            )}
          </FormControl>
        );

      case 'multiple':
        return (
          <FormControl component="fieldset" required error={hasError}>
            <FormGroup>
              {question.options.sort((a, b) => a.order - b.order).map((option, index) => (
                <FormControlLabel
                  key={index}
                  control={
                    <Checkbox
                      checked={(answers[question._id] || []).includes(index)}
                      onChange={(e) => handleMultipleChoiceChange(
                        question._id,
                        index,
                        e.target.checked
                      )}
                    />
                  }
                  label={option.text}
                />
              ))}
            </FormGroup>
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Выберите хотя бы один вариант
              </Typography>
            )}
          </FormControl>
        );

      case 'text':
        return (
          <div>
            <TextField
              fullWidth
              multiline
              rows={4}
              variant="outlined"
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
              placeholder="Введите ваш ответ"
              required
              error={hasError}
              helperText={hasError ? "* Это обязательный вопрос" : ""}
            />
          </div>
        );

      default:
        return null;
    }
  };

  if (testCompleted) {
    return (
      <Container maxWidth="md">
        <Paper className={classes.root}>
          <Typography variant="h4" gutterBottom>
            Тест завершен!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Ваш результат: {score}%
          </Typography>
          <Typography variant="body1" gutterBottom>
            {score >= test.passingScore ? 'Вы успешно прошли тест!' : 'К сожалению, вы не набрали проходной балл'}
          </Typography>
          {test.showCorrectAnswers && (
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/test-results/${attemptId}`)}
            >
              Посмотреть правильные ответы
            </Button>
          )}
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            style={{ marginLeft: '10px' }}
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!test || !questions.length) {
    return (
      <Container maxWidth="md">
        <LinearProgress />
        <Typography align="center" style={{ marginTop: '20px' }}>
          Загрузка теста...
        </Typography>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = calculateProgress();
  const allAnswered = checkAllQuestionsAnswered();

  return (
    <Container maxWidth="lg">
      {/* Диалог предупреждения */}
      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>Не все вопросы отвечены</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы не ответили на {unansweredCount} вопрос(ов). 
            Пожалуйста, ответьте на все вопросы перед отправкой теста.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)} color="primary">
            Продолжить тест
          </Button>
        </DialogActions>
      </Dialog>
      <ModalStatus titleDialog={modal.titleDialog} openDialog={modal.openDialog} handleCloseDialog={handleCloseDialog} dialogMessage={modal.dialogMessage} /> 
      {/* Таймер и прогресс */}
      {test.duration > 0 && (
        <Paper className={classes.timer}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {test.duration !== 0 && (
              <Typography variant="h6">
                Оставшееся время: {formatTime(timeLeft)}
              </Typography>
            )}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </Typography>
              {!allAnswered && (
                <Chip 
                  label={`Осталось: ${getUnansweredQuestions().length}`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Paper>
      )}

      <Paper className={classes.root}>
        {/* Заголовок теста */}
        <Typography variant="h4" gutterBottom>
          {test.name}
        </Typography>
        {test.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {test.description}
          </Typography>
        )}

        {/* Прогресс ответов */}
        <Box className={classes.progressContainer}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Прогресс ответов
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Math.round(progress)}% ({questions.filter(q => isQuestionAnswered(q._id)).length}/{questions.length})
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {/* Карточка вопроса */}
        <Card className={classes.questionCard}>
          <CardContent>
            <Box className={classes.questionHeader}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">
                  Вопрос {currentQuestion.order || currentQuestionIndex + 1}
                </Typography>
                <Typography variant="body1" className={classes.requiredIndicator}>
                  *
                </Typography>
              </Box>
              <Typography variant="body2" color="textSecondary">
                Баллы: {currentQuestion.points}
              </Typography>
            </Box>

            <Typography variant="body1" paragraph>
              {currentQuestion.text}
            </Typography>

            <Box className={classes.optionsContainer}>
              {renderQuestion(currentQuestion)}
            </Box>
          </CardContent>
        </Card>

        {/* Навигация */}
        <Box className={classes.navigation}>
          <Button
            variant="outlined"
            onClick={handlePreviousQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Назад
          </Button>

          <Box>
            {currentQuestionIndex < questions.length - 1 ? (
              <Button
                variant="contained"
                color="primary"
                onClick={handleNextQuestion}
              >
                Следующий вопрос
              </Button>
            ) : (
              <Button
                variant="contained"
                color={allAnswered ? "secondary" : "default"}
                onClick={handleSubmitTest}
                disabled={isSubmitting || (test.duration>0 && timeLeft ===0)}
              >
                {isSubmitting ? 'Отправка...' : 'Завершить тест'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Вопросы с ответами (мини-навигация) */}
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            Вопросы (красная точка - не отвечен):
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {questions.map((q, index) => (
              <Button
                key={q._id}
                variant={currentQuestionIndex === index ? "contained" : "outlined"}
                color={isQuestionAnswered(q._id) ? "primary" : "default"}
                size="small"
                onClick={() => setCurrentQuestionIndex(index)}
                className={classes.questionNavButton}
              >
                {index + 1}
                {!isQuestionAnswered(q._id) && (
                  <span className={classes.unansweredDot}></span>
                )}
              </Button>
            ))}
          </Box>
        </Box>

        {/* Предупреждение о времени */}
        {timeLeft && timeLeft < 300 && timeLeft > 0 && (
          <Alert severity="warning" style={{ marginTop: '20px' }}>
            Осталось меньше 5 минут!
          </Alert>
        )}
        
        {/* Предупреждение о неотвеченных вопросах */}
        {!allAnswered && (
          <Alert severity="info" style={{ marginTop: '20px' }}>
            Все вопросы обязательны для ответа. Неотвеченные вопросы отмечены красной точкой.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default QuestionsStudent;