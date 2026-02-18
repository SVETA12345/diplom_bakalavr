import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { attemptsApi } from '../../utils/attemptsApi';
import { testsApi } from '../../utils/testsApi';
import { questionsApi } from '../../utils/questionsApi';
import {
  Container,
  Paper,
  Typography,
  Button,
  Box,
  Card,
  CardContent,
  LinearProgress,
  Chip,
  Divider,
  IconButton,
  Collapse,
  Grid
} from '@material-ui/core';
import {
    CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Assignment as AssignmentIcon
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

import { useStyles } from './TestResults.styles';
import { AnswerRenderer } from './AnswerRenderer';
import { CorrectAnswerRenderer } from './CorrectAnswerRenderer';
import { formatTime, formatDate, getAnswerForQuestion } from './TestResults.utils';
import { StatisticsCards } from '../../components/StaticCards/StatisticsCards';
import { QuestionNavigation } from './QuestionNavigation';



const TestResults = () => {
  const classes = useStyles();
  const { attemptId } = useParams();
  const navigate = useNavigate();
  const [testId, setTestId] = useState(null)
  const [attempt, setAttempt] = useState(null);
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  useEffect(() => {
    fetchResults();
  }, [attemptId]);

  const fetchResults = async () => {
      setLoading(true);
      
      // Получаем последнюю попытку текущего пользователя
      attemptsApi.getAttemptById(attemptId).then((attempt)=>{
        setAttempt(attempt);
        setLoading(false);
        setTestId(attempt.testId)
        testsApi.getTestById(attempt.testId).then((testData) =>{
            setTest(testData);
        }).catch(err => {
            console.log(err)
        })
        questionsApi.getQuestions(attempt.testId).then((questionsData) =>{
            const sortedQuestions = questionsData.sort((a, b) => a.order - b.order);
            setQuestions(sortedQuestions);
            // Инициализируем состояние для сворачивания/разворачивания
            const expanded = {};
            sortedQuestions.forEach(q => {
                expanded[q._id] = false;
            });
            setExpandedQuestions(expanded);
        }).catch(err=>{
            console.log(err)
        })
      }).catch((err) => {
        console.log(err)
      })
      
  };

  const handleToggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleNavigateToQuestion = (index) => {
    setCurrentQuestionIndex(index);
    // Прокрутка к вопросу
    const element = document.getElementById(`question-${questions[index]._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };





  if (loading) {
    return (
      <Container maxWidth="lg">
        <LinearProgress />
        <Typography align="center" style={{ marginTop: '20px' }}>
          Загрузка результатов...
        </Typography>
      </Container>
    );
  }

  if (!attempt || !test || !questions.length) {
    return (
      <Container maxWidth="lg">
        <Paper className={classes.root}>
          <Alert severity="error">
            Результаты не найдены. Попробуйте пройти тест еще раз.
          </Alert>
          <Box mt={3} textAlign="center">
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/test_take/${testId}`)}
            >
              Пройти тест
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Paper className={classes.root}>
        {/* Заголовок с результатами */}
        <Box className={classes.header}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h4" gutterBottom>
              Результаты теста
            </Typography>
            <Chip
              icon={<AssignmentIcon />}
              label={`Попытка #${attempt.attemptNumber || 1}`}
              color="primary"
              variant="outlined"
            />
          </Box>
          
          <Typography variant="h5" color="textSecondary" gutterBottom>
            {test.name}
          </Typography>
        </Box>

        {/* Информация о попытке */}
        <Paper variant="outlined" className={classes.attemptInfo}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Начало теста
              </Typography>
              <Typography variant="body1">
                {formatDate(attempt.startedAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Завершение
              </Typography>
              <Typography variant="body1">
                {formatDate(attempt.finishedAt)}
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="body2" color="textSecondary">
                Затраченное время
              </Typography>
              <Typography variant="body1">
                {formatTime(attempt.totalTimeSpent)}
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {/* Статистика и результаты */}
        <StatisticsCards 
          attempt={attempt} 
          test={test} 
          questions={questions} 
          classes={classes} 
        />

        {/* Навигация по вопросам */}
        <QuestionNavigation 
          questions={questions} 
          getAnswerForQuestion={(questionId) => getAnswerForQuestion(attempt, questionId)}
          classes={classes} 
        />

        <Divider style={{ margin: '20px 0' }} />

        {/* Детальные результаты по вопросам */}
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Детализация ответов
        </Typography>

        {questions.map((question, index) => {
          const answer = getAnswerForQuestion(attempt, question._id);
          const isCorrect = answer?.isCorrect;
          const isExpanded = expandedQuestions[question._id] || false;

          return (
            <Card
              key={question._id}
              id={`question-${question._id}`}
              className={`${classes.questionCard} ${
                isCorrect ? classes.questionCardCorrect : classes.questionCardIncorrect
              }`}
            >
              <CardContent>
                <Box className={classes.questionHeader}>
                  <Box display="flex" alignItems="center" flexWrap="wrap">
                    <Typography variant="h6">
                      Вопрос {index + 1}
                    </Typography>
                    {isCorrect !== undefined && (
                      <Chip
                        size="small"
                        icon={isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
                        label={isCorrect ? 'Верно' : 'Неверно'}
                        style={{ marginLeft: '10px' }}
                        color={isCorrect ? 'primary' : 'secondary'}
                      />
                    )}
                    <Chip
                      size="small"
                      label={`${answer?.awardedPoints || 0}/${answer?.maxPoints || 0} баллов`}
                      className={classes.pointsChip}
                      variant="outlined"
                    />
                  </Box>
                  <IconButton
                    onClick={() => handleToggleExpand(question._id)}
                    className={classes.expandButton}
                  >
                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  </IconButton>
                </Box>

                <Typography variant="body1" paragraph>
                  {question.text}
                </Typography>

                <Box className={classes.userAnswer}>
                  <AnswerRenderer question={question} answer={answer} classes={classes} />
                </Box>

                

                {!question.showCorrectAnswers && !test.showCorrectAnswers && (
                  <Alert severity="info" style={{ marginTop: '10px' }}>
                    Правильные ответы скрыты преподавателем
                  </Alert>
                )}
              </CardContent>
            </Card>
          );
        })}

        {/* Кнопки действий */}
        <Box className={classes.navigation}>
          <Box>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate(`/test_take/${testId}`)}
              style={{ marginRight: '10px' }}
            >
              Пройти заново
            </Button>
            <Button
              variant="contained"
              onClick={() => window.print()}
            >
              Распечатать
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default TestResults;