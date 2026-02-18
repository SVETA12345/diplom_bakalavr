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
  AppBar,
  Toolbar,
  Tooltip
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

const TeacherTestResults = () => {
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
    <Container maxWidth="lg">
      <Paper style={{ padding: '20px', marginTop: '20px' }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Box>
            <Typography variant="h4" gutterBottom>
              Результаты теста
            </Typography>
            <Typography variant="h5" color="textSecondary">
              {test?.name}
            </Typography>
          </Box>
          <Box>
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

        <TableContainer>
          <Table>
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
                    <TableRow key={attempt._id || index}>
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
        <DialogContent dividers>
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
                    style={{
                      marginBottom: '15px',
                      borderLeft: isCorrect ? '4px solid #4caf50' : '4px solid #f44336'
                    }}
                  >
                    <CardContent>
                      <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                        <Box flex={1}>
                          <Box display="flex" alignItems="center" mb={1}>
                            <Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>
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
                              style={{ marginLeft: '10px' }}
                              variant="outlined"
                            />
                          </Box>
                          
                          <Typography variant="body1" paragraph>
                            {question.text}
                          </Typography>
                          
                          <AnswerRenderer 
                            question={question} 
                            answer={answer} 
                            classes={{}} 
                          />
                        </Box>
                        <IconButton
                          onClick={() => handleToggleExpand(question._id)}
                        >
                          {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                        </IconButton>
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
