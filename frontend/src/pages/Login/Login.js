import './Login.css';
import { Link, useNavigate } from 'react-router-dom'; 
import Header from '../../components/Header/Header'
import { useState } from 'react';
import {
  TextField,
  Button,
  Grid
} from "@material-ui/core";
import * as duckAuth from '../../utils/authApi'
import { useDispatch } from 'react-redux';
import { loginUser } from '../../services/actions/user';

function Login(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loginData, setLoginData] = useState({});
    const [isDisabled, setIsDisabled] = useState(false)
    
    const handleFilterChange = (field, value) => {
    setLoginData(prev => ({
        ...prev,
        [field]: value
      }));
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSaveRegistr = (e) => {
    duckAuth.authorize(loginData, setIsDisabled).then((data)=>{
        const user = data.admin
        dispatch(loginUser({
                        name: user.name,
                        surname: user.surname,
                        patronomic: user.patronomic,
                        department: user.department,
                        email: user.email,
                        role: user.role,
                        password: user.password,
                        token: data.token,
                        isAuthenticated: true
                }));
        navigate('/glavnay')
    }
     
    ).catch((err) => console.log(err))
    setIsDisabled(false)
  }

  return (
      <div >
        <Header>
            <div className='navigation'>
                <nav className='navigation__another-button'>
                    <Link to='/signup' className='navigation__button'>Регистрация</Link>
                    <Link to='/signin' className='navigation__button navigation__button_active'>Войти</Link>
                </nav>
            </div>
        </Header>
        <main className='registr'>
            <h3 className='registr__title'>Вход</h3>
            <Grid container className='registr__item'>
                
                 <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Почта"
                        value={loginData.email || ''}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="email"
                        required  // Добавляем обязательность
                        error={!loginData.email || !validateEmail(loginData.email)}  // Подсветка ошибки, если поле пустое
                        helperText={!loginData.email 
                            ? "Поле обязательно для заполнения" 
                            : !validateEmail(loginData.email)
                            ? "Введите корректный email адрес"
                            : ""}  // Сообщение об ошибке
                        />
                </Grid>
                <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Пароль"
                        value={loginData.password || ''}
                        onChange={(e) => handleFilterChange('password', e.target.value)}
                        variant="outlined"
                        size="small"
                        required  // Добавляем обязательность
                        error={!loginData.password}  // Подсветка ошибки, если поле пустое
                        helperText={!loginData.password ? "Поле обязательно для заполнения" : ""}  // Сообщение об ошибке
                    />
                </Grid>
                <Grid item className='registr__menu'>
                    <Button
                        variant="contained"
                        onClick={handleSaveRegistr}
                        disabled={
                            isDisabled ||
                            !loginData.email  || !validateEmail(loginData.email)  || !loginData.password
                        }
                        color="primary"
                        size="large"
                        fullWidth>Войти</Button>
                </Grid>
            </Grid>
        </main>
      </div>
  );
}

export default Login;