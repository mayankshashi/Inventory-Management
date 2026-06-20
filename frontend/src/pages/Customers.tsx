import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import type { Customer, CustomerFormData } from '../types';

const emptyForm: CustomerFormData = {
  full_name: '',
  email: '',
  phone_number: '',
};

export function CustomersPage() {
  const { notify } = useNotification();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CustomerFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadCustomers = useCallback(async () => {
    try {
      const data = await api.getCustomers();
      setCustomers(data.items);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to load customers', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCustomer(form);
      notify('Customer created successfully');
      setModalOpen(false);
      setForm(emptyForm);
      loadCustomers();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to create customer', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteCustomer(deleteTarget.id);
      notify('Customer deleted successfully');
      setDeleteTarget(null);
      loadCustomers();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete customer', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-content">
      <Breadcrumb items={[{ label: 'Customers' }]} />
      <div className="page-header">
        <h1 className="page-title">Customers</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} />
          Add Customer
        </Button>
      </div>

      {loading ? (
        <p className="empty-state">Loading customers...</p>
      ) : customers.length === 0 ? (
        <p className="empty-state">No customers yet. Add your first customer to get started.</p>
      ) : (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((customer) => (
                <tr key={customer.id}>
                  <td>{customer.full_name}</td>
                  <td>{customer.email}</td>
                  <td>{customer.phone_number}</td>
                  <td>
                    <div className="row-actions">
                      <button
                        className="row-action danger"
                        onClick={() => setDeleteTarget(customer)}
                      >
                        Delete
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
        title="Add Customer"
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="customer-form" disabled={saving}>
              {saving ? 'Saving...' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="customer-form" className="form-grid" onSubmit={handleSubmit}>
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <Input
            label="Phone Number"
            value={form.phone_number}
            onChange={(e) => setForm({ ...form, phone_number: e.target.value })}
            required
          />
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Customer"
        message={`Are you sure you want to delete "${deleteTarget?.full_name}"?`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
