import React from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  Chip
} from '@material-ui/core';

export const StatisticsCards = ({ attempt, test, questions, classes }) => {
  const correctAnswersCount = attempt.answers?.filter(a => a.isCorrect)?.length || 0;
  const totalQuestions = questions.length;

  return (
    <>
      <Card className={classes.scoreCard}>
        <Grid container alignItems="center" justify="space-between">
          <Grid item>
            <Box display="flex" alignItems="center">
              <span className={classes.scoreValue}>
                {attempt.percentage}%
              </span>
            </Box>
          </Grid>
          <Grid item>
            <Chip
              label={attempt.passed ? 'ТЕСТ ПРОЙДЕН' : 'ТЕСТ НЕ ПРОЙДЕН'}
              color={attempt.passed ? 'primary' : 'secondary'}
              className={classes.resultBadge}
            />
          </Grid>
        </Grid>
      </Card>

      <Grid container spacing={3} className={classes.statsGrid}>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" className={classes.statItem}>
            <Typography className={classes.statValue}>
              {correctAnswersCount}
            </Typography>
            <Typography className={classes.statLabel}>
              Правильных ответов
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" className={classes.statItem}>
            <Typography className={classes.statValue}>
              {totalQuestions - correctAnswersCount}
            </Typography>
            <Typography className={classes.statLabel}>
              Неправильных ответов
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" className={classes.statItem}>
            <Typography className={classes.statValue}>
              {attempt.totalScore || 0}
            </Typography>
            <Typography className={classes.statLabel}>
              Набрано баллов
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper variant="outlined" className={classes.statItem}>
            <Typography className={classes.statValue}>
              {test.passingScore}%
            </Typography>
            <Typography className={classes.statLabel}>
              Проходной балл
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </>
  );
};