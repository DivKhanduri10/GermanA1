import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getSessionId } from "@/lib/session";

export async function GET(request: NextRequest) {
  const sessionId = await getSessionId();
  const promptId = request.nextUrl.searchParams.get("promptId");

  const where: Record<string, unknown> = { sessionId };
  if (promptId) where.promptId = parseInt(promptId);

  const submissions = await prisma.writingSubmission.findMany({
    where,
    orderBy: { submittedAt: "desc" },
    take: 20,
  });

  return NextResponse.json({ submissions });
}
