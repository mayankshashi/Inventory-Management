import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Trash2 } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import type { Customer, Order, OrderFormData, Product } from '../types';

const emptyOrderForm: OrderFormData = {
  customer_id: '',
  items: [{ product_id: '', quantity: '1' }],
};

export function OrdersPage() {
  const { notify } = useNotification();
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<OrderFormData>(emptyOrderForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Order | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [ordersData, customersData, productsData] = await Promise.all([
        api.getOrders(),
        api.getCustomers(),
        api.getProducts(),
      ]);
      setOrders(ordersData.items);
      setCustomers(customersData.items);
      setProducts(productsData.items);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to load orders', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const addItem = () => {
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { product_id: '', quantity: '1' }],
    }));
  };

  const removeItem = (index: number) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const updateItem = (index: number, field: 'product_id' | 'quantity', value: string) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createOrder(form);
      notify('Order created successfully');
      setModalOpen(false);
      setForm(emptyOrderForm);
      loadData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create order', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteOrder(deleteTarget.id);
      notify('Order cancelled and stock restored');
      setDeleteTarget(null);
      loadData();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to cancel order', 'error');
    } finally {
      setDeleting(false);
    }
  };

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="page-content">
      <Breadcrumb items={[{ label: 'Orders' }]} />
      <div className="page-header">
        <h1 className="page-title">Orders</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Create Order
        </Button>
      </div>

      {loading ? (
        <p className="empty-state">Loading orders...</p>
      ) : orders.length === 0 ? (
        <p className="empty-state">No orders yet. Create your first order to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link to={`/orders/${order.id}`} className="row-action">
                      {order.id.slice(0, 8)}...
                    </Link>
                  </td>
                  <td>{order.customer_name || order.customer_id}</td>
                  <td>${Number(order.total_amount).toFixed(2)}</td>
                  <td>{formatDate(order.created_at)}</td>
                  <td>
                    <div className="row-actions">
                      <Link to={`/orders/${order.id}`} className="row-action">
                        View
                      </Link>
                      <button
                        className="row-action danger"
                        onClick={() => setDeleteTarget(order)}
                      >
                        Cancel
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        open={modalOpen}
        title="Create Order"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="order-form" disabled={saving}>
              {saving ? 'Creating...' : 'Create Order'}
            </Button>
          </>
        }
      >
        <form id="order-form" className="form-grid" onSubmit={handleSubmit}>
          <Select
            label="Customer"
            value={form.customer_id}
            onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
            placeholder="Select a customer"
            options={customers.map((c) => ({
              value: c.id,
              label: `${c.full_name} (${c.email})`,
            }))}
            required
          />

          <div>
            <span className="section-label">Order Items</span>
            {form.items.map((item, index) => (
              <div
                key={index}
                style={{ display: 'flex', gap: '8px', marginBottom: '12px', alignItems: 'flex-end' }}
              >
                <div style={{ flex: 2 }}>
                  <Select
                    value={item.product_id}
                    onChange={(e) => updateItem(index, 'product_id', e.target.value)}
                    placeholder="Select product"
                    options={products.map((p) => ({
                      value: p.id,
                      label: `${p.name} (stock: ${p.quantity_in_stock})`,
                    }))}
                    required
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                    required
                  />
                </div>
                {form.items.length > 1 && (
                  <button
                    type="button"
                    className="row-action danger"
                    onClick={() => removeItem(index)}
                    aria-label="Remove item"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            ))}
            <Button type="button" variant="outline" compact onClick={addItem}>
              <Plus size={14} />
              Add Item
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Cancel Order"
        message="Are you sure you want to cancel this order? Stock will be restored."
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
