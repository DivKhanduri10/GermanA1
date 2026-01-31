import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const category = searchParams.get("category");
  const count = parseInt(searchParams.get("count") || "10");
  const excludeIds = searchParams.get("excludeIds");

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (excludeIds) {
    where.id = { notIn: excludeIds.split(",").map(Number) };
  }

  // Get total count matching filter
  const total = await prisma.vocabulary.count({ where });
  const take = Math.min(count, total);

  // Fetch random words using offset-based random selection
  const skip = Math.max(0, Math.floor(Math.random() * (total - take)));
  const words = await prisma.vocabulary.findMany({
    where,
    take,
    skip,
    orderBy: { id: "asc" },
  });

  // Shuffle the results
  for (let i = words.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [words[i], words[j]] = [words[j], words[i]];
  }

  return NextResponse.json({ words });
}
