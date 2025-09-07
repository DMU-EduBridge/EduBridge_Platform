import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validation";

// 문제 업데이트 스키마 (부분 업데이트 고려 시 partial 가능, 여기선 필수 유지)
const updateProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  subject: z.string().min(1),
  type: z.string().min(1),
  difficulty: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
  isActive: z.boolean().optional(),
});

// 개별 문제 조회, 수정, 삭제
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const problem = await prisma.problem.findUnique({
      where: { id: params.id },
    });

    if (!problem) {
      return NextResponse.json({ error: "Problem not found" }, { status: 404 });
    }

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error fetching problem:", error);
    return NextResponse.json({ error: "Failed to fetch problem" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const raw = await request.json();
    const parsed = parseJsonBody(raw, updateProblemSchema);
    if (!parsed.success) return parsed.response;
    const {
      title,
      description,
      subject,
      type,
      difficulty,
      options,
      correctAnswer,
      hints,
      tags,
      isActive,
    } = parsed.data;

    const problem = await prisma.problem.update({
      where: { id: params.id },
      data: {
        title,
        description,
        subject,
        type,
        difficulty,
        options: JSON.stringify(options || []),
        correctAnswer,
        hints: JSON.stringify(hints || []),
        tags: JSON.stringify(tags || []),
        isActive,
      },
    });

    return NextResponse.json(problem);
  } catch (error) {
    console.error("Error updating problem:", error);
    return NextResponse.json({ error: "Failed to update problem" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await prisma.problem.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    return NextResponse.json({ error: "Failed to delete problem" }, { status: 500 });
  }
}
