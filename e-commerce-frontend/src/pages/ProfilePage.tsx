import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { apiErrorMessage, saveSession } from '../services/auth';
import type { AuthUser, SavedAddress } from '../types';

export const ProfilePage = () => {
  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '' });
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [form, setForm] = useState({ street: '', city: '', state: '', zipCode: '', isDefault: false });
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const [profileRes, addressRes] = await Promise.all([
        api.get<{ user: AuthUser }>('/auth/profile'),
        api.get<SavedAddress[]>('/addresses'),
      ]);
      const user = profileRes.data.user;
      setProfile({ firstName: user.firstName, lastName: user.lastName ?? '', email: user.email });
      saveSession(user);
      setAddresses(addressRes.data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No pudimos cargar tu perfil.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  const saveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const { data } = await api.patch<{ user: AuthUser }>('/auth/profile', {
        firstName: profile.firstName,
        lastName: profile.lastName,
      });
      saveSession(data.user);
      setNotice('Nombre actualizado.');
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar el perfil.'));
    }
  };

  const addAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await api.post('/addresses', form);
      setForm({ street: '', city: '', state: '', zipCode: '', isDefault: false });
      setNotice('Dirección guardada.');
      const { data } = await api.get<SavedAddress[]>('/addresses');
      setAddresses(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar la dirección.'));
    }
  };

  const setDefault = async (id: string) => {
    try {
      await api.patch(`/addresses/${id}`, { isDefault: true });
      const { data } = await api.get<SavedAddress[]>('/addresses');
      setAddresses(data);
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo marcar como predeterminada.'));
    }
  };

  const removeAddress = async (id: string) => {
    try {
      await api.delete(`/addresses/${id}`);
      setAddresses((current) => current.filter((address) => address.id !== id));
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo eliminar la dirección.'));
    }
  };

  if (loading) return <p className="text-sm text-gray-500">Cargando perfil...</p>;

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-gray-900">Tu perfil</h1>
      {error && <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}
      {notice && <div className="bg-green-50 border-l-4 border-green-500 p-4 text-sm text-green-800">{notice}</div>}

      <form onSubmit={saveProfile} className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <p className="text-sm text-gray-500">{profile.email}</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            required
            value={profile.firstName}
            onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Nombre"
          />
          <input
            required
            value={profile.lastName}
            onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
            className="border border-gray-300 rounded-md px-3 py-2 text-sm"
            placeholder="Apellido"
          />
        </div>
        <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">
          Guardar nombre
        </button>
      </form>

      <section className="bg-white border border-gray-200 rounded-lg p-6">
        <h2 className="font-medium text-gray-900 mb-4">Direcciones de envío</h2>
        {addresses.length === 0 ? (
          <p className="text-sm text-gray-500 mb-4">Aún no tienes direcciones guardadas.</p>
        ) : (
          <ul className="space-y-3 mb-6">
            {addresses.map((address) => (
              <li key={address.id} className="flex flex-wrap items-start justify-between gap-3 border border-gray-100 rounded-md p-3">
                <div className="text-sm text-gray-700">
                  <p>{address.street}</p>
                  <p className="text-gray-500">{address.city}, {address.state} {address.zipCode}</p>
                  {address.isDefault && <p className="text-xs text-gray-400 mt-1">Predeterminada</p>}
                </div>
                <div className="flex gap-3 text-xs">
                  {!address.isDefault && (
                    <button type="button" onClick={() => setDefault(address.id)} className="text-gray-700 hover:underline">
                      Usar por defecto
                    </button>
                  )}
                  <button type="button" onClick={() => removeAddress(address.id)} className="text-red-600 hover:underline">
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}

        <form onSubmit={addAddress} className="space-y-3">
          <input required value={form.street} onChange={(e) => setForm({ ...form, street: e.target.value })} className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Calle y número" />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input required value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Ciudad" />
            <input required value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Provincia" />
            <input required value={form.zipCode} onChange={(e) => setForm({ ...form, zipCode: e.target.value })} className="border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Código postal" />
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Marcar como predeterminada
          </label>
          <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-md text-sm">
            Guardar dirección
          </button>
        </form>
      </section>
    </div>
  );
};
