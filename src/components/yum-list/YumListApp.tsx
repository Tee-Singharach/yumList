"use client";

import { ClipboardListIcon, ListBulletIcon } from "@/components/icons";
import { useMemo, useState } from "react";
import { AddFoodForm } from "@/components/yum-list/AddFoodForm";
import { FoodItemCard } from "@/components/yum-list/FoodItemCard";
import { FOOD_STATUS_LABEL, reorderAfterStatusChange, sortByEatStatus, type FoodItem, type FoodStatus } from "@/types/food";

const INITIAL_ITEMS: FoodItem[] = [
  {
    id: "1",
    name: "ชาบู",
    status: "NOT_EATEN",
    createdAt: "2026-06-10T10:00:00.000Z",
  },
  {
    id: "2",
    name: "หมูกระทะ",
    status: "NOT_EATEN",
    createdAt: "2026-06-12T14:30:00.000Z",
  },
  {
    id: "3",
    name: "ซูชิ",
    status: "NOT_EATEN",
    createdAt: "2026-06-14T09:15:00.000Z",
  },
];

type FilterValue = "ALL" | FoodStatus;

const FILTERS: { value: FilterValue; label: string }[] = [
  { value: "ALL", label: "ทั้งหมด" },
  { value: "NOT_EATEN", label: FOOD_STATUS_LABEL.NOT_EATEN },
  { value: "EATEN", label: FOOD_STATUS_LABEL.EATEN },
];

export function YumListApp() {
  const [items, setItems] = useState<FoodItem[]>(INITIAL_ITEMS);
  const [filter, setFilter] = useState<FilterValue>("ALL");

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

  function handleAdd(name: string) {
    setItems((current) => {
      const newItem: FoodItem = {
        id: crypto.randomUUID(),
        name,
        status: "NOT_EATEN",
        createdAt: new Date().toISOString(),
      };
      const notEaten = current.filter((item) => item.status === "NOT_EATEN");
      const eaten = current.filter((item) => item.status === "EATEN");
      return [newItem, ...notEaten, ...eaten];
    });
  }

  function handleToggleStatus(id: string) {
    setItems((current) => {
      const item = current.find((entry) => entry.id === id);
      if (!item) return current;

      const newStatus = item.status === "NOT_EATEN" ? "EATEN" : "NOT_EATEN";
      return reorderAfterStatusChange(current, id, newStatus);
    });
  }

  function handleEdit(id: string, data: { name: string; status: FoodStatus }) {
    setItems((current) => {
      const previous = current.find((item) => item.id === id);
      if (!previous) return current;

      const updated = current.map((item) =>
        item.id === id ? { ...item, ...data } : item,
      );

      if (previous.status === data.status) return updated;

      return reorderAfterStatusChange(updated, id, data.status);
    });
  }

  function handleDelete(id: string) {
    setItems((current) => current.filter((item) => item.id !== id));
  }

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14">
      <header className="text-center sm:text-left">
        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-700">
          <ListBulletIcon className="h-4 w-4" />
          รายการอาหารที่อยากกิน
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-orange-950 sm:text-5xl">
          Yum<span className="text-orange-500">List</span>
        </h1>
        <p className="mt-3 max-w-xl text-base leading-relaxed text-orange-800/70 sm:text-lg">
          จดไว้ว่าอยากกินอะไร พอไปกินแล้วก็มาอัปเดตว่ากินแล้ว
        </p>
      </header>

      <section className="rounded-3xl border border-orange-100 bg-white p-5 shadow-lg shadow-orange-100/60 sm:p-6">
        <AddFoodForm onAdd={handleAdd} />

        <div className="mt-6 grid grid-cols-3 gap-3">
          <StatCard label="ทั้งหมด" value={stats.total} accent="white" />
          <StatCard label="ยังไม่กิน" value={stats.notEaten} accent="light" />
          <StatCard label="กินแล้ว" value={stats.eaten} accent="muted" />
        </div>
      </section>

      <section>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-orange-950">รายการของคุณ</h2>
          <div
            className="inline-flex rounded-2xl bg-orange-50 p-1"
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
                    ? "bg-white text-orange-900 shadow-sm shadow-orange-100"
                    : "text-orange-600/70 hover:text-orange-800"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {filteredItems.length === 0 ? (
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
    white: "text-orange-950 bg-white border-orange-100",
    light: "text-orange-700 bg-orange-50 border-orange-100",
    muted: "text-orange-600 bg-orange-100/70 border-orange-200",
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
    <div className="rounded-3xl border border-dashed border-orange-200 bg-orange-50/30 px-6 py-14 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-100 text-orange-500">
        <ClipboardListIcon className="h-8 w-8" />
      </div>
      <p className="mt-4 text-base font-medium text-orange-800/80">{message}</p>
    </div>
  );
}
