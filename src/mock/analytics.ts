/**
 * Rich mock data for the redesigned "Học tập của tôi".
 *
 * A learner (~1 year on the platform, ~20 courses across 5 topics) with a real
 * per-topic DAILY time-series so the global date-range + topic filter recompute
 * every tile for real. Deterministic (seeded) — no runtime randomness drift.
 */

export const TOPICS = [
  { slug: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo' },
  { slug: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu' },
  { slug: 'co-vua', name: 'Cờ Vua' },
  { slug: 'tieng-anh-giao-tiep', name: 'Tiếng Anh giao tiếp' },
  { slug: 'ky-nang-thuyet-trinh', name: 'Kỹ năng thuyết trình' },
] as const;
export type TopicSlug = (typeof TOPICS)[number]['slug'];
export const TOPIC_NAME: Record<TopicSlug, string> = Object.fromEntries(TOPICS.map((t) => [t.slug, t.name])) as Record<TopicSlug, string>;

export const DAYS = 365;
export const TODAY = new Date(2026, 7, 5); // fixed reference so labels are stable
export function dateOf(daysAgo: number): Date {
  const d = new Date(TODAY);
  d.setDate(d.getDate() - daysAgo);
  return d;
}

export type CourseStatus = 'active' | 'done' | 'paused';
export interface Course {
  slug: string;
  title: string;
  topic: TopicSlug;
  level: 'Cơ bản' | 'Trung cấp' | 'Nâng cao';
  status: CourseStatus;
  progress: number; // 0..100
  mastery: number; // 0..100 how well understood
  lessonsTotal: number;
  lessonsDone: number;
  lastActiveDaysAgo: number;
  page: boolean; // true = has a real /courses/:slug route
}

export interface TopicStat {
  slug: TopicSlug;
  name: string;
  mastery: number; // 0..100
  target: number; // 0..100
  accuracy: number; // 0..100 quiz accuracy
  coverage: number; // 0..1 concepts done
  level: number; // 0..2 current level
  readiness: number; // 0..100 to next level
}

export interface Recommendation {
  title: string;
  topic: TopicSlug;
  reason: string;
  fit: number; // 0..100
  difficulty: number; // 0..100
  kind: 'video' | 'interactive' | 'quiz';
  courseSlug: string;
  page: boolean;
  unlockFrom?: string; // prerequisite just cleared / to clear
}

export interface LearnerData {
  learner: { name: string; joinedLabel: string; goalWeeklyMinutes: number };
  topics: TopicStat[];
  courses: Course[];
  /** minutes studied per topic per day; index 0 = today, 364 = a year ago */
  dailyByTopic: Record<TopicSlug, number[]>;
  daily: number[]; // total minutes per day
  recommendations: Recommendation[];
  /** confidence vs real accuracy per topic (for the calibration nudge) */
  calibration: { topic: TopicSlug; confidence: number; accuracy: number }[];
}

// ---- seeded PRNG (deterministic) -------------------------------------------
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20260805);

interface Profile {
  slug: TopicSlug;
  base: number; // avg minutes on a study day
  freq: number; // base probability of studying on a day
  ramp: number; // how much more recent it is (active) vs older
  quietBefore?: number; // days-ago threshold below which nearly inactive (paused topics)
}

const PROFILES: Profile[] = [
  { slug: 'tri-tue-nhan-tao', base: 34, freq: 0.62, ramp: 0.7 },
  { slug: 'khoa-hoc-du-lieu', base: 30, freq: 0.5, ramp: 0.5 },
  { slug: 'co-vua', base: 22, freq: 0.4, ramp: 0.1, quietBefore: 40 }, // cooled off recently
  { slug: 'tieng-anh-giao-tiep', base: 20, freq: 0.34, ramp: 0.9 }, // ramping up lately
  { slug: 'ky-nang-thuyet-trinh', base: 18, freq: 0.26, ramp: 0.8 },
];

function genDaily(p: Profile): number[] {
  const arr = new Array(DAYS).fill(0);
  for (let d = 0; d < DAYS; d++) {
    const recency = 1 - d / DAYS;
    const dow = (d + 2) % 7;
    const weekend = dow === 5 || dow === 6;
    let prob = p.freq * (0.45 + recency * p.ramp);
    if (weekend) prob *= 0.55;
    if (p.quietBefore && d < p.quietBefore) prob *= 0.12; // cooled off in the last N days
    if (d > 300) prob *= 0.6; // just getting started ~a year ago
    if (rnd() < prob) arr[d] = Math.round(p.base * (0.55 + rnd() * 0.95));
  }
  return arr;
}

const dailyByTopic = Object.fromEntries(PROFILES.map((p) => [p.slug, genDaily(p)])) as Record<TopicSlug, number[]>;

// guarantee a visible recent streak (last 9 days have some study)
for (let d = 0; d < 9; d++) {
  const total = TOPICS.reduce((n, t) => n + dailyByTopic[t.slug][d], 0);
  if (total === 0) dailyByTopic['tri-tue-nhan-tao'][d] = 30 + Math.round(rnd() * 25);
}

const daily = new Array(DAYS).fill(0).map((_, d) => TOPICS.reduce((n, t) => n + dailyByTopic[t.slug][d], 0));

const TOPIC_STATS: TopicStat[] = [
  { slug: 'tri-tue-nhan-tao', name: 'Trí tuệ nhân tạo', mastery: 74, target: 90, accuracy: 76, coverage: 0.7, level: 1, readiness: 74 },
  { slug: 'khoa-hoc-du-lieu', name: 'Khoa học dữ liệu', mastery: 66, target: 85, accuracy: 69, coverage: 0.58, level: 1, readiness: 60 },
  { slug: 'co-vua', name: 'Cờ Vua', mastery: 52, target: 75, accuracy: 60, coverage: 0.48, level: 0, readiness: 58 },
  { slug: 'tieng-anh-giao-tiep', name: 'Tiếng Anh giao tiếp', mastery: 50, target: 80, accuracy: 58, coverage: 0.44, level: 0, readiness: 52 },
  { slug: 'ky-nang-thuyet-trinh', name: 'Kỹ năng thuyết trình', mastery: 42, target: 70, accuracy: 54, coverage: 0.36, level: 0, readiness: 44 },
];

// 20 courses; the 11 with page:true map to real /courses/:slug routes in data.ts.
const COURSES: Course[] = [
  { slug: 'ai-co-ban-den-thuc-tien', title: 'AI từ cơ bản đến thực tiễn', topic: 'tri-tue-nhan-tao', level: 'Cơ bản', status: 'active', progress: 78, mastery: 74, lessonsTotal: 11, lessonsDone: 9, lastActiveDaysAgo: 1, page: true },
  { slug: 'machine-learning-thuc-chien', title: 'Machine Learning thực chiến', topic: 'tri-tue-nhan-tao', level: 'Trung cấp', status: 'active', progress: 38, mastery: 58, lessonsTotal: 4, lessonsDone: 2, lastActiveDaysAgo: 3, page: true },
  { slug: 'xu-ly-ngon-ngu-tu-nhien', title: 'Xử lý ngôn ngữ tự nhiên', topic: 'tri-tue-nhan-tao', level: 'Trung cấp', status: 'paused', progress: 20, mastery: 40, lessonsTotal: 4, lessonsDone: 1, lastActiveDaysAgo: 34, page: true },
  { slug: 'prompt-engineering-cho-nguoi-moi', title: 'Prompt Engineering cho người mới', topic: 'tri-tue-nhan-tao', level: 'Cơ bản', status: 'done', progress: 100, mastery: 88, lessonsTotal: 4, lessonsDone: 4, lastActiveDaysAgo: 52, page: true },
  { slug: 'mlops-thuc-hanh', title: 'MLOps thực hành', topic: 'tri-tue-nhan-tao', level: 'Nâng cao', status: 'active', progress: 15, mastery: 30, lessonsTotal: 6, lessonsDone: 1, lastActiveDaysAgo: 6, page: false },
  { slug: 'python-cho-khoa-hoc-du-lieu', title: 'Python cho khoa học dữ liệu', topic: 'khoa-hoc-du-lieu', level: 'Cơ bản', status: 'done', progress: 100, mastery: 90, lessonsTotal: 4, lessonsDone: 4, lastActiveDaysAgo: 96, page: true },
  { slug: 'phan-tich-du-lieu-voi-pandas', title: 'Phân tích dữ liệu với Pandas', topic: 'khoa-hoc-du-lieu', level: 'Trung cấp', status: 'active', progress: 55, mastery: 64, lessonsTotal: 4, lessonsDone: 2, lastActiveDaysAgo: 2, page: true },
  { slug: 'sql-cho-phan-tich', title: 'SQL cho phân tích dữ liệu', topic: 'khoa-hoc-du-lieu', level: 'Cơ bản', status: 'active', progress: 40, mastery: 52, lessonsTotal: 5, lessonsDone: 2, lastActiveDaysAgo: 5, page: false },
  { slug: 'thong-ke-co-ban', title: 'Thống kê cho khoa học dữ liệu', topic: 'khoa-hoc-du-lieu', level: 'Trung cấp', status: 'paused', progress: 25, mastery: 44, lessonsTotal: 6, lessonsDone: 1, lastActiveDaysAgo: 61, page: false },
  { slug: 'truc-quan-hoa-du-lieu', title: 'Trực quan hoá dữ liệu', topic: 'khoa-hoc-du-lieu', level: 'Cơ bản', status: 'done', progress: 100, mastery: 80, lessonsTotal: 4, lessonsDone: 4, lastActiveDaysAgo: 120, page: false },
  { slug: 'co-vua-tuong-tac', title: 'Cờ Vua tương tác', topic: 'co-vua', level: 'Cơ bản', status: 'active', progress: 60, mastery: 55, lessonsTotal: 12, lessonsDone: 7, lastActiveDaysAgo: 12, page: true },
  { slug: 'khai-cuoc-co-vua', title: 'Khai cuộc cờ vua', topic: 'co-vua', level: 'Cơ bản', status: 'paused', progress: 35, mastery: 45, lessonsTotal: 6, lessonsDone: 2, lastActiveDaysAgo: 44, page: false },
  { slug: 'trung-cuoc-co-vua', title: 'Chiến thuật trung cuộc', topic: 'co-vua', level: 'Trung cấp', status: 'paused', progress: 10, mastery: 28, lessonsTotal: 8, lessonsDone: 1, lastActiveDaysAgo: 70, page: false },
  { slug: 'tan-cuoc-co-ban', title: 'Tàn cuộc cơ bản', topic: 'co-vua', level: 'Cơ bản', status: 'done', progress: 100, mastery: 72, lessonsTotal: 5, lessonsDone: 5, lastActiveDaysAgo: 150, page: false },
  { slug: 'tieng-anh-giao-tiep-co-ban', title: 'Tiếng Anh giao tiếp', topic: 'tieng-anh-giao-tiep', level: 'Cơ bản', status: 'active', progress: 52, mastery: 50, lessonsTotal: 4, lessonsDone: 2, lastActiveDaysAgo: 2, page: true },
  { slug: 'nghe-toeic-nen-tang', title: 'Nghe TOEIC nền tảng', topic: 'tieng-anh-giao-tiep', level: 'Trung cấp', status: 'active', progress: 30, mastery: 42, lessonsTotal: 8, lessonsDone: 2, lastActiveDaysAgo: 4, page: false },
  { slug: 'phat-am-chuan', title: 'Phát âm chuẩn', topic: 'tieng-anh-giao-tiep', level: 'Cơ bản', status: 'active', progress: 20, mastery: 38, lessonsTotal: 6, lessonsDone: 1, lastActiveDaysAgo: 8, page: false },
  { slug: 'ky-nang-thuyet-trinh-hieu-qua', title: 'Kỹ năng thuyết trình', topic: 'ky-nang-thuyet-trinh', level: 'Cơ bản', status: 'active', progress: 34, mastery: 42, lessonsTotal: 4, lessonsDone: 1, lastActiveDaysAgo: 3, page: true },
  { slug: 'ke-chuyen-bang-du-lieu', title: 'Kể chuyện bằng dữ liệu', topic: 'ky-nang-thuyet-trinh', level: 'Trung cấp', status: 'paused', progress: 12, mastery: 30, lessonsTotal: 6, lessonsDone: 1, lastActiveDaysAgo: 55, page: false },
  { slug: 'thiet-ke-slide-thuyet-phuc', title: 'Thiết kế slide thuyết phục', topic: 'ky-nang-thuyet-trinh', level: 'Cơ bản', status: 'done', progress: 100, mastery: 76, lessonsTotal: 4, lessonsDone: 4, lastActiveDaysAgo: 88, page: false },
];

const DATA: LearnerData = {
  learner: { name: 'Lê Trung Hiếu', joinedLabel: 'Học từ tháng 8, 2025', goalWeeklyMinutes: 300 },
  topics: TOPIC_STATS,
  courses: COURSES,
  dailyByTopic,
  daily,
  recommendations: [
    { title: 'Phân loại với học có giám sát', topic: 'tri-tue-nhan-tao', reason: 'Lấp đúng chỗ yếu ở Học máy và vừa sức với bạn.', fit: 92, difficulty: 68, kind: 'interactive', courseSlug: 'machine-learning-thuc-chien', page: true, unlockFrom: 'Đánh giá mô hình' },
    { title: 'Trình bày quan điểm trong cuộc họp', topic: 'tieng-anh-giao-tiep', reason: 'Chủ đề đang cách mục tiêu xa nhất, dùng được ngay ở chỗ làm.', fit: 84, difficulty: 55, kind: 'video', courseSlug: 'tieng-anh-giao-tiep-co-ban', page: true },
    { title: 'Dàn ý mở - thân - kết', topic: 'ky-nang-thuyet-trinh', reason: 'Nối tiếp phần bạn mới bắt đầu, học sớm đỡ ngợp.', fit: 79, difficulty: 48, kind: 'interactive', courseSlug: 'ky-nang-thuyet-trinh-hieu-qua', page: true },
    { title: 'Tổng hợp và trực quan hoá dữ liệu', topic: 'khoa-hoc-du-lieu', reason: 'Mạch Python bạn đang học khá tốt, học tiếp cho liền.', fit: 73, difficulty: 60, kind: 'video', courseSlug: 'phan-tich-du-lieu-voi-pandas', page: true },
    { title: 'Ôn lại: Khai cuộc cờ vua', topic: 'co-vua', reason: 'Cờ Vua đã nguội hơn tháng — ôn nhanh để không rơi nhịp.', fit: 66, difficulty: 40, kind: 'quiz', courseSlug: 'co-vua-tuong-tac', page: true },
  ],
  calibration: [
    { topic: 'tri-tue-nhan-tao', confidence: 76, accuracy: 76 },
    { topic: 'khoa-hoc-du-lieu', confidence: 62, accuracy: 69 },
    { topic: 'co-vua', confidence: 58, accuracy: 60 },
    { topic: 'tieng-anh-giao-tiep', confidence: 74, accuracy: 58 },
    { topic: 'ky-nang-thuyet-trinh', confidence: 66, accuracy: 54 },
  ],
};

export function getLearnerData(): LearnerData {
  return DATA;
}
