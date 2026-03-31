import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole = null }) => {
    const { isLoggedIn, isAdmin } = useAuth();

    // Not logged in
    if (!isLoggedIn) {
        const redirectTo = requiredRole === 'admin' ? '/admin-login' : '/login';
        return <Navigate to={redirectTo} replace />;
    }

    // Logged in but wrong role
    if (requiredRole === 'admin' && !isAdmin) {
        return <Navigate to="/home" replace />;
    }

    return children;
};

export default ProtectedRoute;
