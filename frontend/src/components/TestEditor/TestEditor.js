import React, { useState } from 'react';
import { Container, Button, Typography, Box, List, ListItem, ListItemText } from '@material-ui/core';
import CreateQuestionForm from '../CreateQuestionForm/CreateQuestionForm';
import AddIcon from '@material-ui/icons/Add';
import {
  TextField,
  Grid,
  FormControlLabel,
  Checkbox,
  IconButton
} from '@material-ui/core';
import EditIcon from '@material-ui/icons/Edit';
import DeleteIcon from '@material-ui/icons/Delete';
function TestEditor() {
    // Состояния для параметров теста
const [testName, setTestName] = useState('');
const [testDescription, setTestDescription] = useState('');
const [subject, setSubject] = useState('');
const [duration, setDuration] = useState(0);
const [maxAttempts, setMaxAttempts] = useState(1);
const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
const [passingScore, setPassingScore] = useState(60);

// Состояния для вопросов
const [questions, setQuestions] = useState([]);
const [showForm, setShowForm] = useState(false);

// Функция сохранения вопроса
const handleSaveQuestion = (question) => {
  const newQuestion = {
    ...question,
    showForm: false,
    id: Date.now(), // временный id
    order: questions.length + 1
  };
  setQuestions([...questions, newQuestion]);
};

const handleSaveUpdateQuestion = (qNew) => {
    const questionsNew = questions.map((q)=>{
    if (q.id == qNew.id) return {
        ...qNew,
        showForm: false,
    };
    return {
        ...q
    }
  })
  setQuestions(questionsNew)
}
// Функции редактирования и удаления вопросов
const handleEditQuestion = (id) => {
  // Реализация редактирования вопроса
  const questionsNew = questions.map((q)=>{
    if (q.id == id) return {
        ...q,
        showForm: true,
    };
    return {
        ...q
    }
  })
  setQuestions(questionsNew)
};

const handleDeleteQuestion = (id) => {
  setQuestions(questions.filter(q => q.id !== id));
  // Обновляем порядок вопросов
  const updatedQuestions = questions.filter(q => q.id !== id)
    .map((q, index) => ({ ...q, order: index + 1 }));
  setQuestions(updatedQuestions);
};
  

  return (
    <Container maxWidth="md">
  <Box my={4}>
    <Typography variant="h4" gutterBottom>
      Редактор тестов
    </Typography>

    {/* Форма параметров теста */}
    <Box mb={4} p={3} border="1px solid #e0e0e0" borderRadius={4}>
      <Typography variant="h6" gutterBottom>
        Основные параметры теста
      </Typography>
      <Box>
      <Button
        variant="outlined"
        color="primary"
        onClick={()=>{}}
        style={{ marginRight: '10px' }}
      >
        Редактировать
      </Button>
      <Button
        variant="contained"
        color="primary"
        onClick={()=>{}}
        disabled={!testName || !subject}
      >
        Сохранить тест
      </Button>
    </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Название теста"
            value={testName}
            onChange={(e) => setTestName(e.target.value)}
            required
            inputProps={{ minLength: 2, maxLength: 30 }}
            helperText="От 2 до 30 символов"
          />
        </Grid>
        
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Описание теста"
            value={testDescription}
            onChange={(e) => setTestDescription(e.target.value)}
            multiline
            minRows={3}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Дисциплина"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Время на прохождение (минут)"
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            required
            InputProps={{ inputProps: { min: 0 } }}
            helperText="0 = без ограничения"
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Максимальное количество попыток"
            type="number"
            value={maxAttempts}
            onChange={(e) => setMaxAttempts(e.target.value)}
            InputProps={{ inputProps: { min: 1 } }}
          />
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth
            label="Проходной балл (%)"
            type="number"
            value={passingScore}
            onChange={(e) => setPassingScore(e.target.value)}
            required
            InputProps={{ inputProps: { min: 0, max: 100 } }}
          />
        </Grid>
        
        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={showCorrectAnswers}
                onChange={(e) => setShowCorrectAnswers(e.target.checked)}
              />
            }
            label="Показывать правильные ответы после прохождения"
          />
        </Grid>
      </Grid>
    </Box>
{/* Кнопка добавления вопроса - всегда видна при наличии заполненных параметров теста */}
      <Button
        variant="contained"
        color="primary"
        startIcon={<AddIcon />}
        onClick={() => setShowForm(true)}
        style={{ marginBottom: '20px' }}
        disabled={!testName || !subject}
      >
        Добавить вопрос
      </Button>
    
    {/* Секция добавления вопросов */}
    <Box mb={3}>
      <Typography variant="h5" gutterBottom>
        Вопросы теста
      </Typography>
      
      {showForm && (
        <Box mb={3} p={3} border="1px solid #e0e0e0" borderRadius={4}>
          <CreateQuestionForm 
            testId="test123" 
            onSave={(question) => {
              handleSaveQuestion(question);
              setShowForm(false); // Закрываем форму после сохранения
            }}
            onCancel={() => setShowForm(false)}
          />
        </Box>
      )}
      
      </Box>

    {/* Список добавленных вопросов */}
    {questions.length > 0 && (
      <Box mt={4}>
        <Typography variant="h6" gutterBottom>
          Добавленные вопросы ({questions.length})
        </Typography>
        <List>
          {questions.map((q, idx) => {
          return !q.showForm ? (
            <ListItem key={q.id} divider>
              <ListItemText
                primary={`Вопрос ${q.order}: ${q.text}`}
                secondary={`Тип: ${q.type === 'single' ? 'Одиночный выбор' : q.type === 'multiple' ? 'Множественный выбор' : 'Текстовый'} | Баллы: ${q.points}`}
              />
              <IconButton edge="end" aria-label="edit" onClick={() => handleEditQuestion(q.id)}>
                <EditIcon />
              </IconButton>
              <IconButton edge="end" aria-label="delete" onClick={() => handleDeleteQuestion(q.id)}>
                <DeleteIcon />
              </IconButton>
            </ListItem>
          ) : (
             <CreateQuestionForm 
             key={q.id}
             questionOriginal={q}
            testId="test123" 
            onSave={(question) => {
              handleSaveUpdateQuestion(question);
            }}
            onCancel={() => setShowForm(false)}
          />
          )
            
})}
        </List>
      </Box>
    )}
  </Box>
</Container>
  );
}

export default TestEditor;