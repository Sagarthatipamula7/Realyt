import { useEffect, useState } from 'react';
import AdminHeader from '../components/AdminHeader.jsx';
import EditorDetailDrawer from '../components/EditorDetailDrawer.jsx';
import { fetchEditorsRoster } from '../api/adminApi.js';
import { Search, Star, Film, ArrowUpDown } from 'lucide-react';

export default function AdminEditorsPage() {
  const [editors, setEditors] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('reels'); // 'reels' | 'rating' | 'recent'
  const [selectedEditorId, setSelectedEditorId] = useState(null);

  useEffect(() => {
    fetchEditorsRoster().then((data) => setEditors(Array.isArray(data) ? data : []));
  }, []);

  const filteredEditors = editors
    .filter((ed) =>
      String(ed.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(ed.email || '').toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortBy === 'reels') return (Number(b.reelsCompletedMonth) || 0) - (Number(a.reelsCompletedMonth) || 0);
      if (sortBy === 'rating') return (Number(b.rating) || 0) - (Number(a.rating) || 0);
      return (Number(b.id) || 0) - (Number(a.id) || 0);
    });

  return (
    <div className="admin-page-container">
      <AdminHeader title="Editors Roster & Performance" subtitle="Vetted circle of video editors, workload progress, and rating analytics" />

      {/* Controls Bar */}
      <div className="admin-controls-bar">
        <div className="search-input-wrap">
          <Search size={16} className="search-icon" />
          <input
            type="text"
            className="admin-input"
            placeholder="Search editor by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-select-wrap">
          <ArrowUpDown size={16} className="filter-icon" />
          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="reels">Sort by Most Reels Completed</option>
            <option value="rating">Sort by Highest Rating</option>
            <option value="recent">Sort by Most Recently Added</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="admin-table-card">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Editor</th>
              <th>Status</th>
              <th style={{ width: '35%' }}>Monthly Progress (Completed / Target)</th>
              <th>Rating</th>
              <th style={{ textAlign: 'right' }}>Reels Completed</th>
            </tr>
          </thead>
          <tbody>
            {filteredEditors.map((ed) => {
              const completed = Number(ed.reelsCompletedMonth) || 0;
              const target = Number(ed.targetReels) || 15;
              const pct = Math.min(100, Math.round((completed / target) * 100));
              const nameStr = String(ed.name || 'Editor');
              const initial = nameStr.length > 0 ? nameStr[0].toUpperCase() : 'E';
              const statusStr = String(ed.status || 'Active');

              return (
                <tr
                  key={ed.id}
                  className="table-row-clickable"
                  onClick={() => setSelectedEditorId(ed.id)}
                >
                  <td>
                    <div className="editor-user-cell">
                      <span className="editor-avatar-initial">{initial}</span>
                      <div>
                        <strong>{nameStr}</strong>
                        <div className="text-dim">{ed.email}</div>
                      </div>
                    </div>
                  </td>

                  <td>
                    <span className="editor-status-dot-wrap">
                      <i className={`editor-status-dot status-${statusStr.toLowerCase().replace(' ', '-')}`} />
                      {statusStr}
                    </span>
                  </td>

                  <td>
                    <div className="progress-bar-wrap">
                      <div className="progress-bar-track">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, background: pct >= 100 ? 'var(--teal)' : 'var(--marigold)' }}
                        />
                      </div>
                      <span className="progress-bar-label">{completed} / {target} reels ({pct}%)</span>
                    </div>
                  </td>

                  <td>
                    <div className="star-rating-cell">
                      <Star size={15} fill="#F2A93B" color="#F2A93B" />
                      <strong>{(Number(ed.rating) || 4.8).toFixed(1)}</strong>
                    </div>
                  </td>

                  <td style={{ textAlign: 'right' }}>
                    <strong className="bold-number"><Film size={14} className="inline-icon" /> {completed}</strong>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Editor Detail Drawer */}
      <EditorDetailDrawer
        editorId={selectedEditorId}
        onClose={() => setSelectedEditorId(null)}
      />
    </div>
  );
}
