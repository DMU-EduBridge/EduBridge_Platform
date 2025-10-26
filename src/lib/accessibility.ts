/**
 * 접근성 개선을 위한 유틸리티 함수들
 */

/**
 * ARIA 라벨을 생성하는 헬퍼 함수
 */
export function generateAriaLabel(type: string, data: Record<string, any>): string {
  switch (type) {
    case 'problem':
      return `문제: ${data.title}, 난이도: ${data.difficulty}, 과목: ${data.subject}`;
    case 'button':
      return data.description || data.label || '버튼';
    case 'card':
      return `${data.title} 카드`;
    case 'form':
      return `${data.title} 폼`;
    default:
      return data.title || data.label || '';
  }
}

/**
 * 키보드 네비게이션을 위한 키 코드 상수
 */
export const KEYBOARD_KEYS = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  TAB: 'Tab',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * 포커스 관리를 위한 유틸리티
 */
export function focusElement(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.focus();
  }
}

/**
 * 스크린 리더를 위한 숨김 텍스트 생성
 */
export function createScreenReaderText(text: string): string {
  return `<span class="sr-only">${text}</span>`;
}

/**
 * 색상 대비를 확인하는 함수 (WCAG 2.1 AA 기준)
 */
export function checkColorContrast(foreground: string, background: string): boolean {
  // 간단한 대비 검사 (실제로는 더 복잡한 계산이 필요)
  const fgLuminance = getLuminance(foreground);
  const bgLuminance = getLuminance(background);
  const contrast =
    (Math.max(fgLuminance, bgLuminance) + 0.05) / (Math.min(fgLuminance, bgLuminance) + 0.05);
  return contrast >= 4.5; // AA 기준
}

function getLuminance(color: string): number {
  // 간단한 구현 (실제로는 더 정확한 계산이 필요)
  const hex = color.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16) / 255;
  const g = parseInt(hex.substr(2, 2), 16) / 255;
  const b = parseInt(hex.substr(4, 2), 16) / 255;

  const [rs, gs, bs] = [r, g, b].map((c) =>
    c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4),
  );

  return 0.2126 * (rs ?? 0) + 0.7152 * (gs ?? 0) + 0.0722 * (bs ?? 0);
}

/**
 * 애니메이션 감소 설정 확인
 */
export function prefersReducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * 고대비 모드 설정 확인
 */
export function prefersHighContrast(): boolean {
  return window.matchMedia('(prefers-contrast: high)').matches;
}
