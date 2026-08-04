/**
 * Mock learner-analytics data for the "Học tập của tôi" dashboard.
 *
 * SCOPE: within the course product (courses / lessons / quizzes), NOT platform-wide.
 * MULTI-TOPIC: the learner studies several diverse topics; most metrics are derived
 * per-topic from `topics[]` so charts stay meaningful across subjects.
 * Values are hand-tuned (not random). Learner: Lê Trung Hiếu.
 * Every slug below is a real route in mock/data.ts so nothing is a dead click.
 */

export type LearnStatus = 'on-track' | 'attention' | 'at-risk';
export const LEVELS = ['Cơ bản', 'Trung cấp', 'Nâng cao'] as const;
export type LevelName = (typeof LEVELS)[number];

export interface Kpi {
  value: number;
  delta: number;
  spark: number[];
}

/** One studied topic — the backbone of the multi-topic metrics. */
export interface TopicStat {
  slug: string; // real /topics/:slug
  name: string;
  courseSlug: string; // a representative /courses/:slug
  mastery: number; // 0..100 avg concept mastery in this topic
  target: number; // 0..100 goal
  accuracy: number; // 0..100 quiz accuracy in this topic
  coverage: number; // 0..1 concepts done / total in this topic
  confidence: number; // 0..100 self-reported
  affinity: number; // relative interest weight
  weekly: number[]; // minutes per week (8 weeks)
  level: { current: number; readiness: number }; // current level index 0..2, readiness % to next
}

export interface CourseProgress {
  title: string;
  slug: string;
  topic: string;
  level: LevelName;
  progress: number; // 0..100
  solid: number;
  skimmed: number;
}

export interface VelocityPoint {
  week: string;
  actual: number | null;
  planned: number;
  projected: number | null;
}

export interface PrereqNode {
  id: string;
  label: string;
  mastery: number;
  col: number;
  row: number;
}
export interface PrereqEdge {
  from: string;
  to: string;
}
export interface BloomBar {
  level: string;
  value: number;
}
export interface QuizScore {
  quiz: string;
  score: number;
  topic: string;
  courseSlug: string;
}
export interface CalibrationPoint {
  bucket: string;
  predicted: number;
  actual: number;
}
export interface CalendarDay {
  daysAgo: number;
  minutes: number;
}
export interface HourBar {
  hour: number;
  value: number;
}
export interface MoodPoint {
  label: string;
  value: number;
}
export interface Recommendation {
  title: string;
  topic: string;
  reason: string;
  fit: number;
  kind: 'video' | 'interactive' | 'quiz';
  courseSlug: string; // real /courses/:slug
  needsReview?: string;
}
export interface ZpdPoint {
  difficulty: number;
  accuracy: number;
}
export interface Slice {
  label: string;
  value: number;
}
export interface Badge {
  label: string;
  earned: boolean;
  hint?: string;
}

export interface LearnerAnalytics {
  learner: {
    name: string;
    focusTopic: string;
    topicCount: number;
    currentCourse: string;
    currentCourseSlug: string;
    chronotype: string;
    motive: string;
    status: LearnStatus;
  };
  topics: TopicStat[];
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
    etaCourse: string;
    daysLeft: number;
    levels: { level: string; mastered: number; total: number }[];
    badges: Badge[];
  };
  mastery: {
    prereqCourse: string;
    prereqCourseSlug: string;
    prereqNodes: PrereqNode[];
    prereqEdges: PrereqEdge[];
    bloom: BloomBar[];
  };
  assessment: {
    quizzes: QuizScore[];
    calibration: CalibrationPoint[];
  };
  rhythm: {
    calendar: CalendarDay[];
    weekLabels: string[];
    weeklyGoal: number;
    clock: HourBar[];
    consistency: number;
    momentum: number;
  };
  mindset: {
    confidence: number;
    confidenceSpark: number[];
    selfReg: { axis: string; value: number }[];
    mood: MoodPoint[];
  };
  recommend: {
    next: Recommendation[];
    zpd: ZpdPoint[];
    zpdBand: [number, number];
    formatPref: Slice[];
  };
}

