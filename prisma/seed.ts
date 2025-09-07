import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 시드 데이터 생성을 시작합니다...");

  // 사용자 생성
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@example.com" },
    update: {},
    create: {
      name: "김선생",
      email: "teacher@example.com",
      role: "TEACHER",
      status: "ACTIVE",
    },
  });

  const students = await Promise.all([
    prisma.user.upsert({
      where: { email: "student1@example.com" },
      update: {},
      create: {
        name: "김학생",
        email: "student1@example.com",
        role: "STUDENT",
        status: "ACTIVE",
        grade: "1학년",
        preferences: {
          create: {
            learningStyle: JSON.stringify(["visual", "kinesthetic"]),
            interests: JSON.stringify(["수학", "과학"]),
            preferredDifficulty: "MEDIUM",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "student2@example.com" },
      update: {},
      create: {
        name: "이학생",
        email: "student2@example.com",
        role: "STUDENT",
        status: "ACTIVE",
        grade: "2학년",
        preferences: {
          create: {
            learningStyle: JSON.stringify(["auditory"]),
            interests: JSON.stringify(["국어", "영어"]),
            preferredDifficulty: "HARD",
          },
        },
      },
    }),
    prisma.user.upsert({
      where: { email: "student3@example.com" },
      update: {},
      create: {
        name: "박학생",
        email: "student3@example.com",
        role: "STUDENT",
        status: "INACTIVE",
        grade: "3학년",
        preferences: {
          create: {
            learningStyle: JSON.stringify(["visual"]),
            interests: JSON.stringify(["사회", "역사"]),
            preferredDifficulty: "EASY",
          },
        },
      },
    }),
  ]);

  // 문제 생성
  const problems = await Promise.all([
    prisma.problem.create({
      data: {
        title: "이차방정식의 해 구하기",
        description: "다음 이차방정식의 해를 구하세요: x² - 5x + 6 = 0",
        content:
          "이차방정식 x² - 5x + 6 = 0의 해를 구하는 문제입니다. 인수분해를 이용하여 풀어보세요.",
        subject: "수학",
        type: "MULTIPLE_CHOICE",
        difficulty: "MEDIUM",
        options: JSON.stringify(["x = 2, 3", "x = 1, 6", "x = -2, -3", "해가 없음"]),
        correctAnswer: "x = 2, 3",
        hints: JSON.stringify([
          "인수분해를 사용해보세요",
          "두 수의 곱이 6이고 합이 5인 수를 찾아보세요",
        ]),
        tags: JSON.stringify(["이차방정식", "인수분해", "수학"]),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: "광합성의 과정",
        description: "광합성에서 빛에너지가 화학에너지로 변환되는 과정을 설명하세요.",
        content:
          "광합성은 식물이 빛에너지를 이용하여 포도당을 만드는 과정입니다. 이 과정에서 일어나는 화학 반응을 설명해보세요.",
        subject: "과학",
        type: "SHORT_ANSWER",
        difficulty: "HARD",
        options: JSON.stringify([]),
        correctAnswer:
          "빛에너지가 엽록소에 의해 흡수되어 ATP와 NADPH를 생성하고, 이를 이용해 포도당을 합성한다.",
        hints: JSON.stringify([
          "엽록소의 역할을 생각해보세요",
          "ATP와 NADPH의 생성 과정을 설명해보세요",
        ]),
        tags: JSON.stringify(["광합성", "생물", "과학"]),
        isActive: true,
      },
    }),
    prisma.problem.create({
      data: {
        title: "한국의 역사",
        description: "조선왕조의 건국 연도는 언제인가요?",
        content: "조선왕조는 이성계에 의해 건국되었습니다. 조선이 건국된 연도를 선택하세요.",
        subject: "사회",
        type: "MULTIPLE_CHOICE",
        difficulty: "EASY",
        options: JSON.stringify(["1392년", "1443년", "1592년", "1636년"]),
        correctAnswer: "1392년",
        hints: JSON.stringify(["이성계가 조선을 건국한 연도를 생각해보세요"]),
        tags: JSON.stringify(["조선", "역사", "사회"]),
        isActive: true,
      },
    }),
  ]);

  // 학습 진도 생성
  await Promise.all(
    students.map((student, index) =>
      prisma.studentProgress.create({
        data: {
          studentId: student.id,
          problemId: problems[index % problems.length].id,
          status: index === 0 ? "COMPLETED" : index === 1 ? "IN_PROGRESS" : "NOT_STARTED",
          score: index === 0 ? 85 : index === 1 ? 0 : 0,
          timeSpent: index === 0 ? 300 : index === 1 ? 120 : 0,
          attempts: index === 0 ? 1 : index === 1 ? 2 : 0,
        },
      })
    )
  );

  // 분석 리포트 생성
  await Promise.all(
    students.map((student, index) =>
      prisma.analysisReport.create({
        data: {
          studentId: student.id,
          type: index === 0 ? "INDIVIDUAL" : index === 1 ? "WEEKLY" : "MONTHLY",
          title: `${student.name}님의 학습 분석 리포트`,
          period: "2024년 1월",
          insights: JSON.stringify([
            "수학 문제 해결 능력이 우수합니다",
            "과학 개념 이해에 어려움을 보입니다",
            "학습 집중도가 높습니다",
          ]),
          recommendations: JSON.stringify([
            "과학 개념을 단계별로 학습해보세요",
            "실험을 통한 체험 학습을 권장합니다",
            "복습 시간을 늘려보세요",
          ]),
          strengths: JSON.stringify(["논리적 사고", "집중력", "성실함"]),
          weaknesses: JSON.stringify(["과학 개념 이해", "추상적 사고"]),
          status: "COMPLETED",
        },
      })
    )
  );

  // 진로 상담 생성
  await Promise.all(
    students.map((student, index) =>
      prisma.careerCounseling.create({
        data: {
          studentId: student.id,
          type: index === 0 ? "ACADEMIC" : index === 1 ? "CAREER" : "UNIVERSITY_GUIDANCE",
          title: `${student.name}님의 진로 상담`,
          content: "학생의 관심사와 성향을 바탕으로 한 진로 상담 내용입니다.",
          careerSuggestions: JSON.stringify([
            "수학 관련 전공 추천",
            "공학 분야 진출 고려",
            "연구직 진로 탐색",
          ]),
          universityRecommendations: JSON.stringify([
            "서울대학교 공과대학",
            "KAIST 전산학부",
            "포스텍 컴퓨터공학과",
          ]),
          skillGaps: JSON.stringify(["프로그래밍 기초", "영어 회화 능력", "프레젠테이션 스킬"]),
          status: "COMPLETED",
        },
      })
    )
  );

  console.log("✅ 시드 데이터 생성이 완료되었습니다!");
  console.log(`👨‍🏫 교사: ${teacher.name} (${teacher.email})`);
  console.log(`👨‍🎓 학생: ${students.length}명`);
  console.log(`📝 문제: ${problems.length}개`);
}

main()
  .catch((e) => {
    console.error("❌ 시드 데이터 생성 중 오류 발생:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
