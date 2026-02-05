import { useState } from 'react';
import {
  Typography,
  Box,
  Button,
  TextField,
  IconButton,
  InputAdornment
} from '@material-ui/core';
import {
  Email as EmailIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff
} from '@material-ui/icons';

// Компонент формы входа
const LoginForm = ({ onSubmit, onCancel, isDisabled, useStyles }) => {
  const classes = useStyles();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ email, password });
  };

  return (
    <form onSubmit={handleSubmit} className={classes.form}>
      <Typography variant="h6" gutterBottom>
        Вход в систему
      </Typography>
      
      <TextField
        fullWidth
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
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
        label="Пароль"
        type={showPassword ? 'text' : 'password'}
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
      
      <Box mt={2}>
        <Button
          disabled={isDisabled}
          type="submit"
          variant="contained"
          color="primary"
          size="large"
          fullWidth
        >
          Войти
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

export default LoginForm;