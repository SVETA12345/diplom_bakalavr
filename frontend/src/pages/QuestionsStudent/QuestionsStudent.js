import React, { useState, useEffect } from 'react';
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
  CardContent
} from '@material-ui/core';
import { Alert } from "@material-ui/lab";
import { makeStyles } from '@material-ui/core/styles';
import { useParams, useNavigate } from 'react-router-dom';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
  },
  questionCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing(2),
  },
  optionsContainer: {
    marginTop: theme.spacing(2),
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
  },
  progressContainer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(3),
  },
  timer: {
    position: 'sticky',
    top: 0,
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(2),
    zIndex: 1000,
    boxShadow: theme.shadows[2],
  },
}));

const QuestionsStudent = () => {
  const classes = useStyles();
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [testCompleted, setTestCompleted] = useState(false);
  const [score, setScore] = useState(null);

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
    try {
      const response = await fetch(`/api/tests/${testId}`);
      const data = await response.json();
      setTest(data);
      if (data.duration > 0) {
        setTimeLeft(data.duration * 60); // конвертируем минуты в секунды
      }
    } catch (error) {
      console.error('Error fetching test:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`/api/questions?testId=${testId}`);
      const data = await response.json();
      setQuestions(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error fetching questions:', error);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
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
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleSubmitTest = async () => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/test-submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          answers,
          timeSpent: test.duration > 0 ? (test.duration * 60 - timeLeft) : null,
        }),
      });
      
      const result = await response.json();
      setScore(result.score);
      setTestCompleted(true);
      
      if (test.showCorrectAnswers) {
        // Можно показать правильные ответы
        console.log('Correct answers:', result.correctAnswers);
      }
    } catch (error) {
      console.error('Error submitting test:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateProgress = () => {
    if (!questions.length) return 0;
    const answeredCount = Object.keys(answers).length;
    return (answeredCount / questions.length) * 100;
  };

  const renderQuestion = (question) => {
    switch (question.type) {
      case 'single':
        return (
          <FormControl component="fieldset">
            <RadioGroup
              value={answers[question._id] || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            >
              {question.options.sort((a, b) => a.order - b.order).map((option, index) => (
                <FormControlLabel
                  key={index}
                  value={index.toString()}
                  control={<Radio />}
                  label={option.text}
                />
              ))}
            </RadioGroup>
          </FormControl>
        );

      case 'multiple':
        return (
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
        );

      case 'text':
        return (
          <TextField
            fullWidth
            multiline
            rows={4}
            variant="outlined"
            value={answers[question._id] || ''}
            onChange={(e) => handleAnswerChange(question._id, e.target.value)}
            placeholder="Введите ваш ответ"
          />
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
              onClick={() => navigate(`/test-results/${testId}`)}
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

  return (
    <Container maxWidth="lg">
      {/* Таймер и прогресс */}
      {test.duration > 0 && (
        <Paper className={classes.timer}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Оставшееся время: {formatTime(timeLeft)}
            </Typography>
            <Typography variant="body2">
              Вопрос {currentQuestionIndex + 1} из {questions.length}
            </Typography>
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
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        {/* Карточка вопроса */}
        <Card className={classes.questionCard}>
          <CardContent>
            <Box className={classes.questionHeader}>
              <Typography variant="h6">
                Вопрос {currentQuestion.order || currentQuestionIndex + 1}
              </Typography>
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
                color="secondary"
                onClick={handleSubmitTest}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Отправка...' : 'Завершить тест'}
              </Button>
            )}
          </Box>
        </Box>

        {/* Вопросы с ответами (мини-навигация) */}
        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            Вопросы:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {questions.map((q, index) => (
              <Button
                key={q._id}
                variant={currentQuestionIndex === index ? "contained" : "outlined"}
                color={answers[q._id] ? "primary" : "default"}
                size="small"
                onClick={() => setCurrentQuestionIndex(index)}
                style={{ minWidth: '40px' }}
              >
                {index + 1}
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
      </Paper>
    </Container>
  );
};

export default QuestionsStudent;