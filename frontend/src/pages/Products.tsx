import { useCallback, useEffect, useState } from 'react';
import { Plus } from 'lucide-react';
import { Breadcrumb } from '../components/layout/Sidebar';
import { Button } from '../components/ui/Button';
import { stockBadge } from '../components/ui/Badge';
import { ConfirmModal, Modal } from '../components/ui/Modal';
import { Input } from '../components/ui/Input';
import { useNotification } from '../context/NotificationContext';
import { api } from '../services/api';
import type { Product, ProductFormData } from '../types';

const emptyForm: ProductFormData = {
  name: '',
  sku: '',
  price: '',
  quantity_in_stock: '',
};

export function ProductsPage() {
  const { notify } = useNotification();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const data = await api.getProducts();
      setProducts(data.items);
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to load products', 'error');
    } finally {
      setLoading(false);
    }
  }, [notify]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const openCreate = () => {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditingProduct(product);
    setForm({
      name: product.name,
      sku: product.sku,
      price: String(product.price),
      quantity_in_stock: String(product.quantity_in_stock),
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, form);
        notify('Product updated successfully');
      } else {
        await api.createProduct(form);
        notify('Product created successfully');
      }
      setModalOpen(false);
      loadProducts();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to save product', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteProduct(deleteTarget.id);
      notify('Product deleted successfully');
      setDeleteTarget(null);
      loadProducts();
    } catch (err) {
      notify(err instanceof Error ? err.message : 'Failed to delete product', 'error');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="page-content">
      <Breadcrumb items={[{ label: 'Products' }]} />
      <div className="page-header">
        <h1 className="page-title">Products</h1>
        <Button onClick={openCreate}>
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {loading ? (
        <p className="empty-state">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="empty-state">No products yet. Add your first product to get started.</p>
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
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td>{product.sku}</td>
                  <td>${Number(product.price).toFixed(2)}</td>
                  <td>{product.quantity_in_stock}</td>
                  <td>{stockBadge(product.quantity_in_stock)}</td>
                  <td>
                    <div className="row-actions">
                      <button className="row-action" onClick={() => openEdit(product)}>
                        Edit
                      </button>
                      <button
                        className="row-action danger"
                        onClick={() => setDeleteTarget(product)}
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
        title={editingProduct ? 'Edit Product' : 'Add Product'}
        onClose={() => setModalOpen(false)}
        footer={
          <>
            <Button variant="outline" onClick={() => setModalOpen(false)} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" form="product-form" disabled={saving}>
              {saving ? 'Saving...' : editingProduct ? 'Update' : 'Create'}
            </Button>
          </>
        }
      >
        <form id="product-form" className="form-grid" onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <Input
            label="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
            required
          />
          <Input
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm({ ...form, price: e.target.value })}
            required
          />
          <Input
            label="Quantity in Stock"
            type="number"
            min="0"
            value={form.quantity_in_stock}
            onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
            required
          />
        </form>
      </Modal>

      <ConfirmModal
        open={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onClose={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
