"use client";

export function ConfirmDialog({
  onConfirm,
  onCancel,
  title = "Are you sure?",
  message = "This action cannot be undone.",
  confirmLabel = "Delete",
}: {
  onConfirm: () => void;
  onCancel: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} aria-hidden />
      <div className="card relative w-full max-w-sm p-6">
        <h3 className="font-serif text-lg font-bold">{title}</h3>
        <p className="mt-1 text-sm text-[rgb(var(--text-muted))]">{message}</p>
        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-outline">Cancel</button>
          <button type="button" onClick={onConfirm} className="btn bg-red-600 text-white hover:bg-red-700">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmDialog;
