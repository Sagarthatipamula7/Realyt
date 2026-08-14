import { Outlet } from 'react-router-dom';
import EditorSidebar from './EditorSidebar.jsx';

export default function EditorLayout() {
  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: '#0F172A' }}>
      {/* Fixed Left Sidebar */}
      <EditorSidebar />
      
      {/* Scrollable Main Content Area */}
      <div style={{ flex: 1, height: '100vh', overflowY: 'auto', background: '#0F172A' }}>
        <Outlet />
      </div>
    </div>
  );
}
