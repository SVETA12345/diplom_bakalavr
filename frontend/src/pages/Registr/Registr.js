import './Registr.css';
import { Link } from 'react-router-dom'; 
import Header from '../../components/Header/Header'
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  TextField,
  Button,
  Grid
} from "@material-ui/core";
import { Autocomplete } from '@material-ui/lab';
import * as duckAuth from '../../utils/authApi'
import { createUser, loginUser } from '../../services/actions/user';

function Registr(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [registrData, setRegistrData] = useState({role: 'teacher'});
    const [isDisabled, setIsDisabled] = useState(false)
    const departmentsData=['Автоматика и вычислительная техника', 'Геология и геофизика нефти и газа',
        'Разработка нефтяных и газовых месторождений', 'Проектирование, сооружение и эксплуатация систем трубопроводного транспорта',
        'Инженерная механика', 'Химическая технология и экология', 'Комплексная безопасность ТЭК',
        'Экономика и управление', 'Международный энергетический бизнес', 'Гуманитарное образование'
    ]
    const handleFilterChange = (field, value) => {
    setRegistrData(prev => ({
        ...prev,
        [field]: value
      }));
  };
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const handleSaveRegistr = (e) => {
    duckAuth.register(registrData, setIsDisabled).then((data)=>{
        dispatch(createUser({
        name: registrData.name,
        surname: registrData.surname,
        patronomic: registrData.patronomic,
        department: registrData.department,
        email: registrData.email,
        role: registrData.role,
        password: registrData.password
      }));
       duckAuth.authorize({email: registrData.email, password: registrData.password}, setIsDisabled).then((data)=>{
             // 3. Автоматически логиним пользователя
            dispatch(loginUser({
                name: registrData.name,
                surname: registrData.surname,
                patronomic: registrData.patronomic,
                department: registrData.department,
                email: registrData.email,
                role: registrData.role,
                password: registrData.password,
                token: data.token,
                isAuthenticated: true
            }));
            navigate('/glavnay')
          }
           
          ).catch((err)=> console.log(err))
    }
    ).catch((err)=> console.log(err))
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
            <h3 className='registr__title'>Регистрация</h3>
            <Grid container className='registr__item'>
                <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Имя"
                        value={registrData.name || ''}
                        onChange={(e) => handleFilterChange('name', e.target.value)}
                        variant="outlined"
                        size="small"
                        required  // Добавляем обязательность
                        error={!registrData.name}  // Подсветка ошибки, если поле пустое
                        helperText={!registrData.name ? "Поле обязательно для заполнения" : ""}  // Сообщение об ошибке
                    />
                </Grid>
                <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Фамилия"
                        value={registrData.surname || ''}
                        onChange={(e) => handleFilterChange('surname', e.target.value)}
                        variant="outlined"
                        size="small"
                        required  // Добавляем обязательность
                        error={!registrData.surname}  // Подсветка ошибки, если поле пустое
                        helperText={!registrData.surname ? "Поле обязательно для заполнения" : ""}  // Сообщение об ошибке
                    />
                </Grid>
                <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Отчество"
                        value={registrData.patronomic || ''}
                        onChange={(e) => handleFilterChange('patronomic', e.target.value)}
                        variant="outlined"
                        size="small"
                        required  // Добавляем обязательность
                        error={!registrData.patronomic}  // Подсветка ошибки, если поле пустое
                        helperText={!registrData.patronomic ? "Поле обязательно для заполнения" : ""}  // Сообщение об ошибке
                    />
                </Grid>
                <Grid item className='registr__menu'>
                    <Autocomplete
                        size="small"
                        freeSolo
                        value={registrData.department || ''}
                        options={departmentsData}
                        onBlur={(event, newValue) => {
                            handleFilterChange('department', event.target.value || '');
                        }}
                        onChange={(event, newValue) => {
                            handleFilterChange('department', newValue || '');
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Факультет"
                                variant="outlined"
                            />
                        )}
                    />
                </Grid>
                 <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Почта"
                        value={registrData.email || ''}
                        onChange={(e) => handleFilterChange('email', e.target.value)}
                        variant="outlined"
                        size="small"
                        type="email"
                        required  // Добавляем обязательность
                        error={!registrData.email || !validateEmail(registrData.email)}  // Подсветка ошибки, если поле пустое
                        helperText={!registrData.email 
                            ? "Поле обязательно для заполнения" 
                            : !validateEmail(registrData.email)
                            ? "Введите корректный email адрес"
                            : ""}  // Сообщение об ошибке
                        />
                </Grid>
                <Grid item className='registr__menu'>
                    <TextField
                        fullWidth
                        label="Пароль"
                        value={registrData.password || ''}
                        onChange={(e) => handleFilterChange('password', e.target.value)}
                        variant="outlined"
                        size="small"
                        required  // Добавляем обязательность
                        error={!registrData.password}  // Подсветка ошибки, если поле пустое
                        helperText={!registrData.password ? "Поле обязательно для заполнения" : ""}  // Сообщение об ошибке
                    />
                </Grid>
                <Grid item className='registr__menu'>
                    <Button
                        variant="contained"
                        onClick={handleSaveRegistr}
                        disabled={
                            isDisabled ||
                            !registrData.name || !registrData.surname || !registrData.patronomic ||
                            !registrData.email  || !validateEmail(registrData.email)  || !registrData.password
                        }
                        color="primary"
                        size="large"
                        fullWidth>Сохранить</Button>
                </Grid>
            </Grid>
        </main>
      </div>
  );
}

export default Registr;