/**
 * The learning catalogue the demo events are generated against: topics, courses,
 * concepts (with prerequisites + a base memory half-life) and videos.
 *
 * Everything is fixed data — no randomness here — so the world is stable across
 * reloads. The randomness lives only in seed.ts, which plays learners through
 * this catalogue.
 */

export type TopicSlug = 'ai' | 'data' | 'web' | 'english' | 'pm';

export interface Topic {
  slug: TopicSlug;
  name: string;
}

export const TOPICS: Topic[] = [
  { slug: 'ai', name: 'Trí tuệ nhân tạo' },
  { slug: 'data', name: 'Phân tích dữ liệu' },
  { slug: 'web', name: 'Lập trình web' },
  { slug: 'english', name: 'Tiếng Anh' },
  { slug: 'pm', name: 'Kỹ năng & Quản lý' },
];

export const TOPIC_NAME: Record<TopicSlug, string> = Object.fromEntries(TOPICS.map((t) => [t.slug, t.name])) as Record<TopicSlug, string>;

export interface Concept {
  id: string;
  label: string;
  courseId: string;
  /** grid position for the concept map */
  col: number;
  row: number;
  /** concept ids that should be learned first */
  prereq: string[];
  /** 0 (easy) … 1 (hard) — drives struggle + slower memory */
  difficulty: number;
  /** base retention half-life in days (shorter = forgotten faster) */
  halfLifeDays: number;
}

export interface Video {
  id: string;
  title: string;
  courseId: string;
  concept: string;
  /** length in seconds */
  durationS: number;
  /** ordinal within its course */
  order: number;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  topic: TopicSlug;
  /** true when a real course page exists to deep-link into */
  page?: boolean;
}

/** id, slug, title, topic, and the ordered concept labels of each course. */
interface CourseSpec {
  id: string;
  slug: string;
  title: string;
  topic: TopicSlug;
  page?: boolean;
  /** ordered concept labels; prereqs are the previous one unless branched */
  concepts: string[];
}

const COURSE_SPECS: CourseSpec[] = [
  {
    id: 'ai-foundations',
    slug: 'ai-co-ban-den-thuc-tien',
    title: 'AI cơ bản đến thực tiễn',
    topic: 'ai',
    page: true,
    concepts: ['AI là gì', 'Học máy cơ bản', 'Mạng nơ-ron', 'Lan truyền ngược', 'Ứng dụng thực tế'],
  },
  {
    id: 'prompting',
    slug: 'nghe-thuat-ra-lenh-ai',
    title: 'Nghệ thuật ra lệnh cho AI',
    topic: 'ai',
    page: true,
    concepts: ['Prompt là gì', 'Ra lệnh rõ ràng', 'Ví dụ mẫu', 'Kiểm soát đầu ra'],
  },
  {
    id: 'data-analytics',
    slug: 'phan-tich-du-lieu-cho-nguoi-moi',
    title: 'Phân tích dữ liệu cho người mới',
    topic: 'data',
    page: true,
    concepts: ['Đọc bảng số', 'Trung bình & trung vị', 'Biểu đồ đúng cách', 'Tương quan', 'Kể chuyện bằng số'],
  },
  {
    id: 'sql',
    slug: 'sql-tu-con-so-khong',
    title: 'SQL từ con số không',
    topic: 'data',
    concepts: ['Bảng & cột', 'Câu lệnh SELECT', 'Lọc dữ liệu', 'Nhóm & tổng hợp', 'Ghép bảng'],
  },
  {
    id: 'web-basics',
    slug: 'lam-web-dau-tien',
    title: 'Làm trang web đầu tiên',
    topic: 'web',
    page: true,
    concepts: ['HTML nền tảng', 'CSS bố cục', 'Responsive', 'JavaScript nhập môn'],
  },
  {
    id: 'react',
    slug: 'react-cho-nguoi-ban-ron',
    title: 'React cho người bận rộn',
    topic: 'web',
    concepts: ['Component', 'State & Props', 'Vòng đời & Effect', 'Quản lý dữ liệu'],
  },
  {
    id: 'english-comm',
    slug: 'tieng-anh-giao-tiep-cong-so',
    title: 'Tiếng Anh giao tiếp công sở',
    topic: 'english',
    page: true,
    concepts: ['Chào hỏi & mở đầu', 'Email công việc', 'Họp trực tuyến', 'Thuyết trình ngắn'],
  },
  {
    id: 'ielts',
    slug: 'ielts-writing-can-ban',
    title: 'IELTS Writing căn bản',
    topic: 'english',
    concepts: ['Đọc đề đúng', 'Câu chủ đề', 'Triển khai ý', 'Liên kết đoạn'],
  },
  {
    id: 'pm-basics',
    slug: 'quan-ly-cong-viec-hieu-qua',
    title: 'Quản lý công việc hiệu quả',
    topic: 'pm',
    page: true,
    concepts: ['Ưu tiên việc', 'Chia nhỏ mục tiêu', 'Ước lượng thời gian', 'Theo dõi tiến độ'],
  },
  {
    id: 'public-speaking',
    slug: 'noi-truoc-dam-dong',
    title: 'Nói trước đám đông',
    topic: 'pm',
    concepts: ['Vượt hồi hộp', 'Mở bài cuốn hút', 'Ngôn ngữ cơ thể', 'Chốt bài ấn tượng'],
  },
  {
    id: 'computer-vision',
    slug: 'thi-giac-may-tinh-nhap-mon',
    title: 'Thị giác máy tính nhập môn',
    topic: 'ai',
    concepts: ['Ảnh số là gì', 'Lọc & biến đổi ảnh', 'Nhận diện vật thể', 'Ứng dụng CV'],
  },
  {
    id: 'ai-ethics',
    slug: 'ai-co-trach-nhiem',
    title: 'AI có trách nhiệm',
    topic: 'ai',
    concepts: ['Thiên lệch dữ liệu', 'Quyền riêng tư', 'Minh bạch mô hình', 'Dùng AI đúng mực'],
  },
  {
    id: 'excel-pro',
    slug: 'excel-cho-phan-tich',
    title: 'Excel cho phân tích',
    topic: 'data',
    concepts: ['Hàm cơ bản', 'PivotTable', 'Biểu đồ trong Excel', 'Làm sạch dữ liệu'],
  },
  {
    id: 'python-data',
    slug: 'python-cho-du-lieu',
    title: 'Python cho dữ liệu',
    topic: 'data',
    concepts: ['Biến & kiểu dữ liệu', 'Pandas nhập môn', 'Vẽ biểu đồ', 'Xử lý bảng lớn'],
  },
  {
    id: 'ui-design',
    slug: 'thiet-ke-giao-dien-co-ban',
    title: 'Thiết kế giao diện cơ bản',
    topic: 'web',
    concepts: ['Bố cục & lưới', 'Màu & tương phản', 'Chữ & khoảng cách', 'Thành phần tái dùng'],
  },
  {
    id: 'git-basics',
    slug: 'git-va-lam-viec-nhom',
    title: 'Git & làm việc nhóm',
    topic: 'web',
    concepts: ['Commit & lịch sử', 'Nhánh & gộp', 'Xử lý xung đột', 'Quy trình nhóm'],
  },
  {
    id: 'toeic',
    slug: 'toeic-cap-toc',
    title: 'TOEIC cấp tốc',
    topic: 'english',
    concepts: ['Nghe câu ngắn', 'Đọc điền từ', 'Đọc đoạn văn', 'Mẹo quản lý thời gian'],
  },
  {
    id: 'teamwork',
    slug: 'lam-viec-nhom-hieu-qua',
    title: 'Làm việc nhóm hiệu quả',
    topic: 'pm',
    concepts: ['Phân vai rõ ràng', 'Giao tiếp trong nhóm', 'Xử lý bất đồng', 'Họp gọn & hiệu quả'],
  },
];

