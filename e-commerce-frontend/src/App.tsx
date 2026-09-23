import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProductsPage } from './pages/admin/ProductsPage';
import { ProductFormPage } from './pages/admin/ProductFormPage';
import { ProtectedRoute } from './components/ProtectedRoute';

// Layouts
import { MainLayout } from './layouts/MainLayout';
import { AuthLayout } from './layouts/AuthLayout';
import { AdminLayout } from './layouts/AdminLayout';

// Páginas
import { CatalogPage } from './pages/CatalogPage';
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/admin/DashboardPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas Públicas de la Tienda */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<CatalogPage />} />
          <Route path="cart" element={<div className="text-center mt-10 text-xl">Carrito en construcción...</div>} />
        </Route>

        {/* Rutas de Autenticación */}
        <Route path="/auth" element={<AuthLayout />}>
          <Route path="login" element={<LoginPage />} />
        </Route>

        {/* Rutas Privadas (Backoffice): exigen sesión y rol de gestión */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'SELLER']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            {/* Redirigir /admin a /admin/dashboard por defecto */}
            <Route index element={<Navigate to="/admin/dashboard" replace />} />
            <Route path="dashboard" element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="products/new" element={<ProductFormPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;