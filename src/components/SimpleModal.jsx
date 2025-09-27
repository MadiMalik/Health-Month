export default function SimpleModal({ open, title = "Dialog", onClose, children }) {
    if (!open) return null;
    return (
      <div role="dialog" aria-modal="true" aria-label={title}
           className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-black/40" onClick={onClose} />
        <div className="relative z-10 max-w-lg w-[92%] sm:w-[480px] rounded-2xl bg-white p-4 sm:p-6 shadow-lg">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">{title}</h2>
            <button className="btn-ghost px-2 py-1" onClick={onClose} aria-label="Close dialog">✕</button>
          </div>
          {children}
        </div>
      </div>
    );
  }