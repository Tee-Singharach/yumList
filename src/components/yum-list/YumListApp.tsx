"use client";

import { ClipboardListIcon, ListBulletIcon } from "@/components/icons";
import { Toast } from "@/components/ui/Toast";
import { useEffect, useMemo, useState } from "react";
import { AddFoodForm } from "@/components/yum-list/AddFoodForm";
import { FoodItemCard } from "@/components/yum-list/FoodItemCard";
import { FOOD_STATUS_LABEL, reorderAfterStatusChange, sortByEatStatus, type FoodItem, type FoodStatus } from "@/types/food";

type FilterValue = "ALL" | FoodStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "NOT_EATEN", label: FOOD_STATUS_LABEL.NOT_EATEN },
  { value: "EATEN", label: FOOD_STATUS_LABEL.EATEN },
];

export function YumListApp() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [filter, setFilter] = useState<FilterValue>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  }, [toast]);

  function showToast(message: string) {
    setToast(message);
  }

  useEffect(() => {
    async function loadItems() {
      try {
        const response = await fetch("/api/foods");
        if (!response.ok) return;
        const data: FoodItem[] = await response.json();
        setItems(data);
      } finally {
        setIsLoading(false);
      }
    }

    loadItems();
  }, []);

  const filteredItems = useMemo(() => {
    const sorted = sortByEatStatus(items);
    if (filter === "ALL") return sorted;
    return sorted.filter((item) => item.status === filter);
  }, [items, filter]);

  const stats = useMemo(
    () => ({
      total: items.length,
      notEaten: items.filter((item) => item.status === "NOT_EATEN").length,
      eaten: items.filter((item) => item.status === "EATEN").length,
    }),
    [items],
  );

  async function handleAdd(name: string) {
    const response = await fetch("/api/foods", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });
    if (!response.ok) return;

    const newItem: FoodItem = await response.json();
    setItems((current) => {
      const notEaten = current.filter((item) => item.status === "NOT_EATEN");
      const eaten = current.filter((item) => item.status === "EATEN");
      return [newItem, ...notEaten, ...eaten];
    });
  }

  async function handleToggleStatus(id: string) {
    const item = items.find((entry) => entry.id === id);
    if (!item) return;

    const newStatus = item.status === "NOT_EATEN" ? "EATEN" : "NOT_EATEN";
    const response = await fetch(`/api/foods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    if (!response.ok) return;

    const updated: FoodItem = await response.json();
    setItems((current) => reorderAfterStatusChange(current, id, updated.status));
  }

  async function handleEdit(id: string, data: { name: string; status: FoodStatus }) {
    const previous = items.find((item) => item.id === id);
    if (!previous) return false;

    const response = await fetch(`/api/foods/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (!response.ok) return false;

    const updated: FoodItem = await response.json();
    setItems((current) => {
      if (previous.status === updated.status) {
        return current.map((item) => (item.id === id ? updated : item));
      }
      return reorderAfterStatusChange(
        current.map((item) => (item.id === id ? updated : item)),
        id,
        updated.status,
      );
    });
    showToast("แก้ไขรายการแล้ว");
    return true;
  }

  async function handleDelete(id: string) {
    const deletedItem = items.find((item) => item.id === id);
    const response = await fetch(`/api/foods/${id}`, { method: "DELETE" });
    if (!response.ok) return false;

    setItems((current) => current.filter((item) => item.id !== id));
    showToast(
      deletedItem ? `ลบ "${deletedItem.name}" แล้ว` : "ลบรายการแล้ว",
    );
    return true;
  }

  return (
    <>
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-sm font-medium text-stone-600">
          <ListBulletIcon className="h-4 w-4" />
          รายการอาหารที่อยากกิน
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-stone-700 sm:text-5xl">
          Yum<span className="text-amber-600">List</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-stone-500 sm:text-lg">
          จดไว้ว่าอยากกินอะไร พอไปกินแล้วก็มาอัปเดตว่ากินแล้ว
        </p>
      </header>

      <section className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm shadow-stone-200/40 sm:p-6">
        <AddFoodForm onAdd={handleAdd} />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="ทั้งหมด" value={stats.total} accent="white" />
          <StatCard label="ยังไม่กิน" value={stats.notEaten} accent="light" />
          <StatCard label="กินแล้ว" value={stats.eaten} accent="muted" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-stone-700">รายการของคุณ</h2>
          <div
            className="inline-flex rounded-2xl bg-stone-100 p-1"
            role="tablist"
            aria-label="กรองรายการ"
          >
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={filter === value}
                onClick={() => setFilter(value)}
                className={`rounded-xl px-3 py-1.5 text-sm font-medium transition ${
                  filter === value
                    ? "bg-white text-stone-700 shadow-sm shadow-stone-200/50"
                    : "text-stone-500 hover:text-stone-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <p className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-6 py-14 text-center text-base font-medium text-stone-500">
            กำลังโหลดรายการ...
          </p>
        ) : filteredItems.length === 0 ? (
          <EmptyState filter={filter} />
        ) : (
          <ul className="flex flex-col gap-3">
            {filteredItems.map((item) => (
              <li key={item.id}>
                <FoodItemCard
                  item={item}
                  onToggleStatus={handleToggleStatus}
                  onEdit={handleEdit}
                  onDelete={handleDelete}
                />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>

    <Toast message={toast} onClose={() => setToast(null)} />
    </>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: "white" | "light" | "muted";
}) {
  const colors = {
    white: "text-stone-700 bg-white border-stone-200",
    light: "text-stone-600 bg-stone-50 border-stone-200",
    muted: "text-stone-500 bg-stone-100 border-stone-200",
  }[accent];

  return (
    <div className={`rounded-2xl border px-3 py-3 text-center ${colors}`}>
      <p className="text-2xl font-bold tabular-nums">{value}</p>
      <p className="mt-0.5 text-xs font-medium opacity-80">{label}</p>
    </div>
  );
}

function EmptyState({ filter }: { filter: FilterValue }) {
  const message =
    filter === "NOT_EATEN"
      ? "ยังไม่มีรายการที่ยังไม่กิน ลองเพิ่มอะไรอร่อย ๆ สักอย่าง"
      : filter === "EATEN"
        ? "ยังไม่มีรายการที่กินแล้ว ไปลุยอาหารจากลิสต์กันเถอะ"
        : "ยังไม่มีรายการอาหาร เริ่มเพิ่มรายการแรกได้เลย";

  return (
    <div className="rounded-3xl border border-dashed border-stone-200 bg-stone-50 px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100 text-stone-400">
        <ClipboardListIcon className="h-8 w-8" />
      </div>
      <p className="mt-4 text-base font-medium text-stone-500">{message}</p>
    </div>
  );
}
