import { toFoodItem } from "@/lib/food-mapper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const foods = await prisma.food.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(foods.map(toFoodItem));
  } catch (error) {
    console.error("GET /api/foods failed:", error);
    return NextResponse.json({ error: "ไม่สามารถโหลดรายการได้" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";

    if (!name) {
      return NextResponse.json({ error: "กรุณาระบุชื่ออาหาร" }, { status: 400 });
    }

    const food = await prisma.food.create({
      data: { name, status: "NOT_EATEN" },
    });

    return NextResponse.json(toFoodItem(food), { status: 201 });
  } catch (error) {
    console.error("POST /api/foods failed:", error);
    return NextResponse.json({ error: "ไม่สามารถเพิ่มรายการได้" }, { status: 500 });
  }
}
