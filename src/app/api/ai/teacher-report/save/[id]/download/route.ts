import { authOptions } from '@/lib/core/auth';
import { prisma } from '@/lib/core/prisma';
import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || !['TEACHER', 'ADMIN'].includes(session.user.role)) {
      return NextResponse.json({ error: '권한이 없습니다.' }, { status: 403 });
    }

    const reportId = params.id;

    // 리포트 조회
    const report = await prisma.teacherReport.findFirst({
      where: {
        id: reportId,
        createdBy: session.user.id, // 본인이 생성한 리포트만 다운로드 가능
        status: { not: 'ARCHIVED' },
      },
      select: {
        id: true,
        title: true,
        content: true,
        reportType: true,
        classInfo: true,
        reportAnalyses: {
          select: {
            analysisData: true,
          },
        },
        createdAt: true,
      },
    });

    if (!report) {
      return NextResponse.json({ error: '리포트를 찾을 수 없습니다.' }, { status: 404 });
    }

    const classInfo = JSON.parse(report.classInfo as string);
    const analysis = report.reportAnalyses?.[0]
      ? JSON.parse(report.reportAnalyses[0].analysisData as string)
      : null;

    // 리포트 내용을 마크다운 형식으로 변환
    const markdownContent = `# ${report.title}

## 기본 정보
- **학급**: ${classInfo.grade}학년 ${classInfo.class}반
- **과목**: ${classInfo.subject}
- **담당교사**: ${classInfo.teacher}
- **학생 수**: ${report.reportAnalyses?.length || 0}명
- **리포트 타입**: ${report.reportType === 'FULL' ? '상세 리포트' : '요약 리포트'}
- **생성일**: ${new Date(report.createdAt).toLocaleDateString('ko-KR')}

## 리포트 내용

${report.content}

${
  analysis
    ? `
## 분석 결과

\`\`\`json
${JSON.stringify(analysis, null, 2)}
\`\`\`
`
    : ''
}

---
*이 리포트는 EduBridge AI 시스템에 의해 자동 생성되었습니다.*
`;

    // 파일명 생성
    const fileName = `${report.title}_${classInfo.grade}학년${classInfo.class}반_${new Date(report.createdAt).toISOString().split('T')[0]}.md`;

    // 응답 헤더 설정
    const headers = new Headers();
    headers.set('Content-Type', 'text/markdown; charset=utf-8');
    headers.set('Content-Disposition', `attachment; filename="${encodeURIComponent(fileName)}"`);

    return new NextResponse(markdownContent, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('리포트 다운로드 오류:', error);
    return NextResponse.json({ error: '리포트 다운로드 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
