import React from 'react';
import {
  Box,
  Typography,
  Button
} from '@material-ui/core';

export const QuestionNavigation = ({ questions, getAnswerForQuestion, classes }) => {
  const handleNavigateToQuestion = (index) => {
    const element = document.getElementById(`question-${questions[index]._id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <Box className={classes.progressSection}>
      <Typography variant="h6" gutterBottom>
        Вопросы
      </Typography>
      <Box display="flex" flexWrap="wrap" gap={1} mb={2}>
        {questions.map((q, index) => {
          const answer = getAnswerForQuestion(q._id);
          const isCorrect = answer?.isCorrect;
          return (
            <Button
              key={q._id}
              variant="outlined"
              size="small"
              onClick={() => handleNavigateToQuestion(index)}
              className={classes.questionNavButton}
              style={{
                backgroundColor: isCorrect 
                  ? theme => theme.palette.success.light 
                  : theme => theme.palette.error.light,
                color: isCorrect ? '#2e7d32' : '#c62828',
                borderColor: isCorrect ? '#2e7d32' : '#c62828',
              }}
            >
              {index + 1}
            </Button>
          );
        })}
      </Box>
    </Box>
  );
};