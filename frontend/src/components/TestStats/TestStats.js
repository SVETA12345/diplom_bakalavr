import {
  Assessment as AssessmentIcon,
  CheckCircle as CheckCircleIcon,
  TrendingUp as TrendingUpIcon,
} from '@material-ui/icons';
import {
  Grid,
  Paper,
  Typography,
  CardContent,
  Avatar,
  Box,
} from '@material-ui/core';
// Компонент статистики теста
const TestStats = ({ attempts, useStyles }) => {
  const classes = useStyles();
  
  const totalAttempts = attempts.length;
  const passedAttempts = attempts.filter(a => a.passed).length;
  const avgScore = attempts.reduce((acc, a) => acc + (a.percentage || 0), 0) / totalAttempts || 0;
  
  const stats = [
    {
      title: 'Всего попыток',
      value: totalAttempts,
      icon: <AssessmentIcon />,
      color: '#2196f3'
    },
    {
      title: 'Успешно сдано',
      value: passedAttempts,
      icon: <CheckCircleIcon />,
      color: '#4caf50'
    },
    {
      title: 'Средний балл',
      value: `${avgScore.toFixed(1)}%`,
      icon: <TrendingUpIcon />,
      color: '#ff9800'
    },
    
  ];

  return (
    <Grid container spacing={3}>
      {stats.map((stat, index) => (
        <Grid item xs={12} sm={6} md={3} key={index}>
          <Paper className={classes.statsCard} elevation={3}>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="textSecondary" gutterBottom variant="body2">
                    {stat.title}
                  </Typography>
                  <Typography variant="h4" component="h2">
                    {stat.value}
                  </Typography>
                </Box>
                <Avatar style={{ backgroundColor: stat.color, width: 56, height: 56 }}>
                  {stat.icon}
                </Avatar>
              </Box>
            </CardContent>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TestStats;
