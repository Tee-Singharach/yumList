"use client";

import { useEffect, useId } from "react";

type ConfirmModalProps = {
  open: boolean;
  title: string;
  children: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: "primary" | "danger";
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  open,
  title,
  children,
  confirmLabel = "ยืนยัน",
  cancelLabel = "ยกเลิก",
  confirmVariant = "primary",
  isLoading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && !isLoading) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, isLoading, onCancel]);

  if (!open) return null;

  const confirmStyles =
    confirmVariant === "danger"
      ? "bg-rose-600 text-white hover:bg-rose-700"
      : "bg-amber-600 text-white hover:bg-amber-700";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        aria-label="ปิด"
        className="absolute inset-0 bg-stone-900/40 backdrop-blur-[2px]"
        onClick={isLoading ? undefined : onCancel}
        disabled={isLoading}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="relative w-full max-w-sm rounded-2xl border border-stone-200 bg-white p-5 shadow-xl shadow-stone-300/30"
      >
        <h2 id={titleId} className="text-lg font-semibold text-stone-700">
          {title}
        </h2>

        <div className="mt-3 text-sm leading-relaxed text-stone-500">{children}</div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl px-4 py-2 text-sm font-medium text-stone-600 transition hover:bg-stone-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`rounded-xl px-4 py-2 text-sm font-medium transition disabled:opacity-50 ${confirmStyles}`}
          >
            {isLoading ? "กำลังดำเนินการ..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
