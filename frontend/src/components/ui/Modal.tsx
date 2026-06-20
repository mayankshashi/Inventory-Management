import type { ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button';
import './Modal.css';

interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
}

export function Modal({ open, title, onClose, children, footer }: ModalProps) {
  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="modal-dialog"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="modal-header">
          <h2 id="modal-title" className="page-title">
            {title}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={20} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onClose: () => void;
  loading?: boolean;
}

export function ConfirmModal({
  open,
  title,
  message,
  onConfirm,
  onClose,
  loading,
}: ConfirmModalProps) {
  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={onConfirm} disabled={loading}>
            {loading ? 'Deleting...' : 'Confirm'}
          </Button>
        </>
      }
    >
      <p style={{ color: 'var(--ui-color-text-secondary)' }}>{message}</p>
    </Modal>
  );
}
