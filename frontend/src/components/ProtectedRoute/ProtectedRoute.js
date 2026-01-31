import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, isLoggedIn }) => {
  // Если не авторизован, перенаправляем на страницу входа
  if (!isLoggedIn) {
    return <Navigate to="/signin" replace />;
  }
  
  // Если авторизован, показываем children
  return children;
};

export default ProtectedRoute;