/** deterministic pseudo-value in [0,1) from a string — keeps the catalogue fixed. */
function hash01(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 100000) / 100000;
}

const slugify = (label: string, i: number): string =>
  `c-${i}-${label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')}`;

export const COURSES: Course[] = COURSE_SPECS.map(({ id, slug, title, topic, page }) => ({ id, slug, title, topic, page }));

export const CONCEPTS: Concept[] = COURSE_SPECS.flatMap((spec) =>
  spec.concepts.map((label, i) => {
    const id = `${spec.id}:${slugify(label, i)}`;
    const difficulty = 0.28 + 0.5 * hash01(id); // 0.28 … 0.78
    return {
      id,
      label,
      courseId: spec.id,
      col: i,
      row: 0,
      prereq: i === 0 ? [] : [`${spec.id}:${slugify(spec.concepts[i - 1], i - 1)}`],
      difficulty,
      halfLifeDays: Math.round(6 + (1 - difficulty) * 20), // harder → forgotten sooner (6…26d)
    };
  }),
);

export const VIDEOS: Video[] = CONCEPTS.map((c, i) => ({
  id: `v:${c.id}`,
  title: `Bài ${c.col + 1}: ${c.label}`,
  courseId: c.courseId,
  concept: c.id,
  durationS: Math.round(230 + hash01(`${c.id}:dur`) * 380), // 230…610s
  order: c.col,
}));

// ---- lookups ----
export const COURSE_BY_ID: Record<string, Course> = Object.fromEntries(COURSES.map((c) => [c.id, c]));
export const CONCEPT_BY_ID: Record<string, Concept> = Object.fromEntries(CONCEPTS.map((c) => [c.id, c]));
export const VIDEO_BY_ID: Record<string, Video> = Object.fromEntries(VIDEOS.map((v) => [v.id, v]));
export const CONCEPTS_OF = (courseId: string): Concept[] => CONCEPTS.filter((c) => c.courseId === courseId);
export const VIDEOS_OF = (courseId: string): Video[] => VIDEOS.filter((v) => v.courseId === courseId);

// ---- time base (fixed, deterministic) ----
export const NOW = new Date(2026, 7, 5, 20, 30, 0); // 05/08/2026 20:30
export const SPAN_DAYS = 365; // một năm học đầy đủ
export const START = new Date(NOW.getTime() - SPAN_DAYS * 86400000);

/** absolute event time (seconds since START) → Date */
export const dateFromT = (t: number): Date => new Date(START.getTime() + t * 1000);
/** "now", expressed on the same seconds-since-START axis */
export const NOW_T = Math.round((NOW.getTime() - START.getTime()) / 1000);
export const DAY_S = 86400;
