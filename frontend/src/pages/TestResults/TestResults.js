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
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  TextField,
  FormControl,
  FormGroup,
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
import { makeStyles } from '@material-ui/core/styles';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  header: {
    marginBottom: theme.spacing(4),
    position: 'relative',
  },
  scoreCard: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(3),
    background: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
  scoreValue: {
    fontSize: '3rem',
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
  },
  resultBadge: {
    marginLeft: theme.spacing(2),
    padding: theme.spacing(1, 2),
    fontSize: '1.1rem',
  },
  questionCard: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(3),
    position: 'relative',
    borderLeft: `6px solid ${theme.palette.grey[300]}`,
  },
  questionCardCorrect: {
    borderLeftColor: theme.palette.success.main,
  },
  questionCardIncorrect: {
    borderLeftColor: theme.palette.error.main,
  },
  questionHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
  pointsChip: {
    marginLeft: theme.spacing(1),
  },
  userAnswer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.shape.borderRadius,
  },
  correctAnswer: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.success.light,
    borderRadius: theme.shape.borderRadius,
  },
  explanationBox: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.info.light,
    borderRadius: theme.shape.borderRadius,
    color: theme.palette.info.contrastText,
  },
  expandButton: {
    marginLeft: theme.spacing(1),
  },
  navigation: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  statsGrid: {
    marginBottom: theme.spacing(4),
  },
  statItem: {
    textAlign: 'center',
    padding: theme.spacing(2),
  },
  statValue: {
    fontSize: '2rem',
    fontWeight: 'bold',
    color: theme.palette.primary.main,
  },
  statLabel: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(1),
  },
  progressSection: {
    marginBottom: theme.spacing(3),
  },
  attemptInfo: {
    marginBottom: theme.spacing(3),
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
  },
  correctOption: {
    color: theme.palette.success.main,
    fontWeight: 'bold',
  },
  incorrectOption: {
    color: theme.palette.error.main,
    textDecoration: 'line-through',
  },
  userSelectedOption: {
    backgroundColor: theme.palette.action.selected,
    padding: theme.spacing(0.5, 1),
    borderRadius: theme.shape.borderRadius,
  },
  questionNavButton: {
    minWidth: '40px',
    margin: theme.spacing(0.5),
  },
}));

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
    console.log('syka')
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
      /*
      const attempts = await attemptsApi.getAttemptById(attemptId);
      const lastAttempt = attempts[attempts.length - 1];
      setAttempt(lastAttempt);
      
      // Получаем информацию о тесте
      const testData = await testsApi.getTestById(testId);
      setTest(testData);
      
      // Получаем все вопросы теста
      const questionsData = await questionsApi.getQuestions(testId);
      const sortedQuestions = questionsData.sort((a, b) => a.order - b.order);
      setQuestions(sortedQuestions);
      
      // Инициализируем состояние для сворачивания/разворачивания
      const expanded = {};
      sortedQuestions.forEach(q => {
        expanded[q._id] = false;
      });
      setExpandedQuestions(expanded);
      
    } catch (error) {
      console.error('Error fetching results:', error);
    } finally {
      setLoading(false);
    }
      */
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

  const getAnswerForQuestion = (questionId) => {
    return attempt?.answers?.find(a => a.questionId === questionId);
  };

  const formatTime = (seconds) => {
    if (!seconds) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const renderUserAnswer = (question, answer) => {
    if (!answer) return <Typography color="textSecondary">Нет ответа</Typography>;

    switch (question.type) {
      case 'single':
        const selectedOption = question.options[parseInt(answer.userAnswer)];
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ваш ответ:
            </Typography>
            <RadioGroup value={answer.userAnswer?.toString()}>
              {question.options.sort((a, b) => a.order - b.order).map((option, index) => {
                const isUserSelected = index === parseInt(answer.userAnswer);
                const isCorrect = answer.isCorrect && isUserSelected;
                const isIncorrect = !answer.isCorrect && isUserSelected;
                
                return (
                  <FormControlLabel
                    key={index}
                    value={index.toString()}
                    control={<Radio disabled />}
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography
                          className={
                            isCorrect ? classes.correctOption :
                            isIncorrect ? classes.incorrectOption : ''
                          }
                        >
                          {option.text}
                        </Typography>
                        {option.isCorrect && (
                          <Chip
                            size="small"
                            icon={<CorrectIcon />}
                            label="Правильный ответ"
                            style={{ marginLeft: '10px' }}
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </RadioGroup>
          </Box>
        );

      case 'multiple':
        const userAnswers = Array.isArray(answer.userAnswer) ? answer.userAnswer : [];
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ваш ответ:
            </Typography>
            <FormGroup>
              {question.options.sort((a, b) => a.order - b.order).map((option, index) => {
                const isUserSelected = userAnswers.includes(index);
                const isCorrect = answer.isCorrect && isUserSelected;
                const isIncorrect = !answer.isCorrect && isUserSelected;
                
                return (
                  <FormControlLabel
                    key={index}
                    control={
                      <Checkbox
                        checked={isUserSelected}
                        disabled
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Typography
                          className={
                            isCorrect ? classes.correctOption :
                            isIncorrect ? classes.incorrectOption : ''
                          }
                        >
                          {option.text}
                        </Typography>
                        {option.isCorrect && (
                          <Chip
                            size="small"
                            icon={<CorrectIcon />}
                            label="Правильный ответ"
                            style={{ marginLeft: '10px' }}
                            color="primary"
                          />
                        )}
                      </Box>
                    }
                  />
                );
              })}
            </FormGroup>
          </Box>
        );

      case 'text':
        return (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Ваш ответ:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={answer.userAnswer || ''}
              disabled
              InputProps={{
                className: answer.isCorrect ? classes.correctOption : classes.incorrectOption,
              }}
            />
          </Box>
        );

      default:
        return null;
    }
  };

  const renderCorrectAnswer = (question, answer) => {
    if (!question.showCorrectAnswers && !test?.showCorrectAnswers) return null;
    
    switch (question.type) {
      case 'single':
        const correctOption = question.options.find(opt => opt.isCorrect);
        const correctIndex = question.options.findIndex(opt => opt.isCorrect);
        return (
          <Box className={classes.correctAnswer}>
            <Typography variant="subtitle2" gutterBottom>
              Правильный ответ:
            </Typography>
            <RadioGroup value={correctIndex?.toString()}>
              <FormControlLabel
                value={correctIndex?.toString()}
                control={<Radio disabled />}
                label={
                  <Typography className={classes.correctOption}>
                    {correctOption?.text}
                  </Typography>
                }
              />
            </RadioGroup>
            {answer?.explanation && (
              <Box mt={1}>
                <Typography variant="body2" color="textSecondary">
                  {answer.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'multiple':
        const correctOptions = question.options
          .map((opt, idx) => ({ ...opt, index: idx }))
          .filter(opt => opt.isCorrect);
        return (
          <Box className={classes.correctAnswer}>
            <Typography variant="subtitle2" gutterBottom>
              Правильные ответы:
            </Typography>
            <FormGroup>
              {correctOptions.map((opt, idx) => (
                <FormControlLabel
                  key={idx}
                  control={<Checkbox checked disabled />}
                  label={
                    <Typography className={classes.correctOption}>
                      {opt.text}
                    </Typography>
                  }
                />
              ))}
            </FormGroup>
            {answer?.explanation && (
              <Box mt={1}>
                <Typography variant="body2" color="textSecondary">
                  {answer.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        );

      case 'text':
        return (
          <Box className={classes.correctAnswer}>
            <Typography variant="subtitle2" gutterBottom>
              Правильный ответ:
            </Typography>
            <TextField
              fullWidth
              multiline
              rows={3}
              variant="outlined"
              value={answer?.correctAnswer || 'Ответ не предоставлен'}
              disabled
              InputProps={{
                className: classes.correctOption,
              }}
            />
            {answer?.explanation && (
              <Box mt={1}>
                <Typography variant="body2">
                  {answer.explanation}
                </Typography>
              </Box>
            )}
          </Box>
        );

      default:
        return null;
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

  const currentQuestion = questions[currentQuestionIndex];
  const currentAnswer = getAnswerForQuestion(currentQuestion?._id);
  const correctAnswersCount = attempt.answers?.filter(a => a.isCorrect)?.length || 0;
  const totalQuestions = questions.length;

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

        {/* Карточка с общим результатом */}
        <Card className={classes.scoreCard}>
          <Grid container alignItems="center" justify="space-between">
            <Grid item>
              <Box display="flex" alignItems="center">
                <span className={classes.scoreValue}>
                  {attempt.percentage}%
                </span>
                <Box>
                  <Typography variant="h6">
                    Ваш результат
                  </Typography>
                  <Typography variant="body2">
                    {attempt.totalScore} баллов из {test.maxScore}
                  </Typography>
                </Box>
              </Box>
            </Grid>
            <Grid item>
              <Chip
                label={attempt.passed ? 'ТЕСТ ПРОЙДЕН' : 'ТЕСТ НЕ ПРОЙДЕН'}
                color={attempt.passed ? 'primary' : 'secondary'}
                className={classes.resultBadge}
              />
            </Grid>
          </Grid>
        </Card>

        {/* Статистика */}
        <Grid container spacing={3} className={classes.statsGrid}>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" className={classes.statItem}>
              <Typography className={classes.statValue}>
                {correctAnswersCount}
              </Typography>
              <Typography className={classes.statLabel}>
                Правильных ответов
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" className={classes.statItem}>
              <Typography className={classes.statValue}>
                {totalQuestions - correctAnswersCount}
              </Typography>
              <Typography className={classes.statLabel}>
                Неправильных ответов
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" className={classes.statItem}>
              <Typography className={classes.statValue}>
                {attempt.totalScore || 0}
              </Typography>
              <Typography className={classes.statLabel}>
                Набрано баллов
              </Typography>
            </Paper>
          </Grid>
          <Grid item xs={12} md={3}>
            <Paper variant="outlined" className={classes.statItem}>
              <Typography className={classes.statValue}>
                {test.passingScore}%
              </Typography>
              <Typography className={classes.statLabel}>
                Проходной балл
              </Typography>
            </Paper>
          </Grid>
        </Grid>

        {/* Навигация по вопросам */}
        <Box className={classes.progressSection}>
          <Typography variant="h6" gutterBottom>
            Вопросы
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
            {questions.map((q, index) => {
              const answer = getAnswerForQuestion(q._id);
              const isCorrect = answer?.isCorrect;
              return (
                <Button
                  key={q._id}
                  variant="outlined"
                  size="small"
                  onClick={() => handleNavigateToQuestion(index)}
                  className={classes.questionNavButton}
                  style={{
                    backgroundColor: isCorrect 
                      ? theme => theme.palette.success.light 
                      : theme => theme.palette.error.light,
                    color: isCorrect ? '#2e7d32' : '#c62828',
                    borderColor: isCorrect ? '#2e7d32' : '#c62828',
                  }}
                >
                  {index + 1}
                </Button>
              );
            })}
          </Box>
        </Box>

        <Divider style={{ margin: '20px 0' }} />

        {/* Детальные результаты по вопросам */}
        <Typography variant="h5" gutterBottom style={{ marginTop: '20px' }}>
          Детализация ответов
        </Typography>

        {questions.map((question, index) => {
          const answer = getAnswerForQuestion(question._id);
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
                  {renderUserAnswer(question, answer)}
                </Box>

                {question.showCorrectAnswers && test.showCorrectAnswers && (
                  <Collapse in={isExpanded}>
                    {renderCorrectAnswer(question, answer)}
                  </Collapse>
                )}

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
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
          >
            На главную
          </Button>
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