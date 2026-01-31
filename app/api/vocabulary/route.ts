import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const limit = searchParams.get("limit");
  const offset = searchParams.get("offset");

  const where = category ? { category } : {};

  const words = await prisma.vocabulary.findMany({
    where,
    take: limit ? parseInt(limit) : undefined,
    skip: offset ? parseInt(offset) : undefined,
    orderBy: { id: "asc" },
  });

  const total = await prisma.vocabulary.count({ where });

  return NextResponse.json({ words, total });
}
