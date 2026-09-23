import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getUser, logoutRequest } from '../services/auth';

export const MainLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    await logoutRequest();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            TiendaRopa
          </Link>
          <nav className="flex items-center space-x-4">
            <Link to="/" className="text-gray-600 hover:text-gray-900 font-medium">Catálogo</Link>
            <Link to="/cart" className="text-gray-600 hover:text-gray-900 font-medium">Carrito</Link>
            {user?.role === 'ADMIN' || user?.role === 'SELLER' ? (
              <Link to="/admin/dashboard" className="text-gray-600 hover:text-gray-900 font-medium">Admin</Link>
            ) : null}
            {user ? (
              <button type="button" onClick={handleLogout} className="text-sm text-gray-500 hover:text-gray-900">
                Salir ({user.firstName})
              </button>
            ) : (
              <Link to="/auth/login" className="text-sm font-medium text-black">Ingresar</Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-grow max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
        <Outlet />
      </main>

      <footer className="bg-gray-900 text-white py-8 text-center">
        <p className="text-sm">© 2026 Tienda de Ropa. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
};
