import { Navigate } from 'react-router-dom';
import { useRole, UserRole } from '../context/RoleContext';

interface Props {
  children: React.ReactNode;
  allowedRoles: UserRole[];
}

export const ProtectedRoute = ({ children, allowedRoles }: Props) => {
  const { role } = useRole();
  
  // Public role (logged out) can only see landing + signup
  if (role === 'public' && !['/', '/signup'].includes(window.location.pathname)) {
    return <Navigate to="/signup" replace />;
  }
  
  if (!allowedRoles.includes(role)) {
    return <Navigate to="/mission-control" replace />;
  }
  return <>{children}</>;
};
