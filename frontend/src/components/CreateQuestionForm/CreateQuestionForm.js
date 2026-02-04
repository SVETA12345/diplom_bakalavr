import { useState, useEffect } from 'react';
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Typography,
  Button,
  Paper,
  Grid,
  Radio,
  Checkbox,
  IconButton,
  Divider
} from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import CancelIcon from '@material-ui/icons/Cancel';
import { makeStyles } from '@material-ui/core/styles';
import ModalStatus from '../ModalStatus/ModalStatus';

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  formControl: {
    marginBottom: theme.spacing(3),
    minWidth: '100%',
  },
  optionRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  optionInput: {
    flexGrow: 1,
  },
  buttonGroup: {
    display: 'flex',
    gap: theme.spacing(2),
    justifyContent: 'flex-end',
    marginTop: theme.spacing(3),
  },
  sectionTitle: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  errorText: {
    color: theme.palette.error.main,
    fontSize: '0.875rem',
    marginTop: theme.spacing(0.5),
  }
}));

const CreateQuestionForm = ({ orderNew, testId, onSave, onCancel, questionOriginal }) => {
  const classes = useStyles();
  const [question, setQuestion] = useState({
    order: orderNew,
    text: '',
    testId: testId || '',
    type: 'single',
    points: 1,
    options: [{ text: '', isCorrect: false, order: 1 }],
    correctAnswerText: '',
    explanation: ''
  });

  const [errors, setErrors] = useState({});
  const [openDialog, setOpenDialog] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');

  const showError = (message) => {
    setDialogMessage(message);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setQuestion({
      ...question,
      [name]: name === 'points' || name === 'order' ? parseInt(value) || 0 : value
    });
    // Очищаем ошибку при изменении
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...question.options];
    
    if (field === 'isCorrect') {
      // Для одиночного выбора сбрасываем остальные isCorrect
      if (question.type === 'single') {
        updatedOptions.forEach(opt => opt.isCorrect = false);
      }
      updatedOptions[index][field] = value;
    } else {
      updatedOptions[index][field] = value;
    }
    
    setQuestion({ ...question, options: updatedOptions });
  };

  const addOption = () => {
    const newOrder = question.options.length + 1;
    setQuestion({
      ...question,
      options: [...question.options, { 
        text: '', 
        isCorrect: false, 
        order: newOrder 
      }]
    });
  };

  const removeOption = (index) => {
    if (question.options.length <= 1) return;
    const updatedOptions = question.options.filter((_, i) => i !== index);
    // Перенумеруем order
    updatedOptions.forEach((opt, idx) => { 
      opt.order = idx + 1; 
    });
    setQuestion({ ...question, options: updatedOptions });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Текст вопроса обязателен';
    }
    
    if (!question.points || question.points <= 0) {
      newErrors.points = 'Введите положительное число баллов';
    }
    
    if (question.type !== 'text') {
      const hasCorrect = question.options.some(opt => opt.isCorrect);
      if (!hasCorrect) {
        newErrors.options = 'Выберите хотя бы один правильный вариант';
      }
      
      const emptyOption = question.options.find(opt => !opt.text.trim());
      if (emptyOption) {
        newErrors.options = 'Заполните все варианты ответов';
      }
    }
    
    if (question.type === 'text' && !question.correctAnswerText.trim()) {
      newErrors.correctAnswerText = 'Введите правильный ответ текстом';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      showError('Пожалуйста, исправьте ошибки в форме');
      return;
    }
    
    if (onSave) onSave(question);
  };
  useEffect(()=>{
    questionOriginal && setQuestion(questionOriginal)
  }, [questionOriginal])
  return (
    <Paper className={classes.root} elevation={3}>
      <Typography variant="h5" gutterBottom>
        Создание вопроса
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Порядковый номер и вес вопроса в одной строке */}
          <Grid item xs={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Порядковый номер *"
                type="number"
                name="order"
                value={question.order}
                onChange={handleChange}
                inputProps={{ min: "1" }}
                variant="outlined"
                fullWidth
                error={!!errors.order}
                helperText={errors.order}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Вес вопроса (баллы) *"
                type="number"
                name="points"
                value={question.points}
                onChange={handleChange}
                inputProps={{ min: "1" }}
                variant="outlined"
                fullWidth
                error={!!errors.points}
                helperText={errors.points}
              />
            </FormControl>
          </Grid>
          
          {/* Текст вопроса */}
          <Grid item xs={12}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Текст вопроса *"
                name="text"
                value={question.text}
                onChange={handleChange}
                placeholder="Введите текст вопроса"
                variant="outlined"
                multiline
                rows={3}
                fullWidth
                error={!!errors.text}
                helperText={errors.text}
              />
            </FormControl>
          </Grid>
          
          {/* Тип вопроса */}
          <Grid item xs={12}>
            <FormControl variant="outlined" className={classes.formControl}>
              <InputLabel>Тип вопроса *</InputLabel>
              <Select
                name="type"
                value={question.type}
                onChange={handleChange}
                label="Тип вопроса *"
              >
                <MenuItem value="single">Одиночный выбор</MenuItem>
                <MenuItem value="multiple">Множественный выбор</MenuItem>
                <MenuItem value="text">Текстовый ответ</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          {/* Варианты ответов (для single/multiple) */}
          {question.type !== 'text' && (
            <Grid item xs={12}>
              <Typography variant="subtitle1" className={classes.sectionTitle}>
                Варианты ответов *
              </Typography>
              {errors.options && (
                <Typography className={classes.errorText}>
                  {errors.options}
                </Typography>
              )}
              
              {question.options.map((option, index) => (
                <div key={index} className={classes.optionRow}>
                  {question.type === 'single' ? (
                    <Radio
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      color="primary"
                    />
                  ) : (
                    <Checkbox
                      checked={option.isCorrect}
                      onChange={(e) => handleOptionChange(index, 'isCorrect', e.target.checked)}
                      color="primary"
                    />
                  )}
                  
                  <TextField
                    className={classes.optionInput}
                    placeholder={`Вариант ${option.order}`}
                    value={option.text}
                    onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                    variant="outlined"
                    fullWidth
                  />
                  
                  <IconButton 
                    onClick={() => removeOption(index)}
                    disabled={question.options.length <= 1}
                    color="secondary"
                  >
                    <DeleteIcon />
                  </IconButton>
                </div>
              ))}
              
              <Button
                startIcon={<AddIcon />}
                onClick={addOption}
                variant="outlined"
                color="primary"
              >
                Добавить вариант
              </Button>
            </Grid>
          )}
          
          {/* Текстовый правильный ответ */}
          {question.type === 'text' && (
            <Grid item xs={12}>
              <FormControl className={classes.formControl}>
                <TextField
                  label="Правильный ответ *"
                  name="correctAnswerText"
                  value={question.correctAnswerText}
                  onChange={handleChange}
                  placeholder="Введите правильный ответ"
                  variant="outlined"
                  multiline
                  rows={2}
                  fullWidth
                  error={!!errors.correctAnswerText}
                  helperText={errors.correctAnswerText}
                />
              </FormControl>
            </Grid>
          )}
          
          {/* Пояснение */}
          <Grid item xs={12}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Пояснение к правильному ответу (опционально)"
                name="explanation"
                value={question.explanation}
                onChange={handleChange}
                placeholder="Объяснение, почему ответ правильный"
                variant="outlined"
                multiline
                rows={2}
                fullWidth
              />
            </FormControl>
          </Grid>
        </Grid>
        
        <Divider style={{ margin: '20px 0' }} />
        
        {/* Кнопки */}
        <div className={classes.buttonGroup}>
          <Button
            startIcon={<CancelIcon />}
            onClick={onCancel}
            variant="outlined"
            color="secondary"
          >
            Отмена
          </Button>
          
          <Button
            startIcon={<SaveIcon />}
            type="submit"
            variant="contained"
            color="primary"
          >
            Сохранить вопрос
          </Button>
        </div>
      </form>
      <ModalStatus titleDialog={'Ошибка'} openDialog={openDialog} handleCloseDialog={handleCloseDialog} dialogMessage={dialogMessage}/>
      
    </Paper>
  );
};

export default CreateQuestionForm;