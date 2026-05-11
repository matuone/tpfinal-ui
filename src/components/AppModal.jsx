import { useEffect } from "react";

const AppModal = ({
  isOpen,
  title,
  message,
  type = "info",
  inputValue = "",
  inputPlaceholder = "",
  confirmText = "Aceptar",
  cancelText = "Cancelar",
  onInputChange,
  onConfirm,
  onClose,
}) => {
  useEffect(() => {
    if (!isOpen) return undefined;

    const handleEsc = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);
    return () => window.removeEventListener("keydown", handleEsc);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isPrompt = type === "prompt";
  const isConfirm = type === "confirm" || isPrompt;

  return (
    <div className="modal-overlay" onClick={onClose} role="presentation">
      <div className="modal-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={title}>
        <h3 className="modal-title">{title}</h3>
        {message ? <p className="modal-message">{message}</p> : null}

        {isPrompt ? (
          <input
            autoFocus
            className="input-field"
            style={{ marginBottom: "0.8rem" }}
            value={inputValue}
            onChange={(event) => onInputChange(event.target.value)}
            placeholder={inputPlaceholder}
          />
        ) : null}

        <div className="modal-actions">
          {isConfirm ? (
            <button type="button" className="btn-secondary" onClick={onClose}>
              {cancelText}
            </button>
          ) : null}
          <button type="button" className="btn-primary" onClick={onConfirm}>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export { AppModal };