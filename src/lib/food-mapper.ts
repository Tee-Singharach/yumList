import type { Food } from "@/generated/prisma/client";
import type { FoodItem, FoodStatus } from "@/types/food";

const FOOD_STATUSES: FoodStatus[] = ["NOT_EATEN", "EATEN"];

export function isFoodStatus(value: string): value is FoodStatus {
  return FOOD_STATUSES.includes(value as FoodStatus);
}

export function toFoodItem(food: Food): FoodItem {
  return {
    id: String(food.id),
    name: food.name,
    status: isFoodStatus(food.status) ? food.status : "NOT_EATEN",
    createdAt: food.createdAt.toISOString(),
  };
}

export function parseFoodId(id: string): number | null {
  const parsed = Number.parseInt(id, 10);
  if (!Number.isInteger(parsed) || parsed < 1) return null;
  return parsed;
}
