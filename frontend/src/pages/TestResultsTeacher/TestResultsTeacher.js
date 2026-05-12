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
  InputAdornment,
  Radio,
  RadioGroup,
  FormControlLabel,
  Badge  
} from '@material-ui/core';
import { Link } from "react-router-dom";
import { useSelector } from 'react-redux';
import Header from '../../components/Header/Header';
import {surveyQuestionsApi} from '../../utils/surveyQuestionsApi'
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
  Search as SearchIcon,
  Poll as PollIcon,
  Timeline as TimelineIcon,
  BarChart as BarChartIcon
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
import { surveysApi } from '../../utils/surveysApi';
import { attemptsSurveyApi } from '../../utils/attemptsSurveyApi';
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
  chartWrapper: {
    position: 'relative',
    width: '100%',
    minHeight: '320px',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  chartCanvas: {
    position: 'relative',
    width: '100%',
    height: '320px',
  },
  // Добавьте для таблицы
  tableWrapper: {
    overflowX: 'auto',
    width: '100%',
  },
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
  infoChip: {
    backgroundColor: '#2196f3',
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
  statisticCard: {
    marginBottom: theme.spacing(2),
  },
  ratingBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#e0e0e0',
    marginTop: 8,
  },
  ratingFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: theme.palette.primary.main,
  }
}));

