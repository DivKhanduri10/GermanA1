import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const partNumber = request.nextUrl.searchParams.get("part");
  const category = request.nextUrl.searchParams.get("category");

  const where: Record<string, unknown> = {};
  if (partNumber) where.partNumber = parseInt(partNumber);
  if (category) where.category = category;

  const prompts = await prisma.speakingPrompt.findMany({
    where,
    orderBy: [{ partNumber: "asc" }, { id: "asc" }],
  });

  // Get unique categories
  const categories = [
    ...new Set(prompts.map((p) => p.category).filter(Boolean)),
  ];

  return NextResponse.json({ prompts, categories });
}
