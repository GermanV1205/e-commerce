import { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { apiErrorStatus } from '../../services/auth';
import type { DashboardReport } from '../../types';

export const DashboardPage = () => {
  const [report, setReport] = useState<DashboardReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReport = async () => {
      try {
        const { data } = await api.get<DashboardReport>('/reports/dashboard');
        setReport(data);
      } catch (err) {
        console.error('Error cargando el dashboard:', err);
        setError(
          apiErrorStatus(err) === 403
            ? 'Tu cuenta no tiene permisos de administrador para ver este reporte.'
            : 'No pudimos cargar el resumen del negocio.',
        );
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, []);

  if (loading) {
    return <p className="text-sm text-gray-500">Cargando resumen...</p>;
  }

  if (error) {
    return <div className="bg-red-50 border-l-4 border-red-500 p-4 text-sm text-red-700">{error}</div>;
  }

  const metrics = report!.metrics;

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Resumen del Negocio</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Por despachar</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.pendingOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Pedidos Entregados</h3>
          <p className="text-3xl font-bold text-gray-900 mt-2">{metrics.completedOrders}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-gray-500 text-sm font-medium">Alertas de Stock</h3>
          <p className="text-3xl font-bold text-red-600 mt-2">{metrics.criticalStockAlerts}</p>
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Variantes con stock crítico</h2>
          <p className="text-sm text-gray-500 mt-1">Menos de 5 unidades disponibles.</p>
        </div>

        {report!.lowStockItems.length === 0 ? (
          <p className="px-6 py-8 text-sm text-gray-500">Todo el inventario está en niveles saludables.</p>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Producto</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Unidades</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {report!.lowStockItems.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-3 text-sm text-gray-900">{item.productName}</td>
                  <td className="px-6 py-3 text-sm text-right font-semibold text-red-600">{item.stock}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};
