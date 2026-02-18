import React from 'react';
import {
  Box,
  Typography,
  RadioGroup,
  FormControlLabel,
  Radio,
  FormGroup,
  Checkbox,
  Chip,
  TextField
} from '@material-ui/core';
import { CheckCircle as CorrectIcon } from '@material-ui/icons';

export const AnswerRenderer = ({ question, answer, classes }) => {
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
          <Typography variant="subtitle2" className={
                           classes.correctOption
                          } gutterBottom>
           { `Правильный ответ: ${answer.correctAnswer}`}
          </Typography>
        </Box>
      );

    default:
      return null;
  }
};