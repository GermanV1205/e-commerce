import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { getUser, logoutRequest } from '../services/auth';

const itemClass = ({ isActive }: { isActive: boolean }) =>
  `block px-4 py-2 rounded transition-colors ${
    isActive ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'
  }`;

export const AdminLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    await logoutRequest();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <span className="text-xl font-bold tracking-wider">PANEL ADMIN</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <NavLink to="/admin/dashboard" className={itemClass}>Resumen</NavLink>
          <NavLink to="/admin/products" className={itemClass}>Inventario</NavLink>
          <NavLink to="/admin/categories" className={itemClass}>Categorías</NavLink>
          <NavLink to="/admin/orders" className={itemClass}>Pedidos</NavLink>
          <NavLink to="/" className="block px-4 py-2 rounded text-gray-500 hover:text-white">Ver tienda</NavLink>
        </nav>
        <div className="p-4 border-t border-gray-800">
          {user && (
            <p className="px-4 pb-2 text-xs text-gray-500 truncate">
              {user.firstName} · {user.role}
            </p>
          )}
          <button onClick={handleLogout} className="w-full text-left px-4 py-2 text-red-400 hover:bg-gray-800 rounded transition-colors">
            Cerrar Sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-x-auto">
        <Outlet />
      </main>
    </div>
  );
};
