'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { BookOpen, Bot, Brain, Clock, Play, Send } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import remarkGfm from 'remark-gfm';

const demoScenarios = [
  {
    id: 1,
    title: 'AI 학습 튜터 체험',
    description: 'AI가 개인화된 학습 자료를 제공하고 실시간 피드백을 주는 과정을 체험해보세요',
    duration: '5분',
    features: ['개인화된 문제 추천', '실시간 피드백', '학습 진도 분석'],
    icon: Brain,
  },
  {
    id: 3,
    title: '문제 생성 및 관리',
    description: 'AI 도움으로 맞춤형 문제를 생성하고 학생들에게 배포하는 과정을 체험해보세요',
    duration: '4분',
    features: ['AI 문제 생성', '난이도 자동 조절', '학생별 맞춤 문제'],
    icon: BookOpen,
  },
  {
    id: 4,
    title: 'LLM AI 챗봇 테스트',
    description: '실제 LLM AI와 대화하며 질문하고 답변을 받아보세요',
    duration: '무제한',
    features: ['실시간 AI 대화', '다양한 주제 질문', '자연어 이해'],
    icon: Bot,
  },
];

// const demoSteps = [
//   {
//     step: 1,
//     title: '학생 로그인',
//     description: '학생 계정으로 로그인하여 학습 환경에 접속합니다',
//     completed: true,
//   },
//   {
//     step: 2,
//     title: 'AI 튜터와 상호작용',
//     description: 'AI 튜터가 개인화된 학습 자료를 추천하고 학습을 도와줍니다',
//     completed: true,
//   },
//   {
//     step: 3,
//     title: '문제 풀이 및 피드백',
//     description: '추천받은 문제를 풀고 AI가 실시간으로 피드백을 제공합니다',
//     completed: false,
//   },
//   {
//     step: 4,
//     title: '진도 확인 및 분석',
//     description: '학습 진도와 성과를 확인하고 다음 학습 계획을 세웁니다',
//     completed: false,
//   },
// ];

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ProblemGenerationForm {
  subject: string;
  unit: string;
  difficulty: string;
  count: number;
}

interface GeneratedProblem {
  id: string;
  title: string;
  content: string;
  type: string;
  difficulty: string;
  subject: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
  hints: string[];
}

interface StudentLog {
  scenario: string;
  description: string;
  user_id: string;
  logs: any[];
}

interface ReportGenerationForm {
  user_id: string;
  selectedScenario?: string;
}

interface GeneratedReport {
  user_id: string;
  report_text: string;
  weakest_unit: string;
  performance_summary: Record<string, any>;
  generated_at: string;
}

