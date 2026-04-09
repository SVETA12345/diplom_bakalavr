import './Login.css';
import { Link, useNavigate } from 'react-router-dom'; 
import Header from '../../components/Header/Header'
import { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  Grid,
  CircularProgress
} from "@material-ui/core";
import * as duckAuth from '../../utils/authApi'
import { useDispatch } from 'react-redux';
import { loginUser } from '../../services/actions/user';
import ModalStatus from "../../components/ModalStatus/ModalStatus";

function Login(props) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const [loginData, setLoginData] = useState({});
    const [twoFactorCode, setTwoFactorCode] = useState('');
    const [requiresTwoFactor, setRequiresTwoFactor] = useState(false);
    const [isDisabled, setIsDisabled] = useState(false);
    const [loading, setLoading] = useState(false);
    
    // Состояния для сброса пароля
    const [resetMode, setResetMode] = useState(false);
    const [resetEmail, setResetEmail] = useState('');
    const [resetCode, setResetCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [resetStep, setResetStep] = useState(1); // 1: запрос email, 2: ввод кода и нового пароля
    
    const [modal, setModal] = useState({
        titleDialog: '',
        openDialog: false,
        dialogMessage: ''
    });
    
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
        e.preventDefault();
        
        if (requiresTwoFactor && !twoFactorCode) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Пожалуйста, введите код из письма'
            });
            return;
        }
        
        const loginPayload = requiresTwoFactor 
            ? { ...loginData, twoFactorCode }
            : loginData;
        
        setLoading(true);
        setIsDisabled(true);
        
        duckAuth.authorizeWithTwoFactor(loginPayload)
            .then((data) => {
                if (data.requiresTwoFactor) {
                    setRequiresTwoFactor(true);
                    setModal({
                        titleDialog: 'Подтверждение',
                        openDialog: true,
                        dialogMessage: 'Код подтверждения отправлен на вашу почту'
                    });
                } else {
                    const user = data.admin;
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
                    navigate('/glavnay');
                }
            })
            .catch((err) => {
                let errorMessage = 'Произошла ошибка!';
                
                if (err.message) {
                    if (err.message.includes('код') || err.message.includes('Verification')) {
                        errorMessage = 'Неверный код подтверждения. Попробуйте снова.';
                        setTwoFactorCode('');
                    } else if (err.message.includes('пароль') || err.message.includes('password')) {
                        errorMessage = 'Неверный пароль. Попробуйте снова.';
                        setLoginData(prev => ({ ...prev, password: '' }));
                    } else if (err.message.includes('email')) {
                        errorMessage = 'Пользователь с таким email не найден.';
                    } else {
                        errorMessage = err.message;
                    }
                }
                
                setModal({
                    titleDialog: 'Ошибка',
                    openDialog: true,
                    dialogMessage: errorMessage
                });
            })
            .finally(() => {
                setLoading(false);
                setIsDisabled(false);
            });
    };
    
    const handleResendCode = () => {
        if (!loginData.email) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Email не указан'
            });
            return;
        }
        
        setLoading(true);
        
        duckAuth.resendTwoFactorCode(loginData.email)
            .then(() => {
                setModal({
                    titleDialog: 'Успешно',
                    openDialog: true,
                    dialogMessage: 'Новый код отправлен на вашу почту'
                });
            })
            .catch((err) => {
                setModal({
                    titleDialog: 'Ошибка',
                    openDialog: true,
                    dialogMessage: err.message || 'Не удалось отправить код. Попробуйте позже.'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    // Обработчик сброса пароля - отправка кода
    const handleSendResetCode = (e) => {
        e.preventDefault();
        
        if (!resetEmail || !validateEmail(resetEmail)) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Введите корректный email адрес'
            });
            return;
        }
        
        setLoading(true);
        
        duckAuth.sendResetCode(resetEmail)
            .then(() => {
                setResetStep(2);
                setModal({
                    titleDialog: 'Успешно',
                    openDialog: true,
                    dialogMessage: 'Код для сброса пароля отправлен на вашу почту'
                });
            })
            .catch((err) => {
                setModal({
                    titleDialog: 'Ошибка',
                    openDialog: true,
                    dialogMessage: err.message || 'Не удалось отправить код. Попробуйте позже.'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    // Обработчик подтверждения кода и установки нового пароля
    const handleResetPassword = (e) => {
        e.preventDefault();
        
        if (!resetCode || resetCode.length !== 6) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Введите 6-значный код из письма'
            });
            return;
        }
        
        if (!newPassword || newPassword.length < 6) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Пароль должен содержать не менее 6 символов'
            });
            return;
        }
        
        if (newPassword !== confirmPassword) {
            setModal({
                titleDialog: 'Ошибка',
                openDialog: true,
                dialogMessage: 'Пароли не совпадают'
            });
            return;
        }
        
        setLoading(true);
        
        duckAuth.verifyCodeAndResetPassword(resetEmail, resetCode, newPassword)
            .then(() => {
                setModal({
                    titleDialog: 'Успешно',
                    openDialog: true,
                    dialogMessage: 'Пароль успешно изменён. Теперь вы можете войти с новым паролем.'
                });
                // Возвращаемся к форме входа
                setResetMode(false);
                setResetStep(1);
                setResetEmail('');
                setResetCode('');
                setNewPassword('');
                setConfirmPassword('');
            })
            .catch((err) => {
                setModal({
                    titleDialog: 'Ошибка',
                    openDialog: true,
                    dialogMessage: err.message || 'Не удалось сбросить пароль. Проверьте код и попробуйте снова.'
                });
            })
            .finally(() => {
                setLoading(false);
            });
    };
    
    const handleCloseDialog = () => {
        setModal({
            titleDialog: '',
            openDialog: false,
            dialogMessage: ''
        });
    };
    
    const handleBackToLogin = () => {
        setRequiresTwoFactor(false);
        setTwoFactorCode('');
        setLoginData(prev => ({ ...prev, password: '' }));
    };
    
    const handleBackToLoginFromReset = () => {
        setResetMode(false);
        setResetStep(1);
        setResetEmail('');
        setResetCode('');
        setNewPassword('');
        setConfirmPassword('');
    };
    
    useEffect(() => {
        duckAuth.getContent().then((user) => {
            if (user.name) {
                dispatch(loginUser({
                    name: user.name,
                    surname: user.surname,
                    patronomic: user.patronomic,
                    department: user.department,
                    email: user.email,
                    role: user.role,
                    password: user.password,
                    isAuthenticated: true
                }));
                navigate('/glavnay');
            }
        }).catch((err) => console.log(err));
    }, [dispatch, navigate]);
    
    // Форма сброса пароля
    if (resetMode) {
        return (
            <div>
                <Header>
                    <div className='navigation'>
                        <nav className='navigation__another-button'>
                            <Link to='/signup' className='navigation__button'>Регистрация</Link>
                            <Link to='/signin' className='navigation__button navigation__button_active'>Войти</Link>
                        </nav>
                    </div>
                </Header>
                <main className='registr'>
                    <h3 className='registr__title'>
                        {resetStep === 1 ? 'Сброс пароля' : 'Создание нового пароля'}
                    </h3>
                    
                    <form onSubmit={resetStep === 1 ? handleSendResetCode : handleResetPassword}>
                        <Grid container className='registr__item'>
                            {resetStep === 1 ? (
                                // Шаг 1: ввод email для сброса
                                <>
                                    <Grid item className='registr__menu'>
                                        <TextField
                                            fullWidth
                                            label="Email"
                                            value={resetEmail}
                                            onChange={(e) => setResetEmail(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            type="email"
                                            required
                                            disabled={loading}
                                            error={resetEmail && !validateEmail(resetEmail)}
                                            helperText={resetEmail && !validateEmail(resetEmail) ? "Введите корректный email" : ""}
                                            placeholder="example@mail.ru"
                                        />
                                    </Grid>
                                    
                                    <Grid item className='registr__menu'>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={loading || !resetEmail || !validateEmail(resetEmail)}
                                            color="primary"
                                            size="large"
                                            fullWidth
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Отправить код'}
                                        </Button>
                                    </Grid>
                                </>
                            ) : (
                                // Шаг 2: ввод кода и нового пароля
                                <>
                                    <Grid item className='registr__menu'>
                                        <TextField
                                            fullWidth
                                            label="Код из письма"
                                            value={resetCode}
                                            onChange={(e) => setResetCode(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            type="text"
                                            required
                                            disabled={loading}
                                            placeholder="000000"
                                            inputProps={{
                                                maxLength: 6,
                                                pattern: '[0-9]*',
                                                inputMode: 'numeric',
                                                style: { textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }
                                            }}
                                        />
                                    </Grid>
                                    
                                    <Grid item className='registr__menu'>
                                        <TextField
                                            fullWidth
                                            label="Новый пароль"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            type="password"
                                            required
                                            disabled={loading}
                                            error={newPassword && newPassword.length < 6}
                                            helperText={newPassword && newPassword.length < 6 ? "Пароль должен быть не менее 6 символов" : ""}
                                        />
                                    </Grid>
                                    
                                    <Grid item className='registr__menu'>
                                        <TextField
                                            fullWidth
                                            label="Подтверждение пароля"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            variant="outlined"
                                            size="small"
                                            type="password"
                                            required
                                            disabled={loading}
                                            error={confirmPassword && newPassword !== confirmPassword}
                                            helperText={confirmPassword && newPassword !== confirmPassword ? "Пароли не совпадают" : ""}
                                        />
                                    </Grid>
                                    
                                    <Grid item className='registr__menu'>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={
                                                loading ||
                                                !resetCode ||
                                                resetCode.length !== 6 ||
                                                !newPassword ||
                                                newPassword.length < 6 ||
                                                newPassword !== confirmPassword
                                            }
                                            color="primary"
                                            size="large"
                                            fullWidth
                                        >
                                            {loading ? <CircularProgress size={24} color="inherit" /> : 'Сбросить пароль'}
                                        </Button>
                                    </Grid>
                                </>
                            )}
                            
                            <Grid item className='registr__menu'>
                                <Button
                                    variant="text"
                                    onClick={handleBackToLoginFromReset}
                                    disabled={loading}
                                    size="small"
                                    fullWidth
                                    style={{ textTransform: 'none' }}
                                >
                                    ← Вернуться ко входу
                                </Button>
                            </Grid>
                        </Grid>
                    </form>
                    
                    <ModalStatus
                        titleDialog={modal.titleDialog}
                        openDialog={modal.openDialog}
                        handleCloseDialog={handleCloseDialog}
                        dialogMessage={modal.dialogMessage}
                    />
                </main>
            </div>
        );
    }
    
    // Основная форма входа
    return (
        <div>
            <Header>
                <div className='navigation'>
                    <nav className='navigation__another-button'>
                        <Link to='/signup' className='navigation__button'>Регистрация</Link>
                        <Link to='/signin' className='navigation__button navigation__button_active'>Войти</Link>
                    </nav>
                </div>
            </Header>
            <main className='registr'>
                <h3 className='registr__title'>
                    {requiresTwoFactor ? 'Подтверждение входа' : 'Вход'}
                </h3>
                
                <form onSubmit={handleSaveRegistr}>
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
                                required
                                disabled={requiresTwoFactor || loading}
                                error={!requiresTwoFactor && (!loginData.email || !validateEmail(loginData.email))}
                                helperText={!requiresTwoFactor && (!loginData.email 
                                    ? "Поле обязательно для заполнения" 
                                    : !validateEmail(loginData.email)
                                    ? "Введите корректный email адрес"
                                    : "")}
                            />
                        </Grid>
                        
                        {!requiresTwoFactor && (
                            <Grid item className='registr__menu'>
                                <TextField
                                    fullWidth
                                    label="Пароль"
                                    type="password"
                                    value={loginData.password || ''}
                                    onChange={(e) => handleFilterChange('password', e.target.value)}
                                    variant="outlined"
                                    size="small"
                                    required
                                    disabled={loading}
                                    error={!loginData.password}
                                    helperText={!loginData.password ? "Поле обязательно для заполнения" : ""}
                                />
                            </Grid>
                        )}
                        
                        {requiresTwoFactor && (
                            <>
                                <Grid item className='registr__menu'>
                                    <TextField
                                        fullWidth
                                        label="Код из письма"
                                        value={twoFactorCode}
                                        onChange={(e) => setTwoFactorCode(e.target.value)}
                                        variant="outlined"
                                        size="small"
                                        type="text"
                                        required
                                        disabled={loading}
                                        error={!twoFactorCode}
                                        helperText={!twoFactorCode ? "Введите 6-значный код из письма" : ""}
                                        autoFocus
                                        inputProps={{
                                            maxLength: 6,
                                            pattern: '[0-9]*',
                                            inputMode: 'numeric',
                                            style: { textAlign: 'center', letterSpacing: '4px', fontSize: '20px' }
                                        }}
                                    />
                                </Grid>
                                
                                <Grid item className='registr__menu'>
                                    <Button
                                        variant="text"
                                        onClick={handleResendCode}
                                        disabled={loading}
                                        size="small"
                                        fullWidth
                                        style={{ textTransform: 'none' }}
                                    >
                                        Отправить код повторно
                                    </Button>
                                </Grid>
                                
                                <Grid item className='registr__menu'>
                                    <Button
                                        variant="text"
                                        onClick={handleBackToLogin}
                                        disabled={loading}
                                        size="small"
                                        fullWidth
                                        style={{ textTransform: 'none' }}
                                    >
                                        ← Вернуться к вводу пароля
                                    </Button>
                                </Grid>
                            </>
                        )}
                        
                        <Grid item className='registr__menu'>
                            <Button
                                type="submit"
                                variant="contained"
                                disabled={
                                    loading ||
                                    isDisabled ||
                                    !loginData.email || 
                                    !validateEmail(loginData.email) ||
                                    (!requiresTwoFactor && !loginData.password) ||
                                    (requiresTwoFactor && !twoFactorCode)
                                }
                                color="primary"
                                size="large"
                                fullWidth
                            >
                                {loading ? (
                                    <CircularProgress size={24} color="inherit" />
                                ) : (
                                    requiresTwoFactor ? 'Подтвердить вход' : 'Войти'
                                )}
                            </Button>
                        </Grid>
                        
                        {/* Кнопка "Забыли пароль?" */}
                        <Grid item className='registr__menu'>
                            <Button
                                variant="text"
                                onClick={() => setResetMode(true)}
                                disabled={loading}
                                size="small"
                                fullWidth
                                style={{ textTransform: 'none', color: '#666' }}
                            >
                                Забыли пароль?
                            </Button>
                        </Grid>
                    </Grid>
                </form>
                
                <ModalStatus
                    titleDialog={modal.titleDialog}
                    openDialog={modal.openDialog}
                    handleCloseDialog={handleCloseDialog}
                    dialogMessage={modal.dialogMessage}
                />
            </main>
        </div>
    );
}

export default Login;