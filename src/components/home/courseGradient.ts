// Deterministic dark gradient per course, standing in for the Figma illustration
// artwork until real assets are exported (plan Task 10).
const GRADIENTS = [
  'from-[#0B1220] via-[#132140] to-[#1E3A8A]',
  'from-[#0B1220] via-[#182A46] to-[#2563EB]',
  'from-[#101828] via-[#1D2939] to-[#3B72F6]',
  'from-[#0B1220] via-[#1A2E4A] to-[#0EA5E9]',
  'from-[#131A2A] via-[#26304A] to-[#7C3AED]',
  'from-[#0B1220] via-[#213043] to-[#059669]',
];

export function courseGradient(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i += 1) {
    hash = (hash * 31 + id.charCodeAt(i)) >>> 0;
  }
  return GRADIENTS[hash % GRADIENTS.length];
}