// Компонент для отображения статистики по анкете
// Компонент для отображения статистики по анкете (исправленная версия)
// Компонент для отображения статистики по анкете (с поддержкой matrix)
const SurveyStatistics = ({ survey, attempts, questions }) => {
  const classes = useStyles();
  const [statistics, setStatistics] = useState(null);

  useEffect(() => {
    if (attempts.length > 0 && questions.length > 0) {
      calculateStatistics();
    }
  }, [attempts, questions]);

  const calculateStatistics = () => {
    const stats = {
      totalResponses: attempts.length,
      completedResponses: attempts.filter(a => a.isCompleted).length,
      averageTimeSpent: attempts.reduce((sum, a) => sum + (a.totalTimeSpent || 0), 0) / attempts.length,
      questionsStats: {}
    };

    questions.forEach(question => {
      const answersForQuestion = attempts
        .map(attempt => attempt.answers?.find(a => a.questionId === question._id))
        .filter(a => a);

      const questionStats = {
        totalAnswers: answersForQuestion.length,
        responseRate: (answersForQuestion.length / attempts.length) * 100,
        type: question.type,
        distribution: {},
        averageRating: 0,
        textAnswers: [],
        // Для matrix вопросов
        matrixData: null
      };

      switch (question.type) {
        case 'rating':
        case 'scale':
          const ratings = answersForQuestion.map(a => a.ratingValue || 0).filter(r => r > 0);
          if (ratings.length > 0) {
            questionStats.averageRating = ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
          }
          ratings.forEach(r => {
            questionStats.distribution[r] = (questionStats.distribution[r] || 0) + 1;
          });
          break;

        case 'choice':
        case 'multiple_choice':
          answersForQuestion.forEach(answer => {
            if (answer.selectedOptions) {
              answer.selectedOptions.forEach(opt => {
                questionStats.distribution[opt.optionText] = (questionStats.distribution[opt.optionText] || 0) + 1;
              });
            }
          });
          break;

        case 'boolean':
          answersForQuestion.forEach(answer => {
            const value = answer.userAnswer === true || answer.userAnswer === 'true' || answer.userAnswer === 'да' ? 'Да' : 'Нет';
            questionStats.distribution[value] = (questionStats.distribution[value] || 0) + 1;
          });
          break;

        case 'matrix':
          // Обработка matrix вопросов
          const matrixData = {
            rows: question.matrixSettings?.rows || [],
            columns: question.matrixSettings?.columns || [],
            columnValues: question.matrixSettings?.columnValues || [],
            responses: []
          };
          
          // Собираем все ответы по матрице
          answersForQuestion.forEach(answer => {
            if (answer.matrixAnswers) {
              matrixData.responses.push(answer.matrixAnswers);
            } else if (answer.userAnswer && typeof answer.userAnswer === 'object') {
              matrixData.responses.push(answer.userAnswer);
            }
          });
          
          // Анализируем распределение ответов для каждой строки
          const rowStats = {};
          matrixData.rows.forEach(row => {
            rowStats[row] = {
              distribution: {},
              average: 0,
              counts: {}
            };
            
            // Собираем значения для этой строки
            const rowValues = [];
            matrixData.responses.forEach(response => {
              if (response && response[row] !== undefined) {
                const value = response[row];
                rowValues.push(value);
                rowStats[row].distribution[value] = (rowStats[row].distribution[value] || 0) + 1;
              }
            });
            
            // Вычисляем среднее
            if (rowValues.length > 0) {
              rowStats[row].average = rowValues.reduce((a, b) => a + b, 0) / rowValues.length;
            }
            
            // Создаем counts для каждого столбца
            matrixData.columns.forEach((col, idx) => {
              const colValue = matrixData.columnValues[idx];
              rowStats[row].counts[col] = rowStats[row].distribution[colValue] || 0;
            });
          });
          
          questionStats.matrixData = {
            rows: matrixData.rows,
            columns: matrixData.columns,
            columnValues: matrixData.columnValues,
            rowStats: rowStats,
            totalResponses: matrixData.responses.length
          };
          break;

        case 'text_short':
        case 'text_long':
          questionStats.textAnswers = answersForQuestion
            .map(a => a.textAnswer || a.userAnswer)
            .filter(t => t && t.trim());
          break;
      }

      stats.questionsStats[question._id] = questionStats;
    });

    setStatistics(stats);
  };

  const getChartDataForQuestion = (question) => {
    const stats = statistics?.questionsStats[question._id];
    if (!stats) return null;

    switch (question.type) {
      case 'rating':
      case 'scale':
        const ratingData = Object.entries(stats.distribution)
          .sort((a, b) => Number(a[0]) - Number(b[0]));
        return {
          labels: ratingData.map(([rating]) => `${rating}`),
          datasets: [{
            label: 'Количество ответов',
            data: ratingData.map(([, count]) => count),
            backgroundColor: 'rgba(54, 162, 235, 0.5)',
            borderColor: 'rgb(54, 162, 235)',
            borderWidth: 1
          }]
        };

      case 'choice':
      case 'multiple_choice':
        const choiceData = Object.entries(stats.distribution);
        return {
          labels: choiceData.map(([option]) => option),
          datasets: [{
            data: choiceData.map(([, count]) => count),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#FF6384', '#C9CBCF'
            ]
          }]
        };

      case 'boolean':
        const boolData = Object.entries(stats.distribution);
        return {
          labels: boolData.map(([option]) => option),
          datasets: [{
            data: boolData.map(([, count]) => count),
            backgroundColor: ['#4caf50', '#f44336']
          }]
        };

      default:
        return null;
    }
  };

  // Получение данных для матричного графика (тепловая карта)
  const getMatrixChartData = (matrixData) => {
    if (!matrixData) return null;
    
    const datasets = [];
    matrixData.columns.forEach((column, colIndex) => {
      const data = matrixData.rows.map(row => matrixData.rowStats[row]?.counts[column] || 0);
      datasets.push({
        label: column,
        data: data,
        backgroundColor: `rgba(54, 162, 235, ${0.3 + colIndex * 0.1})`,
        borderColor: 'rgb(54, 162, 235)',
        borderWidth: 1
      });
    });
    
    return {
      labels: matrixData.rows,
      datasets: datasets
    };
  };

  const getChartOptions = (type) => {
    const baseOptions = {
      maintainAspectRatio: false,
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            boxWidth: 12,
            fontSize: 11
          }
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              let label = context.dataset.label || '';
              if (label) label += ': ';
              label += context.raw || context.parsed;
              return label;
            }
          }
        }
      }
    };

    if (type === 'bar') {
      return {
        ...baseOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          },
          x: {
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              autoSkip: true
            }
          }
        }
      };
    }

    if (type === 'doughnut') {
      return {
        ...baseOptions,
        cutout: '50%',
        plugins: {
          ...baseOptions.plugins,
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              fontSize: 10
            }
          }
        }
      };
    }

    return baseOptions;
  };

  if (!statistics) return <LinearProgress />;

  return (
    <Box>
      <Grid container spacing={3} className={classes.statisticCard}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Всего ответов
              </Typography>
              <Typography variant="h4">
                {statistics.totalResponses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Завершили полностью
              </Typography>
              <Typography variant="h4">
                {statistics.totalResponses > 0 
                  ? ((statistics.completedResponses / statistics.totalResponses) * 100).toFixed(1)
                  : 0}%
              </Typography>
              <Typography variant="caption" color="textSecondary">
                {statistics.completedResponses} из {statistics.totalResponses}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Среднее время прохождения
              </Typography>
              <Typography variant="h4">
                {formatTime(statistics.averageTimeSpent)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Typography variant="h6" gutterBottom style={{ marginTop: 24 }}>
        Анализ по вопросам
      </Typography>
      
      {questions.map((question, index) => {
        const stats = statistics.questionsStats[question._id];
        const chartData = getChartDataForQuestion(question);
        const isRatingType = question.type === 'rating' || question.type === 'scale';
        const isChoiceType = question.type === 'choice' || question.type === 'multiple_choice';
        const isBooleanType = question.type === 'boolean';
        const isTextType = question.type === 'text_short' || question.type === 'text_long';
        const isMatrixType = question.type === 'matrix';
        const matrixChartData = isMatrixType && stats?.matrixData ? getMatrixChartData(stats.matrixData) : null;

        return (
          <Card key={question._id} className={classes.questionCard} style={{ marginBottom: 16 }}>
            <CardHeader
              avatar={<PollIcon />}
              title={`Вопрос ${index + 1}: ${question.text}`}
              subheader={`Тип: ${question.type} | Ответили: ${stats.responseRate.toFixed(1)}%`}
            />
            <CardContent>
              {/* Рейтинг/шкала */}
              {isRatingType && (
                <Box mb={2}>
                  <Typography variant="subtitle1" gutterBottom>
                    Средняя оценка: {stats.averageRating.toFixed(2)}
                  </Typography>
                  <div className={classes.ratingBar}>
                    <div 
                      className={classes.ratingFill}
                      style={{ width: `${(stats.averageRating / (question.ratingSettings?.maxValue || 10)) * 100}%` }}
                    />
                  </div>
                </Box>
              )}

              {/* Matrix вопрос - групповая гистограмма */}
              {isMatrixType && stats.matrixData && stats.matrixData.rows.length > 0 && (
                <Box mb={3}>
                  <Typography variant="subtitle1" gutterBottom>
                    Распределение ответов по строкам матрицы
                  </Typography>
                  
                  {/* Таблица для матрицы */}
                  <TableContainer component={Paper} style={{ marginTop: 8, overflowX: 'auto' }}>
                    <Table size="small" style={{ minWidth: 400 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Строка / Столбец</TableCell>
                          {stats.matrixData.columns.map((col, idx) => (
                            <TableCell key={idx} align="center">{col}</TableCell>
                          ))}
                          <TableCell align="center">Среднее</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {stats.matrixData.rows.map((row, rowIdx) => (
                          <TableRow key={rowIdx}>
                            <TableCell component="th" scope="row">
                              <Typography variant="body2" style={{ fontWeight: 'bold' }}>
                                {row}
                              </Typography>
                            </TableCell>
                            {stats.matrixData.columns.map((col, colIdx) => (
                              <TableCell key={colIdx} align="center">
                                <Chip 
                                  size="small"
                                  label={stats.matrixData.rowStats[row]?.counts[col] || 0}
                                  variant={stats.matrixData.rowStats[row]?.counts[col] > 0 ? "default" : "outlined"}
                                />
                              </TableCell>
                            ))}
                            <TableCell align="center">
                              <Chip 
                                size="small"
                                label={stats.matrixData.rowStats[row]?.average.toFixed(1) || 0}
                                color="primary"
                              />
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* График для матрицы */}
                  {matrixChartData && matrixChartData.datasets.length > 0 && (
                    <Box 
                      style={{ 
                        position: 'relative', 
                        width: '100%', 
                        minHeight: '400px',
                        height: 'auto',
                        marginTop: '16px',
                        marginBottom: '16px'
                      }}
                    >
                      <div style={{ width: '100%', height: '400px' }}>
                        <Bar 
                          data={matrixChartData} 
                          options={{
                            maintainAspectRatio: false,
                            responsive: true,
                            plugins: {
                              legend: {
                                position: 'top',
                              },
                              tooltip: {
                                callbacks: {
                                  label: function(context) {
                                    return `${context.dataset.label}: ${context.raw} ответов`;
                                  }
                                }
                              }
                            },
                            scales: {
                              y: {
                                beginAtZero: true,
                                ticks: {
                                  stepSize: 1
                                },
                                title: {
                                  display: true,
                                  text: 'Количество ответов'
                                }
                              },
                              x: {
                                title: {
                                  display: true,
                                  text: 'Строки матрицы'
                                }
                              }
                            }
                          }}
                          redraw={false}
                        />
                      </div>
                    </Box>
                  )}
                </Box>
              )}

              {/* График для других типов */}
              {chartData && !isMatrixType && (
                <Box 
                  style={{ 
                    position: 'relative', 
                    width: '100%', 
                    minHeight: '320px',
                    height: 'auto',
                    marginTop: '16px',
                    marginBottom: '16px'
                  }}
                >
                  {(isChoiceType || isBooleanType) && (
                    <div style={{ width: '100%', height: '320px' }}>
                      <Doughnut 
                        data={chartData} 
                        options={getChartOptions('doughnut')}
                        redraw={false}
                      />
                    </div>
                  )}
                  {isRatingType && (
                    <div style={{ width: '100%', height: '320px' }}>
                      <Bar 
                        data={chartData} 
                        options={getChartOptions('bar')}
                        redraw={false}
                      />
                    </div>
                  )}
                </Box>
              )}

              {/* Текстовые ответы */}
              {isTextType && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Текстовые ответы:</Typography>
                  <Paper variant="outlined" style={{ maxHeight: 200, overflow: 'auto', padding: 8, marginTop: 8 }}>
                    {stats.textAnswers.length > 0 ? (
                      stats.textAnswers.map((answer, idx) => (
                        <Box key={idx} p={1} borderBottom="1px solid #eee">
                          <Typography variant="body2">{answer}</Typography>
                        </Box>
                      ))
                    ) : (
                      <Typography color="textSecondary">Нет текстовых ответов</Typography>
                    )}
                  </Paper>
                </Box>
              )}

              {/* Таблица распределения ответов (для не-matrix типов) */}
              {!isMatrixType && Object.entries(stats.distribution).length > 0 && (
                <Box mt={2}>
                  <Typography variant="subtitle2">Распределение ответов:</Typography>
                  <TableContainer component={Paper} style={{ marginTop: 8, overflowX: 'auto' }}>
                    <Table size="small" style={{ minWidth: 200 }}>
                      <TableHead>
                        <TableRow>
                          <TableCell>Ответ</TableCell>
                          <TableCell align="right">Количество</TableCell>
                          <TableCell align="right">Процент</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {Object.entries(stats.distribution).map(([key, count]) => (
                          <TableRow key={key}>
                            <TableCell>{key}</TableCell>
                            <TableCell align="right">{count}</TableCell>
                            <TableCell align="right">
                              {stats.totalAnswers > 0 
                                ? ((count / stats.totalAnswers) * 100).toFixed(1)
                                : 0}%
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              )}
            </CardContent>
          </Card>
        );
      })}
    </Box>
  );
};
// Компонент детального просмотра ответов студента (адаптирован для анкет)
const StudentAnswersDialog = ({ open, onClose, attempt, questions, isSurvey }) => {
  const classes = useStyles();
  const [expandedQuestions, setExpandedQuestions] = useState({});

  if (!attempt) return null;

  const toggleQuestion = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const renderUserAnswer = (answer, question) => {
    if (!question) return <Typography color="error">Вопрос не найден</Typography>;

    switch (question.type) {
      case 'rating':
      case 'scale':
        return (
          <Box>
            <Typography variant="subtitle2">Оценка:</Typography>
            <Chip 
              label={`${answer.ratingValue || answer.userAnswer} из ${question.maxRating || 10}`}
              color="primary"
            />
          </Box>
        );

      case 'choice':
        const selectedOption = answer.selectedOptions?.[0];
        return (
          <Box>
            <Typography variant="subtitle2">Выбранный ответ:</Typography>
            <Chip label={selectedOption?.optionText || answer.userAnswer} />
          </Box>
        );

      case 'multiple_choice':
        const selectedOptions = answer.selectedOptions?.map(opt => opt.optionText).join(', ');
        return (
          <Box>
            <Typography variant="subtitle2">Выбранные ответы:</Typography>
            <Paper variant="outlined" style={{ padding: 8, backgroundColor: '#f5f5f5' }}>
              <Typography>{selectedOptions || answer.userAnswer || '(не выбрано)'}</Typography>
            </Paper>
          </Box>
        );

      case 'boolean':
        return (
          <Box>
            <Typography variant="subtitle2">Ответ:</Typography>
            <Chip 
              label={answer.userAnswer === true || answer.userAnswer === 'true' || answer.userAnswer === 'да' ? 'Да' : 'Нет'}
              color={answer.userAnswer ? 'primary' : 'default'}
            />
          </Box>
        );

      case 'text_short':
      case 'text_long':
        return (
          <Box>
            <Typography variant="subtitle2">Ответ:</Typography>
            <Paper variant="outlined" style={{ padding: 12, backgroundColor: '#f5f5f5' }}>
              <Typography>{answer.textAnswer || answer.userAnswer || '(пусто)'}</Typography>
            </Paper>
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
              {isSurvey ? 'Респондент:' : 'Студент:'} {attempt.studentName || attempt.studentId || 'Аноним'}
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {isSurvey ? `Ответ #${attempt.responseNumber || 1}` : `Попытка #${attempt.attemptNumber}`} • 
              {new Date(attempt.finishedAt || attempt.submittedAt).toLocaleString()}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Paper variant="outlined" style={{ padding: 16 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Начало:</Typography>
                  <Typography variant="body1">
                    {new Date(attempt.startedAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">Завершение:</Typography>
                  <Typography variant="body1">
                    {new Date(attempt.finishedAt || attempt.submittedAt).toLocaleString()}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">Время прохождения:</Typography>
                  <Typography variant="body1">
                    {formatTime(attempt.totalTimeSpent)}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Ответы на вопросы
            </Typography>
            <Divider />
          </Grid>

          {attempt.answers?.map((answer, idx) => {
            const question = questions.find(q => q._id === answer.questionId);
            if (!question) return null;

            return (
              <Grid item xs={12} key={answer.questionId}>
                <Card className={classes.questionCard}>
                  <CardHeader
                    title={
                      <Typography variant="subtitle1">
                        Вопрос {idx + 1}: {question.text}
                      </Typography>
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
                    </CardContent>
                  </Collapse>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary" variant="contained">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Основная страница (объединенная для тестов и анкет)
const TeacherAnswersPage = () => {
  const classes = useStyles();
  const testsOriginal = useSelector(state => state.tests.tests);
  const surveyOriginal = useSelector(state => state.surveys.surveys);
  const [contentType, setContentType] = useState('test'); // 'test' или 'survey'
  const [tests, setTests] = useState([]);
  const [surveys, setSurveys] = useState([]);
  const [filteredTests, setFilteredTests] = useState([]);
  const [filteredSurveys, setFilteredSurveys] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
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
    studentId: '',
    studentGroup: '',
    isAnonymous: 'all'
  });

  // Загрузка тестов и анкет преподавателя
  useEffect(() => {
    setTests(testsOriginal);
    setFilteredTests(testsOriginal);
    
    // Загрузка анкет (нужно добавить API)
    loadSurveys();
  }, [testsOriginal]);

  const loadSurveys = async () => {
    try {
      
      setSurveys(surveyOriginal);
      setFilteredSurveys(surveyOriginal);
    } catch (err) {
      console.log(err);
    }
  };

  // Фильтрация по поисковому запросу
  useEffect(() => {
    const currentList = contentType === 'test' ? tests : surveys;
    const setFiltered = contentType === 'test' ? setFilteredTests : setFilteredSurveys;
    
    if (searchQuery.trim() === '') {
      setFiltered(currentList);
    } else {
      const query = searchQuery.toLowerCase().trim();
      const filtered = currentList.filter(item => 
        item.name.toLowerCase().includes(query) || 
        (item.description && item.description.toLowerCase().includes(query))
      );
      setFiltered(filtered);
      
      if (selectedItem && !filtered.some(item => item._id === selectedItem._id)) {
        setSelectedItem(null);
        setAttempts([]);
        setQuestions([]);
      }
    }
  }, [searchQuery, tests, surveys, contentType, selectedItem]);

  const loadSurveyAttempts = async (surveyId) => {
    setLoading(true);
    try {
      const attemptsData = await attemptsSurveyApi.getAttemptsBySurveyId(surveyId);
      setAttempts(attemptsData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSurveyQuestions = async (surveyId) => {
    try {
      const questionsData = await surveyQuestionsApi.getSurveyQuestions(surveyId);
      setQuestions(questionsData);
    } catch (err) {
      console.log(err);
    }
  };

  const handleItemSelect = (item) => {
    setSelectedItem(item);
    if (contentType === 'test') {
      loadTestAttempts(item._id);
      loadTestQuestions(item._id);
    } else {
      console.log('dfs')
      loadSurveyAttempts(item._id);
      loadSurveyQuestions(item._id);
    }
  };

  const loadTestAttempts = async (testId) => {
    setLoading(true);
    try {
      const attemptsData = await attemptsApi.getAttemptsByTestId(testId);
      setAttempts(attemptsData);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const loadTestQuestions = async (testId) => {
    try {
      const questionsData = await questionsApi.getQuestions(testId);
      setQuestions(questionsData);
    } catch (err) {
      console.log(err);
    }
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
    if (filters.studentId && !attempt.studentId?.includes(filters.studentId)) return false;
    if (filters.studentGroup && filters.studentGroup.trim() !== '') {
      if (!attempt.studentGroup) return false;
      const attemptGroup = attempt.studentGroup.toString().trim().toLowerCase();
      const searchGroup = filters.studentGroup.toString().trim().toLowerCase();
      if (!attemptGroup.includes(searchGroup)) return false;
    }
    if (filters.isAnonymous !== 'all') {
      const isAnonymous = !attempt.studentId;
      if (filters.isAnonymous === 'anonymous' && !isAnonymous) return false;
      if (filters.isAnonymous === 'registered' && isAnonymous) return false;
    }
    return true;
  });

  // Данные для графиков (только для тестов)
  const getScoreDistribution = () => {
    const distribution = [0, 0, 0, 0, 0];
    filteredAttempts.forEach(attempt => {
      if (attempt.percentage !== undefined) {
        const score = attempt.percentage || 0;
        if (score < 20) distribution[0]++;
        else if (score < 40) distribution[1]++;
        else if (score < 60) distribution[2]++;
        else if (score < 80) distribution[3]++;
        else distribution[4]++;
      }
    });
    return distribution;
  };

  const chartData = {
    labels: ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'],
    datasets: [{
      label: 'Количество студентов',
      data: getScoreDistribution(),
      backgroundColor: ['rgba(255, 99, 132, 0.5)', 'rgba(255, 159, 64, 0.5)', 'rgba(255, 205, 86, 0.5)', 'rgba(75, 192, 192, 0.5)', 'rgba(54, 162, 235, 0.5)'],
      borderColor: ['rgb(255, 99, 132)', 'rgb(255, 159, 64)', 'rgb(255, 205, 86)', 'rgb(75, 192, 192)', 'rgb(54, 162, 235)'],
      borderWidth: 1,
    }],
  };

  const lineChartData = {
    labels: filteredAttempts.map(a => new Date(a.finishedAt || a.submittedAt).toLocaleDateString()),
    datasets: [{
      label: contentType === 'test' ? 'Процент выполнения' : 'Время прохождения (сек)',
      data: contentType === 'test' 
        ? filteredAttempts.map(a => a.percentage || 0)
        : filteredAttempts.map(a => a.totalTimeSpent || 0),
      borderColor: 'rgb(75, 192, 192)',
      backgroundColor: 'rgba(75, 192, 192, 0.2)',
    }],
  };

  const currentList = contentType === 'test' ? filteredTests : filteredSurveys;

  return (
    <>
      <Header>
        <div className="navigation">
          <nav className="navigation__another-button">
            <Link to="/glavnay" className="navigation__button">Главная</Link>
            <Link to="/lk" className="navigation__button navigation__button_active">Личный кабинет</Link>
          </nav>
        </div>
      </Header>
    
      <div className={classes.root}>
        <Container maxWidth="xl">
          <Box className={classes.header} display="flex" justifyContent="space-between" alignItems="center" flexWrap="wrap">
            <Box>
              <Typography variant="h4" component="h1">
                Просмотр ответов
              </Typography>
              <Box display="flex" alignItems="center" mt={1}>
                <Button
                  variant={contentType === 'test' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => {
                    setContentType('test');
                    setSelectedItem(null);
                    setAttempts([]);
                    setQuestions([]);
                    setSearchQuery('');
                  }}
                  style={{ marginRight: 8 }}
                >
                  Тесты
                </Button>
                <Button
                  variant={contentType === 'survey' ? 'contained' : 'outlined'}
                  color="primary"
                  onClick={() => {
                    setContentType('survey');
                    setSelectedItem(null);
                    setAttempts([]);
                    setQuestions([]);
                    setSearchQuery('');
                  }}
                >
                  Анкеты
                </Button>
              </Box>
            </Box>
            <Box>
              <Tooltip title="Обновить">
                <IconButton onClick={() => selectedItem && handleItemSelect(selectedItem)}>
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
            {/* Список тестов/анкет с поиском */}
            <Grid item xs={12} md={3}>
              <Paper className={classes.paper}>
                <Typography variant="h6" gutterBottom>
                  {contentType === 'test' ? 'Мои тесты' : 'Мои анкеты'}
                </Typography>
                
                <Box className={classes.searchBox}>
                  <TextField
                    fullWidth
                    variant="outlined"
                    placeholder={`Поиск по названию...`}
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
                          <IconButton size="small" onClick={handleClearSearch}>
                            <ClearIcon />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                {searchQuery && (
                  <Typography className={classes.searchResultCount}>
                    Найдено: {currentList.length}
                  </Typography>
                )}

                <List component="nav" className={classes.testList}>
                  {currentList.length > 0 ? (
                    currentList.map((item) => (
                      <ListItem
                        button
                        key={item._id}
                        selected={selectedItem?._id === item._id}
                        onClick={() => handleItemSelect(item)}
                      >
                        <ListItemIcon>
                          {contentType === 'test' ? <AssessmentIcon /> : <PollIcon />}
                        </ListItemIcon>
                        <ListItemText 
                          primary={item.name} 
                          secondary={item.description?.substring(0, 50)}
                        />
                      </ListItem>
                    ))
                  ) : (
                    <Box className={classes.noTestsFound}>
                      <Typography variant="body2">
                        {searchQuery ? 'Не найдено' : `Нет доступных ${contentType === 'test' ? 'тестов' : 'анкет'}`}
                      </Typography>
                    </Box>
                  )}
                </List>
              </Paper>
            </Grid>

            {/* Детали и статистика */}
            <Grid item xs={12} md={9}>
              {selectedItem ? (
                <>
                  <Paper style={{ marginBottom: 16, padding: 16 }}>
                    <Typography variant="h5" gutterBottom>
                      {selectedItem.name}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      {selectedItem.description}
                    </Typography>
                    <Box mt={2} display="flex" alignItems="center">
                      <Chip 
                        size="small"
                        label={`Всего ${contentType === 'test' ? 'попыток' : 'ответов'}: ${attempts.length}`}
                        color="primary"
                        variant="outlined"
                      />
                    </Box>
                  </Paper>

                  {/* Статистика для тестов */}
                  {contentType === 'test' && (
                    <Paper style={{ marginBottom: 16 }}>
                      <TestStats attempts={filteredAttempts} useStyles={useStyles} />
                    </Paper>
                  )}

                  {/* Статистика для анкет */}
                  {contentType === 'survey' && (
                    <SurveyStatistics 
                      survey={selectedItem}
                      attempts={filteredAttempts}
                      questions={questions}
                    />
                  )}

                  {/* Табы с графиками и таблицей (только для тестов) */}
                  {contentType === 'test' && (
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
                                              {attempt.studentName && `${attempt.studentName} ${attempt.studentSurname}` || attempt.studentId || 'Аноним'}
                                            </Typography>
                                          </Box>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        <Typography variant="body2">
                                          {attempt.studentGroup || '-'}
                                        </Typography>
                                      </TableCell>
                                      <TableCell>
                                        <Chip label={`#${attempt.attemptNumber}`} size="small" variant="outlined" />
                                      </TableCell>
                                      <TableCell>
                                        {new Date(attempt.finishedAt).toLocaleDateString()}
                                      </TableCell>
                                      <TableCell>
                                        <Chip 
                                          label={`${attempt.percentage?.toFixed(1)}%`}
                                          className={attempt.passed ? classes.successChip : classes.warningChip}
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
                  )}

                  {/* Таблица ответов для анкет */}
                  {contentType === 'survey' && (
                    <Paper className={classes.tabRoot}>
                      <Box p={3}>
                        <Typography variant="h6" gutterBottom>Список ответов на анкету</Typography>
                        <TableContainer className={classes.tableContainer}>
                          <Table stickyHeader>
                            <TableHead>
                              <TableRow>
                                <TableCell>Респондент</TableCell>
                                <TableCell>Группа</TableCell>
                                <TableCell>Статус</TableCell>
                                <TableCell>Дата</TableCell>
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
                                            {attempt.studentName || attempt.studentId || 'Анонимный пользователь'}
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </TableCell>
                                    <TableCell>
                                      <Typography variant="body2">
                                        {attempt.studentGroup || '-'}
                                      </Typography>
                                    </TableCell>
                                    <TableCell>
                                      <Chip 
                                        label={attempt.isCompleted ? 'Завершено' : 'Не завершено'}
                                        className={attempt.isCompleted ? classes.successChip : classes.warningChip}
                                        size="small"
                                      />
                                    </TableCell>
                                    <TableCell>
                                      {new Date(attempt.finishedAt || attempt.submittedAt).toLocaleDateString()}
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
                    </Paper>
                  )}
                </>
              ) : (
                <Paper className={classes.paper}>
                  <Box textAlign="center" py={5}>
                    {contentType === 'test' ? <AssessmentIcon style={{ fontSize: 60, color: '#ccc' }} /> : <PollIcon style={{ fontSize: 60, color: '#ccc' }} />}
                    <Typography variant="h6" color="textSecondary">
                      {searchQuery ? 'Выберите элемент из результатов поиска' : `Выберите ${contentType === 'test' ? 'тест' : 'анкету'} для просмотра результатов`}
                    </Typography>
                  </Box>
                </Paper>
              )}
            </Grid>
          </Grid>
        </Container>
      </div>

      {/* Диалог фильтров */}
      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)}>
        <DialogTitle>Фильтры</DialogTitle>
        <DialogContent>
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
          {contentType === 'survey' && (
            <FormControl fullWidth margin="normal">
              <InputLabel>Тип ответа</InputLabel>
              <Select
                value={filters.isAnonymous}
                onChange={(e) => setFilters({...filters, isAnonymous: e.target.value})}
              >
                <MenuItem value="all">Все</MenuItem>
                <MenuItem value="anonymous">Анонимные</MenuItem>
                <MenuItem value="registered">Зарегистрированные</MenuItem>
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilters({
            dateFrom: '',
            dateTo: '',
            studentId: '',
            studentGroup: '',
            isAnonymous: 'all'
          })}>
            Сбросить
          </Button>
          <Button onClick={() => setFilterDialogOpen(false)} color="primary">
            Применить
          </Button>
        </DialogActions>
      </Dialog>

      {/* Диалог просмотра ответов студента/респондента */}
      <StudentAnswersDialog
        open={!!selectedAttempt}
        onClose={() => setSelectedAttempt(null)}
        attempt={selectedAttempt}
        questions={questions}
        isSurvey={contentType === 'survey'}
      />
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

export default TeacherAnswersPage;