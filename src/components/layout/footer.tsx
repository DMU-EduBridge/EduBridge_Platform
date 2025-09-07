import Link from "next/link";

export function Footer() {
  return (
    <footer className="text-white bg-gray-900">
      <div className="px-4 py-12 mx-auto max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* 로고 및 설명 */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center mb-4 space-x-2">
              <div className="flex justify-center items-center w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg">
                <span className="text-sm font-bold text-white">E</span>
              </div>
              <span className="text-xl font-bold">EduBridge</span>
            </div>
            <p className="mb-4 max-w-md text-gray-400">
              AI 기반 교육 플랫폼으로 선생님과 학생을 연결하고, 개인화된 학습 경험과 진로 상담을
              통해 혁신적인 교육 성과를 만들어가세요.
            </p>
          </div>

          {/* 제품 */}
          <div>
            <h3 className="mb-4 font-semibold">제품</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/features" className="transition-colors hover:text-white">
                  기능
                </Link>
              </li>
              <li>
                <Link href="/pricing" className="transition-colors hover:text-white">
                  요금제
                </Link>
              </li>
              <li>
                <Link href="/integrations" className="transition-colors hover:text-white">
                  연동
                </Link>
              </li>
              <li>
                <Link href="/api" className="transition-colors hover:text-white">
                  API
                </Link>
              </li>
            </ul>
          </div>

          {/* 지원 */}
          <div>
            <h3 className="mb-4 font-semibold">지원</h3>
            <ul className="space-y-2 text-gray-400">
              <li>
                <Link href="/help" className="transition-colors hover:text-white">
                  도움말
                </Link>
              </li>
              <li>
                <Link href="/contact" className="transition-colors hover:text-white">
                  문의하기
                </Link>
              </li>
              <li>
                <Link href="/status" className="transition-colors hover:text-white">
                  서비스 상태
                </Link>
              </li>
              <li>
                <Link href="/community" className="transition-colors hover:text-white">
                  커뮤니티
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col justify-between items-center pt-8 mt-8 border-t border-gray-800 md:flex-row">
          <p className="text-sm text-gray-400">© 2025 EduBridge. All rights reserved.</p>
          <div className="flex mt-4 space-x-6 md:mt-0">
            <Link
              href="/privacy"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              개인정보처리방침
            </Link>
            <Link
              href="/terms"
              className="text-sm text-gray-400 transition-colors hover:text-white"
            >
              이용약관
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
