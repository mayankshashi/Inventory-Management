import { Menu, Search } from 'lucide-react';
import './TopNav.css';

interface TopNavProps {
  onMenuClick: () => void;
  onToggleSidebar: () => void;
  sidebarExpanded: boolean;
}

export function TopNav({ onMenuClick, onToggleSidebar, sidebarExpanded }: TopNavProps) {
  return (
    <header className="topnav">
      <div className="topnav-left">
        <button className="topnav-menu-btn" onClick={onMenuClick} aria-label="Open menu">
          <Menu size={24} strokeWidth={1.5} />
        </button>
        <button
          className="topnav-expand-btn"
          onClick={onToggleSidebar}
          aria-label={sidebarExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          <Menu size={20} strokeWidth={1.5} />
        </button>
      </div>
      <div className="topnav-search">
        <Search size={16} className="topnav-search-icon" />
        <input type="search" placeholder="Search inventory..." className="topnav-search-input" />
      </div>
      <div className="topnav-right" />
    </header>
  );
}
