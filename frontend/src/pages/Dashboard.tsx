import { useEffect, useState } from 'react';
import { Package, ShoppingCart, Users } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Sidebar';
import { stockBadge } from '../components/ui/Badge';
import { SummaryCard } from '../components/ui/SummaryCard';
import { api } from '../services/api';
import type { DashboardStats } from '../types';

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api
      .getDashboardStats()
      .then(setStats)
      .catch((err: Error) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page-content">
        <p className="empty-state">Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-content">
        <div className="error-banner">{error}</div>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Breadcrumb items={[{ label: 'Dashboard' }]} />
      <div className="page-header">
        <h1 className="page-title">Dashboard</h1>
      </div>

      <div className="summary-grid">
        <SummaryCard
          title="Total Products"
          value={stats?.total_products ?? 0}
          icon={<Package size={24} />}
        />
        <SummaryCard
          title="Total Customers"
          value={stats?.total_customers ?? 0}
          icon={<Users size={24} />}
        />
        <SummaryCard
          title="Total Orders"
          value={stats?.total_orders ?? 0}
          icon={<ShoppingCart size={24} />}
        />
      </div>

      <h2 className="section-label" style={{ fontSize: '18px', marginBottom: '16px' }}>
        Low Stock Products
      </h2>
      {stats?.low_stock_products.length === 0 ? (
        <p className="empty-state">All products are well stocked.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {stats?.low_stock_products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td>{stockBadge(product.quantity_in_stock)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
