// TeacherAnswersPage.jsx
import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Chip,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Box,
  IconButton,
  Tooltip,
  Tabs,
  Tab,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Collapse,
  Radio,
  RadioGroup,
  FormControlLabel,
  Checkbox,
  Switch,
  Badge,
  InputAdornment
} from '@material-ui/core';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import {
  Assessment as AssessmentIcon,
  Person as PersonIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  FilterList as FilterListIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Clear as ClearIcon,
  Search as SearchIcon
} from '@material-ui/icons';
import { makeStyles } from '@material-ui/core/styles';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip as ChartTooltip,
  Legend
} from 'chart.js';
import { attemptsApi } from '../../utils/attemptsApi';
import { questionsApi } from '../../utils/questionsApi';
import TestStats from '../../components/TestStats/TestStats';

// Регистрация компонентов ChartJS
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  ChartTooltip,
  Legend
);

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: '#f5f5f5',
    minHeight: '100vh',
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    height: '100%',
  },
  tableContainer: {
    maxHeight: 440,
  },
  header: {
    marginBottom: theme.spacing(3),
  },
  statsCard: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: theme.shadows[10],
    },
  },
  avatarIcon: {
    backgroundColor: theme.palette.primary.main,
    marginRight: theme.spacing(1),
  },
  successChip: {
    backgroundColor: '#4caf50',
    color: 'white',
  },
  warningChip: {
    backgroundColor: '#ff9800',
    color: 'white',
  },
  errorChip: {
    backgroundColor: '#f44336',
    color: 'white',
  },
  answerCorrect: {
    color: '#4caf50',
  },
  answerIncorrect: {
    color: '#f44336',
  },
  expandButton: {
    transform: 'rotate(0deg)',
    marginLeft: 'auto',
    transition: theme.transitions.create('transform', {
      duration: theme.transitions.duration.shortest,
    }),
  },
  expandButtonOpen: {
    transform: 'rotate(180deg)',
  },
  filterSection: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2),
    backgroundColor: '#fff',
  },
  tabRoot: {
    flexGrow: 1,
    backgroundColor: '#fff',
  },
  questionCard: {
    marginBottom: theme.spacing(2),
    '&:last-child': {
      marginBottom: 0,
    },
  },
  chartContainer: {
    height: 300,
    marginTop: theme.spacing(2),
  },
  searchBox: {
    marginBottom: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  testList: {
    maxHeight: 'calc(100vh - 300px)',
    overflow: 'auto',
  },
  searchResultCount: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
    color: theme.palette.text.secondary,
    fontSize: '0.875rem',
  },
  clearSearchButton: {
    marginLeft: theme.spacing(1),
  },
  noTestsFound: {
    padding: theme.spacing(3),
    textAlign: 'center',
    color: theme.palette.text.secondary,
  },
}));


