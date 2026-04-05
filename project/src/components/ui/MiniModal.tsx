import React from "react";

type MiniModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  onCancel: () => void;
  confirmDisabled?: boolean;
};

export const MiniModal = ({
  open,
  title,
  description,
  children,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  confirmDisabled = false,
}: MiniModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="theme-surface-strong w-full max-w-md rounded-3xl border border-[var(--app-border)] p-6 shadow-2xl backdrop-blur-xl">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && <p className="theme-muted mt-2 text-sm leading-6">{description}</p>}
        {children && <div className="mt-5">{children}</div>}
        <div className="mt-6 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-[var(--app-border-soft)] px-4 py-2 text-sm theme-muted hover:text-[var(--app-text)]"
          >
            {cancelLabel}
          </button>
          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={confirmDisabled}
              className="rounded-xl bg-[var(--app-accent)] px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              {confirmLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
