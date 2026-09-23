import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { getUser, isAuthenticated } from '../services/auth';
import type { AuthUser } from '../types';

interface ProtectedRouteProps {
  allowedRoles?: AuthUser['role'][];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const location = useLocation();

  if (!isAuthenticated()) {
    return <Navigate to="/auth/login" replace state={{ from: location.pathname }} />;
  }

  const user = getUser();

  if (allowedRoles && (!user || !allowedRoles.includes(user.role))) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="max-w-md text-center bg-white border border-gray-200 rounded-lg shadow-sm p-8">
          <h1 className="text-xl font-bold text-gray-900">Acceso restringido</h1>
          <p className="mt-2 text-sm text-gray-600">
            Esta sección requiere un rol {allowedRoles.join(' o ')}. Tu cuenta es {user?.role ?? 'desconocida'}.
          </p>
        </div>
      </div>
    );
  }

  return <Outlet />;
};
