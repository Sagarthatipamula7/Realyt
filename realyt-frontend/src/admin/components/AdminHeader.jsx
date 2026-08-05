export default function AdminHeader({ title, subtitle, actions }) {
  return (
    <div className="saa-page-header">
      <div className="saa-page-heading">
        <h1 className="saa-page-title">{title}</h1>
        {subtitle && <p className="saa-page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="saa-page-actions">{actions}</div>}
    </div>
  );
}