// 학생 풀이 로그 샘플 데이터
const studentLogScenarios: Record<string, StudentLog> = {
  perfect: {
    scenario: 'perfect',
    description: '완벽한 학생: 모든 문제를 빠르고 정확하게 해결',
    user_id: 'user_perfect',
    logs: [
      {
        problem_id: 'prob_1',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'medium',
        problem_content: 'y = 3x + 2 그래프의 기울기는?',
        selected_answer: '3',
        correct_answer: '3',
        is_correct: true,
        time_spent: 30,
        attempts: 1,
        timestamp: '2024-12-10T10:15:00',
      },
      {
        problem_id: 'prob_2',
        subject: '수학',
        unit: '이차함수',
        difficulty: 'hard',
        problem_content: '이차함수 y = x² - 4의 꼭짓점 좌표는?',
        selected_answer: '(0, -4)',
        correct_answer: '(0, -4)',
        is_correct: true,
        time_spent: 45,
        attempts: 1,
        timestamp: '2024-12-10T10:20:00',
      },
      {
        problem_id: 'prob_3',
        subject: '수학',
        unit: '삼각함수',
        difficulty: 'expert',
        problem_content: 'sin(30°)의 값은?',
        selected_answer: '1/2',
        correct_answer: '1/2',
        is_correct: true,
        time_spent: 60,
        attempts: 1,
        timestamp: '2024-12-10T10:25:00',
      },
    ],
  },
  struggling: {
    scenario: 'struggling',
    description: '어려워하는 학생: 문제를 여러 번 시도하고 시간이 오래 걸림',
    user_id: 'user_struggling',
    logs: [
      {
        problem_id: 'prob_1',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = 2x + 1의 y절편은?',
        selected_answer: '2',
        correct_answer: '1',
        is_correct: false,
        time_spent: 180,
        attempts: 5,
        timestamp: '2024-12-10T14:10:00',
      },
      {
        problem_id: 'prob_2',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = -x + 3 그래프가 지나가는 점은?',
        selected_answer: '(1, 2)',
        correct_answer: '(0, 3)',
        is_correct: false,
        time_spent: 240,
        attempts: 7,
        timestamp: '2024-12-10T14:20:00',
      },
      {
        problem_id: 'prob_3',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'medium',
        problem_content: 'y = 5x - 3과 y = 2x + 1의 교점의 x좌표는?',
        selected_answer: '4/3',
        correct_answer: '4/3',
        is_correct: true,
        time_spent: 600,
        attempts: 10,
        timestamp: '2024-12-10T14:35:00',
      },
      {
        problem_id: 'prob_4',
        subject: '수학',
        unit: '이차함수',
        difficulty: 'medium',
        problem_content: '이차함수 y = x² + 2x - 3의 축의 방정식은?',
        selected_answer: '',
        correct_answer: 'x = -1',
        is_correct: false,
        time_spent: 300,
        attempts: 0,
        timestamp: '2024-12-10T14:50:00',
      },
    ],
  },
  inconsistent: {
    scenario: 'inconsistent',
    description: '불안정한 학생: 쉬운 문제는 쉽게, 어려운 문제는 포기하는 패턴',
    user_id: 'user_inconsistent',
    logs: [
      {
        problem_id: 'prob_1',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = x + 5의 기울기는?',
        selected_answer: '1',
        correct_answer: '1',
        is_correct: true,
        time_spent: 20,
        attempts: 1,
        timestamp: '2024-12-10T16:00:00',
      },
      {
        problem_id: 'prob_2',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = 4x - 2에서 x = 3일 때 y값은?',
        selected_answer: '10',
        correct_answer: '10',
        is_correct: true,
        time_spent: 25,
        attempts: 1,
        timestamp: '2024-12-10T16:05:00',
      },
      {
        problem_id: 'prob_3',
        subject: '수학',
        unit: '이차함수',
        difficulty: 'hard',
        problem_content: 'y = 2x² - 4x + 3의 최솟값은?',
        selected_answer: '',
        correct_answer: '1',
        is_correct: false,
        time_spent: 600,
        attempts: 0,
        timestamp: '2024-12-10T16:15:00',
      },
      {
        problem_id: 'prob_4',
        subject: '수학',
        unit: '이차함수',
        difficulty: 'hard',
        problem_content: '이차함수 y = -x² + 6x - 5의 꼭짓점 좌표는?',
        selected_answer: '',
        correct_answer: '(3, 4)',
        is_correct: false,
        time_spent: 180,
        attempts: 0,
        timestamp: '2024-12-10T16:30:00',
      },
    ],
  },
  slow: {
    scenario: 'slow',
    description: '천천히 하는 학생: 정확하지만 시간이 오래 걸리는 유형',
    user_id: 'user_slow',
    logs: [
      {
        problem_id: 'prob_1',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = 3x + 1의 x절편은?',
        selected_answer: '-1/3',
        correct_answer: '-1/3',
        is_correct: true,
        time_spent: 600,
        attempts: 1,
        timestamp: '2024-12-10T18:00:00',
      },
      {
        problem_id: 'prob_2',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'easy',
        problem_content: 'y = -2x + 4의 y절편은?',
        selected_answer: '4',
        correct_answer: '4',
        is_correct: true,
        time_spent: 580,
        attempts: 1,
        timestamp: '2024-12-10T18:15:00',
      },
      {
        problem_id: 'prob_3',
        subject: '수학',
        unit: '일차함수',
        difficulty: 'medium',
        problem_content: '두 점 (2, 5), (4, 9)를 지나는 직선의 방정식은?',
        selected_answer: 'y = 2x + 1',
        correct_answer: 'y = 2x + 1',
        is_correct: true,
        time_spent: 900,
        attempts: 1,
        timestamp: '2024-12-10T18:35:00',
      },
    ],
  },
};

