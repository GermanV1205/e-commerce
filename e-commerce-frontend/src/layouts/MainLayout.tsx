import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import { useCartCount } from '../context/CartCountContext';
import { notifyCartUpdated } from '../context/cart-events';
import { getUser, logoutRequest } from '../services/auth';

const navClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? 'text-black' : 'text-gray-500 hover:text-gray-900'}`;

export const MainLayout = () => {
  const navigate = useNavigate();
  const user = getUser();
  const { totalItems } = useCartCount();

  const handleLogout = async () => {
    await logoutRequest();
    notifyCartUpdated();
    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="text-2xl font-bold text-gray-900 tracking-tight">
            TiendaRopa
          </Link>
          <nav className="flex items-center gap-5">
            <NavLink to="/" end className={navClass}>Catálogo</NavLink>
            <NavLink to="/cart" className={navClass}>
              Carrito
              {totalItems > 0 && (
                <span className="ml-1.5 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1 rounded-full bg-black text-white text-xs">
                  {totalItems}
                </span>
              )}
            </NavLink>
            {user && <NavLink to="/orders" className={navClass}>Pedidos</NavLink>}
            {user && <NavLink to="/profile" className={navClass}>Perfil</NavLink>}
            {(user?.role === 'ADMIN' || user?.role === 'SELLER') && (
              <NavLink to="/admin/dashboard" className={navClass}>Admin</NavLink>
            )}
            {user ? (
              <button type="button" onClick={handleLogout} className="text-sm text-gray-400 hover:text-gray-900">
                Salir · {user.firstName}
              </button>
            ) : (
              <Link to="/auth/login" className="text-sm font-medium bg-black text-white px-3 py-1.5 rounded-md hover:bg-gray-800">
                Ingresar
              </Link>
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
