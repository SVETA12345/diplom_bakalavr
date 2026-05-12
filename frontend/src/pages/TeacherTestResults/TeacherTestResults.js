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
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Avatar,
  Dialog,
  DialogTitle,
  DialogContent,
  Toolbar,
  Tooltip,
  makeStyles
} from '@material-ui/core';
import {
  CheckCircle as CorrectIcon,
  Cancel as IncorrectIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  Visibility as ViewIcon,
  Print as PrintIcon
} from '@material-ui/icons';
import { Alert } from '@material-ui/lab';

import { AnswerRenderer } from '../TestResults/AnswerRenderer';
import { formatTime, formatDate, getAnswerForQuestion } from '../TestResults/TestResults.utils';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: '20px',
    marginTop: '20px',
  },
  answerContainer: {
    marginTop: '10px',
    padding: '12px',
    backgroundColor: '#f5f5f5',
    borderRadius: '8px',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  },
  chartWrapper: {
    position: 'relative',
    width: '100%',
    minHeight: '300px',
    marginTop: '15px',
    marginBottom: '15px',
  },
  chartContainer: {
    position: 'relative',
    height: '300px',
    width: '100%',
  },
  questionCard: {
    marginBottom: '15px',
    overflow: 'visible', // Важно для графиков
  },
  expandableContent: {
    marginTop: '15px',
    paddingTop: '15px',
    borderTop: '1px solid #e0e0e0',
  },
  statsGrid: {
    marginBottom: '20px',
  },
  dialogContent: {
    overflow: 'auto',
    padding: '20px',
  }
}));

