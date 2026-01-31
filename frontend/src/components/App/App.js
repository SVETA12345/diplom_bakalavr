import './App.css';
import { Routes, Route, BrowserRouter, useNavigate, Navigate } from 'react-router-dom';
import Main from '../Main/Main'
import Registr from '../Registr/Registr';
import Glavnay from '../Glavnay/Glavnay'
import Login from '../Login/Login'
import { useSelector } from 'react-redux';
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TestEditor from '../TestEditor/TestEditor'

import * as duckAuth from '../../utils/authApi'
import ProtectedRoute from '../ProtectedRoute/ProtectedRoute';
import { createUser, loginUser } from '../../services/actions/user';
function App() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  useEffect(()=>{
    duckAuth.getContent().then((user)=>{
      if (user.name){
        dispatch(loginUser({
              name: user.name,
              surname: user.surname,
              patronomic: user.patronomic,
              department: user.department,
              email: user.email,
              role: user.role,
              password: user.password,
              isAuthenticated: true
            })
          )
          navigate('/glavnay')
        }
      }).catch((err)=> console.log(err))
      
  }, [])
  const isLoggedIn = useSelector(state => state.isAuthenticated);
  return (
    <div className="App">
        <div className='page'>
          
            <Routes>
              <Route path="/" element={<Main />} />
               <Route path="/signup" element={<Registr />} />
               <Route path="/signin" element={<Login />} />
               <Route 
                path="/glavnay" 
                element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <Glavnay />
              </ProtectedRoute>
            } 
          />
          <Route 
                path="/test_editor" 
                element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <TestEditor />
              </ProtectedRoute>
            } 
          />
            </Routes>

        </div>
      </div>
  );
}

export default App;