const TOPICS: TopicStat[] = [
  { slug: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo', courseSlug: 'ai-co-ban-den-thuc-tien', mastery: 72, target: 90, accuracy: 74, coverage: 0.68, confidence: 76, affinity: 34, weekly: [50, 60, 55, 70, 65, 80, 75, 85], level: { current: 1, readiness: 72 } },
  { slug: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu', courseSlug: 'python-cho-khoa-hoc-du-lieu', mastery: 64, target: 85, accuracy: 68, coverage: 0.55, confidence: 60, affinity: 24, weekly: [40, 45, 50, 55, 60, 65, 70, 75], level: { current: 1, readiness: 58 } },
  { slug: 'co-vua', name: 'Cờ Vua', courseSlug: 'co-vua-tuong-tac', mastery: 55, target: 75, accuracy: 62, coverage: 0.5, confidence: 58, affinity: 16, weekly: [30, 35, 25, 40, 35, 45, 40, 50], level: { current: 0, readiness: 64 } },
  { slug: 'tieng-anh-giao-tiep', name: 'Tiếng Anh giao tiếp', courseSlug: 'tieng-anh-giao-tiep-co-ban', mastery: 48, target: 80, accuracy: 58, coverage: 0.42, confidence: 74, affinity: 15, weekly: [20, 25, 30, 35, 40, 45, 50, 55], level: { current: 0, readiness: 47 } },
  { slug: 'ky-nang-thuyet-trinh', name: 'Kỹ năng thuyết trình', courseSlug: 'ky-nang-thuyet-trinh-hieu-qua', mastery: 40, target: 70, accuracy: 52, coverage: 0.35, confidence: 64, affinity: 11, weekly: [15, 20, 25, 20, 30, 35, 40, 45], level: { current: 0, readiness: 38 } },
];

const WEEK_LABELS = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'];

function buildCalendar(): CalendarDay[] {
  const days: CalendarDay[] = [];
  for (let daysAgo = 90; daysAgo >= 0; daysAgo--) {
    const dow = (daysAgo + 3) % 7;
    const weekend = dow === 5 || dow === 6;
    const recent = daysAgo <= 8;
    let minutes = 0;
    if (recent) minutes = 35 + ((daysAgo * 7) % 30);
    else if (daysAgo > 60 && daysAgo < 66) minutes = 0;
    else if (weekend) minutes = daysAgo % 3 === 0 ? 0 : 15 + (daysAgo % 20);
    else minutes = 20 + ((daysAgo * 11) % 45);
    days.push({ daysAgo, minutes });
  }
  return days.reverse();
}

const DATA: LearnerAnalytics = {
  learner: {
    name: 'Lê Trung Hiếu',
    focusTopic: 'Trí tuệ nhân tạo',
    topicCount: TOPICS.length,
    currentCourse: 'Trí tuệ nhân tạo (AI) từ cơ bản đến thực tiễn',
    currentCourseSlug: 'ai-co-ban-den-thuc-tien',
    chronotype: 'Cú đêm',
    motive: 'Học để xây kỹ năng',
    status: 'on-track',
  },
  topics: TOPICS,
  health: {
    score: 78,
    delta: 6,
    trend: [64, 62, 66, 65, 69, 71, 70, 73, 72, 74, 73, 76, 75, 77, 76, 78, 77, 79, 78, 80, 79, 78, 80, 79, 81, 80, 79, 80, 78, 78],
  },
  kpis: {
    streak: { value: 9, delta: 3, record: 21, spark: [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1] },
    completion: { value: 47, delta: 8, spark: [22, 25, 28, 30, 33, 36, 38, 40, 42, 43, 45, 46, 47] },
    weeklyMinutes: { value: 310, delta: 40, goal: 300, spark: [180, 210, 240, 200, 260, 290, 275, 300, 285, 310, 305, 310] },
    conceptsMastered: { value: 46, delta: 6, total: 96, spark: [24, 27, 30, 33, 36, 38, 40, 41, 43, 44, 45, 46] },
  },
  progress: {
    courses: [
      { title: 'AI từ cơ bản đến thực tiễn', slug: 'ai-co-ban-den-thuc-tien', topic: 'Trí tuệ nhân tạo', level: 'Cơ bản', progress: 64, solid: 52, skimmed: 12 },
      { title: 'Machine Learning thực chiến', slug: 'machine-learning-thuc-chien', topic: 'Trí tuệ nhân tạo', level: 'Trung cấp', progress: 28, solid: 20, skimmed: 8 },
      { title: 'Python cho khoa học dữ liệu', slug: 'python-cho-khoa-hoc-du-lieu', topic: 'Khoa học dữ liệu', level: 'Cơ bản', progress: 100, solid: 88, skimmed: 12 },
      { title: 'Phân tích dữ liệu với Pandas', slug: 'phan-tich-du-lieu-voi-pandas', topic: 'Khoa học dữ liệu', level: 'Trung cấp', progress: 40, solid: 30, skimmed: 10 },
      { title: 'Cờ Vua tương tác', slug: 'co-vua-tuong-tac', topic: 'Cờ Vua', level: 'Cơ bản', progress: 55, solid: 44, skimmed: 11 },
      { title: 'Tiếng Anh giao tiếp', slug: 'tieng-anh-giao-tiep-co-ban', topic: 'Tiếng Anh giao tiếp', level: 'Cơ bản', progress: 48, solid: 38, skimmed: 10 },
      { title: 'Kỹ năng thuyết trình', slug: 'ky-nang-thuyet-trinh-hieu-qua', topic: 'Kỹ năng thuyết trình', level: 'Cơ bản', progress: 30, solid: 22, skimmed: 8 },
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
    etaCourse: 'AI từ cơ bản đến thực tiễn',
    daysLeft: 16,
    levels: [
      { level: 'Cơ bản', mastered: 34, total: 40 },
      { level: 'Trung cấp', mastered: 10, total: 34 },
      { level: 'Nâng cao', mastered: 2, total: 22 },
    ],
    badges: [
      { label: 'Hoàn thành khóa đầu tiên', earned: true },
      { label: 'Chuỗi 7 ngày', earned: true },
      { label: 'Chuỗi 14 ngày', earned: true },
      { label: 'Điểm quiz trên 90', earned: true },
      { label: '10 giờ học', earned: true },
      { label: 'Chuỗi 30 ngày', earned: false, hint: 'còn 9 ngày' },
    ],
  },
  mastery: {
    prereqCourse: 'AI từ cơ bản đến thực tiễn',
    prereqCourseSlug: 'ai-co-ban-den-thuc-tien',
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
      { quiz: 'Nền tảng AI', score: 88, topic: 'Trí tuệ nhân tạo', courseSlug: 'ai-co-ban-den-thuc-tien' },
      { quiz: 'Học máy', score: 68, topic: 'Trí tuệ nhân tạo', courseSlug: 'machine-learning-thuc-chien' },
      { quiz: 'Python cơ bản', score: 82, topic: 'Khoa học dữ liệu', courseSlug: 'python-cho-khoa-hoc-du-lieu' },
      { quiz: 'Khai cuộc cờ', score: 64, topic: 'Cờ Vua', courseSlug: 'co-vua-tuong-tac' },
      { quiz: 'Giao tiếp công việc', score: 58, topic: 'Tiếng Anh giao tiếp', courseSlug: 'tieng-anh-giao-tiep-co-ban' },
      { quiz: 'Cấu trúc bài nói', score: 54, topic: 'Kỹ năng thuyết trình', courseSlug: 'ky-nang-thuyet-trinh-hieu-qua' },
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
    weekLabels: WEEK_LABELS,
    weeklyGoal: 300,
    clock: [
      { hour: 0, value: 8 }, { hour: 1, value: 3 }, { hour: 2, value: 1 }, { hour: 3, value: 0 }, { hour: 4, value: 0 }, { hour: 5, value: 0 },
      { hour: 6, value: 2 }, { hour: 7, value: 6 }, { hour: 8, value: 9 }, { hour: 9, value: 7 }, { hour: 10, value: 5 }, { hour: 11, value: 4 },
      { hour: 12, value: 6 }, { hour: 13, value: 5 }, { hour: 14, value: 4 }, { hour: 15, value: 3 }, { hour: 16, value: 4 }, { hour: 17, value: 5 },
      { hour: 18, value: 6 }, { hour: 19, value: 7 }, { hour: 20, value: 12 }, { hour: 21, value: 18 }, { hour: 22, value: 22 }, { hour: 23, value: 15 },
    ],
    consistency: 72,
    momentum: 12,
  },
  mindset: {
    confidence: 66,
    confidenceSpark: [58, 60, 57, 62, 64, 61, 65, 63, 66, 68, 66],
    selfReg: [
      { axis: 'Lập kế hoạch', value: 64 },
      { axis: 'Theo dõi', value: 78 },
      { axis: 'Điều chỉnh', value: 58 },
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
      { title: 'Phân loại với học có giám sát', topic: 'Trí tuệ nhân tạo', reason: 'Vừa sức với bạn và lấp đúng chỗ còn yếu ở phần Học máy.', fit: 92, kind: 'interactive', courseSlug: 'machine-learning-thuc-chien', needsReview: 'Ôn nhanh "Đánh giá mô hình" khoảng 10 phút trước khi vào.' },
      { title: 'Trình bày quan điểm trong cuộc họp', topic: 'Tiếng Anh giao tiếp', reason: 'Kỹ năng bạn đang yếu nhưng dùng được ngay ở chỗ làm.', fit: 84, kind: 'video', courseSlug: 'tieng-anh-giao-tiep-co-ban' },
      { title: 'Dàn ý mở - thân - kết', topic: 'Kỹ năng thuyết trình', reason: 'Phần bạn mới bắt đầu, học sớm sẽ đỡ ngợp về sau.', fit: 79, kind: 'interactive', courseSlug: 'ky-nang-thuyet-trinh-hieu-qua' },
      { title: 'Tổng hợp và trực quan hoá dữ liệu', topic: 'Khoa học dữ liệu', reason: 'Nối tiếp mạch Python bạn đang học khá tốt.', fit: 73, kind: 'video', courseSlug: 'phan-tich-du-lieu-voi-pandas' },
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
    formatPref: [
      { label: 'Video', value: 46 },
      { label: 'Tương tác', value: 38 },
      { label: 'Tài liệu', value: 16 },
    ],
  },
};

export function getLearnerAnalytics(): LearnerAnalytics {
  return DATA;
}
