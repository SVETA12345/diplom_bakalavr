import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  Grid,
  IconButton,
  InputAdornment
} from '@material-ui/core';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@material-ui/icons';
// Компонент формы регистрации
const RegisterForm = ({ onSubmit, onCancel, useStyles }) => {
  const classes = useStyles();
  const [formData, setFormData] = useState({
    surname: '',
    name: '',
    patronomic: '',
    email: '',
    password: '',
    group: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <Typography variant="h6" gutterBottom>
        Регистрация студента
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="surname"
            label="Фамилия"
            value={formData.surname}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="name"
            label="Имя"
            value={formData.name}
            onChange={handleChange}
            required
            variant="outlined"
          />
        </Grid>
        
        <Grid item xs={12} sm={4}>
          <TextField
            fullWidth
            name="patronomic"
            label="Отчество"
            value={formData.patronomic}
            onChange={handleChange}
            variant="outlined"
          />
        </Grid>
      </Grid>
      
      <TextField
        fullWidth
        name="email"
        label="Email"
        type="email"
        value={formData.email}
        onChange={handleChange}
        required
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <EmailIcon color="action" />
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        name="password"
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        value={formData.password}
        onChange={handleChange}
        required
        variant="outlined"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <LockIcon color="action" />
            </InputAdornment>
          ),
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                onClick={() => setShowPassword(!showPassword)}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />
      
      <TextField
        fullWidth
        name="group"
        label="Группа"
        value={formData.group}
        onChange={handleChange}
        required
        variant="outlined"
      />
      
      <Box mt={2}>
        <Button
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          Зарегистрироваться
        </Button>
        
        <Button
          variant="text"
          color="default"
          onClick={onCancel}
          fullWidth
          style={{ marginTop: 8 }}
        >
          Отмена
        </Button>
      </Box>
    </form>
  );
};

export default RegisterForm;