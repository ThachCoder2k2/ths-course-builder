/**
 * Mock learner-analytics data for the "Học tập của tôi" dashboard.
 *
 * SCOPE: everything here describes the learner WITHIN the course product
 * (courses / lessons / quizzes-of-a-course) — not a platform-wide journey.
 * Values are hand-tuned (not random) so every chart reads intentionally.
 * Learner: Lê Trung Hiếu. Anchored loosely on courses that exist in data.ts.
 *
 * Swap this module for a real API later; components only touch getLearnerAnalytics().
 */

export type LearnStatus = 'on-track' | 'attention' | 'at-risk';

export interface Kpi {
  value: number;
  delta: number; // vs previous period, same unit
  spark: number[]; // recent trend for a mini sparkline
}

export interface CourseProgress {
  title: string;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  progress: number; // 0..100 lessons completed
  solid: number; // 0..100 of the course learned "for real"
  skimmed: number; // 0..100 ticked-but-shallow
}

export interface VelocityPoint {
  week: string;
  actual: number | null; // cumulative lessons done (null = future)
  planned: number; // cumulative planned
  projected: number | null; // dashed forecast (null before "now")
}

export interface SkillAxis {
  skill: string;
  current: number; // 0..100
  target: number; // 0..100
}

export interface MasteryCell {
  section: string;
  coverage: number; // 0..1 mastered-of-section
  weight: number; // relative size
}

export interface PrereqNode {
  id: string;
  label: string;
  mastery: number; // 0..1
  col: number; // layer 0..n (left→right)
  row: number; // vertical slot within layer
}
export interface PrereqEdge {
  from: string;
  to: string;
}

export interface BloomBar {
  level: string;
  value: number; // activity/accuracy share 0..100
}

export interface QuizScore {
  quiz: string;
  score: number; // 0..100
}

export interface Point2D {
  label: string;
  x: number;
  y: number;
  tone?: 'good' | 'warning' | 'danger' | 'neutral';
}

export interface CalibrationPoint {
  bucket: string;
  predicted: number; // 0..1 self-confidence
  actual: number; // 0..1 real accuracy
}

export interface CalendarDay {
  /** days ago from "today" (0 = today). Used only to lay out the grid. */
  daysAgo: number;
  minutes: number; // study minutes that day (0 = no activity)
}

export interface WeekMinutes {
  week: string;
  minutes: number;
}

export interface HourBar {
  hour: number; // 0..23
  value: number; // relative activity
}

export interface MoodPoint {
  label: string;
  value: number; // 1..5 mood
}

export interface Recommendation {
  title: string;
  reason: string;
  fit: number; // 0..100 how well it fits right now
  kind: 'video' | 'interactive' | 'quiz';
  needsReview?: string; // optional prerequisite to refresh first
}

export interface ZpdPoint {
  difficulty: number; // 0..100
  accuracy: number; // 0..100
}

export interface Slice {
  label: string;
  value: number;
}

export interface Badge {
  label: string;
  earned: boolean;
  hint?: string; // for the not-yet-earned one
}

export interface LevelStep {
  label: string;
  readiness: number; // 0..100
}

export interface LearnerAnalytics {
  learner: {
    name: string;
    joinedLabel: string;
    currentCourse: string;
    chronotype: string;
    motive: string;
    status: LearnStatus;
  };
  health: { score: number; delta: number; trend: number[] };
  kpis: {
    streak: Kpi & { record: number };
    completion: Kpi;
    weeklyMinutes: Kpi & { goal: number };
    conceptsMastered: Kpi & { total: number };
  };

  progress: {
    courses: CourseProgress[];
    velocity: VelocityPoint[];
    etaLabel: string;
    daysLeft: number;
    levels: { level: string; mastered: number; total: number }[];
    badges: Badge[];
    weeklyGoal: { target: number; actual: number };
  };

  mastery: {
    skills: SkillAxis[];
    coverage: MasteryCell[];
    prereqNodes: PrereqNode[];
    prereqEdges: PrereqEdge[];
    bloom: BloomBar[];
  };

  assessment: {
    quizzes: QuizScore[];
    topicAccuracy: { topic: string; accuracy: number }[];
    itemMap: Point2D[];
    calibration: CalibrationPoint[];
  };

  rhythm: {
    calendar: CalendarDay[];
    weekly: WeekMinutes[];
    weeklyGoal: number;
    clock: HourBar[];
    consistency: number; // 0..100
    momentum: number; // % change vs previous 7 days
  };

  mindset: {
    confidence: number; // 0..100
    confidenceSpark: number[];
    illusion: Point2D[]; // x=confidence 0..100, y=real score 0..100
    selfReg: { axis: string; value: number }[];
    mood: MoodPoint[];
  };

