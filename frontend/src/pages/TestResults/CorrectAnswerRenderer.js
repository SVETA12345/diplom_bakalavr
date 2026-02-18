import React from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  TextField
} from '@material-ui/core';

export const CorrectAnswerRenderer = ({ question, answer, classes, test }) => {
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
      console.log('syka', question)
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
      console.log('question', question)
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
          {answer?.correctAnswerText && (
            <Box mt={1}>
              <Typography variant="body2">
                {answer.correctAnswerText}
              </Typography>
            </Box>
          )}
        </Box>
      );

    default:
      return null;
  }
};