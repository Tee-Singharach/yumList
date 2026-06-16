"use client";

export type ToastVariant = "edit" | "delete";

export type ToastState = {
  message: string;
  variant: ToastVariant;
} | null;

type ToastProps = {
  toast: ToastState;
  onClose: () => void;
};

const variantStyles: Record<
  ToastVariant,
  { container: string; icon: string; text: string }
> = {
  edit: {
    container: "border-amber-200 bg-amber-50 shadow-amber-200/40",
    icon: "bg-amber-100 text-amber-600",
    text: "text-amber-900",
  },
  delete: {
    container: "border-rose-200 bg-rose-50 shadow-rose-200/40",
    icon: "bg-rose-100 text-rose-600",
    text: "text-rose-900",
  },
};

export function Toast({ toast, onClose }: ToastProps) {
  if (!toast) return null;

  const styles = variantStyles[toast.variant];

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed right-4 bottom-4 z-50 sm:right-6 sm:bottom-6"
    >
      <div
        className={`flex max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-lg ${styles.container}`}
      >
        <span
          className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${styles.icon}`}
        >
          <CheckIcon />
        </span>
        <p className={`text-sm font-medium ${styles.text}`}>{toast.message}</p>
        <button
          type="button"
          onClick={onClose}
          aria-label="ปิดการแจ้งเตือน"
          className="ml-1 rounded-lg p-1 text-stone-400 transition hover:bg-white/60 hover:text-stone-600"
        >
          <CloseIcon />
        </button>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
      <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
    </svg>
  );
}
