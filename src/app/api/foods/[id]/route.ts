import { isFoodStatus, parseFoodId, toFoodItem } from "@/lib/food-mapper";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const foodId = parseFoodId(id);

    if (foodId === null) {
      return NextResponse.json({ error: "รหัสรายการไม่ถูกต้อง" }, { status: 400 });
    }

    const body = await request.json();
    const data: { name?: string; status?: string } = {};

    if (typeof body.name === "string") {
      const name = body.name.trim();
      if (!name) {
        return NextResponse.json({ error: "กรุณาระบุชื่ออาหาร" }, { status: 400 });
      }
      data.name = name;
    }

    if (typeof body.status === "string") {
      if (!isFoodStatus(body.status)) {
        return NextResponse.json({ error: "สถานะไม่ถูกต้อง" }, { status: 400 });
      }
      data.status = body.status;
    }

    if (!data.name && !data.status) {
      return NextResponse.json({ error: "ไม่มีข้อมูลที่จะอัปเดต" }, { status: 400 });
    }

    const food = await prisma.food.update({
      where: { id: foodId },
      data,
    });

    return NextResponse.json(toFoodItem(food));
  } catch (error) {
    console.error("PATCH /api/foods/[id] failed:", error);
    return NextResponse.json({ error: "ไม่สามารถอัปเดตรายการได้" }, { status: 500 });
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  try {
    const { id } = await context.params;
    const foodId = parseFoodId(id);

    if (foodId === null) {
      return NextResponse.json({ error: "รหัสรายการไม่ถูกต้อง" }, { status: 400 });
    }

    await prisma.food.delete({ where: { id: foodId } });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("DELETE /api/foods/[id] failed:", error);
    return NextResponse.json({ error: "ไม่สามารถลบรายการได้" }, { status: 500 });
  }
}
