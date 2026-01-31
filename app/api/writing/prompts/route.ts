import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET(request: NextRequest) {
  const promptType = request.nextUrl.searchParams.get("type");

  const where = promptType ? { promptType } : {};

  const prompts = await prisma.writingPrompt.findMany({
    where,
    orderBy: { id: "asc" },
  });

  return NextResponse.json({ prompts });
}
