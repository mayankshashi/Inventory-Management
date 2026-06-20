import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNav } from './TopNav';
import './AppLayout.css';

export function AppLayout() {
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar
        expanded={sidebarExpanded}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div
        className={`app-main ${sidebarExpanded ? 'app-main-expanded' : 'app-main-collapsed'}`}
      >
        <TopNav
          onMenuClick={() => setMobileOpen(true)}
          onToggleSidebar={() => setSidebarExpanded((v) => !v)}
          sidebarExpanded={sidebarExpanded}
        />
        <main className="app-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
