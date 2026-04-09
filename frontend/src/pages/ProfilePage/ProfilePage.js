import { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Grid,
  Avatar,
  Box,
  Divider,
  CircularProgress,
  Card,
  CardContent,
  CardActions,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import { Autocomplete } from '@material-ui/lab';
import {
  Save as SaveIcon,
  ExitToApp as ExitIcon,
  Edit as EditIcon,
} from '@material-ui/icons';
import { useSelector } from 'react-redux';
import { updateUserData, logout } from '../../utils/authApi';
import SnackbarCustom from '../../components/SnackbarCustom/SnackbarCustom';
import Header from '../../components/Header/Header';
import constants from '../../utils/constants';

// Стили компонента
const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(4),
    marginBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(3),
    borderRadius: theme.spacing(1),
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: theme.spacing(3),
  },
  avatar: {
    width: theme.spacing(8),
    height: theme.spacing(8),
    marginRight: theme.spacing(2),
    backgroundColor: theme.palette.primary.main,
  },
  title: {
    flexGrow: 1,
  },
  formSection: {
    marginTop: theme.spacing(3),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    color: theme.palette.text.secondary,
  },
  buttonContainer: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: theme.spacing(2),
    marginTop: theme.spacing(3),
  },
  button: {
    marginLeft: theme.spacing(1),
  },
  divider: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  infoCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.default,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '400px',
  },
  roleChip: {
    display: 'inline-block',
    padding: theme.spacing(0.5, 2),
    borderRadius: theme.spacing(2),
    backgroundColor: theme.palette.primary.light,
    color: theme.palette.primary.contrastText,
    fontSize: '0.875rem',
    fontWeight: 500,
  },
}));

const ProfilePage = () => {
  const {departmentsData} = constants;
  console.log('departmentsData', departmentsData)
  const classes = useStyles();
  const user = useSelector(state => state.user);
  // Состояния для данных пользователя
  const [userData, setUserData] = useState({
    name: '',
    surname: '',
    patronomic: '',
    role: '',
    department: '',
    group: '',
    email: '',
  });

  const [originalData, setOriginalData] = useState({});
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  


  // Обработчик изменения полей формы
  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // Обработчик сохранения изменений
  const handleSave = async () => {
      setSaving(true);
      updateUserData(userData).then((userCurrent) =>{
        setUserData(userCurrent);
        setOriginalData(userCurrent);
        setIsEditing(false);
        showSnackbar('Данные успешно сохранены', 'success');
        setSaving(false);
      })
      .catch((err) =>{
        setSaving(false);
        showSnackbar('Ошибка при сохранении данных', 'error');
      })
      
  };

  // Обработчик отмены изменений
  const handleCancel = () => {
    setUserData(originalData);
    setIsEditing(false);
  };

  // Обработчик выхода из профиля
  const handleLogout = async () => {
    logout().then(()=>{
        window.location.href = '/signin'
    })
    .catch(()=>{
        showSnackbar('Ошибка при выходе из системы', 'error');
    })
  };

  // Показать уведомление
  const showSnackbar = (message, severity) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };


  // Получение инициалов пользователя
  const getUserInitials = () => {
    return `${userData.name?.[0] || ''}${userData.surname?.[0] || ''}`.toUpperCase();
  };
  //Загрузка данных пользователя
  useEffect(() => {
    setUserData(user);
      setOriginalData(user);
  }, []);
  if (loading) {
    return (
      <Container className={classes.loadingContainer}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <>
     <Header>
        <div className="navigation">
          <nav className="navigation__another-button">
            <Link to="/glavnay" className="navigation__button">
              Главная
            </Link>
            <Link
              to="/lk"
              className="navigation__button navigation__button_active"
            >
              Личный кабинет
            </Link>
          </nav>
        </div>
      </Header>
    <Container maxWidth="md" className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        {/* Заголовок профиля */}
        <Box className={classes.header}>
          <Avatar className={classes.avatar}>
            {getUserInitials() || <EditIcon />}
          </Avatar>
          <Box className={classes.title}>
            <Typography variant="h5" component="h1">
              Личный кабинет
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {userData.surname} {userData.name} {userData.patronomic}
            </Typography>
          </Box>
          <Box>
            <span className={classes.roleChip}>
              {userData.role === 'teacher' ? 'Преподаватель' : 
               userData.role === 'student' ? 'Студент' : userData.role}
            </span>
          </Box>
        </Box>

        <Divider className={classes.divider} />

        {/* Информационная карточка */}
        <Card className={classes.infoCard} variant="outlined">
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="textSecondary">
                  Email
                </Typography>
                <Typography variant="body1">
                  {userData.email}
                </Typography>
              </Grid>
              {userData.role === 'teacher' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Кафедра
                  </Typography>
                  <Typography variant="body1">
                    {userData.department || 'Не указано'}
                  </Typography>
                </Grid>
              )}
              {userData.role === 'student' && (
                <Grid item xs={12} sm={6}>
                  <Typography variant="body2" color="textSecondary">
                    Группа
                  </Typography>
                  <Typography variant="body1">
                    {userData.group || 'Не указано'}
                  </Typography>
                </Grid>
              )}
            </Grid>
          </CardContent>
          <CardActions>
            <Button
              size="small"
              color="primary"
              onClick={() => setIsEditing(true)}
              startIcon={<EditIcon />}
            >
              Редактировать профиль
            </Button>
          </CardActions>
        </Card>

        {/* Форма редактирования */}
        {isEditing && (
          <>
            <Typography variant="h6" className={classes.sectionTitle}>
              Редактирование профиля
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Фамилия"
                  name="surname"
                  value={userData.surname || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ minLength: 2, maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Имя"
                  name="name"
                  value={userData.name || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ minLength: 2, maxLength: 30 }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  fullWidth
                  label="Отчество"
                  name="patronomic"
                  value={userData.patronomic || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  inputProps={{ minLength: 2, maxLength: 30 }}
                />
              </Grid>

              {userData.role === 'teacher' && (
                 <Grid item xs={12}>
                                    <Autocomplete
                                        size="small"
                                        name="department"
                                        freeSolo
                                        value={userData.department || ''}
                                        options={departmentsData}
                                        onBlur={handleChange}
                                        onChange={handleChange}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                label="Факультет"
                                                variant="outlined"
                                            />
                                        )}
                                    />
                                </Grid>
              )}

              {userData.role === 'student' && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Группа"
                    name="group"
                    value={userData.group || ''}
                    onChange={handleChange}
                    variant="outlined"
                    size="small"
                  />
                </Grid>
              )}

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  type="email"
                  value={userData.email || ''}
                  onChange={handleChange}
                  variant="outlined"
                  size="small"
                  disabled
                  helperText="Email нельзя изменить"
                />
              </Grid>
            </Grid>

            <Box className={classes.buttonContainer}>
              <Button
                variant="outlined"
                color="default"
                onClick={handleCancel}
                disabled={saving}
              >
                Отмена
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={20} /> : <SaveIcon />}
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </Button>
            </Box>
          </>
        )}

        <Divider className={classes.divider} />

        {/* Кнопка выхода */}
        <Box display="flex" justifyContent="flex-end">
          <Button
            variant="contained"
            color="secondary"
            onClick={handleLogout}
            startIcon={<ExitIcon />}
          >
            Выйти из профиля
          </Button>
        </Box>
      </Paper>

      {/* Уведомления */}
      <SnackbarCustom 
         setSnackbar={setSnackbar} snackbar={snackbar}
      />
    </Container>
    </>
  );
};

export default ProfilePage;