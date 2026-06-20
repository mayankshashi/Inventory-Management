import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from './components/layout/AppLayout';
import { NotificationProvider } from './context/NotificationContext';
import { CustomersPage } from './pages/Customers';
import { DashboardPage } from './pages/Dashboard';
import { OrderDetailsPage } from './pages/OrderDetails';
import { OrdersPage } from './pages/Orders';
import { ProductsPage } from './pages/Products';

export function App() {
  return (
    <NotificationProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="products" element={<ProductsPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="orders" element={<OrdersPage />} />
            <Route path="orders/:id" element={<OrderDetailsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
}
