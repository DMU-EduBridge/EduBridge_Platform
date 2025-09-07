import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";
import { parseJsonBody } from "@/lib/validation";

// 문제 생성 스키마
const createProblemSchema = z.object({
  title: z.string().min(1),
  description: z.string().min(1),
  content: z.string().min(1),
  subject: z.string().min(1),
  type: z.string().min(1),
  difficulty: z.string().min(1),
  options: z.array(z.string()).optional(),
  correctAnswer: z.string().min(1),
  hints: z.array(z.string()).optional(),
  tags: z.array(z.string()).optional(),
});

// 문제 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const subject = searchParams.get("subject");
    const difficulty = searchParams.get("difficulty");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const where: any = {};

    if (search) {
      where.OR = [{ title: { contains: search } }, { description: { contains: search } }];
    }

    if (subject && subject !== "all") {
      where.subject = subject;
    }

    if (difficulty && difficulty !== "all") {
      where.difficulty = difficulty;
    }

    const [problems, total] = await Promise.all([
      prisma.problem.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.problem.count({ where }),
    ]);

    return NextResponse.json({
      problems,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching problems:", error);
    return NextResponse.json({ error: "Failed to fetch problems" }, { status: 500 });
  }
}

// 새 문제 생성
export async function POST(request: NextRequest) {
  try {
    const raw = await request.json();
    const parsed = parseJsonBody(raw, createProblemSchema);
    if (!parsed.success) return parsed.response;
    const {
      title,
      description,
      content,
      subject,
      type,
      difficulty,
      options,
      correctAnswer,
      hints,
      tags,
    } = parsed.data;

    const problem = await prisma.problem.create({
      data: {
        title,
        description,
        content,
        subject,
        type,
        difficulty,
        options: JSON.stringify(options || []),
        correctAnswer,
        hints: JSON.stringify(hints || []),
        tags: JSON.stringify(tags || []),
        isActive: true,
      },
    });

    return NextResponse.json(problem, { status: 201 });
  } catch (error) {
    console.error("Error creating problem:", error);
    return NextResponse.json({ error: "Failed to create problem" }, { status: 500 });
  }
}
