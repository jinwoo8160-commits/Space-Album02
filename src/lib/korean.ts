/**
 * 한글 받침에 따라 목적격 조사 을/를 을 고릅니다.
 * 유니코드 한글 음절은 (코드 - 0xAC00) % 28 === 0 이면 받침이 없습니다.
 */
export function objectParticle(word: string): "을" | "를" {
  const last = word.charAt(word.length - 1);
  const code = last.charCodeAt(0);
  if (Number.isNaN(code) || code < 0xac00 || code > 0xd7a3) return "를";
  return (code - 0xac00) % 28 === 0 ? "를" : "을";
}

export function unlockCountryMessage(name: string): string {
  return `${name}${objectParticle(name)} 선택하려면 잠금을 해제해주세요`;
}
