import React, { useRef } from 'react';
import Header from '../Header/Header'
import { Link } from 'react-router-dom'; 
import OverviewFeatures from '../OverviewFeatures/OverviewFeatures'
import { useSelector } from 'react-redux';
import './Main.css'

function Main(props) {
    const isLoggedIn = useSelector(state => state.isAuthenticated);
    const bottomRef = useRef(null);
    const scrollToBottom = (e) => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    return (
        <div className='main'>
            <div className='main__background'>
                <Header>
                    { isLoggedIn ? (
                     <div className='navigation'>
                        <nav className='navigation__another-button'>
                            <Link to='/glavnay' className='navigation__button'>Главная</Link>
                            <Link to='/lk' className='navigation__button navigation__button_active'>Личный кабинет</Link>
                        </nav>
                     </div>
                    ) : (
                    <div className='navigation'>
                        <nav className='navigation__another-button'>
                            <Link to='/signup' className='navigation__button'>Регистрация</Link>
                            <Link to='/signin' className='navigation__button navigation__button_active'>Войти</Link>
                        </nav>
                    </div>
                    )}
                    
                </Header>
                <div className='main__title-container'>
                    <h1>Конструктор тестов</h1>
                    <h2>Простой и удобный сервис для создания тестов и проведения тестирования.</h2>
                    <button onClick={scrollToBottom} className='main__title-but'>Возможности</button>
                </div>
            </div>
            <OverviewFeatures bottomRef={bottomRef} />
        </div>
    )
}

export default Main;