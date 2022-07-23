export default function Note({ children }) {
  return (
    <div className="note">
      <h4 className="note-title">Note</h4>
      <div className="note-text">{children}</div>
    </div>
  );
}
