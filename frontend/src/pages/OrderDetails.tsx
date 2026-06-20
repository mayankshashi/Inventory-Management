import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Breadcrumb } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { ConfirmModal } from '../components/ui/Modal';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import type { Order } from '../types';

export function OrderDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { notify } = useNotification();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    api
      .getOrder(id)
      .then(setOrder)
      .catch((err: Error) => notify(err.message, 'error'))
      .finally(() => setLoading(false));
  }, [id, notify]);

  const handleCancel = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await api.deleteOrder(id);
      notify('Order cancelled and stock restored');
      window.history.back();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to cancel order', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  if (loading) {
    return (
      <div className="page-content">
        <p className="empty-state">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="page-content">
        <div className="error-banner">Order not found.</div>
        <Link to="/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="page-content">
      <Breadcrumb
        items={[
          { label: 'Orders', to: '/orders' },
          { label: `Order ${order.id.slice(0, 8)}` },
        ]}
      />
      <div className="page-header">
        <h1 className="page-title">Order Details</h1>
        <Button variant="outline" onClick={() => setConfirmOpen(true)}>
          Cancel Order
        </Button>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        <div>
          <span className="section-label">Order ID</span>
          <p style={{ fontSize: '14px', fontFamily: 'monospace' }}>{order.id}</p>
        </div>
        <div>
          <span className="section-label">Customer</span>
          <p style={{ fontSize: '14px' }}>{order.customer_name}</p>
        </div>
        <div>
          <span className="section-label">Total Amount</span>
          <p style={{ fontSize: '20px', fontWeight: 600 }}>
            ${Number(order.total_amount).toFixed(2)}
          </p>
        </div>
        <div>
          <span className="section-label">Created At</span>
          <p style={{ fontSize: '14px' }}>{formatDate(order.created_at)}</p>
        </div>
      </div>

      <h2 className="section-label" style={{ fontSize: '18px', marginBottom: '16px' }}>
        Order Items
      </h2>
      <div className="table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Quantity</th>
              <th>Unit Price</th>
              <th>Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id}>
                <td>{item.product_name || item.product_id}</td>
                <td>{item.quantity}</td>
                <td>${Number(item.unit_price).toFixed(2)}</td>
                <td>${(Number(item.unit_price) * item.quantity).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <ConfirmModal
        open={confirmOpen}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? Stock will be restored."
        onConfirm={handleCancel}
        onClose={() => setConfirmOpen(false)}
        loading={deleting}
      />
    </div>
  );
}
