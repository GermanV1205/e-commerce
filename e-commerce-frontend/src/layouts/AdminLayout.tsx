import { Outlet, Link, useNavigate } from 'react-router-dom';
import { getUser, logoutRequest } from '../services/auth';

export const AdminLayout = () => {
  const navigate = useNavigate();
  const user = getUser();

  const handleLogout = async () => {
    await logoutRequest();
    navigate('/auth/login', { replace: true });
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar de Administración */}
      <aside className="w-64 bg-gray-900 text-white flex flex-col">
        <div className="h-16 flex items-center justify-center border-b border-gray-800">
          <span className="text-xl font-bold tracking-wider">PANEL ADMIN</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          <Link to="/admin/dashboard" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Resumen</Link>
          <Link to="/admin/products" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Inventario</Link>
          <a href="#" className="block px-4 py-2 rounded text-gray-400 hover:bg-gray-800 hover:text-white transition-colors">Pedidos</a>
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

      {/* Área de Trabajo Principal */}
      <main className="flex-1 p-8">
        <Outlet />
      </main>
    </div>
  );
};