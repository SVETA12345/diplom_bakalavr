import './App.css';
import { Routes, Route, BrowserRouter, useNavigate, Navigate } from 'react-router-dom';
import Main from '../../components/Main/Main'
import Registr from '../Registr/Registr';
import Glavnay from '../Glavnay/Glavnay'
import Login from '../Login/Login'
import { useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import TestEditor from '../TestEditor/TestEditor'
import TestListPage from '../TestListPage/TestListPage';
import QuestionsStudent from '../QuestionsStudent/QuestionsStudent';
import * as duckAuth from '../../utils/authApi'
import ProtectedRoute from '../../components/ProtectedRoute/ProtectedRoute';
import { loginUser } from '../../services/actions/user';
import PublicTestPage from '../PublicTestPage/PublicTestPage';

function App() {
  
  
  const isLoggedIn = useSelector(state => state.user.isAuthenticated);
  return (
    <div className="App">
        <div className='page'>
          
            <Routes>
              <Route path="/test_take/:testId" element={<PublicTestPage />} />
              <Route path="/test_take/:testId/start" element={<QuestionsStudent />} />
               <Route path="/signup" element={<Registr />} />
               <Route path="/signin" element={<Login />} />
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
          <Route 
  path="tests/:testIdActive" 
  element={
    <ProtectedRoute isLoggedIn={isLoggedIn}>
      <TestEditor />
    </ProtectedRoute>
  } 
/>
          <Route 
                path="/tests_list" 
                element={
                <ProtectedRoute isLoggedIn={isLoggedIn}>
                    <TestListPage />
              </ProtectedRoute>
            } 
          />
            </Routes>

        </div>
      </div>
  );
}

export default App;
