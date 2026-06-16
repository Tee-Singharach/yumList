"use client";

import { CalendarIcon, CakeIcon, CheckCircleIcon } from "@/components/icons";
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
  onToggleStatus: (id: string) => void;
  onEdit: (id: string, data: FoodItemEditData) => void;
  onDelete: (id: string) => void;
};

export function FoodItemCard({
  item,
  onToggleStatus,
  onEdit,
  onDelete,
}: FoodItemCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(item.name);
  const [editStatus, setEditStatus] = useState<FoodStatus>(item.status);

  const isEaten = item.status === "EATEN";

  function handleStartEdit() {
    setEditName(item.name);
    setEditStatus(item.status);
    setIsEditing(true);
  }

  function handleSaveEdit() {
    const trimmedName = editName.trim();
    if (!trimmedName) return;

    onEdit(item.id, {
      name: trimmedName,
      status: editStatus,
    });
    setIsEditing(false);
  }

  function handleCancelEdit() {
    setEditName(item.name);
    setEditStatus(item.status);
    setIsEditing(false);
  }

  return (
    <article
      className={`group rounded-2xl border bg-white p-4 shadow-sm transition hover:shadow-md hover:shadow-orange-100/50 ${
        isEaten
          ? "border-orange-200/80 bg-orange-50/30"
          : "border-orange-100 hover:border-orange-300"
      }`}
    >
      <div className="flex items-start gap-3">
        <span
          className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
            isEaten
              ? "bg-orange-200/60 text-orange-600"
              : "bg-orange-100 text-orange-600"
          }`}
          aria-hidden="true"
        >
          {isEaten ? <CheckCircleIcon /> : <CakeIcon />}
        </span>

        <div className="min-w-0 flex-1">
          {isEditing ? (
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold text-orange-950">แก้ไขรายการอาหาร</p>

              <div>
                <label htmlFor={`edit-name-${item.id}`} className={labelClassName}>
                  ชื่ออาหาร <span className="text-orange-500">*</span>
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
                  onClick={handleSaveEdit}
                  disabled={!editName.trim()}
                  className="rounded-lg bg-orange-500 px-3 py-1.5 text-sm font-medium text-white transition hover:bg-orange-600 disabled:opacity-50"
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="rounded-lg px-3 py-1.5 text-sm font-medium text-orange-700 transition hover:bg-orange-50"
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
                      ? "text-orange-400 line-through decoration-orange-200"
                      : "text-orange-950"
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
        <div className="mt-4 flex flex-wrap gap-2 border-t border-orange-100 pt-3">
          <ActionButton
            onClick={() => onToggleStatus(item.id)}
            variant={isEaten ? "secondary" : "primary"}
          >
            {isEaten ? "ยังไม่กิน" : "กินแล้ว"}
          </ActionButton>
          <ActionButton onClick={handleStartEdit} variant="ghost">
            แก้ไข
          </ActionButton>
          <ActionButton onClick={() => onDelete(item.id)} variant="danger">
            ลบ
          </ActionButton>
        </div>
      )}
    </article>
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
    <div className="rounded-xl bg-orange-50/60 px-3 py-2">
      <dt className="text-xs font-medium text-orange-600/70">{label}</dt>
      <dd className="mt-0.5 flex items-center gap-1.5 font-medium text-orange-900">
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
          ? "bg-orange-200/70 text-orange-700"
          : "bg-orange-100 text-orange-700"
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
      "bg-orange-500 text-white hover:bg-orange-600 shadow-sm shadow-orange-200",
    secondary: "bg-orange-100 text-orange-700 hover:bg-orange-200",
    ghost: "bg-orange-50 text-orange-800 hover:bg-orange-100",
    danger: "bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200",
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
