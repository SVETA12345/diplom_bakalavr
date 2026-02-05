import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from '@material-ui/lab';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Grid,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Avatar,
} from '@material-ui/core';
import {
  Assignment as AssignmentIcon,
  Person as PersonIcon,
  School as SchoolIcon,
  Schedule as ScheduleIcon,
} from '@material-ui/icons';
import { testsApi } from '../../utils/testsApi';
import { makeStyles } from '@material-ui/core/styles';
import * as duckAuth from '../../utils/authApi'
import LoginForm from '../../components/LoginForm/LoginForm';
import RegisterForm from '../../components/RegisterForm/RegisterForm';

const useStyles = makeStyles((theme) => ({
  root: {
    minHeight: '100vh',
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(4),
    borderRadius: theme.spacing(2),
    boxShadow: theme.shadows[3],
  },
  testInfoCard: {
    marginBottom: theme.spacing(3),
    borderLeft: `4px solid ${theme.palette.primary.main}`,
  },
  avatar: {
    backgroundColor: theme.palette.primary.main,
    width: theme.spacing(7),
    height: theme.spacing(7),
    marginRight: theme.spacing(2),
  },
  sectionTitle: {
    marginBottom: theme.spacing(3),
    color: theme.palette.text.primary,
  },
  authSection: {
    backgroundColor: theme.palette.background.paper,
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
    border: `1px solid ${theme.palette.divider}`,
  },
  authButtons: {
    '& > *': {
      marginRight: theme.spacing(2),
      marginBottom: theme.spacing(2),
    },
  },
  form: {
    marginTop: theme.spacing(3),
    '& .MuiTextField-root': {
      marginBottom: theme.spacing(2),
    },
  },
  startButton: {
    padding: theme.spacing(1.5, 4),
    fontSize: '1.1rem',
    borderRadius: theme.spacing(1),
  },
  infoItem: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(1.5),
    '& svg': {
      marginRight: theme.spacing(1.5),
      color: theme.palette.text.secondary,
    },
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '60vh',
  },
}));

const PublicTestPage = ({}) => {
  const classes = useStyles();
  const { testId } = useParams();
  const [test, setTest] = useState({
    name: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [isDisabled, setIsDisabled] = useState(false)

  useEffect(() => {
    
    checkAuth();
  }, []);

  const fetchTestData = async () => {
    setIsLoading(true);
    testsApi.getTestById(testId).then((data)=>{
      setTest(data);
      setIsLoading(false);
    })
    .catch(err => {
      setIsLoading(false); console.log(err)
  })
  };

  const checkAuth = () => {
    duckAuth.getContent().then((user)=> {console.log(user); fetchTestData(); setIsAuthenticated(true)})
    .catch(err =>  setIsAuthenticated(false))
  };

  const handleLogin = async (credentials) => {
    duckAuth.authorize(credentials, setIsDisabled).then((data)=>{
      setIsAuthenticated(true);
      setShowLogin(false);
      setError('');
      fetchTestData();
    })
    .catch((error)=>{
      setError('Ошибка при входе. Пожалуйста, попробуйте позже.');
    })
  };

  const handleRegister = async (userData) => {
    duckAuth.register({ ...userData, role: 'student' }, setIsDisabled).then((data)=>{
           duckAuth.authorize({email: userData.email, password: userData.password}, setIsDisabled).then((data)=>{
                 // 3. Автоматически логиним пользователя
                setIsAuthenticated(true);
                setShowRegister(false);
                setError('');
                fetchTestData();
              }
               
              ).catch((err)=> setError(err || 'Ошибка регистрации'))
        }
        ).catch((err)=> setError(err || 'Ошибка регистрации'))
    
  };

  const handleStartTest = () => {
    console.log('pff')
    window.location.href = `/test_take/${testId}/start`;
  };

  if (isLoading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress size={60} />
      </Container>
    );
  }

  if (error && !test) {
    return (
      <Container maxWidth="md" className={classes.root}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }
  console.log('yeye')
  return (
    <Container maxWidth="md" className={classes.root}>
      <Paper className={classes.paper} elevation={0}>
        {/* Информация о тесте */}
        <Card className={classes.testInfoCard} elevation={0}>
          <CardContent>
            <Box display="flex" alignItems="center" mb={3}>
              <Avatar className={classes.avatar}>
                <AssignmentIcon fontSize="large" />
              </Avatar>
              <Box>
                <Typography variant="h4" component="h1" gutterBottom>
                  {test.name}
                </Typography>
                <Typography variant="subtitle1" color="textSecondary">
                  {test.description}
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Box className={classes.infoItem}>
                  <SchoolIcon />
                  <Typography variant="body1">
                    <strong>Дисциплина:</strong> {test.subject}
                  </Typography>
                </Box>
                
                <Box className={classes.infoItem}>
                  <ScheduleIcon />
                  <Typography variant="body1">
                    <strong>Время на выполнение:</strong> {test.duration} мин.
                  </Typography>
                </Box>
              </Grid>
              
              <Grid item xs={12} md={6}>
                <Box className={classes.infoItem}>
                  <Typography variant="body1">
                    <strong>Минимальный балл:</strong> {test.passingScore}%
                  </Typography>
                </Box>
                
                
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Divider />

        {/* Если пользователь не авторизован */}
        {!isAuthenticated ? (
          <Box mt={4}>
            <Typography variant="h5" className={classes.sectionTitle} gutterBottom>
              Для прохождения теста необходимо войти в систему
            </Typography>

            {error && (
              <Box mb={2}>
                <Alert severity="error" onClose={() => setError('')}>
                  {error}
                </Alert>
              </Box>
            )}

            {!showLogin && !showRegister && (
              <Box className={classes.authButtons}>
                <Button
                  variant="contained"
                  color="primary"
                  size="large"
                  onClick={() => {
                    setShowLogin(true);
                    setShowRegister(false);
                    setError('');
                  }}
                  startIcon={<PersonIcon />}
                >
                  Войти
                </Button>
                
                <Button
                  variant="outlined"
                  color="primary"
                  size="large"
                  onClick={() => {
                    setShowRegister(true);
                    setShowLogin(false);
                    setError('');
                  }}
                >
                  Зарегистрироваться
                </Button>
              </Box>
            )}

            {/* Форма входа */}
            {showLogin && (
              <LoginForm 
                useStyles={useStyles}
                isDisabled={isDisabled}
                onSubmit={handleLogin} 
                onCancel={(e) => {
                  e.preventDefault()
                  setShowLogin(false);
                  setError('');
                }}
              />
            )}

            {/* Форма регистрации */}
            {showRegister && (
              <RegisterForm 
                useStyles={useStyles}
                onSubmit={handleRegister} 
                onCancel={() => {
                  setShowRegister(false);
                  setError('');
                }}
              />
            )}
          </Box>
        ) : (
          /* Если пользователь авторизован */
          <Box mt={4} textAlign="center">
            <Typography variant="h6" gutterBottom>
              Вы авторизованы как студент
            </Typography>
            <Button
              variant="contained"
              color="primary"
              size="large"
              className={classes.startButton}
              onClick={handleStartTest}
              startIcon={<AssignmentIcon />}
            >
              Начать тестирование
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};





export default PublicTestPage;