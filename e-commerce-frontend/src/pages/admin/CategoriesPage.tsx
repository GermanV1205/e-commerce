import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { apiErrorMessage } from '../../services/auth';
import type { Category } from '../../types';

const slugify = (value: string) =>
  value.toLowerCase().trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

export const CategoriesPage = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const { data } = await api.get<Category[]>('/categories');
    setCategories(data);
  };

  useEffect(() => {
    load().catch((err) => setError(apiErrorMessage(err, 'No pudimos cargar las categorías.')));
  }, []);

  const resetForm = () => {
    setName('');
    setSlug('');
    setEditingId(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const payload = { name, slug: slug || slugify(name) };
    try {
      if (editingId) {
        await api.patch(`/categories/${editingId}`, payload);
      } else {
        await api.post('/categories', payload);
      }
      resetForm();
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo guardar la categoría.'));
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('¿Eliminar esta categoría?')) return;
    setError(null);
    try {
      await api.delete(`/categories/${id}`);
      await load();
    } catch (err) {
      setError(apiErrorMessage(err, 'No se pudo eliminar. Si tiene productos, muévelos primero.'));
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Categorías</h1>
      {error && <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>}

      <form onSubmit={save} className="bg-white border border-gray-200 rounded-lg p-5 mb-6 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <input
          required
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (!editingId) setSlug(slugify(e.target.value));
          }}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="Nombre"
        />
        <input
          required
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="border border-gray-300 rounded-md px-3 py-2 text-sm"
          placeholder="slug"
        />
        <div className="flex gap-2">
          <button type="submit" className="bg-black text-white px-4 py-2 rounded-md text-sm">
            {editingId ? 'Guardar' : 'Crear'}
          </button>
          {editingId && (
            <button type="button" onClick={resetForm} className="text-sm text-gray-600">
              Cancelar
            </button>
          )}
        </div>
      </form>

      <ul className="bg-white border border-gray-200 rounded-lg divide-y divide-gray-100">
        {categories.map((category) => (
          <li key={category.id} className="px-4 py-3 flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-gray-900">{category.name}</p>
              <p className="text-xs text-gray-400">{category.slug}</p>
            </div>
            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => {
                  setEditingId(category.id);
                  setName(category.name);
                  setSlug(category.slug);
                }}
                className="text-gray-700 hover:underline"
              >
                Editar
              </button>
              <button type="button" onClick={() => remove(category.id)} className="text-red-600 hover:underline">
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
