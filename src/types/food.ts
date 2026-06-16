export type FoodStatus = "NOT_EATEN" | "EATEN";

export interface FoodItem {
  id: string;
  name: string;
  status: FoodStatus;
  createdAt: string;
}

export const FOOD_STATUS_LABEL: Record<FoodStatus, string> = {
  NOT_EATEN: "ยังไม่กิน",
  EATEN: "กินแล้ว",
};

export function formatCreatedAt(date: string): string {
  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(date));
}

export const inputClassName =
  "w-full rounded-xl border border-stone-200 bg-white px-3 py-2 text-base text-stone-700 outline-none transition placeholder:text-stone-400 focus:border-stone-400 focus:ring-4 focus:ring-stone-100";

export const labelClassName = "mb-1 block text-sm font-medium text-stone-600";

export function reorderAfterStatusChange(
  items: FoodItem[],
  id: string,
  newStatus: FoodStatus,
): FoodItem[] {
  const updated = items.map((item) =>
    item.id === id ? { ...item, status: newStatus } : item,
  );
  const changed = updated.find((item) => item.id === id);
  if (!changed) return updated;

  const rest = updated.filter((item) => item.id !== id);
  const notEaten = rest.filter((item) => item.status === "NOT_EATEN");
  const eaten = rest.filter((item) => item.status === "EATEN");

  if (newStatus === "EATEN") {
    return [...notEaten, ...eaten, changed];
  }

  return [changed, ...notEaten, ...eaten];
}

export function sortByEatStatus(items: FoodItem[]): FoodItem[] {
  return [
    ...items.filter((item) => item.status === "NOT_EATEN"),
    ...items.filter((item) => item.status === "EATEN"),
  ];
}