  recommend: {
    next: Recommendation[];
    zpd: ZpdPoint[];
    zpdBand: [number, number]; // optimal difficulty window
    skillGap: SkillAxis[];
    formatPref: Slice[];
    topicAffinity: Slice[];
    levelUp: { steps: LevelStep[]; current: number };
  };
}

// ---- Hand-tuned dataset -----------------------------------------------------

const decay = (from: number, step: number, n: number) =>
  Array.from({ length: n }, (_, i) => Math.round(from + step * i));

const DATA: LearnerAnalytics = {
  learner: {
    name: 'Lê Trung Hiếu',
    joinedLabel: 'Học từ tháng 5, 2026',
    currentCourse: 'Trí tuệ nhân tạo (AI) từ cơ bản đến thực tiễn',
    chronotype: 'Cú đêm',
    motive: 'Học để xây kỹ năng',
    status: 'on-track',
  },
  health: {
    score: 78,
    delta: 6,
    trend: [64, 62, 66, 65, 69, 71, 70, 73, 72, 74, 73, 76, 75, 77, 76, 78, 77, 79, 78, 80, 79, 78, 80, 79, 81, 80, 79, 80, 78, 78],
  },
  kpis: {
    streak: { value: 9, delta: 3, record: 21, spark: [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1] },
    completion: { value: 47, delta: 8, spark: [22, 25, 28, 30, 33, 36, 38, 40, 42, 43, 45, 46, 47] },
    weeklyMinutes: { value: 320, delta: 45, goal: 300, spark: [180, 210, 240, 200, 260, 290, 275, 300, 285, 310, 305, 320] },
    conceptsMastered: { value: 38, delta: 5, total: 72, spark: [18, 21, 24, 26, 28, 30, 31, 33, 34, 35, 36, 38] },
  },

  progress: {
    courses: [
      { title: 'AI từ cơ bản đến thực tiễn', level: 'Cơ bản', progress: 64, solid: 52, skimmed: 12 },
      { title: 'Python cho khoa học dữ liệu', level: 'Cơ bản', progress: 100, solid: 88, skimmed: 12 },
      { title: 'Machine Learning thực chiến', level: 'Trung cấp', progress: 28, solid: 20, skimmed: 8 },
      { title: 'Phân tích dữ liệu với Pandas', level: 'Trung cấp', progress: 12, solid: 9, skimmed: 3 },
    ],
    velocity: [
      { week: 'T1', actual: 3, planned: 3, projected: null },
      { week: 'T2', actual: 7, planned: 6, projected: null },
      { week: 'T3', actual: 10, planned: 9, projected: null },
      { week: 'T4', actual: 13, planned: 12, projected: null },
      { week: 'T5', actual: 15, planned: 15, projected: null },
      { week: 'T6', actual: 19, planned: 18, projected: 19 },
      { week: 'T7', actual: null, planned: 21, projected: 22 },
      { week: 'T8', actual: null, planned: 24, projected: 25 },
      { week: 'T9', actual: null, planned: 27, projected: 27 },
    ],
    etaLabel: '20 tháng 8',
    daysLeft: 16,
    levels: [
      { level: 'Cơ bản', mastered: 26, total: 30 },
      { level: 'Trung cấp', mastered: 10, total: 28 },
      { level: 'Nâng cao', mastered: 2, total: 14 },
    ],
    badges: [
      { label: 'Hoàn thành khóa đầu tiên', earned: true },
      { label: 'Chuỗi 7 ngày', earned: true },
      { label: 'Chuỗi 14 ngày', earned: true },
      { label: 'Điểm quiz trên 90', earned: true },
      { label: '10 giờ học', earned: true },
      { label: 'Chuỗi 30 ngày', earned: false, hint: 'còn 9 ngày' },
    ],
    weeklyGoal: { target: 300, actual: 320 },
  },

  mastery: {
    skills: [
      { skill: 'Nền tảng AI', current: 82, target: 90 },
      { skill: 'Học máy', current: 58, target: 85 },
      { skill: 'Dữ liệu', current: 71, target: 80 },
      { skill: 'Viết prompt', current: 74, target: 80 },
      { skill: 'Đạo đức AI', current: 45, target: 75 },
      { skill: 'Ứng dụng', current: 52, target: 80 },
    ],
    coverage: [
      { section: 'Giới thiệu về AI', coverage: 1, weight: 3 },
      { section: 'Nền tảng học máy', coverage: 0.62, weight: 4 },
      { section: 'Ứng dụng thực tiễn', coverage: 0.38, weight: 4 },
      { section: 'Dữ liệu & đặc trưng', coverage: 0.8, weight: 2 },
      { section: 'Đạo đức & rủi ro', coverage: 0.3, weight: 2 },
    ],
    prereqNodes: [
      { id: 'a', label: 'AI là gì', mastery: 0.95, col: 0, row: 1 },
      { id: 'b', label: 'Dữ liệu & đặc trưng', mastery: 0.8, col: 1, row: 0 },
      { id: 'c', label: 'Học có giám sát', mastery: 0.55, col: 1, row: 2 },
      { id: 'd', label: 'Đánh giá mô hình', mastery: 0.35, col: 2, row: 1 },
      { id: 'e', label: 'Học không giám sát', mastery: 0.28, col: 2, row: 3 },
      { id: 'f', label: 'AI tạo sinh (LLM)', mastery: 0.2, col: 3, row: 2 },
    ],
    prereqEdges: [
      { from: 'a', to: 'b' },
      { from: 'a', to: 'c' },
      { from: 'b', to: 'd' },
      { from: 'c', to: 'd' },
      { from: 'c', to: 'e' },
      { from: 'd', to: 'f' },
    ],
    bloom: [
      { level: 'Nhớ', value: 92 },
      { level: 'Hiểu', value: 84 },
      { level: 'Vận dụng', value: 68 },
      { level: 'Phân tích', value: 47 },
      { level: 'Đánh giá', value: 31 },
      { level: 'Sáng tạo', value: 18 },
    ],
  },

  assessment: {
    quizzes: [
      { quiz: 'Giới thiệu AI', score: 92 },
      { quiz: 'Học máy cơ bản', score: 68 },
      { quiz: 'Dữ liệu', score: 81 },
      { quiz: 'Prompt', score: 88 },
      { quiz: 'Đạo đức AI', score: 54 },
    ],
    topicAccuracy: [
      { topic: 'Khái niệm AI', accuracy: 90 },
      { topic: 'Học máy', accuracy: 62 },
      { topic: 'Dữ liệu', accuracy: 80 },
      { topic: 'Prompt', accuracy: 86 },
      { topic: 'Đạo đức', accuracy: 55 },
      { topic: 'Ứng dụng', accuracy: 64 },
    ],
    itemMap: [
      { label: 'Câu dễ, phân biệt tốt', x: 28, y: 74, tone: 'good' },
      { label: 'Câu vừa', x: 52, y: 61, tone: 'neutral' },
      { label: 'Câu vừa 2', x: 58, y: 55, tone: 'neutral' },
      { label: 'Câu khó, phân biệt tốt', x: 78, y: 68, tone: 'good' },
      { label: 'Câu quá dễ', x: 14, y: 22, tone: 'warning' },
      { label: 'Câu nhiễu (không phân biệt)', x: 62, y: 18, tone: 'danger' },
      { label: 'Câu khó', x: 84, y: 44, tone: 'neutral' },
    ],
    calibration: [
      { bucket: '0–20%', predicted: 0.1, actual: 0.18 },
      { bucket: '20–40%', predicted: 0.3, actual: 0.35 },
      { bucket: '40–60%', predicted: 0.5, actual: 0.46 },
      { bucket: '60–80%', predicted: 0.7, actual: 0.58 },
      { bucket: '80–100%', predicted: 0.9, actual: 0.71 },
    ],
  },

  rhythm: {
    calendar: buildCalendar(),
    weekly: [
      { week: 'Tuần 1', minutes: 180 },
      { week: 'Tuần 2', minutes: 240 },
      { week: 'Tuần 3', minutes: 200 },
      { week: 'Tuần 4', minutes: 290 },
      { week: 'Tuần 5', minutes: 275 },
      { week: 'Tuần 6', minutes: 310 },
      { week: 'Tuần 7', minutes: 305 },
      { week: 'Tuần 8', minutes: 320 },
    ],
    weeklyGoal: 300,
    clock: [
      { hour: 0, value: 8 },
      { hour: 1, value: 3 },
      { hour: 2, value: 1 },
      { hour: 3, value: 0 },
      { hour: 4, value: 0 },
      { hour: 5, value: 0 },
      { hour: 6, value: 2 },
      { hour: 7, value: 6 },
      { hour: 8, value: 9 },
      { hour: 9, value: 7 },
      { hour: 10, value: 5 },
      { hour: 11, value: 4 },
      { hour: 12, value: 6 },
      { hour: 13, value: 5 },
      { hour: 14, value: 4 },
      { hour: 15, value: 3 },
      { hour: 16, value: 4 },
      { hour: 17, value: 5 },
      { hour: 18, value: 6 },
      { hour: 19, value: 7 },
      { hour: 20, value: 12 },
      { hour: 21, value: 18 },
      { hour: 22, value: 22 },
      { hour: 23, value: 15 },
    ],
    consistency: 72,
    momentum: 12,
  },

  mindset: {
    confidence: 66,
    confidenceSpark: [58, 60, 57, 62, 64, 61, 65, 63, 66, 68, 66],
    illusion: [
      { label: 'Giới thiệu AI', x: 90, y: 92, tone: 'good' },
      { label: 'Dữ liệu', x: 78, y: 80, tone: 'good' },
      { label: 'Prompt', x: 82, y: 86, tone: 'good' },
      { label: 'Học máy', x: 74, y: 62, tone: 'warning' },
      { label: 'Đạo đức AI', x: 80, y: 54, tone: 'danger' },
      { label: 'Ứng dụng', x: 60, y: 64, tone: 'neutral' },
    ],
    selfReg: [
      { axis: 'Lập kế hoạch', value: 64 },
      { axis: 'Theo dõi', value: 78 },
      { axis: 'Kiểm soát', value: 58 },
    ],
    mood: [
      { label: 'T2', value: 4 },
      { label: 'T3', value: 3 },
      { label: 'T4', value: 3 },
      { label: 'T5', value: 2 },
      { label: 'T6', value: 3 },
      { label: 'T7', value: 4 },
      { label: 'CN', value: 4 },
    ],
  },

  recommend: {
    next: [
      {
        title: 'Phân loại với học có giám sát (Học máy)',
        reason: 'Vừa sức với bạn và lấp đúng chỗ còn yếu ở phần Học máy.',
        fit: 92,
        kind: 'interactive',
        needsReview: 'Ôn nhanh "Đánh giá mô hình" khoảng 10 phút trước khi vào.',
      },
      { title: 'AI tạo sinh và mô hình ngôn ngữ lớn', reason: 'Nối tiếp mạch bạn đang học, đúng chủ đề bạn hay xem.', fit: 84, kind: 'video' },
      { title: 'Bài kiểm tra ngắn: Đạo đức AI', reason: 'Điểm phần này đang thấp nhất, làm lại để chắc kiến thức.', fit: 79, kind: 'quiz' },
      { title: 'Viết prompt hiệu quả (nâng cao)', reason: 'Bạn mạnh mảng prompt, thử thách cao hơn để giữ hứng.', fit: 71, kind: 'interactive' },
    ],
    zpd: [
      { difficulty: 10, accuracy: 98 },
      { difficulty: 25, accuracy: 94 },
      { difficulty: 40, accuracy: 88 },
      { difficulty: 55, accuracy: 80 },
      { difficulty: 70, accuracy: 72 },
      { difficulty: 82, accuracy: 58 },
      { difficulty: 92, accuracy: 41 },
    ],
    zpdBand: [60, 80],
    skillGap: [
      { skill: 'Nền tảng AI', current: 82, target: 90 },
      { skill: 'Học máy', current: 58, target: 85 },
      { skill: 'Dữ liệu', current: 71, target: 80 },
      { skill: 'Viết prompt', current: 74, target: 80 },
      { skill: 'Đạo đức AI', current: 45, target: 75 },
      { skill: 'Ứng dụng', current: 52, target: 80 },
    ],
    formatPref: [
      { label: 'Video', value: 46 },
      { label: 'Tương tác', value: 38 },
      { label: 'Tài liệu', value: 16 },
    ],
    topicAffinity: [
      { label: 'Trí tuệ nhân tạo', value: 42 },
      { label: 'Khoa học dữ liệu', value: 26 },
      { label: 'Lập trình Python', value: 20 },
      { label: 'Prompt', value: 12 },
    ],
    levelUp: {
      steps: [
        { label: 'Cơ bản', readiness: 100 },
        { label: 'Trung cấp', readiness: 68 },
        { label: 'Nâng cao', readiness: 24 },
      ],
      current: 1,
    },
  },
};

// A gentle 91-day activity pattern: weekday-heavy, a couple of gaps, a strong recent streak.
function buildCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const dow = (daysAgo + 3) % 7; // pseudo day-of-week
    const weekend = dow === 5 || dow === 6;
    const recent = daysAgo <= 8; // current streak
    let minutes = 0;
    if (recent) minutes = 35 + ((daysAgo * 7) % 30);
    else if (daysAgo > 60 && daysAgo < 66) minutes = 0; // a gap
    else if (weekend) minutes = (daysAgo % 3 === 0 ? 0 : 15 + (daysAgo % 20));
    else minutes = 20 + ((daysAgo * 11) % 45);
    days.push({ daysAgo, minutes });
  }
  return days.reverse();
}

// silence "decay unused" while keeping the helper available for future tuning
void decay;

export function getLearnerAnalytics(): LearnerAnalytics {
  return DATA;
}
