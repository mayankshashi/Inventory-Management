import { NavLink } from 'react-router-dom';
import {
  ChevronRight,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
} from 'lucide-react';
import './Sidebar.css';

const navItems = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/products', label: 'Products', icon: Package },
  { to: '/customers', label: 'Customers', icon: Users },
  { to: '/orders', label: 'Orders', icon: ShoppingCart },
];

interface SidebarProps {
  expanded: boolean;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function Sidebar({ expanded, mobileOpen, onMobileClose }: SidebarProps) {
  return (
    <>
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={onMobileClose} role="presentation" />
      )}
      <aside
        className={`sidebar ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'} ${
          mobileOpen ? 'sidebar-mobile-open' : ''
        }`}
      >
        <div className="sidebar-brand">
          <div className="sidebar-brand-icon">IM</div>
          {expanded && <span className="sidebar-brand-text">Inventory</span>}
        </div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `sidebar-nav-item ${isActive ? 'sidebar-nav-item-active' : ''}`
              }
              onClick={onMobileClose}
            >
              <Icon size={24} strokeWidth={1.5} />
              {expanded && <span>{label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}

interface BreadcrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  return (
    <nav className="breadcrumb" aria-label="Breadcrumb">
      {items.map((item, index) => (
        <span key={item.label} className="breadcrumb-item">
          {index > 0 && <ChevronRight size={14} className="breadcrumb-sep" />}
          {item.to ? (
            <NavLink to={item.to} className="breadcrumb-link">
              {item.label}
            </NavLink>
          ) : (
            <span className="breadcrumb-current">{item.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
