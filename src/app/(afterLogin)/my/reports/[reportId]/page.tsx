'use client';

import { Button } from '@/components/ui/button';
import { useStudentReportDetail } from '@/hooks/teacher-reports/use-student-report-detail';
import 'highlight.js/styles/github.css';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ArrowLeft, Download, FileText } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

export default function StudentReportDetailPage() {
  const params = useParams();
  const router = useRouter();
  const reportId = params.reportId as string;
  const reportContentRef = useRef<HTMLDivElement>(null);

  const { data: reportResponse, isLoading, error } = useStudentReportDetail(reportId);
  const report = reportResponse?.data;

  const handleDownloadReport = async () => {
    if (!report || !reportContentRef.current) return;

    try {
      // 리포트 콘텐츠를 캔버스로 변환
      const canvas = await html2canvas(reportContentRef.current, {
        scale: 2, // 고해상도
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: reportContentRef.current.scrollWidth,
        height: reportContentRef.current.scrollHeight,
      });

      // PDF 생성
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      // A4 페이지 크기 계산
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth - 20; // 좌우 여백 10mm씩
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 10; // 상단 여백

      // 첫 페이지 추가
      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight - 20; // 상하 여백 제외

      // 여러 페이지가 필요한 경우
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight + 10;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight - 20;
      }

      // 파일명 생성 (특수문자 제거)
      const fileName = `${report.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '')}.pdf`;

      // PDF 다운로드
      pdf.save(fileName);
    } catch (error) {
      console.error('PDF 생성 실패:', error);
      // PDF 생성 실패 시 마크다운으로 대체 다운로드
      handleDownloadMarkdown();
    }
  };

  const handleDownloadMarkdown = () => {
    if (!report) return;

    // 리포트 메타데이터를 포함한 마크다운 콘텐츠 생성
    const metadata = [
      `# ${report.title}`,
      '',
      `**리포트 타입:** ${report.reportType === 'PROGRESS_REPORT' ? '진도 리포트' : report.reportType === 'PERFORMANCE_ANALYSIS' ? '성과 분석' : report.reportType === 'CLASS_SUMMARY' ? '클래스 요약' : report.reportType === 'STUDENT_INSIGHTS' ? '학생 인사이트' : '리포트'}`,
      `**생성일:** ${new Date(report.createdAt).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' })}`,
      report.class ? `**대상 클래스:** ${report.class.name}` : '',
      `**상태:** ${report.status === 'COMPLETED' ? '완료' : report.status === 'GENERATING' ? '생성 중' : report.status === 'FAILED' ? '실패' : '초안'}`,
      '',
      '---',
      '',
    ]
      .filter(Boolean)
      .join('\n');

    const content = `${metadata}${report.content}`;
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.title.replace(/[^a-zA-Z0-9가-힣\s]/g, '')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                돌아가기
              </Button>
              <div className="border-l border-gray-200 pl-3">
                <h1 className="text-2xl font-bold text-gray-900">리포트 상세</h1>
                <p className="mt-1 text-xs text-gray-600">리포트를 불러오는 중...</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-8 text-center">
              <div className="mx-auto mb-3 h-6 w-6 animate-spin rounded-full border-b-2 border-blue-600"></div>
              <p className="text-sm text-gray-600">리포트를 불러오는 중...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !report) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="px-6 py-4">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                돌아가기
              </Button>
              <div className="border-l border-gray-200 pl-3">
                <h1 className="text-2xl font-bold text-gray-900">리포트 상세</h1>
                <p className="mt-1 text-xs text-gray-600">리포트를 불러올 수 없습니다</p>
              </div>
            </div>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
            <div className="p-8 text-center">
              <p className="mb-3 text-sm text-red-600">리포트를 불러오는데 실패했습니다.</p>
              <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
                다시 시도
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 고정 문서 헤더 */}
      <div className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" onClick={() => router.back()}>
                <ArrowLeft className="mr-1 h-4 w-4" />
                돌아가기
              </Button>
              <div className="border-l border-gray-200 pl-3">
                <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
                <div className="mt-1 flex items-center gap-3 text-xs text-gray-600">
                  {report.class && (
                    <span className="flex items-center gap-1">
                      <span className="font-medium">클래스:</span>
                      {report.class.name}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <span className="font-medium">생성일:</span>
                    {new Date(report.createdAt).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                  <span
                    className={`rounded-full px-2 py-1 text-xs font-medium ${
                      report.status === 'COMPLETED'
                        ? 'bg-green-100 text-green-800'
                        : report.status === 'GENERATING'
                          ? 'bg-blue-100 text-blue-800'
                          : report.status === 'FAILED'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {report.status === 'COMPLETED'
                      ? '완료'
                      : report.status === 'GENERATING'
                        ? '생성 중'
                        : report.status === 'FAILED'
                          ? '실패'
                          : '초안'}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2">
              {report.status === 'COMPLETED' && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDownloadReport}>
                    <Download className="mr-1 h-4 w-4" />
                    PDF 다운로드
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* 문서 본문 */}
      <div className="px-6 py-4">
        <div className="space-y-4">
          {/* 문서 메타 정보 */}
          <div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div>
                  <div className="text-xs font-medium text-gray-500">리포트 타입</div>
                  <div className="text-sm font-semibold text-gray-900">
                    {report.reportType === 'PROGRESS_REPORT'
                      ? '진도 리포트'
                      : report.reportType === 'PERFORMANCE_ANALYSIS'
                        ? '성과 분석'
                        : report.reportType === 'CLASS_SUMMARY'
                          ? '클래스 요약'
                          : report.reportType === 'STUDENT_INSIGHTS'
                            ? '학생 인사이트'
                            : '리포트'}
                  </div>
                </div>
                {report.class && (
                  <div>
                    <div className="text-xs font-medium text-gray-500">대상 클래스</div>
                    <div className="text-sm font-semibold text-gray-900">{report.class.name}</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 리포트 내용 */}
          {report.content ? (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-lg font-semibold text-gray-900">리포트 내용</h2>
                <p className="mt-1 text-xs text-gray-600">AI가 생성한 학습 분석 리포트입니다</p>
              </div>
              <div className="px-4 py-4" ref={reportContentRef}>
                <div className="prose prose-gray prose-headings:font-semibold prose-headings:text-gray-900 prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg prose-p:text-gray-800 prose-p:leading-relaxed prose-ul:text-gray-800 prose-ol:text-gray-800 prose-li:text-gray-800 prose-strong:text-gray-900 prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 max-w-none">
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                      h1: ({ children }) => (
                        <h1 className="mb-4 mt-6 border-b border-gray-200 pb-2 text-2xl font-bold text-gray-900 first:mt-0">
                          {children}
                        </h1>
                      ),
                      h2: ({ children }) => (
                        <h2 className="mb-3 mt-5 text-xl font-semibold text-gray-900 first:mt-0">
                          {children}
                        </h2>
                      ),
                      h3: ({ children }) => (
                        <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-900 first:mt-0">
                          {children}
                        </h3>
                      ),
                      p: ({ children }) => (
                        <p className="mb-3 leading-relaxed text-gray-800">{children}</p>
                      ),
                      ul: ({ children }) => (
                        <ul className="mb-3 list-inside list-disc space-y-1 text-gray-800">
                          {children}
                        </ul>
                      ),
                      ol: ({ children }) => (
                        <ol className="mb-3 list-inside list-decimal space-y-1 text-gray-800">
                          {children}
                        </ol>
                      ),
                      li: ({ children }) => (
                        <li className="leading-relaxed text-gray-800">{children}</li>
                      ),
                      strong: ({ children }) => (
                        <strong className="font-semibold text-gray-900">{children}</strong>
                      ),
                      code: ({ children }) => (
                        <code className="rounded bg-gray-100 px-1 py-0.5 font-mono text-sm text-gray-800">
                          {children}
                        </code>
                      ),
                      pre: ({ children }) => (
                        <pre className="mb-3 overflow-x-auto rounded-lg border border-gray-200 bg-gray-50 p-4">
                          {children}
                        </pre>
                      ),
                      blockquote: ({ children }) => (
                        <blockquote className="mb-3 border-l-4 border-blue-500 pl-4 italic text-gray-700">
                          {children}
                        </blockquote>
                      ),
                    }}
                  >
                    {report.content}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="p-8 text-center">
                <FileText className="mx-auto mb-3 h-8 w-8 text-gray-400" />
                <h3 className="mb-2 text-base font-semibold text-gray-900">
                  리포트 내용이 없습니다
                </h3>
                <p className="text-sm text-gray-600">리포트를 생성하여 내용을 확인하세요.</p>
              </div>
            </div>
          )}

          {/* 분석 데이터 */}
          {report.analysisData && (
            <div className="rounded-lg border border-gray-200 bg-white shadow-sm">
              <div className="border-b border-gray-200 px-4 py-3">
                <h2 className="text-lg font-semibold text-gray-900">분석 데이터</h2>
                <p className="mt-1 text-xs text-gray-600">상세한 분석 결과와 인사이트입니다</p>
              </div>
              <div className="px-4 py-4">
                <div className="space-y-4">
                  {report.analysisData.summary && (
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-gray-900">요약</h3>
                      <div className="rounded-lg bg-gray-50 p-3">
                        <p className="text-sm leading-relaxed text-gray-700">
                          {report.analysisData.summary}
                        </p>
                      </div>
                    </div>
                  )}

                  {report.analysisData.insights && report.analysisData.insights.length > 0 && (
                    <div>
                      <h3 className="mb-2 text-base font-semibold text-gray-900">주요 인사이트</h3>
                      <div className="space-y-2">
                        {report.analysisData.insights.map((insight: string, index: number) => (
                          <div key={index} className="flex items-start gap-2">
                            <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-blue-500"></div>
                            <p className="text-sm leading-relaxed text-gray-700">{insight}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {report.analysisData.recommendations &&
                    report.analysisData.recommendations.length > 0 && (
                      <div>
                        <h3 className="mb-2 text-base font-semibold text-gray-900">권장사항</h3>
                        <div className="space-y-2">
                          {report.analysisData.recommendations.map(
                            (recommendation: string, index: number) => (
                              <div key={index} className="flex items-start gap-2">
                                <div className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-green-500"></div>
                                <p className="text-sm leading-relaxed text-gray-700">
                                  {recommendation}
                                </p>
                              </div>
                            ),
                          )}
                        </div>
                      </div>
                    )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
