import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import { apiErrorMessage, saveSession } from '../../services/auth';
import { notifyCartUpdated } from '../../context/CartCountContext';
import { mergeGuestCart } from '../../services/guest-cart';

export const RegisterPage = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { data } = await api.post('/auth/register', form);
      saveSession(data.user);
      await mergeGuestCart().catch(() => undefined);
      notifyCartUpdated();
      navigate('/', { replace: true });
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo crear la cuenta.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <input required placeholder="Nombre" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
        <input required placeholder="Apellido" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
      </div>
      <input required type="email" placeholder="Correo" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />
      <input required type="password" minLength={6} placeholder="Contraseña (mín. 6)" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm" />

      <button type="submit" disabled={loading} className="w-full py-2 rounded-md text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50">
        {loading ? 'Creando cuenta...' : 'Crear cuenta'}
      </button>
      <p className="text-center text-sm text-gray-500">
        ¿Ya tienes cuenta? <Link to="/auth/login" className="underline">Inicia sesión</Link>
      </p>
    </form>
  );
};
