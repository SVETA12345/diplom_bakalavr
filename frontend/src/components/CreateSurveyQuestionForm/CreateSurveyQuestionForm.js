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
  Divider,
  FormControlLabel,
  Switch,
  Slider,
  FormHelperText
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
  },
  sliderContainer: {
    padding: theme.spacing(2),
  },
  matrixRow: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  matrixColumn: {
    marginTop: theme.spacing(2),
  }
}));

const CreateSurveyQuestionForm = ({ orderNew, surveyId, onSave, onCancel, questionOriginal }) => {
  const classes = useStyles();
  
  // Базовые поля вопроса
  const [question, setQuestion] = useState({
    order: orderNew,
    text: '',
    surveyId: surveyId || '',
    type: 'choice',
    required: true,
    weight: 1,
    options: [{ text: '', value: 1, order: 1, hasCommentField: false }],
    // Для типа rating
    ratingSettings: {
      minValue: 1,
      maxValue: 5,
      minLabel: '',
      maxLabel: '',
      step: 1
    },
    // Для типа scale (Ликерта)
    scaleSettings: {
      points: ['Полностью не согласен', 'Не согласен', 'Нейтрально', 'Согласен', 'Полностью согласен'],
      pointsCount: 5
    },
    // Для текстовых вопросов
    textSettings: {
      maxLength: null,
      placeholder: '',
      rows: 3
    },
    // Для матричных вопросов
    matrixSettings: {
      rows: ['Строка 1'],
      columns: ['Колонка 1', 'Колонка 2', 'Колонка 3'],
      columnValues: [1, 2, 3]
    },
    explanation: '',
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
      [name]: name === 'order' ? parseInt(value) || 0 : value
    });
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSwitchChange = (name) => (e) => {
    setQuestion({
      ...question,
      [name]: e.target.checked
    });
  };

  const handleOptionChange = (index, field, value) => {
    const updatedOptions = [...question.options];
    updatedOptions[index][field] = value;
    setQuestion({ ...question, options: updatedOptions });
  };

  const addOption = () => {
    const newOrder = question.options.length + 1;
    setQuestion({
      ...question,
      options: [...question.options, { 
        text: '', 
        value: newOrder, 
        order: newOrder,
        hasCommentField: false 
      }]
    });
  };

  const removeOption = (index) => {
    if (question.options.length <= 1) return;
    const updatedOptions = question.options.filter((_, i) => i !== index);
    updatedOptions.forEach((opt, idx) => { 
      opt.order = idx + 1;
      opt.value = idx + 1;
    });
    setQuestion({ ...question, options: updatedOptions });
  };

  // Обработчики для rating настроек
  const handleRatingChange = (field, value) => {
    setQuestion({
      ...question,
      ratingSettings: {
        ...question.ratingSettings,
        [field]: value
      }
    });
  };

  // Обработчики для text настроек
  const handleTextSettingChange = (field, value) => {
    setQuestion({
      ...question,
      textSettings: {
        ...question.textSettings,
        [field]: value
      }
    });
  };

  // Обработчики для matrix настроек
  const addMatrixRow = () => {
    const newRows = [...question.matrixSettings.rows, `Строка ${question.matrixSettings.rows.length + 1}`];
    setQuestion({
      ...question,
      matrixSettings: {
        ...question.matrixSettings,
        rows: newRows
      }
    });
  };

  const removeMatrixRow = (index) => {
    const newRows = question.matrixSettings.rows.filter((_, i) => i !== index);
    setQuestion({
      ...question,
      matrixSettings: {
        ...question.matrixSettings,
        rows: newRows
      }
    });
  };

  const updateMatrixRow = (index, value) => {
    const newRows = [...question.matrixSettings.rows];
    newRows[index] = value;
    setQuestion({
      ...question,
      matrixSettings: {
        ...question.matrixSettings,
        rows: newRows
      }
    });
  };

  const addMatrixColumn = () => {
    const newColumns = [...question.matrixSettings.columns, `Колонка ${question.matrixSettings.columns.length + 1}`];
    const newValues = [...question.matrixSettings.columnValues, question.matrixSettings.columnValues.length + 1];
    setQuestion({
      ...question,
      matrixSettings: {
        ...question.matrixSettings,
        columns: newColumns,
        columnValues: newValues
      }
    });
  };

  const removeMatrixColumn = (index) => {
    const newColumns = question.matrixSettings.columns.filter((_, i) => i !== index);
    const newValues = question.matrixSettings.columnValues.filter((_, i) => i !== index);
    setQuestion({
      ...question,
      matrixSettings: {
        ...question.matrixSettings,
        columns: newColumns,
        columnValues: newValues
      }
    });
  };

  // Валидация формы
  const validateForm = () => {
    const newErrors = {};
    
    if (!question.text.trim()) {
      newErrors.text = 'Текст вопроса обязателен';
    }
    
    if (question.type === 'choice' || question.type === 'multiple_choice') {
      const emptyOption = question.options.find(opt => !opt.text.trim());
      if (emptyOption) {
        newErrors.options = 'Заполните все варианты ответов';
      }
      
      if (question.options.length < 2) {
        newErrors.options = 'Добавьте хотя бы 2 варианта ответа';
      }
    }
    
    if (question.type === 'matrix') {
      if (question.matrixSettings.rows.length < 1) {
        newErrors.matrix = 'Добавьте хотя бы одну строку';
      }
      if (question.matrixSettings.columns.length < 2) {
        newErrors.matrix = 'Добавьте хотя бы 2 колонки';
      }
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
    
    // Очищаем неиспользуемые поля в зависимости от типа вопроса
    const cleanedQuestion = { ...question };
    
    if (cleanedQuestion.type !== 'rating') {
      delete cleanedQuestion.ratingSettings;
    }
    if (cleanedQuestion.type !== 'scale') {
      delete cleanedQuestion.scaleSettings;
    }
    if (!['text_short', 'text_long'].includes(cleanedQuestion.type)) {
      delete cleanedQuestion.textSettings;
    }
    if (cleanedQuestion.type !== 'matrix') {
      delete cleanedQuestion.matrixSettings;
    }
    if (cleanedQuestion.type !== 'choice' && cleanedQuestion.type !== 'multiple_choice') {
      delete cleanedQuestion.options;
    }
    
    if (onSave) onSave(cleanedQuestion);
  };

  useEffect(() => {
    if (questionOriginal) {
      setQuestion(questionOriginal);
    }
  }, [questionOriginal]);

  // Рендер настроек в зависимости от типа вопроса
  const renderTypeSpecificFields = () => {
    switch (question.type) {
      
      case 'choice':
         return (<Grid item xs={12}>
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
                <TextField
                  className={classes.optionInput}
                  placeholder={`Вариант ${option.order}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                
               
                
                <IconButton 
                  onClick={() => removeOption(index)}
                  disabled={question.options.length <= 1}
                  color="secondary"
                  size="small"
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
              size="small"
            >
              Добавить вариант
            </Button>
          </Grid>
         )
      case 'multiple_choice':
        
        return (
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
                <TextField
                  className={classes.optionInput}
                  placeholder={`Вариант ${option.order}`}
                  value={option.text}
                  onChange={(e) => handleOptionChange(index, 'text', e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                />
                
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={option.hasCommentField}
                      onChange={(e) => handleOptionChange(index, 'hasCommentField', e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Комментарий"
                />
                
                <IconButton 
                  onClick={() => removeOption(index)}
                  disabled={question.options.length <= 1}
                  color="secondary"
                  size="small"
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
              size="small"
            >
              Добавить вариант
            </Button>
          </Grid>
        );

      case 'rating':
        return (
          <Grid item xs={12}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Настройки рейтинга
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Минимальное значение"
                  type="number"
                  value={question.ratingSettings.minValue}
                  onChange={(e) => handleRatingChange('minValue', parseInt(e.target.value))}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Максимальное значение"
                  type="number"
                  value={question.ratingSettings.maxValue}
                  onChange={(e) => handleRatingChange('maxValue', parseInt(e.target.value))}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Метка минимума"
                  value={question.ratingSettings.minLabel}
                  onChange={(e) => handleRatingChange('minLabel', e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="Например: Очень плохо"
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Метка максимума"
                  value={question.ratingSettings.maxLabel}
                  onChange={(e) => handleRatingChange('maxLabel', e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                  placeholder="Например: Отлично"
                />
              </Grid>
              <Grid item xs={12}>
                <Typography gutterBottom>Шаг изменения: {question.ratingSettings.step}</Typography>
                <Slider
                  value={question.ratingSettings.step}
                  onChange={(e, val) => handleRatingChange('step', val)}
                  step={1}
                  marks
                  min={1}
                  max={5}
                />
              </Grid>
            </Grid>
          </Grid>
        );

      case 'scale':
        return (
          <Grid item xs={12}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Настройки шкалы Ликерта
            </Typography>
            {question.scaleSettings.points.map((point, index) => (
              <div key={index} className={classes.optionRow}>
                <TextField
                  className={classes.optionInput}
                  value={point}
                  onChange={(e) => {
                    const newPoints = [...question.scaleSettings.points];
                    newPoints[index] = e.target.value;
                    setQuestion({
                      ...question,
                      scaleSettings: {
                        ...question.scaleSettings,
                        points: newPoints
                      }
                    });
                  }}
                  variant="outlined"
                  size="small"
                  fullWidth
                  label={`Пункт ${index + 1}`}
                />
                {index > 0 && (
                  <IconButton 
                    onClick={() => {
                      const newPoints = question.scaleSettings.points.filter((_, i) => i !== index);
                      setQuestion({
                        ...question,
                        scaleSettings: {
                          ...question.scaleSettings,
                          points: newPoints,
                          pointsCount: newPoints.length
                        }
                      });
                    }}
                    color="secondary"
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                )}
              </div>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={() => {
                const newPoints = [...question.scaleSettings.points, `Пункт ${question.scaleSettings.points.length + 1}`];
                setQuestion({
                  ...question,
                  scaleSettings: {
                    ...question.scaleSettings,
                    points: newPoints,
                    pointsCount: newPoints.length
                  }
                });
              }}
              variant="outlined"
              color="primary"
              size="small"
            >
              Добавить пункт
            </Button>
          </Grid>
        );

      case 'text_short':
      case 'text_long':
        return (
          <Grid item xs={12}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Настройки текстового поля
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Плейсхолдер"
                  value={question.textSettings.placeholder}
                  onChange={(e) => handleTextSettingChange('placeholder', e.target.value)}
                  variant="outlined"
                  fullWidth
                  size="small"
                />
              </Grid>
              {question.type === 'text_long' && (
                <Grid item xs={12}>
                  <TextField
                    label="Количество строк"
                    type="number"
                    value={question.textSettings.rows}
                    onChange={(e) => handleTextSettingChange('rows', parseInt(e.target.value))}
                    variant="outlined"
                    fullWidth
                    size="small"
                    inputProps={{ min: 2, max: 10 }}
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  label="Максимальная длина текста (0 - без ограничений)"
                  type="number"
                  value={question.textSettings.maxLength || 0}
                  onChange={(e) => handleTextSettingChange('maxLength', parseInt(e.target.value) || null)}
                  variant="outlined"
                  fullWidth
                  size="small"
                  inputProps={{ min: 0 }}
                />
              </Grid>
            </Grid>
          </Grid>
        );

      case 'matrix':
        return (
          <Grid item xs={12}>
            <Typography variant="subtitle1" className={classes.sectionTitle}>
              Матрица вопросов
            </Typography>
            {errors.matrix && (
              <Typography className={classes.errorText}>
                {errors.matrix}
              </Typography>
            )}
            
            <Typography variant="body2" gutterBottom>Строки (параметры для оценки):</Typography>
            {question.matrixSettings.rows.map((row, index) => (
              <div key={index} className={classes.matrixRow}>
                <TextField
                  className={classes.optionInput}
                  value={row}
                  onChange={(e) => updateMatrixRow(index, e.target.value)}
                  variant="outlined"
                  size="small"
                  fullWidth
                  label={`Строка ${index + 1}`}
                />
                <IconButton 
                  onClick={() => removeMatrixRow(index)}
                  disabled={question.matrixSettings.rows.length <= 1}
                  color="secondary"
                  size="small"
                >
                  <DeleteIcon />
                </IconButton>
              </div>
            ))}
            <Button
              startIcon={<AddIcon />}
              onClick={addMatrixRow}
              variant="outlined"
              color="primary"
              size="small"
              style={{ marginBottom: 20 }}
            >
              Добавить строку
            </Button>

            <Typography variant="body2" gutterBottom>Колонки (варианты оценок):</Typography>
            <Grid container spacing={2} className={classes.matrixColumn}>
              {question.matrixSettings.columns.map((column, index) => (
                <Grid item xs={12} key={index}>
                  <div className={classes.matrixRow}>
                    <TextField
                      className={classes.optionInput}
                      value={column}
                      onChange={(e) => {
                        const newColumns = [...question.matrixSettings.columns];
                        newColumns[index] = e.target.value;
                        setQuestion({
                          ...question,
                          matrixSettings: {
                            ...question.matrixSettings,
                            columns: newColumns
                          }
                        });
                      }}
                      variant="outlined"
                      size="small"
                      fullWidth
                      label={`Колонка ${index + 1}`}
                    />
                    {index > 1 && (
                      <IconButton 
                        onClick={() => removeMatrixColumn(index)}
                        color="secondary"
                        size="small"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </div>
                </Grid>
              ))}
            </Grid>
            <Button
              startIcon={<AddIcon />}
              onClick={addMatrixColumn}
              variant="outlined"
              color="primary"
              size="small"
            >
              Добавить колонку
            </Button>
          </Grid>
        );

      default:
        return null;
    }
  };

  return (
    <Paper className={classes.root} elevation={3}>
      <Typography variant="h5" gutterBottom>
        Создание вопроса для анкеты
      </Typography>
      
      <form onSubmit={handleSubmit}>
        <Grid container spacing={3}>
          {/* Порядковый номер и вес */}
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
                size="small"
                error={!!errors.order}
                helperText={errors.order}
              />
            </FormControl>
          </Grid>
          
          <Grid item xs={6}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Вес вопроса (для статистики)"
                type="number"
                name="weight"
                value={question.weight}
                onChange={handleChange}
                inputProps={{ min: "1" }}
                variant="outlined"
                fullWidth
                size="small"
                helperText="Опционально, для подсчета важности"
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
                <MenuItem value="choice">Одиночный выбор</MenuItem>
                <MenuItem value="multiple_choice">Множественный выбор</MenuItem>
                <MenuItem value="rating">Рейтинг/Оценка</MenuItem>
                <MenuItem value="scale">Шкала Ликерта</MenuItem>
                <MenuItem value="text_short">Короткий текст</MenuItem>
                <MenuItem value="text_long">Длинный текст</MenuItem>
                <MenuItem value="boolean">Да/Нет</MenuItem>
                <MenuItem value="matrix">Матрица</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Обязательность вопроса */}
          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={question.required}
                  onChange={handleSwitchChange('required')}
                  color="primary"
                />
              }
              label="Обязательный вопрос"
            />
          </Grid>
          
          {/* Специфичные поля для разных типов вопросов */}
          {renderTypeSpecificFields()}
          
          
          
          {/* Пояснение */}
          <Grid item xs={12}>
            <FormControl className={classes.formControl}>
              <TextField
                label="Пояснение к вопросу (опционально)"
                name="explanation"
                value={question.explanation}
                onChange={handleChange}
                placeholder="Дополнительная информация для студентов"
                variant="outlined"
                multiline
                rows={2}
                fullWidth
                size="small"
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
      
      <ModalStatus 
        titleDialog={'Ошибка'} 
        openDialog={openDialog} 
        handleCloseDialog={handleCloseDialog} 
        dialogMessage={dialogMessage}
      />
    </Paper>
  );
};

export default CreateSurveyQuestionForm;