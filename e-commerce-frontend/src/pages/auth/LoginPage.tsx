import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api'; // Asegúrate de que este archivo exista
import { apiErrorMessage, saveSession } from '../../services/auth';

export const LoginPage = () => {
  const navigate = useNavigate();
  // Estados para capturar lo que el usuario escribe
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Petición REAL a tu backend en NestJS
      const response = await api.post('/auth/login', { email, password });

      // 2. Extraemos el JWT y guardamos la sesión
      const { user } = response.data;
      saveSession(user);

      // 3. Los clientes van a la tienda; el personal, al backoffice
      navigate(user.role === 'CLIENT' ? '/' : '/admin/dashboard', { replace: true });

    } catch (err) {
      // Si NestJS rechaza (Ej. 401 Credenciales inválidas), lo mostramos aquí
      setError(apiErrorMessage(err, 'Ocurrió un error al intentar iniciar sesión.'));
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleLogin}>
      {/* Alerta de Error Dinámica */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
          Correo electrónico
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            placeholder="admin@tienda.com"
          />
        </div>
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
          Contraseña
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
          />
        </div>
      </div>

      <div>
        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors disabled:opacity-50"
        >
          {loading ? 'Verificando credenciales...' : 'Ingresar al Sistema'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          ¿No tienes cuenta? <Link to="/auth/register" className="underline">Regístrate</Link>
        </p>
      </div>
    </form>
  );
};