export default function DemoPage() {
  const [currentScenario, setCurrentScenario] = useState(4);
  const [isPlaying, setIsPlaying] = useState(false);
  const [, setCurrentStep] = useState(0);

  // LLM 챗봇 관련 상태
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatUserId, setChatUserId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 실제 학생 데이터
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(true);

  // 학생 선택 핸들러
  const handleStudentSelect = (student: any) => {
    setSelectedStudent(student);
    setChatUserId(student?.id || '');
  };

  // 문제 생성 관련 상태
  const [problemForm, setProblemForm] = useState<ProblemGenerationForm>({
    subject: '수학',
    unit: '일차함수',
    difficulty: 'medium',
    count: 1,
  });
  const [generatedProblems, setGeneratedProblems] = useState<GeneratedProblem[]>([]);
  const [isProblemLoading, setIsProblemLoading] = useState(false);

  // 리포트 생성 관련 상태
  const [reportForm, setReportForm] = useState<ReportGenerationForm>({
    user_id: 'user_1234',
    selectedScenario: 'struggling',
  });
  const [generatedReport, setGeneratedReport] = useState<GeneratedReport | null>(null);
  const [isReportLoading, setIsReportLoading] = useState(false);
  const [selectedReportStudent, setSelectedReportStudent] = useState<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // DB에서 실제 학생 데이터 가져오기
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch('/api/demo/students');
        const data = await response.json();
        setStudents(data.students || []);
      } catch (error) {
        console.error('Failed to fetch students:', error);
        // 에러 시 빈 배열로 설정 (UI에서 처리)
        setStudents([]);
      } finally {
        setIsLoadingStudents(false);
      }
    };

    fetchStudents();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const startDemo = () => {
    setIsPlaying(true);
    // 실제로는 애니메이션이나 인터랙티브 데모 실행
  };

  const pauseDemo = () => {
    setIsPlaying(false);
  };

  const resetDemo = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setMessages([]);
    setInputMessage('');
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isChatLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: inputMessage,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      // 선택한 사용자의 실제 DB 데이터 또는 시나리오 데이터 가져오기
      let studentLogs: any[] = [];

      if (selectedStudent) {
        try {
          // 실제 DB에서 데이터 가져오기
          const response = await fetch(`/api/demo/students/${selectedStudent.id}/attempts`);
          const data = await response.json();

          if (data.logs && data.logs.length > 0) {
            // DB 데이터를 사용
            studentLogs = data.logs;
          } else {
            // DB 데이터가 없으면 하드코딩된 시나리오 데이터 사용
            const scenarioKey = Object.keys(studentLogScenarios).find(
              (key) => studentLogScenarios[key]?.user_id === selectedStudent.id,
            );
            if (scenarioKey && studentLogScenarios[scenarioKey]) {
              studentLogs = studentLogScenarios[scenarioKey].logs;
            }
          }
        } catch (error) {
          console.error('Failed to fetch student logs:', error);
          // 에러 시 시나리오 데이터 사용
          const scenarioKey = Object.keys(studentLogScenarios).find(
            (key) => studentLogScenarios[key]?.user_id === selectedStudent.id,
          );
          if (scenarioKey && studentLogScenarios[scenarioKey]) {
            studentLogs = studentLogScenarios[scenarioKey].logs;
          }
        }
      }

      // AI 서버(FastAPI)로 직접 요청
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000'}/chat/message`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: chatUserId,
            user_message: inputMessage,
            student_logs: studentLogs.length > 0 ? studentLogs : undefined,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.ai_response || '죄송합니다. 응답을 생성할 수 없습니다.',
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'AI 서버(포트 8000)에 연결할 수 없습니다. AI 서버가 실행 중인지 확인해주세요.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const generateProblem = async () => {
    setIsProblemLoading(true);
    try {
      // 문제 생성도 AI 서버(FastAPI)로 직접 요청
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000'}/generate-question`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(problemForm),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedProblems(Array.isArray(data) ? data : [data]);
    } catch (error) {
      console.error('Failed to generate problem:', error);
      alert('AI 서버에 연결할 수 없습니다. AI 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsProblemLoading(false);
    }
  };

  const generateReport = async () => {
    setIsReportLoading(true);
    try {
      let studentLogs: any[] = [];
      let userId = '';
      let scenarioInfo: any = {};

      // 실제 학생이 선택된 경우
      if (selectedReportStudent?.id) {
        userId = selectedReportStudent.id;

        // 해당 학생의 실제 풀이 로그 가져오기
        try {
          const logsResponse = await fetch(`/api/demo/students/${userId}/attempts`);
          if (logsResponse.ok) {
            const logsData = await logsResponse.json();
            studentLogs = logsData.logs || [];
            scenarioInfo = {
              scenario: 'actual_student',
              description: `${selectedReportStudent.name} 학생의 실제 풀이 데이터`,
            };
          }
        } catch (err) {
          console.error('Failed to fetch student logs:', err);
        }

        // 로그가 없는 경우 시나리오 사용
        if (studentLogs.length === 0) {
          const scenarioKey = reportForm.selectedScenario || 'struggling';
          const selectedLogScenario = studentLogScenarios[scenarioKey];
          if (selectedLogScenario) {
            studentLogs = selectedLogScenario.logs;
            scenarioInfo = {
              scenario: selectedLogScenario.scenario,
              description: selectedLogScenario.description,
            };
          }
        }
      } else {
        // 시나리오 사용
        const scenarioKey = reportForm.selectedScenario || 'struggling';
        const selectedLogScenario = studentLogScenarios[scenarioKey];

        if (!selectedLogScenario) {
          throw new Error('학생 또는 시나리오를 선택해주세요.');
        }

        userId = selectedLogScenario.user_id;
        studentLogs = selectedLogScenario.logs;
        scenarioInfo = {
          scenario: selectedLogScenario.scenario,
          description: selectedLogScenario.description,
        };
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_FASTAPI_URL || 'http://127.0.0.1:8000'}/generate-report`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: userId,
            student_logs: studentLogs,
            scenario_info: scenarioInfo,
          }),
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setGeneratedReport(data);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('AI 서버에 연결할 수 없습니다. AI 서버가 실행 중인지 확인해주세요.');
    } finally {
      setIsReportLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* 헤더 */}
      <div className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold text-gray-900">EduBridge</span>
            </Link>
            <div className="flex gap-2">
              <Button variant="outline" asChild>
                <Link href="/login">로그인</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">회원가입</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* 메인 헤더 */}
        <div className="mb-12 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-5xl">
            EduBridge AI 플랫폼
            <span className="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              데모 체험
            </span>
          </h1>
          <p className="mx-auto max-w-3xl text-xl text-gray-600">
            실제 사용자처럼 플랫폼의 모든 기능을 체험해보고, AI가 어떻게 교육을 혁신하는지 직접
            확인해보세요.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* 데모 시나리오 선택 */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle>데모 시나리오</CardTitle>
                <CardDescription>체험하고 싶은 기능을 선택하세요</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {demoScenarios.map((scenario) => (
                  <div
                    key={scenario.id}
                    className={`cursor-pointer rounded-lg border p-4 transition-all ${
                      currentScenario === scenario.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setCurrentScenario(scenario.id)}
                  >
                    <div className="flex items-start gap-3">
                      <scenario.icon className="mt-1 h-6 w-6 text-blue-600" />
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{scenario.title}</h3>
                        <p className="mt-1 text-sm text-gray-600">{scenario.description}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            <Clock className="mr-1 h-3 w-3" />
                            {scenario.duration}
                          </Badge>
                        </div>
                        <div className="mt-2">
                          {scenario.features.map((feature, index) => (
                            <span key={index} className="text-xs text-gray-500">
                              {feature}
                              {index < scenario.features.length - 1 && ' • '}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* 데모 실행 영역 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>
                      {demoScenarios.find((s) => s.id === currentScenario)?.title}
                    </CardTitle>
                    <CardDescription>
                      {demoScenarios.find((s) => s.id === currentScenario)?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {/* LLM 챗봇 데모 */}
                {currentScenario === 4 ? (
                  <div className="flex h-[600px] flex-col">
                    <div className="mb-4 flex-1 space-y-4 overflow-y-auto rounded-lg bg-gray-50 p-4">
                      {messages.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-center">
                          <div>
                            <Bot className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                            <h3 className="mb-2 text-lg font-semibold text-gray-900">
                              LLM AI 챗봇에 오신 것을 환영합니다!
                            </h3>
                            <p className="text-gray-600">
                              리포트에서 사용한 사용자 ID를 입력하고, 해당 사용자 컨텍스트로 AI와
                              대화하세요
                            </p>
                            <p className="mt-2 text-xs text-gray-500">
                              예: user_perfect, user_struggling, user_inconsistent, user_slow
                            </p>
                          </div>
                        </div>
                      ) : (
                        messages.map((msg, index) => (
                          <div
                            key={index}
                            className={`flex ${
                              msg.role === 'user' ? 'justify-end' : 'justify-start'
                            }`}
                          >
                            <div
                              className={`max-w-[80%] rounded-lg p-3 ${
                                msg.role === 'user'
                                  ? 'bg-blue-600 text-white'
                                  : 'border border-gray-200 bg-white'
                              }`}
                            >
                              <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                              <p className="mt-1 text-xs opacity-70">
                                {msg.timestamp.toLocaleTimeString()}
                              </p>
                            </div>
                          </div>
                        ))
                      )}
                      {isChatLoading && (
                        <div className="flex justify-start">
                          <div className="rounded-lg border border-gray-200 bg-white p-3">
                            <div className="flex space-x-1">
                              <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                              <div
                                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                style={{ animationDelay: '0.2s' }}
                              />
                              <div
                                className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                style={{ animationDelay: '0.4s' }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* 사용자 선택 */}
                    <div className="mb-4 rounded-lg border border-gray-200 bg-white p-4">
                      <label className="mb-2 block text-sm font-medium text-gray-700">
                        학생 선택
                      </label>
                      <select
                        value={selectedStudent?.id || ''}
                        onChange={(e) => {
                          const student = students.find((s: any) => s.id === e.target.value);
                          handleStudentSelect(student);
                        }}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm"
                        disabled={isLoadingStudents}
                      >
                        <option value="">{isLoadingStudents ? '로딩 중...' : '선택하세요'}</option>
                        {students.map((student: any) => (
                          <option key={student.id} value={student.id}>
                            {student.name} ({student.email}) - {student.grade}
                          </option>
                        ))}
                      </select>

                      {/* 수동 입력 옵션 */}
                      {/* <div className="mt-3">
                        <label className="mb-1 block text-xs font-medium text-gray-600">
                          또는 수동 입력
                        </label>
                        <input
                          type="text"
                          value={chatUserId}
                          onChange={(e) => setChatUserId(e.target.value)}
                          placeholder="예: user_perfect, user_1234"
                          className="w-full rounded-md border border-gray-300 px-3 py-2 text-xs"
                        />
                        <p className="mt-1 text-xs text-gray-400">
                          리포트 시나리오에서 사용한 사용자 ID를 입력할 수 있습니다.
                        </p>
                      </div> */}
                    </div>

                    <div className="flex gap-2">
                      <Textarea
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder="질문을 입력하세요..."
                        className="resize-none"
                        rows={2}
                      />
                      <Button
                        onClick={sendMessage}
                        disabled={!inputMessage.trim() || isChatLoading}
                        className="self-end"
                      >
                        <Send className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ) : currentScenario === 3 ? (
                  /* 문제 생성 데모 */
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      <h3 className="mb-6 text-lg font-semibold text-gray-900">AI 문제 생성</h3>

                      <div className="grid grid-cols-2 gap-4">
                        {/* 과목 선택 */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            과목 <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={problemForm.subject}
                            onValueChange={(value) =>
                              setProblemForm({ ...problemForm, subject: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="과목을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="수학">수학</SelectItem>
                              <SelectItem value="국어">국어</SelectItem>
                              <SelectItem value="영어">영어</SelectItem>
                              <SelectItem value="과학">과학</SelectItem>
                              <SelectItem value="사회">사회</SelectItem>
                              <SelectItem value="역사">역사</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 단원 선택 */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            단원 <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={problemForm.unit}
                            onValueChange={(value) =>
                              setProblemForm({ ...problemForm, unit: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="단원을 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="일차함수">일차함수</SelectItem>
                              <SelectItem value="이차함수">이차함수</SelectItem>
                              <SelectItem value="삼각함수">삼각함수</SelectItem>
                              <SelectItem value="지수함수">지수함수</SelectItem>
                              <SelectItem value="로그함수">로그함수</SelectItem>
                              <SelectItem value="수열">수열</SelectItem>
                              <SelectItem value="확률">확률</SelectItem>
                              <SelectItem value="통계">통계</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 난이도 선택 */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            난이도 <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={problemForm.difficulty}
                            onValueChange={(value) =>
                              setProblemForm({ ...problemForm, difficulty: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="난이도를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="easy">쉬움 (EASY)</SelectItem>
                              <SelectItem value="medium">보통 (MEDIUM)</SelectItem>
                              <SelectItem value="hard">어려움 (HARD)</SelectItem>
                              <SelectItem value="expert">매우 어려움 (EXPERT)</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        {/* 생성 개수 */}
                        <div>
                          <label className="mb-2 block text-sm font-medium text-gray-700">
                            생성 개수 <span className="text-red-500">*</span>
                          </label>
                          <Select
                            value={problemForm.count.toString()}
                            onValueChange={(value) =>
                              setProblemForm({ ...problemForm, count: parseInt(value) || 1 })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="개수를 선택하세요" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="1">1개</SelectItem>
                              <SelectItem value="2">2개</SelectItem>
                              <SelectItem value="3">3개</SelectItem>
                              <SelectItem value="4">4개</SelectItem>
                              <SelectItem value="5">5개</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <Button
                        onClick={generateProblem}
                        disabled={
                          isProblemLoading ||
                          !problemForm.subject ||
                          !problemForm.unit ||
                          !problemForm.difficulty
                        }
                        className="mt-6 w-full"
                        size="lg"
                      >
                        {isProblemLoading ? (
                          <>
                            <span className="mr-2 inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                            생성 중...
                          </>
                        ) : (
                          <>
                            <BookOpen className="mr-2 h-4 w-4" />
                            AI 문제 생성하기
                          </>
                        )}
                      </Button>
                    </div>

                    {generatedProblems.length > 0 && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">
                          생성된 문제 ({generatedProblems.length}개)
                        </h3>
                        {generatedProblems.map((problem, index) => (
                          <div
                            key={problem.id || index}
                            className="rounded-lg border border-gray-200 bg-white p-4"
                          >
                            <h4 className="mb-2 font-semibold text-gray-900">{problem.title}</h4>
                            <p className="mb-2 text-sm text-gray-700">{problem.content}</p>
                            <div className="text-xs text-gray-500">
                              난이도: {problem.difficulty} | 과목: {problem.subject}
                            </div>
                            {problem.options && (
                              <div className="mt-2 text-sm">
                                <strong>선택지:</strong>
                                <ul className="list-inside list-disc">
                                  {problem.options.map((option, i) => (
                                    <li key={i}>{option}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            <div className="mt-2 text-sm">
                              <strong>정답:</strong> {problem.correctAnswer}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ) : currentScenario === 1 ? (
                  /* 리포트 생성 데모 */
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      <h3 className="mb-4 font-semibold text-gray-900">
                        학생 풀이 로그 시나리오 선택
                      </h3>
                      <p className="mb-4 text-sm text-gray-600">
                        실제 학생을 선택하거나 학습 패턴 시나리오를 선택하여 리포트가 어떻게
                        생성되는지 확인하세요.
                      </p>

                      {/* 실제 학생 선택 */}
                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          실제 학생 선택
                        </label>
                        <Select
                          value={selectedReportStudent?.id || ''}
                          onValueChange={(value) => {
                            const student = students.find((s) => s.id === value);
                            setSelectedReportStudent(student);
                            setReportForm({ ...reportForm, user_id: value });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="학생을 선택하세요" />
                          </SelectTrigger>
                          <SelectContent>
                            {students.map((student) => (
                              <SelectItem key={student.id} value={student.id}>
                                {student.name} ({student.email})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="mb-4">
                        <label className="mb-2 block text-sm font-medium text-gray-700">
                          또는 시나리오 선택
                        </label>
                      </div>

                      <div className="mb-4 grid grid-cols-2 gap-3">
                        {Object.entries(studentLogScenarios).map(([key, scenario]) => (
                          <div
                            key={key}
                            className={`cursor-pointer rounded-lg border-2 p-3 transition-all ${
                              reportForm.selectedScenario === key
                                ? 'border-blue-500 bg-blue-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => setReportForm({ ...reportForm, selectedScenario: key })}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <h4 className="font-semibold text-gray-900">
                                  {scenario.scenario === 'perfect' && '🏆 완벽한 학생'}
                                  {scenario.scenario === 'struggling' && '😓 어려워하는 학생'}
                                  {scenario.scenario === 'inconsistent' && '📈 불안정한 학생'}
                                  {scenario.scenario === 'slow' && '⏱️ 천천히 하는 학생'}
                                </h4>
                                <p className="mt-1 text-xs text-gray-600">{scenario.description}</p>
                                <div className="mt-2 text-xs text-gray-500">
                                  문제 수: {scenario.logs.length}개
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* 선택된 시나리오의 로그 데이터 보여주기 */}
                      {reportForm.selectedScenario &&
                        studentLogScenarios[reportForm.selectedScenario] && (
                          <div className="mb-4 rounded-lg bg-gradient-to-br from-gray-50 to-blue-50 p-4">
                            <div className="mb-3 flex items-center justify-between">
                              <h4 className="text-sm font-semibold text-gray-900">
                                📊 학생 풀이 로그 (미리보기)
                              </h4>
                              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700">
                                총 {studentLogScenarios[reportForm.selectedScenario]?.logs.length}개
                                문제
                              </span>
                            </div>
                            <div className="max-h-96 space-y-3 overflow-y-auto">
                              {studentLogScenarios[reportForm.selectedScenario]?.logs.map(
                                (log, idx) => (
                                  <div
                                    key={idx}
                                    className="rounded-lg border-2 bg-white p-4 shadow-sm transition-all hover:shadow-md"
                                  >
                                    <div className="mb-3 flex items-start justify-between">
                                      <div className="flex-1">
                                        <div className="mb-2 flex items-center gap-2">
                                          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                                            Q{idx + 1}
                                          </span>
                                          <span
                                            className={`rounded px-2 py-1 text-xs font-medium ${
                                              log.difficulty === 'easy'
                                                ? 'bg-green-100 text-green-700'
                                                : log.difficulty === 'medium'
                                                  ? 'bg-yellow-100 text-yellow-700'
                                                  : 'bg-red-100 text-red-700'
                                            }`}
                                          >
                                            {log.difficulty === 'easy'
                                              ? '쉬움'
                                              : log.difficulty === 'medium'
                                                ? '보통'
                                                : '어려움'}
                                          </span>
                                          <span className="rounded bg-purple-100 px-2 py-1 text-xs font-medium text-purple-700">
                                            {log.unit}
                                          </span>
                                        </div>
                                        <div className="rounded-lg bg-gray-50 p-3">
                                          <p className="text-sm font-medium text-gray-900">
                                            {log.problem_content}
                                          </p>
                                        </div>
                                      </div>
                                      <div className="ml-4">
                                        <span
                                          className={`flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold ${
                                            log.is_correct
                                              ? 'bg-green-100 text-green-700'
                                              : 'bg-red-100 text-red-700'
                                          }`}
                                        >
                                          {log.is_correct ? '✓' : '✗'}
                                        </span>
                                      </div>
                                    </div>

                                    {/* 답변 비교 */}
                                    <div className="mb-3 grid grid-cols-2 gap-3">
                                      <div className="rounded-lg border-2 bg-red-50 p-3">
                                        <div className="mb-1 text-xs font-medium text-red-700">
                                          학생 답변
                                        </div>
                                        <div
                                          className={`text-sm font-semibold ${
                                            log.selected_answer ? 'text-red-900' : 'text-gray-400'
                                          }`}
                                        >
                                          {log.selected_answer || '미제출'}
                                        </div>
                                      </div>
                                      <div className="rounded-lg border-2 bg-green-50 p-3">
                                        <div className="mb-1 text-xs font-medium text-green-700">
                                          정답
                                        </div>
                                        <div className="text-sm font-semibold text-green-900">
                                          {log.correct_answer}
                                        </div>
                                      </div>
                                    </div>

                                    {/* 통계 정보 */}
                                    <div className="grid grid-cols-3 gap-2 rounded-lg bg-gray-50 p-3">
                                      <div className="text-center">
                                        <div className="mb-1 text-xs text-gray-500">풀이 시간</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {log.time_spent}초
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="mb-1 text-xs text-gray-500">시도 횟수</div>
                                        <div className="text-sm font-semibold text-gray-900">
                                          {log.attempts}회
                                        </div>
                                      </div>
                                      <div className="text-center">
                                        <div className="mb-1 text-xs text-gray-500">완료 시간</div>
                                        {log.timestamp ? (
                                          <div className="text-xs font-medium text-gray-700">
                                            {new Date(log.timestamp).toLocaleTimeString('ko-KR', {
                                              hour: '2-digit',
                                              minute: '2-digit',
                                            })}
                                          </div>
                                        ) : (
                                          <div className="text-xs text-gray-400">-</div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ),
                              )}
                            </div>
                          </div>
                        )}

                      <Button
                        onClick={generateReport}
                        disabled={isReportLoading}
                        className="w-full"
                      >
                        {isReportLoading ? '리포트 생성 중...' : '리포트 생성하기'}
                      </Button>
                    </div>

                    {generatedReport && (
                      <div className="space-y-4">
                        <h3 className="font-semibold text-gray-900">생성된 리포트 분석 결과</h3>
                        <div className="rounded-lg border border-gray-200 bg-white p-6">
                          <div className="mb-4 rounded-lg bg-blue-50 p-3">
                            <div className="text-xs text-gray-600">
                              생성 시간: {new Date(generatedReport.generated_at).toLocaleString()}
                            </div>
                            <div className="mt-2 text-xs text-gray-700">
                              <strong>선택한 시나리오:</strong>{' '}
                              {
                                studentLogScenarios[reportForm.selectedScenario || 'struggling']
                                  ?.description
                              }
                            </div>
                          </div>

                          <div className="prose prose-sm mb-4 max-w-none rounded-lg bg-gray-50 p-6">
                            <ReactMarkdown
                              remarkPlugins={[remarkGfm]}
                              rehypePlugins={[rehypeHighlight]}
                              components={{
                                h1: ({ children }) => (
                                  <h1 className="mb-4 mt-0 text-2xl font-bold text-gray-900">
                                    {children}
                                  </h1>
                                ),
                                h2: ({ children }) => (
                                  <h2 className="mb-3 mt-6 text-xl font-semibold text-gray-900">
                                    {children}
                                  </h2>
                                ),
                                h3: ({ children }) => (
                                  <h3 className="mb-2 mt-4 text-lg font-semibold text-gray-900">
                                    {children}
                                  </h3>
                                ),
                                p: ({ children }) => (
                                  <p className="mb-3 leading-relaxed text-gray-700">{children}</p>
                                ),
                                ul: ({ children }) => (
                                  <ul className="mb-4 ml-6 list-disc space-y-1 text-gray-700">
                                    {children}
                                  </ul>
                                ),
                                ol: ({ children }) => (
                                  <ol className="mb-4 ml-6 list-decimal space-y-1 text-gray-700">
                                    {children}
                                  </ol>
                                ),
                                li: ({ children }) => <li className="text-gray-700">{children}</li>,
                                strong: ({ children }) => (
                                  <strong className="font-semibold text-gray-900">
                                    {children}
                                  </strong>
                                ),
                              }}
                            >
                              {generatedReport.report_text}
                            </ReactMarkdown>
                          </div>

                          {generatedReport.weakest_unit && (
                            <div className="mb-4 rounded-lg bg-red-50 p-3">
                              <strong className="text-red-900">⚠️ 약점 단원:</strong>{' '}
                              <span className="text-red-700">{generatedReport.weakest_unit}</span>
                            </div>
                          )}

                          {/* 로그 데이터와 리포트의 일치성 확인 */}
                          <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                            <h4 className="mb-2 text-sm font-semibold text-yellow-900">
                              📊 리포트가 로그 데이터를 잘 반영했는지 확인:
                            </h4>
                            <div className="space-y-1 text-xs text-yellow-800">
                              <div>
                                • 입력된 로그: 총{' '}
                                {
                                  studentLogScenarios[reportForm.selectedScenario || 'struggling']
                                    ?.logs.length
                                }
                                개 문제
                              </div>
                              <div>
                                • 리포트에서 언급된 약점: {generatedReport.weakest_unit || '없음'}
                              </div>
                              <div>
                                • 리포트 내용이 학생의 실제 학습 패턴을 정확히 분석했는지
                                검토해보세요
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : currentScenario === 1 ? (
                  /* AI 학습 튜터 체험 데모 */
                  <div className="space-y-6">
                    <div className="rounded-lg border border-gray-200 bg-white p-6">
                      <div className="mb-6 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                          <Brain className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            AI 학습 튜터와 대화
                          </h3>
                          <p className="text-sm text-gray-600">
                            개인화된 학습 가이드와 실시간 피드백을 받아보세요
                          </p>
                        </div>
                      </div>

                      {/* 챗봇 영역 */}
                      <div className="mb-4 flex h-[400px] flex-col rounded-lg bg-gradient-to-br from-gray-50 to-blue-50">
                        <div className="flex-1 space-y-4 overflow-y-auto p-4">
                          {messages.length === 0 ? (
                            <div className="flex h-full items-center justify-center">
                              <div className="text-center">
                                <Brain className="mx-auto mb-4 h-16 w-16 text-blue-600" />
                                <h3 className="mb-2 text-xl font-semibold text-gray-900">
                                  안녕하세요! AI 학습 튜터입니다
                                </h3>
                                <p className="text-gray-600">
                                  어떤 도움이 필요하신가요? 학습 관련 질문을 해주세요.
                                </p>
                                <div className="mt-4 space-y-2">
                                  <p className="text-sm font-medium text-gray-700">예시 질문:</p>
                                  <div className="space-y-1">
                                    {[
                                      '오늘 공부할 내용을 추천해주세요',
                                      '수학 일차함수 어려워요',
                                      '어떻게 공부하면 좋을까요?',
                                    ].map((example, idx) => (
                                      <button
                                        key={idx}
                                        onClick={() => setInputMessage(example)}
                                        className="block w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                                      >
                                        💬 {example}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            messages.map((msg, index) => (
                              <div
                                key={index}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                              >
                                <div
                                  className={`max-w-[80%] rounded-2xl p-4 ${
                                    msg.role === 'user'
                                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white'
                                      : 'border border-gray-200 bg-white shadow-sm'
                                  }`}
                                >
                                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                                  <p
                                    className={`mt-1 text-xs ${
                                      msg.role === 'user' ? 'text-blue-100' : 'text-gray-400'
                                    }`}
                                  >
                                    {msg.timestamp.toLocaleTimeString()}
                                  </p>
                                </div>
                              </div>
                            ))
                          )}
                          {isChatLoading && (
                            <div className="flex justify-start">
                              <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
                                <div className="flex space-x-1">
                                  <div className="h-2 w-2 animate-bounce rounded-full bg-gray-400" />
                                  <div
                                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                    style={{ animationDelay: '0.2s' }}
                                  />
                                  <div
                                    className="h-2 w-2 animate-bounce rounded-full bg-gray-400"
                                    style={{ animationDelay: '0.4s' }}
                                  />
                                </div>
                              </div>
                            </div>
                          )}
                          <div ref={messagesEndRef} />
                        </div>

                        {/* 입력 영역 */}
                        <div className="border-t border-gray-200 bg-white p-4">
                          <div className="flex gap-2">
                            <Textarea
                              value={inputMessage}
                              onChange={(e) => setInputMessage(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                  e.preventDefault();
                                  sendMessage();
                                }
                              }}
                              placeholder="메시지를 입력하세요... (Enter로 전송)"
                              className="resize-none"
                              rows={2}
                            />
                            <Button
                              onClick={sendMessage}
                              disabled={!inputMessage.trim() || isChatLoading}
                              className="self-end"
                              size="lg"
                            >
                              <Send className="h-5 w-5" />
                            </Button>
                          </div>
                          <p className="mt-2 text-xs text-gray-500">
                            ✨ AI 튜터가 당신의 학습 패턴을 분석하여 맞춤형 조언을 제공합니다
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 데모 화면 시뮬레이션 */
                  <div className="flex min-h-[400px] items-center justify-center rounded-lg bg-gray-50 p-8">
                    {isPlaying ? (
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-blue-100">
                          <Play className="h-8 w-8 text-blue-600" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          데모 실행 중...
                        </h3>
                        <p className="text-gray-600">
                          실제 플랫폼 환경에서 기능을 체험하고 있습니다
                        </p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-200">
                          <Play className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="mb-2 text-lg font-semibold text-gray-900">
                          데모를 시작하세요
                        </h3>
                        <p className="text-gray-600">
                          왼쪽에서 시나리오를 선택하고 데모를 시작해보세요
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* 진행 단계
                <div className="mt-6">
                  <h4 className="mb-4 font-semibold text-gray-900">진행 단계</h4>
                  <div className="space-y-3">
                    {demoSteps.map((step) => (
                      <div key={step.step} className="flex items-center gap-3">
                        <div
                          className={`flex h-8 w-8 items-center justify-center rounded-full ${
                            step.completed
                              ? 'bg-green-100 text-green-600'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {step.completed ? (
                            <CheckCircle className="h-4 w-4" />
                          ) : (
                            <span className="text-sm font-medium">{step.step}</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <h5
                            className={`font-medium ${
                              step.completed ? 'text-gray-900' : 'text-gray-500'
                            }`}
                          >
                            {step.title}
                          </h5>
                          <p
                            className={`text-sm ${
                              step.completed ? 'text-gray-600' : 'text-gray-400'
                            }`}
                          >
                            {step.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div> */}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 기능 하이라이트 */}
        {/* <div className="mt-16">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            체험할 수 있는 주요 기능
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card className="text-center">
              <CardContent className="p-6">
                <Brain className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                <h3 className="mb-2 font-semibold text-gray-900">AI 학습 튜터</h3>
                <p className="text-sm text-gray-600">개인화된 학습 자료와 실시간 피드백</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <TrendingUp className="mx-auto mb-4 h-12 w-12 text-green-600" />
                <h3 className="mb-2 font-semibold text-gray-900">성과 분석</h3>
                <p className="text-sm text-gray-600">학습 진도와 성과를 실시간으로 분석</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <MessageCircle className="mx-auto mb-4 h-12 w-12 text-purple-600" />
                <h3 className="mb-2 font-semibold text-gray-900">진로 상담</h3>
                <p className="text-sm text-gray-600">AI 기반 개인 맞춤형 진로 상담</p>
              </CardContent>
            </Card>
            <Card className="text-center">
              <CardContent className="p-6">
                <Award className="mx-auto mb-4 h-12 w-12 text-orange-600" />
                <h3 className="mb-2 font-semibold text-gray-900">성취 관리</h3>
                <p className="text-sm text-gray-600">학습 목표 달성과 성취도 관리</p>
              </CardContent>
            </Card>
          </div>
        </div> */}
      </div>
    </div>
  );
}
