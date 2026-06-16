"use client";

import { PlusIcon } from "@/components/icons";
import { inputClassName, labelClassName } from "@/types/food";
import { FormEvent, useState } from "react";

type AddFoodFormProps = {
  onAdd: (name: string) => void;
};

export function AddFoodForm({ onAdd }: AddFoodFormProps) {
  const [name, setName] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedName = name.trim();
    if (!trimmedName) return;

    onAdd(trimmedName);
    setName("");
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <h2 className="text-base font-semibold text-orange-950">
        รายการอาหารที่อยากกิน
      </h2>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1">
          <label htmlFor="food-name" className={labelClassName}>
            ชื่ออาหาร <span className="text-orange-500">*</span>
          </label>
          <input
            id="food-name"
            type="text"
            required
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="เช่น ชาบู, ซูชิ, หมูกระทะ"
            className={inputClassName}
          />
        </div>

        <button
          type="submit"
          disabled={!name.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-200 transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <PlusIcon />
          เพิ่มรายการ
        </button>
      </div>
    </form>
  );
}