// Компонент детального просмотра ответов студента
const StudentAnswersDialog = ({ open, onClose, attempt, questions, onUpdateScore }) => {
  const classes = useStyles();
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [manualScores, setManualScores] = useState({});

  useEffect(() => {
    if (attempt && attempt.answers) {
      const scores = {};
      attempt.answers.forEach(answer => {
        scores[answer.questionId] = answer.awardedPoints || 0;
      });
      setManualScores(scores);
    }
  }, [attempt]);

  if (!attempt) return null;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleScoreChange = (questionId, value) => {
    setManualScores(prev => ({
      ...prev,
      [questionId]: parseInt(value) || 0
    }));
  };

  const handleSaveScores = () => {
    onUpdateScore(attempt._id, manualScores);
    onClose();
  };

  const renderUserAnswer = (answer, question) => {
    if (!question) return <Typography color="error">Вопрос не найден</Typography>;

    switch (question.type) {
      case 'single':
        const selectedOption = question.options[answer.userAnswer];
        return (
          <Box>
            <Typography variant="subtitle2">Выбранный ответ:</Typography>
            <Chip 
              label={selectedOption?.text || 'Не выбран'} 
              color={answer.isCorrect ? 'primary' : 'default'}
              icon={answer.isCorrect ? <CheckCircleIcon /> : <ClearIcon />}
            />
          </Box>
        );

      case 'multiple':
        const selectedOrders = Array.isArray(answer.userAnswer) ? answer.userAnswer : [];
        const selectedOptions = question.options?.filter(opt => 
          selectedOrders.includes(opt.order)
        );
        return (
          <Box>
            <Typography variant="subtitle2">Выбранные ответы:</Typography>
            {selectedOptions.map(opt => (
              <Chip 
                key={opt.order}
                label={opt.text}
                size="small"
                style={{ margin: 2 }}
              />
            ))}
          </Box>
        );

      case 'text':
        return (
          <Box>
            <Typography variant="subtitle2">Ответ студента:</Typography>
            <Paper variant="outlined" style={{ padding: 8, backgroundColor: '#f5f5f5' }}>
              <Typography>{answer.userAnswer || '(пусто)'}</Typography>
            </Paper>
            {answer.isCorrect === false && (
              <Box mt={1}>
                <Typography variant="subtitle2">Правильный ответ:</Typography>
                <Chip 
                  label={question.correctAnswerText || 'Не указан'} 
                  color="primary"
                  icon={<CheckCircleIcon />}
                />
              </Box>
            )}
          </Box>
        );

      default:
        return <Typography>Неизвестный тип вопроса</Typography>;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      scroll="paper"
    >
      <DialogTitle>
        <Box display="flex" alignItems="center">
          <Avatar className={classes.avatarIcon}>
            <PersonIcon />
          </Avatar>
          <Box ml={2}>
            <Typography variant="h6">
              Студент: {attempt.studentName || attempt.studentId}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Попытка #{attempt.attemptNumber} • {new Date(attempt.finishedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" style={{ padding: 16 }}>
              <Grid container spacing={2}>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Результат:</Typography>
                  <Chip 
                    label={`${attempt.percentage?.toFixed(1)}%`}
                    className={
                      attempt.passed ? classes.successChip : classes.errorChip
                    }
                  />
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Баллы:</Typography>
                  <Typography variant="h6">
                    {attempt.totalScore} / {attempt.maxPossibleScore || '?'}
                  </Typography>
                </Grid>
                <Grid item xs={4}>
                  <Typography variant="body2" color="textSecondary">Время:</Typography>
                  <Typography variant="body1">
                    {formatTime(attempt.totalTimeSpent)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Детали ответов
            </Typography>
            <Divider />
          </Grid>

          {attempt.answers.map((answer, idx) => {
            const question = questions.find(q => q._id === answer.questionId);
            if (!question) return null;

            return (
              <Grid item xs={12} key={answer.questionId}>
                <Card className={classes.questionCard}>
                  <CardHeader
                    avatar={
                      answer.isCorrect ? 
                        <CheckCircleIcon className={classes.answerCorrect} /> : 
                        <CancelIcon className={classes.answerIncorrect} />
                    }
                    title={
                      <Box display="flex" alignItems="center">
                        <Typography variant="subtitle1">
                          Вопрос {idx + 1}: {question.text}
                        </Typography>
                        <Chip 
                          size="small"
                          label={`${answer.awardedPoints || 0}/${answer.maxPoints || 0} баллов`}
                          style={{ marginLeft: 16 }}
                          color={answer.isCorrect ? 'primary' : 'default'}
                        />
                      </Box>
                    }
                    action={
                      <IconButton onClick={() => toggleQuestion(question._id)}>
                        {expandedQuestions[question._id] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    }
                  />
                  <Collapse in={expandedQuestions[question._id]} timeout="auto" unmountOnExit>
                    <CardContent>
                      {renderUserAnswer(answer, question)}
                      
                      {question.explanation && (
                        <Box mt={2}>
                          <Typography variant="subtitle2">Пояснение:</Typography>
                          <Typography variant="body2" color="textSecondary">
                            {question.explanation}
                          </Typography>
                        </Box>
                      )}

                      <Box mt={2} display="flex" alignItems="center">
                        <TextField
                          label="Баллы"
                          type="number"
                          value={manualScores[question._id] || 0}
                          onChange={(e) => handleScoreChange(question._id, e.target.value)}
                          inputProps={{ min: 0, max: answer.maxPoints || 100 }}
                          size="small"
                          variant="outlined"
                          style={{ width: 120 }}
                        />
                      </Box>
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Отмена
        </Button>
        <Button onClick={handleSaveScores} color="primary" variant="contained">
          Сохранить изменения
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основная страница
const TestResultsTeacher = () => {
  const classes = useStyles();
  const testsOriginal = useSelector(state => state.tests.tests);
  const [tests, setTests] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTest, setSelectedTest] = useState(null);
  const [attempts, setAttempts] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    passed: 'all',
    minScore: '',
    maxScore: '',
    studentId: '',
    studentGroup: ''
  });

  // Загрузка тестов преподавателя
  useEffect(() => {
    setTests(testsOriginal);
    setFilteredTests(testsOriginal);
  }, [testsOriginal]);

  // Фильтрация тестов по поисковому запросу
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTests(tests);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = tests.filter(test => 
        test.name.toLowerCase().includes(query) || 
        (test.subject && test.subject.toLowerCase().includes(query)) ||
        (test.description && test.description.toLowerCase().includes(query))
      );
      setFilteredTests(filtered);
      
      // Если выбранный тест не входит в отфильтрованный список, сбрасываем выбор
      if (selectedTest && !filtered.some(t => t._id === selectedTest._id)) {
        setSelectedTest(null);
        setAttempts([]);
        setQuestions([]);
      }
    }
  }, [searchQuery, tests, selectedTest]);

  const fetchTestAttempts = async (testId) => {
    setLoading(true);
    attemptsApi.getAttemptsByTestId(testId).then((attemps)=>{
        setAttempts(attemps);
        setLoading(false);
    })
    .catch(err => {
        setLoading(false);
    })
  };

  const fetchTestQuestions = async (testId) => {
    questionsApi.getQuestions(testId).then((q)=>{
        setQuestions(q);
    }).catch(err=>{

    })
  };

  const handleTestSelect = (test) => {
    setSelectedTest(test);
    fetchTestAttempts(test._id);
    fetchTestQuestions(test._id);
  };

  const handleUpdateScore = async (attemptId, newScores) => {
    const attemptNew = attempts.find((at) => at._id === attemptId) 
    let totalScore =0
    for (let question_id in newScores){
        totalScore+=newScores[question_id]
        
        attemptNew.answers=attemptNew.answers.map((an)=>{
            if (an.questionId==question_id){
                if (newScores[question_id] === an.maxPoints){
                    return {
                        ...an,
                        isCorrect:true,
                        awardedPoints: newScores[question_id],
                    }
                }
                else return{
                ...an,
                isCorrect:false,
                awardedPoints: newScores[question_id]
            }
            } 
            return an
        })
    }
    const percentage = totalScore/attemptNew.maxPossibleScore*100
    attemptNew.passed=percentage >= selectedTest.passingScore
    attemptNew.totalScore= totalScore
    attemptNew.percentage=percentage
    attemptsApi.updateAttempt(attemptNew)
    .then((data) => {
        
        //setAttempts(attemptsNew)
    })
    .catch(err =>{

    })
    
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  const filteredAttempts = attempts.filter(attempt => {
    if (filters.passed !== 'all' && attempt.passed !== (filters.passed === 'true')) return false;
    if (filters.minScore && (attempt.percentage || 0) < parseInt(filters.minScore)) return false;
    if (filters.maxScore && (attempt.percentage || 0) > parseInt(filters.maxScore)) return false;
    if (filters.studentId && !attempt.studentId.includes(filters.studentId)) return false;
    if (filters.studentGroup && filters.studentGroup.trim() !== '') {
        // Проверяем наличие поля studentGroup
        if (!attempt.studentGroup) return false;
        
        // Приводим к строке и удаляем пробелы, игнорируем регистр
        const attemptGroup = attempt.studentGroup.toString().trim().toLowerCase();
        const searchGroup = filters.studentGroup.toString().trim().toLowerCase();
        
        // Используем includes для частичного совпадения или strict равенство
        if (!attemptGroup.includes(searchGroup)) return false;
    }
    return true;
  });

  // Данные для графиков
  const getScoreDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    filteredAttempts.forEach(attempt => {
      const score = attempt.percentage || 0;
      if (score < 20) distribution[0]++;
      else if (score < 40) distribution[1]++;
      else if (score < 60) distribution[2]++;
      else if (score < 80) distribution[3]++;
      else distribution[4]++;
    });
    return distribution;
  };

  const chartData = {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [
      {
        label: 'Количество студентов',
        data: getScoreDistribution(),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 205, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(54, 162, 235, 0.5)',
        ],
        borderColor: [
          'rgb(255, 99, 132)',
          'rgb(255, 159, 64)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(54, 162, 235)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: filteredAttempts.map(a => new Date(a.finishedAt).toLocaleDateString()),
    datasets: [
      {
        label: 'Процент выполнения',
        data: filteredAttempts.map(a => a.percentage || 0),
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
      },
    ],
  };

  return (
    <>
    <Header>
                        <div className="navigation">
                          <nav className="navigation__another-button">
                            <Link to="/glavnay" className="navigation__button">
                              Главная
                            </Link>
                            <Link
                              to="/lk"
                              className="navigation__button navigation__button_active"
                            >
                              Личный кабинет
                            </Link>
                          </nav>
                        </div>
                      </Header>
    
    <div className={classes.root}>
      <Container maxWidth="xl">
        <Box className={classes.header} display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h4" component="h1">
            Просмотр ответов студентов
          </Typography>
          <Box>
            <Tooltip title="Обновить">
              <IconButton onClick={() => selectedTest && fetchTestAttempts(selectedTest._id)}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Фильтры">
              <IconButton onClick={() => setFilterDialogOpen(true)}>
                <Badge color="secondary" variant="dot" invisible={Object.values(filters).every(v => !v)}>
                  <FilterListIcon />
                </Badge>
              </IconButton>
            </Tooltip>
            
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Список тестов с поиском */}
          <Grid item xs={12} md={3}>
            <Paper className={classes.paper}>
              <Typography variant="h6" gutterBottom>
                Мои тесты
              </Typography>
              
              {/* Поле поиска */}
              <Box className={classes.searchBox}>
                <TextField
                  fullWidth
                  variant="outlined"
                  placeholder="Поиск по названию, предмету..."
                  size="small"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <SearchIcon />
                      </InputAdornment>
                    ),
                    endAdornment: searchQuery && (
                      <InputAdornment position="end">
                        <IconButton
                          size="small"
                          onClick={handleClearSearch}
                          className={classes.clearSearchButton}
                        >
                          <ClearIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              {/* Количество найденных тестов */}
              {searchQuery && (
                <Typography className={classes.searchResultCount}>
                  Найдено тестов: {filteredTests.length}
                </Typography>
              )}

              {/* Список тестов */}
              <List component="nav" className={classes.testList}>
                {filteredTests.length > 0 ? (
                  filteredTests.map((test) => (
                    <ListItem
                      button
                      key={test._id}
                      selected={selectedTest?._id === test._id}
                      onClick={() => handleTestSelect(test)}
                    >
                      <ListItemIcon>
                        <AssessmentIcon />
                      </ListItemIcon>
                      <ListItemText 
                        primary={test.name} 
                        secondary={
                          <>
                            {test.subject && `${test.subject} • `}
                            {test.duration} мин
                          </>
                        }
                      />
                    </ListItem>
                  ))
                ) : (
                  <Box className={classes.noTestsFound}>
                    <Typography variant="body2">
                      {searchQuery ? 'Тесты не найдены' : 'Нет доступных тестов'}
                    </Typography>
                  </Box>
                )}
              </List>
            </Paper>
          </Grid>

          {/* Детали теста */}
          <Grid item xs={12} md={9}>
            {selectedTest ? (
              <>
                {/* Статистика */}
                <Paper style={{ marginBottom: 16 }}>
                  <TestStats 
                    attempts={filteredAttempts} 
                    useStyles={useStyles}
                  />
                </Paper>

                {/* Табы с графиками и таблицей */}
                <Paper className={classes.tabRoot}>
                  <Tabs
                    value={tabValue}
                    onChange={(e, v) => setTabValue(v)}
                    indicatorColor="primary"
                    textColor="primary"
                  >
                    <Tab label="Список попыток" />
                    <Tab label="Статистика" />
                  </Tabs>
                  <Divider />

                  {/* Список попыток */}
                  {tabValue === 0 && (
                    <Box p={3}>
                      <TableContainer className={classes.tableContainer}>
                        <Table stickyHeader>
                          <TableHead>
                            <TableRow>
                              <TableCell>Студент</TableCell>
                              <TableCell>Группа</TableCell>
                              <TableCell>Попытка</TableCell>
                              <TableCell>Дата</TableCell>
                              <TableCell>Результат</TableCell>
                              <TableCell>Баллы</TableCell>
                              <TableCell>Время</TableCell>
                              <TableCell>Действия</TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {filteredAttempts
                              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                              .map((attempt) => (
                                <TableRow key={attempt._id} hover>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <Avatar className={classes.avatarIcon}>
                                        <PersonIcon />
                                      </Avatar>
                                      <Box ml={1}>
                                        <Typography variant="body2">
                                          {attempt.studentName && `${attempt.studentName} ${attempt.studentSurname}` || attempt.studentId}
                                        </Typography>
                                      </Box>
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {attempt.studentGroup && `${attempt.studentGroup}` || '-'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={`#${attempt.attemptNumber}`}
                                      size="small"
                                      variant="outlined"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    {new Date(attempt.finishedAt).toLocaleDateString()}
                                  </TableCell>
                                  <TableCell>
                                    <Chip 
                                      label={`${attempt.percentage?.toFixed(1)}%`}
                                      className={
                                        attempt.passed ? classes.successChip : classes.warningChip
                                      }
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <Typography variant="body2">
                                      {attempt.totalScore || 0} / {attempt.maxPossibleScore || '?'}
                                    </Typography>
                                  </TableCell>
                                  <TableCell>
                                    <Box display="flex" alignItems="center">
                                      <AccessTimeIcon fontSize="small" style={{ marginRight: 4 }} />
                                      {formatTime(attempt.totalTimeSpent)}
                                    </Box>
                                  </TableCell>
                                  <TableCell>
                                    <Button
                                      variant="outlined"
                                      size="small"
                                      onClick={() => setSelectedAttempt(attempt)}
                                    >
                                      Просмотр
                                    </Button>
                                  </TableCell>
                                </TableRow>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                      <TablePagination
                        rowsPerPageOptions={[5, 10, 25]}
                        component="div"
                        count={filteredAttempts.length}
                        rowsPerPage={rowsPerPage}
                        page={page}
                        onPageChange={handleChangePage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                      />
                    </Box>
                  )}

                  {/* Статистика */}
                  {tabValue === 1 && (
                    <Box p={3}>
                      <Grid container spacing={3}>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader title="Распределение оценок" />
                            <CardContent>
                              <div className={classes.chartContainer}>
                                <Bar data={chartData} />
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                        <Grid item xs={12} md={6}>
                          <Card>
                            <CardHeader title="Динамика результатов" />
                            <CardContent>
                              <div className={classes.chartContainer}>
                                <Line data={lineChartData} />
                              </div>
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                    </Box>
                  )}

             
                </Paper>
              </>
            ) : (
              <Paper className={classes.paper}>
                <Box textAlign="center" py={5}>
                  <AssessmentIcon style={{ fontSize: 60, color: '#ccc' }} />
                  <Typography variant="h6" color="textSecondary">
                    {searchQuery ? 'Выберите тест из результатов поиска' : 'Выберите тест для просмотра результатов'}
                  </Typography>
                </Box>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Container>

      {/* Диалог фильтров */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Фильтры</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="normal">
            <InputLabel>Результат</InputLabel>
            <Select
              value={filters.passed}
              onChange={(e) => setFilters({...filters, passed: e.target.value})}
            >
              <MenuItem value="all">Все</MenuItem>
              <MenuItem value="true">Сдано</MenuItem>
              <MenuItem value="false">Не сдано</MenuItem>
            </Select>
          </FormControl>
          <TextField
            fullWidth
            margin="normal"
            label="ID студента"
            value={filters.studentId}
            onChange={(e) => setFilters({...filters, studentId: e.target.value})}
          />
           <TextField
            fullWidth
            margin="normal"
            label="Группа студента"
            value={filters.studentGroup}
            onChange={(e) => setFilters({...filters, studentGroup: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Мин. процент"
            type="number"
            value={filters.minScore}
            onChange={(e) => setFilters({...filters, minScore: e.target.value})}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Макс. процент"
            type="number"
            value={filters.maxScore}
            onChange={(e) => setFilters({...filters, maxScore: e.target.value})}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilters({
            dateFrom: '',
            dateTo: '',
            passed: 'all',
            minScore: '',
            maxScore: '',
            studentId: ''
          })}>
            Сбросить
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра ответов студента */}
      <StudentAnswersDialog
        open={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        attempt={selectedAttempt}
        questions={questions}
        onUpdateScore={handleUpdateScore}
      />
    </div>
    </>
  );
};

// Вспомогательная функция форматирования времени
const formatTime = (seconds) => {
  if (!seconds) return '—';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default TestResultsTeacher;