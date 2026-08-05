import { Outlet } from 'react-router-dom';
import AdminSidebar from '../components/AdminSidebar.jsx';
import AdminTopbar from '../components/AdminTopbar.jsx';

export default function AdminLayout() {
  return (
    <div className="saa-shell">
      <AdminSidebar />
      <div className="saa-main">
        <AdminTopbar />
        <main className="saa-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
