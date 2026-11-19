export default function EmptyState({ icon: Icon, title, text, action }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={30} strokeWidth={1.5} />
      </div>
      <h3>{title}</h3>
      {text && <p>{text}</p>}
      {action}
    </div>
  );
}
