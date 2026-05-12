import React, { useState, useEffect } from 'react';
import { surveysApi } from '../../utils/surveysApi';

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
  Chip,
  Slider,
  Grid,
  ButtonGroup as MuiButtonGroup,
  FormHelperText
} from '@material-ui/core';
import ModalStatus from '../../components/ModalStatus/ModalStatus';
import { Alert } from "@material-ui/lab";
import { useStyles } from './styles';
import { useParams, useNavigate } from 'react-router-dom';
import {surveyQuestionsApi} from '../../utils/surveyQuestionsApi'
import { attemptsSurveyApi } from '../../utils/attemptsSurveyApi'

const SurveyQuestionsStudent = () => {
  const classes = useStyles();
  const { surveyId } = useParams();
  const navigate = useNavigate();
  const [responseId, setResponseId] = useState(null);
  const [survey, setSurvey] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [surveyCompleted, setSurveyCompleted] = useState(false);
  const [startedAt, setStartedAt] = useState('');
  const [showWarning, setShowWarning] = useState(false);
  const [unansweredCount, setUnansweredCount] = useState(0);
  const [questionErrors, setQuestionErrors] = useState({});
  const [studentInfo, setStudentInfo] = useState({
    studentName: '',
    studentSurname: '',
    studentGroup: ''
  });
  const [showStudentInfoForm, setShowStudentInfoForm] = useState(false);
  const [modal, setModal] = useState({
    titleDialog: '',
    openDialog: false,
    dialogMessage: ''
  });
  // Для матричных вопросов
  const [matrixAnswers, setMatrixAnswers] = useState({});

  // Загрузка опроса и вопросов
  useEffect(() => {
    fetchSurveyData();
    fetchQuestions();
  }, [surveyId]);

  // Таймер
  useEffect(() => {
    if (!survey || !survey.estimatedTime || timeLeft === null) return;

    if (timeLeft <= 0) {
      handleSubmitSurvey();
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, survey]);

  const fetchSurveyData = async () => {
    surveysApi.getSurveyById(surveyId).then((data) => {
      setSurvey(data);
      setStartedAt(new Date());
      if (data.estimatedTime > 0) {
        setTimeLeft(data.estimatedTime * 60);
      }
      if (!data.isAnonymous) {
        setShowStudentInfoForm(true);
      }
    }).catch(err => {
      console.log(err);
      navigate(`/survey_take/${surveyId}`);
    });
  };

  const fetchQuestions = async () => {
    surveyQuestionsApi.getSurveyQuestions(surveyId).then(data => {
      const sortedQuestions = data.sort((a, b) => a.order - b.order);
      setQuestions(sortedQuestions);
      const initialErrors = {};
      sortedQuestions.forEach(q => {
        if (q.required) {
          initialErrors[q._id] = false;
        }
      });
      setQuestionErrors(initialErrors);
    })
    .catch(err => {
      console.log(err);
      setModal({
        titleDialog: 'Ошибка',
        openDialog: true,
        dialogMessage: 'Не удалось загрузить вопросы опроса'
      });
    });
  };

  const handleStudentInfoChange = (field, value) => {
    setStudentInfo(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateStudentInfo = () => {
    if (!survey.isAnonymous) {
      if (!studentInfo.studentName.trim() || !studentInfo.studentSurname.trim()) {
        setModal({
          titleDialog: 'Ошибка',
          openDialog: true,
          dialogMessage: 'Пожалуйста, укажите имя и фамилию'
        });
        return false;
      }
    }
    return true;
  };

  const handleAnswerChange = (questionId, value, questionType, isMatrix = false, rowIndex = null) => {
    if (isMatrix && rowIndex !== null) {
      // Для матричных вопросов
      setMatrixAnswers(prev => ({
        ...prev,
        [questionId]: {
          ...prev[questionId],
          [rowIndex]: value
        }
      }));
      
      // Проверяем, отвечена ли вся матрица
      const question = questions.find(q => q._id === questionId);
      const currentMatrixAnswers = { ...matrixAnswers, [questionId]: { ...matrixAnswers[questionId], [rowIndex]: value } };
      const allRowsAnswered = question.matrixSettings.rows.every((_, idx) => currentMatrixAnswers[questionId]?.[idx] !== undefined);
      console.log(allRowsAnswered, currentMatrixAnswers, question)
      if (allRowsAnswered) {
        setAnswers(prev => ({
          ...prev,
          [questionId]: {
            value: currentMatrixAnswers[questionId],
            type: questionType
          }
        }));
      } else {
        // Удаляем ответ из answers, если матрица не полностью заполнена
        setAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers[questionId];
          return newAnswers;
        });
      }
    } else {
        console.log('pff', questionId, value, questionType);
      setAnswers(prev => ({
        ...prev,
        [questionId]: {
          value: value,
          type: questionType
        }
      }));
    }
    
    if (questionErrors[questionId]) {
      setQuestionErrors(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const handleMultipleChoiceChange = (questionId, optionIndex, optionText, optionValue, checked, questionType) => {
    const currentAnswers = answers[questionId]?.value || [];
    let newAnswers;
    
    if (checked) {
      newAnswers = [...currentAnswers, { index: optionIndex, text: optionText, value: optionValue }];
    } else {
      newAnswers = currentAnswers.filter(opt => opt.index !== optionIndex);
    }
    
    setAnswers(prev => ({
      ...prev,
      [questionId]: {
        value: newAnswers,
        type: questionType
      }
    }));
    
    if (questionErrors[questionId]) {
      setQuestionErrors(prev => ({
        ...prev,
        [questionId]: false
      }));
    }
  };

  const handleNextQuestion = () => {
    const currentQuestion = questions[currentQuestionIndex];
    if (currentQuestion.required && !isQuestionAnswered(currentQuestion._id)) {
      setQuestionErrors(prev => ({
        ...prev,
        [currentQuestion._id]: true
      }));
      return;
    }
    
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const isQuestionAnswered = (questionId) => {
    const answer = answers[questionId];
    if (!answer || answer.value === undefined || answer.value === null) return false;
    
    const question = questions.find(q => q._id === questionId);
    if (!question) return false;
    
    // Если вопрос не обязательный, он считается отвеченным
    if (!question.required) return true;
    
    switch (question.type) {
      case 'text_short':
      case 'text_long':
        return typeof answer.value === 'string' && answer.value.trim() !== '';
      case 'rating':
      case 'scale':
        return answer.value !== null && answer.value !== undefined;
      case 'boolean':
        return answer.value !== null && answer.value !== undefined;
      case 'choice':
        return answer.value !== '' && answer.value !== null;
      case 'multiple_choice':
        return Array.isArray(answer.value) && answer.value.length > 0;
      case 'matrix':
        // Проверяем, что все строки матрицы заполнены
        const matrixRows = question.matrixSettings?.rows || [];
        const matrixAns = answer.value || {};
        return matrixRows.length > 0 && matrixRows.every((_, idx) => matrixAns[idx] !== undefined);
      default:
        return false;
    }
  };

  const getRequiredUnansweredQuestions = () => {
    return questions.filter(q => q.required && !isQuestionAnswered(q._id));
  };

  const handleSubmitSurvey = async () => {
    if (!validateStudentInfo()) {
      return;
    }
    
    const unanswered = getRequiredUnansweredQuestions();
    
    if (unanswered.length > 0) {
      const newErrors = { ...questionErrors };
      unanswered.forEach(q => {
        newErrors[q._id] = true;
      });
      setQuestionErrors(newErrors);
      
      setUnansweredCount(unanswered.length);
      setShowWarning(true);
      
      const firstUnansweredIndex = questions.findIndex(q => q._id === unanswered[0]._id);
      if (firstUnansweredIndex !== -1) {
        setCurrentQuestionIndex(firstUnansweredIndex);
      }
      
      return;
    }
    
    setIsSubmitting(true);
    
    let totalTimeSpent = null;
    if (survey.estimatedTime !== 0) {
      const totalTime = survey.estimatedTime * 60;
      totalTimeSpent = totalTime - timeLeft;
    }
    
    let answersData = [];
    for (let key in answers) {
      const answer = answers[key];
      const question = questions.find(q => q._id === key);
      
      let formattedAnswer = {
        questionId: key,
        questionType: answer.type,
      };
      
      switch (answer.type) {
        case 'text_short':
        case 'text_long':
          formattedAnswer.userAnswer = answer.value;
          formattedAnswer.textAnswer = answer.value;
          break;
        case 'rating':
          formattedAnswer.userAnswer = answer.value;
          formattedAnswer.ratingValue = answer.value;
          break;
        case 'scale':
          formattedAnswer.userAnswer = answer.value;
          formattedAnswer.scaleValue = answer.value;
          break;
        case 'boolean':
          formattedAnswer.userAnswer = answer.value;
          break;
        case 'choice':
          formattedAnswer.userAnswer = answer.value;
          const selectedOption = question.options?.find(opt => opt.order == answer.value);
          
          
          if (selectedOption) {
            formattedAnswer.selectedOptions = {
              optionId: selectedOption._id,
              optionText: selectedOption.text
            };
            
          }
          break;
        case 'multiple_choice':
        
          formattedAnswer.userAnswer = answer.value.map(opt => opt.text).join(', ');
          formattedAnswer.selectedOptions = answer.value.map(opt => ({
            optionText: opt.text,
            optionValue: opt.value
          }));
          break;
        case 'matrix':
          formattedAnswer.userAnswer = answer.value;
          formattedAnswer.matrixAnswers = answer.value;
          break;
        default:
          formattedAnswer.userAnswer = answer.value;
      }
      
      answersData.push(formattedAnswer);
    }
    
    const dataResponse = {
      answers: answersData,
      startedAt: startedAt,
      finishedAt: new Date(),
      totalTimeSpent: totalTimeSpent,
      isCompleted: true,
      ...(!survey.isAnonymous && {
        studentName: studentInfo.studentName,
        studentSurname: studentInfo.studentSurname,
        studentGroup: studentInfo.studentGroup
      })
    };
    
    attemptsSurveyApi.addAttempt(dataResponse, surveyId).then((data) => {
      setIsSubmitting(false);
      setSurveyCompleted(true);
      setResponseId(data.response._id);
    }).catch(err => {
      console.log(err);
      setModal({
        titleDialog: 'Ошибка',
        openDialog: true,
        dialogMessage: err.message || 'Ошибка при отправке ответов'
      });
      setIsSubmitting(false);
    });
    
  };

  const handleCloseDialog = () => {
    setModal({
      titleDialog: '',
      openDialog: false,
      dialogMessage: ''
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const calculateProgress = () => {
    if (!questions.length) return 0;
    const requiredQuestions = questions.filter(q => q.required);
    if (requiredQuestions.length === 0) return 100;
    const answeredCount = requiredQuestions.filter(q => isQuestionAnswered(q._id)).length;
    return (answeredCount / requiredQuestions.length) * 100;
  };

  const RatingButtons = ({ value, onChange, minValue, maxValue, minLabel, maxLabel, step }) => {
    const ratings = [];
    for (let i = minValue; i <= maxValue; i += step) {
      ratings.push(i);
    }
    return (
      <div>
        <MuiButtonGroup variant="outlined" color="primary">
          {ratings.map((rating) => (
            <Button
              key={rating}
              variant={value === rating ? "contained" : "outlined"}
              onClick={() => onChange(rating)}
              style={{ minWidth: '50px' }}
            >
              {rating}
            </Button>
          ))}
        </MuiButtonGroup>
        {(minLabel || maxLabel) && (
          <Box display="flex" justifyContent="space-between" mt={1}>
            <Typography variant="caption">{minLabel}</Typography>
            <Typography variant="caption">{maxLabel}</Typography>
          </Box>
        )}
      </div>
    );
  };

  const renderQuestion = (question) => {
    const isAnswered = isQuestionAnswered(question._id);
    const hasError = questionErrors[question._id] && question.required && !isAnswered;
    const currentAnswer = answers[question._id]?.value;
    console.log('question.type', currentAnswer)
    switch (question.type) {
      case 'choice':
        return (
          <FormControl component="fieldset" required={question.required} error={hasError}>
            <RadioGroup
              value={currentAnswer !== undefined ? currentAnswer : ''}
              onChange={(e) => {console.log('hye'); handleAnswerChange(question._id, e.target.value, question.type)}}
            >
              {question.options.sort((a, b) => a.order - b.order).map((option) => (
                <FormControlLabel
                  key={option.order}
                  value={option.order}
                  control={<Radio />}
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

      case 'multiple_choice':
        return (
          <FormControl component="fieldset" required={question.required} error={hasError}>
            <FormGroup>
              {question.options.sort((a, b) => a.order - b.order).map((option) => (
                <FormControlLabel
                  key={option.order}
                  control={
                    <Checkbox
                      checked={(currentAnswer || []).some(opt => opt.index === option.order)}
                      onChange={(e) => handleMultipleChoiceChange(
                        question._id,
                        option.order,
                        option.text,
                        option.value,
                        e.target.checked,
                        question.type
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

      case 'text_short':
        return (
          <div>
            <TextField
              fullWidth
              variant="outlined"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value, question.type)}
              placeholder={question.textSettings?.placeholder || "Введите ваш ответ"}
              required={question.required}
              error={hasError}
              helperText={hasError ? "* Это обязательный вопрос" : ""}
              inputProps={{
                maxLength: question.textSettings?.maxLength
              }}
            />
            {question.textSettings?.maxLength && (
              <FormHelperText>
                Максимум {question.textSettings.maxLength} символов
              </FormHelperText>
            )}
          </div>
        );

      case 'text_long':
        return (
          <div>
            <TextField
              fullWidth
              multiline
              rows={question.textSettings?.rows || 4}
              variant="outlined"
              value={currentAnswer || ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value, question.type)}
              placeholder={question.textSettings?.placeholder || "Введите ваш ответ"}
              required={question.required}
              error={hasError}
              helperText={hasError ? "* Это обязательный вопрос" : ""}
              inputProps={{
                maxLength: question.textSettings?.maxLength
              }}
            />
            {question.textSettings?.maxLength && (
              <FormHelperText>
                Максимум {question.textSettings.maxLength} символов
              </FormHelperText>
            )}
          </div>
        );

      case 'rating':
        const ratingSettings = question.ratingSettings || { minValue: 1, maxValue: 5, step: 1 };
        return (
          <div>
            <RatingButtons
              value={currentAnswer !== undefined ? currentAnswer : null}
              onChange={(val) => handleAnswerChange(question._id, val, question.type)}
              minValue={ratingSettings.minValue}
              maxValue={ratingSettings.maxValue}
              minLabel={ratingSettings.minLabel}
              maxLabel={ratingSettings.maxLabel}
              step={ratingSettings.step}
            />
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Пожалуйста, поставьте оценку
              </Typography>
            )}
          </div>
        );

      case 'scale':
        const scaleSettings = question.scaleSettings || { pointsCount: 5 };
        const scalePoints = scaleSettings.points || 
          Array.from({ length: scaleSettings.pointsCount }, (_, i) => `${i + 1}`);
        return (
          <div>
            <Box px={2}>
              <Slider
                value={currentAnswer !== undefined ? currentAnswer : 0}
                onChange={(e, newValue) => handleAnswerChange(question._id, newValue, question.type)}
                min={0}
                max={scaleSettings.pointsCount - 1}
                step={1}
                marks
                valueLabelDisplay="auto"
                valueLabelFormat={(val) => scalePoints[val]}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" px={2}>
              {scalePoints.map((point, idx) => (
                <Typography key={idx} variant="caption">{point}</Typography>
              ))}
            </Box>
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Пожалуйста, выберите значение
              </Typography>
            )}
          </div>
        );

      case 'boolean':
        return (
          <FormControl component="fieldset" required={question.required} error={hasError}>
            <RadioGroup
              value={currentAnswer !== undefined ? String(currentAnswer) : ''}
              onChange={(e) => handleAnswerChange(question._id, e.target.value === 'true', question.type)}
            >
              <FormControlLabel value="true" control={<Radio />} label="Да" />
              <FormControlLabel value="false" control={<Radio />} label="Нет" />
            </RadioGroup>
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Пожалуйста, выберите ответ
              </Typography>
            )}
          </FormControl>
        );

      case 'matrix':
        const matrixSettings = question.matrixSettings;
        if (!matrixSettings) return null;
        
        const matrixCurrentAnswers = matrixAnswers[question._id] || {};
        
        return (
          <div>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Typography variant="subtitle2">Параметры</Typography>
              </Grid>
              <Grid item xs={8}>
                <Grid container>
                  {matrixSettings.columns.map((col, colIdx) => (
                    <Grid item xs key={colIdx}>
                      <Typography variant="subtitle2" align="center">{col}</Typography>
                    </Grid>
                  ))}
                </Grid>
              </Grid>
              
            {/* Строки матрицы */}
        {matrixSettings.rows.map((row, rowIdx) => (
          <React.Fragment key={rowIdx}>
            <Grid item xs={4}>
              <Typography style={{ paddingTop: '12px' }}>{row}</Typography>
            </Grid>
            <Grid item xs={8}>
              <Grid container>
                {matrixSettings.columns.map((col, colIdx) => (
                  <Grid item xs key={colIdx} style={{ textAlign: 'center' }}>
                    <Radio
                      checked={matrixCurrentAnswers[rowIdx] === colIdx}
                      onChange={() => handleAnswerChange(
                        question._id, 
                        colIdx, 
                        question.type, 
                        true, 
                        rowIdx
                      )}
                      value={colIdx}
                      name={`matrix-${question._id}-${rowIdx}`}
                    />
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </React.Fragment>
        ))}
      </Grid>  
            
            {hasError && (
              <Typography variant="caption" className={classes.errorText}>
                * Пожалуйста, ответьте на все строки матрицы
              </Typography>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (surveyCompleted) {
    return (
      <Container maxWidth="md">
        <Paper className={classes.root}>
          <Typography variant="h4" gutterBottom>
            Опрос завершен!
          </Typography>
          <Typography variant="h6" gutterBottom>
            Спасибо за участие в опросе!
          </Typography>
          <Typography variant="body1" paragraph>
            Ваши ответы были успешно сохранены.
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/')}
          >
            Вернуться на главную
          </Button>
        </Paper>
      </Container>
    );
  }

  if (!survey || !questions.length) {
    return (
      <Container maxWidth="md">
        <LinearProgress />
        <Typography align="center" style={{ marginTop: '20px' }}>
          Загрузка опроса...
        </Typography>
      </Container>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const progress = calculateProgress();
  const requiredUnanswered = getRequiredUnansweredQuestions();
  const allRequiredAnswered = requiredUnanswered.length === 0;

  if (showStudentInfoForm && !survey.isAnonymous) {
    return (
      <Container maxWidth="md">
        <Paper className={classes.root}>
          <Typography variant="h4" gutterBottom>
            {survey.name}
          </Typography>
          <Typography variant="body1" paragraph>
            Пожалуйста, представьтесь перед началом опроса
          </Typography>
          
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Имя"
                value={studentInfo.studentName}
                onChange={(e) => handleStudentInfoChange('studentName', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Фамилия"
                value={studentInfo.studentSurname}
                onChange={(e) => handleStudentInfoChange('studentSurname', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Группа"
                value={studentInfo.studentGroup}
                onChange={(e) => handleStudentInfoChange('studentGroup', e.target.value)}
              />
            </Grid>
          </Grid>
          
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                if (validateStudentInfo()) {
                  setShowStudentInfoForm(false);
                }
              }}
            >
              Начать опрос
            </Button>
          </Box>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg">
      <Dialog open={showWarning} onClose={() => setShowWarning(false)}>
        <DialogTitle>Не все обязательные вопросы отвечены</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Вы не ответили на {unansweredCount} обязательный(ых) вопрос(ов). 
            Пожалуйста, ответьте на все обязательные вопросы перед отправкой опроса.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWarning(false)} color="primary">
            Продолжить опрос
          </Button>
        </DialogActions>
      </Dialog>
      
      <ModalStatus 
        titleDialog={modal.titleDialog} 
        openDialog={modal.openDialog} 
        handleCloseDialog={handleCloseDialog} 
        dialogMessage={modal.dialogMessage} 
      />
      
      {survey.estimatedTime > 0 && (
        <Paper className={classes.timer}>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            {survey.estimatedTime !== 0 && (
              <Typography variant="h6">
                Оставшееся время: {formatTime(timeLeft)}
              </Typography>
            )}
            <Box display="flex" alignItems="center" gap={2}>
              <Typography variant="body2">
                Вопрос {currentQuestionIndex + 1} из {questions.length}
              </Typography>
              {!allRequiredAnswered && (
                <Chip 
                  label={`Осталось обязательных: ${requiredUnanswered.length}`}
                  color="error"
                  size="small"
                />
              )}
            </Box>
          </Box>
        </Paper>
      )}

      <Paper className={classes.root}>
        <Typography variant="h4" gutterBottom>
          {survey.name}
        </Typography>
        {survey.description && (
          <Typography variant="body1" color="textSecondary" paragraph>
            {survey.description}
          </Typography>
        )}

        <Box className={classes.progressContainer}>
          <Box display="flex" justifyContent="space-between" mb={1}>
            <Typography variant="body2" color="textSecondary">
              Прогресс ответов на обязательные вопросы
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} />
        </Box>

        <Card className={classes.questionCard}>
          <CardContent>
            <Box className={classes.questionHeader}>
              <Box display="flex" alignItems="center">
                <Typography variant="h6">
                  Вопрос {currentQuestion.order || currentQuestionIndex + 1}
                </Typography>
                {currentQuestion.required && (
                  <Typography variant="body1" className={classes.requiredIndicator}>
                    *
                  </Typography>
                )}
              </Box>
              {currentQuestion.weight > 1 && (
                <Typography variant="body2" color="textSecondary">
                  Важность: {currentQuestion.weight}
                </Typography>
              )}
            </Box>

            <Typography variant="body1" paragraph>
              {currentQuestion.text}
            </Typography>

            {currentQuestion.explanation && (
              <Typography variant="body2" color="textSecondary" paragraph>
                <em>{currentQuestion.explanation}</em>
              </Typography>
            )}

            <Box className={classes.optionsContainer}>
              {renderQuestion(currentQuestion)}
            </Box>
          </CardContent>
        </Card>

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
                color={allRequiredAnswered ? "secondary" : "default"}
                onClick={handleSubmitSurvey}
                disabled={isSubmitting || (survey.estimatedTime > 0 && timeLeft === 0)}
              >
                {isSubmitting ? 'Отправка...' : 'Завершить опрос'}
              </Button>
            )}
          </Box>
        </Box>

        <Box mt={4}>
          <Typography variant="subtitle1" gutterBottom>
            Навигация по вопросам:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {questions.map((q, index) => (
              <Button
                key={q._id}
                variant={currentQuestionIndex === index ? "contained" : "outlined"}
                color={isQuestionAnswered(q._id) ? "primary" : (q.required ? "default" : "default")}
                size="small"
                onClick={() => setCurrentQuestionIndex(index)}
                className={classes.questionNavButton}
              >
                {index + 1}
                {q.required && !isQuestionAnswered(q._id) && (
                  <span className={classes.unansweredDot}></span>
                )}
                {!q.required && !isQuestionAnswered(q._id) && (
                  <span className={classes.optionalDot}></span>
                )}
              </Button>
            ))}
          </Box>
        </Box>

        {timeLeft && timeLeft < 300 && timeLeft > 0 && (
          <Alert severity="warning" style={{ marginTop: '20px' }}>
            Осталось меньше 5 минут!
          </Alert>
        )}
        
        {!allRequiredAnswered && (
          <Alert severity="info" style={{ marginTop: '20px' }}>
            Обязательные вопросы отмечены звёздочкой (*) и красной точкой в навигации. 
            Необязательные вопросы можно пропустить.
          </Alert>
        )}
      </Paper>
    </Container>
  );
};

export default SurveyQuestionsStudent;