const TeacherTestResults = () => {
  const classes = useStyles();
  const { testId } = useParams();
  const navigate = useNavigate();
  
  const [test, setTest] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedQuestions, setExpandedQuestions] = useState({});
  const [selectedAttempt, setSelectedAttempt] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    fetchData();
  }, [testId]);

  const fetchData = async () => {
    setLoading(true);
    
    try {
      const testData = await testsApi.getTestById(testId);
      setTest(testData);
      
      const questionsData = await questionsApi.getQuestions(testId);
      const sortedQuestions = questionsData.sort((a, b) => a.order - b.order);
      setQuestions(sortedQuestions);
      
      const expanded = {};
      sortedQuestions.forEach(q => {
        expanded[q._id] = false;
      });
      setExpandedQuestions(expanded);
      
      const attemptsData = await attemptsApi.getAttemptsByTestId(testId);
      setAttempts(attemptsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleExpand = (questionId) => {
    setExpandedQuestions(prev => ({
      ...prev,
      [questionId]: !prev[questionId]
    }));
  };

  const handleOpenAttempt = (attempt) => {
    setSelectedAttempt(attempt);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedAttempt(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const calculateStats = (attempt) => {
    let correctCount = 0;
    let totalPoints = 0;
    let maxPoints = 0;
    
    if (attempt.answers && questions.length > 0) {
      attempt.answers.forEach(answer => {
        if (answer.isCorrect) {
          correctCount++;
        }
        totalPoints += answer.awardedPoints || 0;
        maxPoints += answer.maxPoints || 0;
      });
    }
    
    return {
      correctCount,
      totalPoints,
      maxPoints,
      percentage: maxPoints > 0 ? Math.round((totalPoints / maxPoints) * 100) : 0
    };
  };

  if (loading) {
    return (
      <Container maxWidth="lg">
        <LinearProgress />
        <Typography align="center" style={{ marginTop: '20px' }}>
          Загрузка данных...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" style={{ paddingBottom: '40px' }}>
      <Paper className={classes.root}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3} flexWrap="wrap">
          <Box>
            <Typography variant="h4" gutterBottom>
              Результаты теста
            </Typography>
            <Typography variant="h5" color="textSecondary">
              {test?.name}
            </Typography>
          </Box>
          <Box mt={{ xs: 2, sm: 0 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={() => navigate('/tests_list')}
            >
              К списку тестов
            </Button>
          </Box>
        </Box>

        <Box mb={3}>
          <Typography variant="body2" color="textSecondary">
            Всего попыток: {attempts.length}
          </Typography>
        </Box>

        <TableContainer style={{ overflowX: 'auto' }}>
          <Table style={{ minWidth: 600 }}>
            <TableHead>
              <TableRow>
                <TableCell>№</TableCell>
                <TableCell>Студент</TableCell>
                <TableCell>Дата начала</TableCell>
                <TableCell>Дата завершения</TableCell>
                <TableCell>Время</TableCell>
                <TableCell align="center">Баллы</TableCell>
                <TableCell align="center">%</TableCell>
                <TableCell align="center">Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {attempts
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((attempt, index) => {
                  const stats = calculateStats(attempt);
                  return (
                    <TableRow key={attempt._id || index} hover>
                      <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Avatar style={{ marginRight: '10px' }}>
                            <PersonIcon />
                          </Avatar>
                          {attempt.studentName || attempt.studentId || `Студент ${index + 1}`}
                        </Box>
                      </TableCell>
                      <TableCell>{formatDate(attempt.startedAt)}</TableCell>
                      <TableCell>{formatDate(attempt.finishedAt)}</TableCell>
                      <TableCell>{formatTime(attempt.totalTimeSpent)}</TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${stats.totalPoints}/${stats.maxPoints}`}
                          color={stats.percentage >= 50 ? 'primary' : 'secondary'}
                          variant="outlined"
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${stats.percentage}%`}
                          color={stats.percentage >= 50 ? 'primary' : 'secondary'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="center">
                        <Tooltip title="Просмотреть ответы">
                          <IconButton
                            color="primary"
                            onClick={() => handleOpenAttempt(attempt)}
                          >
                            <ViewIcon />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={attempts.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Диалог просмотра ответов студента */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          style: { maxHeight: '90vh' }
        }}
      >
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">
              Ответы студента
            </Typography>
            <IconButton onClick={handleCloseDialog}>
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent className={classes.dialogContent}>
          {selectedAttempt && (
            <Box>
              <Paper variant="outlined" style={{ padding: '15px', marginBottom: '20px' }}>
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Студент
                    </Typography>
                    <Typography variant="body1">
                      {selectedAttempt.studentName || selectedAttempt.studentId || 'Неизвестно'}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Дата прохождения
                    </Typography>
                    <Typography variant="body1">
                      {formatDate(selectedAttempt.startedAt)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <Typography variant="body2" color="textSecondary">
                      Затраченное время
                    </Typography>
                    <Typography variant="body1">
                      {formatTime(selectedAttempt.totalTimeSpent)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              <Divider style={{ margin: '20px 0' }} />

              <Typography variant="h6" gutterBottom>
                Ответы на вопросы
              </Typography>

              {questions.map((question, index) => {
                const answer = getAnswerForQuestion(selectedAttempt, question._id);
                const isCorrect = answer?.isCorrect;
                const isExpanded = expandedQuestions[question._id] || false;

                return (
                  <Card 
                    key={question._id} 
                    className={classes.questionCard}
                    style={{
                      borderLeft: isCorrect !== undefined 
                        ? `4px solid ${isCorrect ? '#4caf50' : '#f44336'}`
                        : '4px solid #2196f3'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start" flexWrap="wrap">
                        <Box flex={1} style={{ minWidth: 0, width: '100%' }}>
                          <Box display="flex" alignItems="center" flexWrap="wrap" mb={1}>
                            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
                              Вопрос {index + 1}
                            </Typography>
                            {isCorrect !== undefined && (
                              <Chip
                                size="small"
                                icon={isCorrect ? <CorrectIcon /> : <IncorrectIcon />}
                                label={isCorrect ? 'Верно' : 'Неверно'}
                                style={{ marginLeft: '10px', marginTop: '5px' }}
                                color={isCorrect ? 'primary' : 'secondary'}
                              />
                            )}
                            {answer?.awardedPoints !== undefined && (
                              <Chip
                                size="small"
                                label={`${answer?.awardedPoints || 0}/${answer?.maxPoints || 0} баллов`}
                                style={{ marginLeft: '10px', marginTop: '5px' }}
                                variant="outlined"
                              />
                            )}
                          </Box>
                          
                          <Typography variant="body1" paragraph style={{ wordWrap: 'break-word' }}>
                            {question.text}
                          </Typography>
                          
                          {/* Контейнер для ответа с фиксированными стилями */}
                          <div className={classes.answerContainer}>
                            <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                              Ответ студента:
                            </Typography>
                            <AnswerRenderer 
                              question={question} 
                              answer={answer} 
                              classes={classes} 
                            />
                          </div>

                          {/* Кнопка разворота для статистики */}
                          <Box display="flex" justifyContent="flex-end" mt={1}>
                            <IconButton
                              onClick={() => handleToggleExpand(question._id)}
                              size="small"
                            >
                              {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                              <Typography variant="caption" style={{ marginLeft: '4px' }}>
                                {isExpanded ? 'Скрыть статистику' : 'Показать статистику'}
                              </Typography>
                            </IconButton>
                          </Box>

                          {/* Развернутый контент со статистикой */}
                          <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                            <div className={classes.expandableContent}>
                              <Typography variant="subtitle2" gutterBottom color="primary">
                                Статистика по вопросу:
                              </Typography>
                              
                              {/* Здесь можно добавить дополнительную статистику */}
                              <Grid container spacing={2}>
                                <Grid item xs={12} sm={6}>
                                  <Paper variant="outlined" style={{ padding: '10px' }}>
                                    <Typography variant="caption" color="textSecondary">
                                      Процент правильных ответов
                                    </Typography>
                                    <Typography variant="h6">
                                      {(() => {
                                        if (!attempts.length) return '0%';
                                        const correctCount = attempts.filter(a => {
                                          const ans = getAnswerForQuestion(a, question._id);
                                          return ans?.isCorrect === true;
                                        }).length;
                                        return `${Math.round((correctCount / attempts.length) * 100)}%`;
                                      })()}
                                    </Typography>
                                  </Paper>
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                  <Paper variant="outlined" style={{ padding: '10px' }}>
                                    <Typography variant="caption" color="textSecondary">
                                      Средний балл
                                    </Typography>
                                    <Typography variant="h6">
                                      {(() => {
                                        const points = attempts.map(a => {
                                          const ans = getAnswerForQuestion(a, question._id);
                                          return ans?.awardedPoints || 0;
                                        });
                                        if (!points.length) return '0';
                                        const avg = points.reduce((a, b) => a + b, 0) / points.length;
                                        return avg.toFixed(1);
                                      })()}
                                    </Typography>
                                  </Paper>
                                </Grid>
                              </Grid>
                            </div>
                          </Collapse>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Container>
  );
};

export default TeacherTestResults;