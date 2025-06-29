import { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const ProtectedRoute = ({ children, role }) => {
  const auth = useContext(AuthContext);

  if (auth.isLoading) {
    return <div>Loading...</div>; // Or a proper loading spinner
  }

  if (!auth.isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  if (role && auth.role !== role) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;