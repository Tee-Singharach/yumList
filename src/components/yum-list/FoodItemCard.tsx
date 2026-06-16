"use client";

import { CalendarIcon, CakeIcon, CheckCircleIcon } from "@/components/icons";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { useState } from "react";
import {
  FOOD_STATUS_LABEL,
  formatCreatedAt,
  inputClassName,
  labelClassName,
  type FoodItem,
  type FoodStatus,
} from "@/types/food";

type FoodItemEditData = {
  name: string;
  status: FoodStatus;
};

type FoodItemCardProps = {
  item: FoodItem;
  onToggleStatus: (id: string) => void | Promise<void>;
  onEdit: (id: string, data: FoodItemEditData) => boolean | Promise<boolean>;
  onDelete: (id: string) => boolean | Promise<boolean>;
};

type ConfirmAction = "delete" | "edit" | null;

export function FoodItemCard({
  item,
  onToggleStatus,
  onEdit,
  onDelete,
}: FoodItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editStatus, setEditStatus] = useState<FoodStatus>(item.status);
  const [isSaving, setIsSaving] = useState(false);
  const [confirmAction, setConfirmAction] = useState<ConfirmAction>(null);
  const [confirmError, setConfirmError] = useState<string | null>(null);

  const isEaten = item.status === "EATEN";

  function handleStartEdit() {
    setEditName(item.name);
    setEditStatus(item.status);
    setConfirmError(null);
    setIsEditing(true);
  }

  function handleRequestSave() {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    const nameChanged = trimmedName !== item.name;
    const statusChanged = editStatus !== item.status;

    if (!nameChanged && !statusChanged) {
      setIsEditing(false);
      return;
    }

    setConfirmError(null);
    setConfirmAction("edit");
  }

  async function handleConfirmEdit() {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    setIsSaving(true);
    setConfirmError(null);

    try {
      const saved = await onEdit(item.id, {
        name: trimmedName,
        status: editStatus,
      });
      if (saved === false) {
        setConfirmError("บันทึกไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      setConfirmAction(null);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleConfirmDelete() {
    setIsSaving(true);
    setConfirmError(null);

    try {
      const deleted = await onDelete(item.id);
      if (deleted === false) {
        setConfirmError("ลบไม่สำเร็จ ลองใหม่อีกครั้ง");
        return;
      }
      setConfirmAction(null);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCloseConfirm() {
    if (isSaving) return;
    setConfirmAction(null);
    setConfirmError(null);
  }

  function handleCancelEdit() {
    setEditName(item.name);
    setEditStatus(item.status);
    setIsEditing(false);
  }

  const trimmedEditName = editName.trim();
  const nameChanged = trimmedEditName !== item.name;
  const statusChanged = editStatus !== item.status;

  return (
    <>
    <article
      className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:shadow-stone-200/40 ${
        isEaten
          ? "border-stone-200 bg-stone-50/50"
          : "border-stone-200 hover:border-stone-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isEaten
              ? "bg-stone-200/70 text-stone-500"
              : "bg-stone-100 text-stone-500"
          }`}
          aria-hidden="true"
        >
          {isEaten ? <CheckCircleIcon /> : <CakeIcon />}
        </span>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-stone-700">แก้ไขรายการอาหาร</p>

              <div>
                <label htmlFor={`edit-name-${item.id}`} className={labelClassName}>
                  ชื่ออาหาร <span className="text-amber-600">*</span>
                </label>
                <input
                  id={`edit-name-${item.id}`}
                  type="text"
                  value={editName}
                  onChange={(event) => setEditName(event.target.value)}
                  autoFocus
                  className={inputClassName}
                />
              </div>

              <div>
                <label htmlFor={`edit-status-${item.id}`} className={labelClassName}>
                  สถานะ
                </label>
                <select
                  id={`edit-status-${item.id}`}
                  value={editStatus}
                  onChange={(event) =>
                    setEditStatus(event.target.value as FoodStatus)
                  }
                  className={inputClassName}
                >
                  <option value="NOT_EATEN">{FOOD_STATUS_LABEL.NOT_EATEN}</option>
                  <option value="EATEN">{FOOD_STATUS_LABEL.EATEN}</option>
                </select>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleRequestSave}
                  disabled={!editName.trim()}
                  className="rounded-lg bg-amber-600 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-amber-700 disabled:opacity-50"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-stone-600 transition hover:bg-stone-100"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-2">
                <h3
                  className={`text-lg font-semibold ${
                    isEaten
                      ? "text-stone-400 line-through decoration-stone-300"
                      : "text-stone-700"
                  }`}
                >
                  {item.name}
                </h3>
                <StatusBadge status={item.status} />
              </div>

              <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
                <MetaItem label="สถานะ" value={FOOD_STATUS_LABEL[item.status]} />
                <MetaItem
                  label="วันที่สร้าง"
                  value={formatCreatedAt(item.createdAt)}
                  icon={<CalendarIcon className="h-3.5 w-3.5" />}
                />
              </dl>
            </>
          )}
        </div>
      </div>

      {!isEditing && (
        <div className="mt-4 flex flex-wrap gap-2 border-t border-stone-100 pt-3">
          <ActionButton
            onClick={() => onToggleStatus(item.id)}
            variant={isEaten ? "secondary" : "primary"}
          >
            {isEaten ? "ยังไม่กิน" : "กินแล้ว"}
          </ActionButton>
          <ActionButton onClick={handleStartEdit} variant="ghost">
            แก้ไข
          </ActionButton>
          <ActionButton
            onClick={() => {
              setConfirmError(null);
              setConfirmAction("delete");
            }}
            variant="danger"
          >
            ลบ
          </ActionButton>
        </div>
      )}
    </article>

    <ConfirmModal
      open={confirmAction === "delete"}
      title="ยืนยันการลบ"
      confirmLabel="ลบรายการ"
      confirmVariant="danger"
      isLoading={isSaving}
      onConfirm={handleConfirmDelete}
      onCancel={handleCloseConfirm}
    >
      <p>
        ต้องการลบ <span className="font-medium text-stone-700">&quot;{item.name}&quot;</span>{" "}
        ออกจากรายการหรือไม่?
      </p>
      <p className="mt-2">การลบนี้ไม่สามารถย้อนกลับได้</p>
      {confirmError ? (
        <p className="mt-3 text-sm text-rose-600">{confirmError}</p>
      ) : null}
    </ConfirmModal>

    <ConfirmModal
      open={confirmAction === "edit"}
      title="ยืนยันการแก้ไข"
      confirmLabel="บันทึกการเปลี่ยนแปลง"
      isLoading={isSaving}
      onConfirm={handleConfirmEdit}
      onCancel={handleCloseConfirm}
    >
      <p>ต้องการบันทึกการเปลี่ยนแปลงนี้หรือไม่?</p>
      <ul className="mt-3 space-y-2 rounded-xl bg-stone-50 px-3 py-2.5">
        {nameChanged ? (
          <li>
            <span className="text-stone-400">ชื่ออาหาร: </span>
            <span className="text-stone-500 line-through">{item.name}</span>
            <span className="text-stone-400"> → </span>
            <span className="font-medium text-stone-700">{trimmedEditName}</span>
          </li>
        ) : null}
        {statusChanged ? (
          <li>
            <span className="text-stone-400">สถานะ: </span>
            <span className="text-stone-500">{FOOD_STATUS_LABEL[item.status]}</span>
            <span className="text-stone-400"> → </span>
            <span className="font-medium text-stone-700">
              {FOOD_STATUS_LABEL[editStatus]}
            </span>
          </li>
        ) : null}
      </ul>
      {confirmError ? (
        <p className="mt-3 text-sm text-rose-600">{confirmError}</p>
      ) : null}
    </ConfirmModal>
    </>
  );
}

function MetaItem({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl bg-stone-50 px-3 py-2">
      <dt className="text-xs font-medium text-stone-400">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-stone-600">
        {icon}
        {value}
      </dd>
    </div>
  );
}

function StatusBadge({ status }: { status: FoodStatus }) {
  const isEaten = status === "EATEN";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isEaten
          ? "bg-stone-200/80 text-stone-600"
          : "bg-amber-50 text-amber-800"
      }`}
    >
      {FOOD_STATUS_LABEL[status]}
    </span>
  );
}

function ActionButton({
  children,
  onClick,
  variant,
}: {
  children: React.ReactNode;
  onClick: () => void;
  variant: "primary" | "secondary" | "ghost" | "danger";
}) {
  const styles = {
    primary:
      "bg-amber-600 text-white hover:bg-amber-700 shadow-sm shadow-stone-200/50",
    secondary: "bg-stone-100 text-stone-600 hover:bg-stone-200",
    ghost: "bg-stone-50 text-stone-600 hover:bg-stone-100",
    danger: "bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200/80",
  }[variant];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${styles}`}
    >
      {children}
    </button>
  );
}
