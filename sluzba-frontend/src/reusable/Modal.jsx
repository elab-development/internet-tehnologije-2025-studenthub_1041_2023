
const Modal = ({ open, onClose, title, children }) =>
  open ? (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h2>{title}</h2>
        {children}
      </div>
    </div>
  ) : null;

export default Modal;