import type { Course, Topic, Instructor, User, Collection, Comment } from './types';

export const user: User = {
  id: 'u1',
  name: 'Học viên THS',
  avatar: '/src/assets/avatar-user.png',
};

export const instructors: Instructor[] = [
  {
    id: 'in1',
    name: 'Nguyễn Minh Anh',
    title: 'AI Engineer, Techainer',
    avatar: '/src/assets/avatar-in1.png',
    bio: 'Hơn 8 năm xây dựng hệ thống học máy cho doanh nghiệp, tập trung vào thị giác máy tính và xử lý ngôn ngữ tự nhiên.',
  },
  {
    id: 'in2',
    name: 'Trần Quốc Bảo',
    title: 'Data Scientist',
    avatar: '/src/assets/avatar-in2.png',
    bio: 'Chuyên gia phân tích dữ liệu, giảng viên các khoá Python và trực quan hoá dữ liệu cho người mới bắt đầu.',
  },
];

export const topics: Topic[] = [
  {
    id: 't1',
    slug: 'tri-tue-nhan-tao',
    title: 'Trí tuệ nhân tạo',
    description:
      'Khám phá các khoá học về trí tuệ nhân tạo, từ nền tảng cơ bản đến ứng dụng thực tiễn trong doanh nghiệp.',
    coverImage: '/src/assets/topic-ai.png',
    courseIds: ['c1', 'c2', 'c3', 'c4', 'c5', 'c6'],
  },
  {
    id: 't2',
    slug: 'khoa-hoc-du-lieu',
    title: 'Khoa học dữ liệu',
    description:
      'Xây dựng nền tảng phân tích dữ liệu, từ Python cơ bản đến xử lý và trực quan hoá dữ liệu thực tế.',
    coverImage: '/src/assets/topic-data.png',
    courseIds: ['c7', 'c8'],
  },
];

export const courses: Course[] = [
  {
    id: 'c1',
    slug: 'ai-co-ban-den-thuc-tien',
    title: 'Trí tuệ nhân tạo (AI) từ cơ bản đến thực tiễn',
    subtitle: 'Nắm vững nền tảng AI và cách áp dụng vào công việc hằng ngày.',
    description:
      'Khoá học đưa bạn đi từ những khái niệm nền tảng nhất của trí tuệ nhân tạo tới các ứng dụng thực tế. Bạn sẽ hiểu cách máy học từ dữ liệu, phân biệt các nhóm bài toán phổ biến, và tự tay chạy thử những mô hình đầu tiên. Nội dung được thiết kế cho người chưa có nền tảng kỹ thuật sâu, ưu tiên ví dụ trực quan và bài tập ngắn sau mỗi phần.',
    thumbnail: '/src/assets/course-c1.png',
    coverImage: '/src/assets/course-c1-cover.png',
    level: 'beginner',
    durationHours: 12,
    lessonCount: 11,
    rating: 4.8,
    enrolledCount: 1240,
    instructorId: 'in1',
    topicIds: ['t1'],
    learnPoints: [
      'Hiểu rõ trí tuệ nhân tạo là gì và khác gì với tự động hoá thông thường',
      'Phân biệt học có giám sát, học không giám sát và học tăng cường',
      'Đọc hiểu quy trình huấn luyện một mô hình từ dữ liệu thô',
      'Đánh giá chất lượng mô hình bằng các chỉ số phổ biến',
      'Nhận diện bài toán phù hợp để áp dụng AI trong công việc',
      'Sử dụng công cụ AI tạo sinh một cách hiệu quả và an toàn',
    ],
    skills: [
      'Machine Learning',
      'Tư duy dữ liệu',
      'Đánh giá mô hình',
      'Prompt Engineering',
      'Ứng dụng AI',
    ],
    sections: [
      {
        id: 's1',
        title: 'Giới thiệu về trí tuệ nhân tạo',
        lessons: [
          {
            id: 'l1',
            title: 'AI là gì?',
            durationMin: 8,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: true,
            resources: [
              { id: 'r1', label: 'Slide bài giảng (PDF)', url: '#', kind: 'pdf' },
              { id: 'r2', label: 'Bài đọc thêm', url: '#', kind: 'link' },
            ],
          },
          {
            id: 'l2',
            title: 'Lịch sử phát triển của AI',
            durationMin: 11,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: true,
            resources: [],
          },
          {
            id: 'l3',
            title: 'AI trong đời sống hằng ngày',
            durationMin: 9,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
        ],
      },
      {
        id: 's2',
        title: 'Nền tảng học máy',
        lessons: [
          {
            id: 'l4',
            title: 'Dữ liệu và đặc trưng',
            durationMin: 14,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [{ id: 'r3', label: 'Bộ dữ liệu mẫu (CSV)', url: '#', kind: 'file' }],
          },
          {
            id: 'l5',
            title: 'Học có giám sát',
            durationMin: 16,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
          {
            id: 'l6',
            title: 'Học không giám sát',
            durationMin: 13,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
          {
            id: 'l7',
            title: 'Đánh giá mô hình',
            durationMin: 15,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
        ],
      },
      {
        id: 's3',
        title: 'Ứng dụng thực tiễn',
        lessons: [
          {
            id: 'l8',
            title: 'AI tạo sinh và mô hình ngôn ngữ lớn',
            durationMin: 18,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
          {
            id: 'l9',
            title: 'Viết prompt hiệu quả',
            durationMin: 12,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
          {
            id: 'l10',
            title: 'Đạo đức và rủi ro khi dùng AI',
            durationMin: 10,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
          {
            id: 'l11',
            title: 'Xây dựng lộ trình học tiếp theo',
            durationMin: 7,
            videoUrl: '/media/sample-lesson.mp4',
            isPreview: false,
            resources: [],
          },
        ],
      },
    ],
  },
  {
    id: 'c2',
    slug: 'machine-learning-thuc-chien',
    title: 'Machine Learning thực chiến',
    subtitle: 'Huấn luyện, tinh chỉnh và triển khai mô hình học máy.',
    description:
      'Khoá học tập trung vào quy trình làm việc thực tế của một kỹ sư học máy: chuẩn bị dữ liệu, chọn mô hình, tinh chỉnh siêu tham số và đưa mô hình vào sử dụng.',
    thumbnail: '/src/assets/course-c2.png',
    coverImage: '/src/assets/course-c2-cover.png',
    level: 'intermediate',
    durationHours: 18,
    lessonCount: 4,
    rating: 4.7,
    enrolledCount: 860,
    instructorId: 'in1',
    topicIds: ['t1'],
    learnPoints: [
      'Xây dựng pipeline xử lý dữ liệu hoàn chỉnh',
      'Chọn thuật toán phù hợp với từng bài toán',
      'Tinh chỉnh siêu tham số một cách có hệ thống',
      'Triển khai mô hình ra môi trường thật',
    ],
    skills: ['Scikit-learn', 'Feature Engineering', 'Model Tuning'],
    sections: [
      {
        id: 'c2s1',
        title: 'Chuẩn bị dữ liệu',
        lessons: [
          { id: 'c2l1', title: 'Làm sạch dữ liệu', durationMin: 15, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c2l2', title: 'Tạo đặc trưng', durationMin: 17, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c2s2',
        title: 'Huấn luyện và triển khai',
        lessons: [
          { id: 'c2l3', title: 'Tinh chỉnh siêu tham số', durationMin: 20, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c2l4', title: 'Đưa mô hình vào sản phẩm', durationMin: 19, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c3',
    slug: 'deep-learning-nang-cao',
    title: 'Deep Learning nâng cao',
    subtitle: 'Mạng nơ-ron sâu, kiến trúc hiện đại và kỹ thuật tối ưu.',
    description:
      'Đi sâu vào các kiến trúc mạng nơ-ron hiện đại, kỹ thuật huấn luyện quy mô lớn và cách tối ưu hiệu năng mô hình.',
    thumbnail: '/src/assets/course-c3.png',
    coverImage: '/src/assets/course-c3-cover.png',
    level: 'advanced',
    durationHours: 24,
    lessonCount: 4,
    rating: 4.9,
    enrolledCount: 540,
    instructorId: 'in1',
    topicIds: ['t1'],
    learnPoints: [
      'Hiểu sâu cơ chế lan truyền ngược',
      'Nắm các kiến trúc CNN và Transformer',
      'Áp dụng kỹ thuật chống quá khớp',
      'Tối ưu tốc độ huấn luyện trên GPU',
    ],
    skills: ['PyTorch', 'Transformer', 'Tối ưu hoá'],
    sections: [
      {
        id: 'c3s1',
        title: 'Nền tảng mạng nơ-ron',
        lessons: [
          { id: 'c3l1', title: 'Lan truyền ngược', durationMin: 22, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c3l2', title: 'Hàm kích hoạt và khởi tạo', durationMin: 18, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c3s2',
        title: 'Kiến trúc hiện đại',
        lessons: [
          { id: 'c3l3', title: 'Mạng tích chập', durationMin: 25, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c3l4', title: 'Kiến trúc Transformer', durationMin: 28, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c4',
    slug: 'xu-ly-ngon-ngu-tu-nhien',
    title: 'Xử lý ngôn ngữ tự nhiên',
    subtitle: 'Cho máy hiểu và sinh ngôn ngữ của con người.',
    description:
      'Tìm hiểu cách máy tính biểu diễn, hiểu và sinh ra ngôn ngữ tự nhiên, cùng các ứng dụng như phân loại văn bản và trợ lý ảo.',
    thumbnail: '/src/assets/course-c4.png',
    coverImage: '/src/assets/course-c4-cover.png',
    level: 'intermediate',
    durationHours: 16,
    lessonCount: 4,
    rating: 4.6,
    enrolledCount: 720,
    instructorId: 'in1',
    topicIds: ['t1'],
    learnPoints: [
      'Biểu diễn văn bản dưới dạng số',
      'Xây dựng bộ phân loại văn bản',
      'Sử dụng mô hình ngôn ngữ có sẵn',
      'Đánh giá chất lượng đầu ra ngôn ngữ',
    ],
    skills: ['NLP', 'Embedding', 'Phân loại văn bản'],
    sections: [
      {
        id: 'c4s1',
        title: 'Biểu diễn văn bản',
        lessons: [
          { id: 'c4l1', title: 'Tách từ và chuẩn hoá', durationMin: 14, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c4l2', title: 'Vector hoá văn bản', durationMin: 16, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c4s2',
        title: 'Ứng dụng',
        lessons: [
          { id: 'c4l3', title: 'Phân loại cảm xúc', durationMin: 18, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c4l4', title: 'Trợ lý hỏi đáp', durationMin: 20, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c5',
    slug: 'computer-vision-ung-dung',
    title: 'Thị giác máy tính ứng dụng',
    subtitle: 'Nhận diện, phát hiện và phân đoạn ảnh trong thực tế.',
    description:
      'Khoá học hướng dẫn xây dựng các hệ thống xử lý ảnh thực tế: nhận diện đối tượng, phát hiện lỗi sản phẩm và phân đoạn ảnh y tế.',
    thumbnail: '/src/assets/course-c5.png',
    coverImage: '/src/assets/course-c5-cover.png',
    level: 'intermediate',
    durationHours: 20,
    lessonCount: 4,
    rating: 4.5,
    enrolledCount: 610,
    instructorId: 'in1',
    topicIds: ['t1'],
    learnPoints: [
      'Tiền xử lý và tăng cường ảnh',
      'Huấn luyện mô hình phân loại ảnh',
      'Phát hiện đối tượng trong ảnh',
      'Triển khai mô hình lên thiết bị biên',
    ],
    skills: ['Computer Vision', 'OpenCV', 'Object Detection'],
    sections: [
      {
        id: 'c5s1',
        title: 'Xử lý ảnh cơ bản',
        lessons: [
          { id: 'c5l1', title: 'Đọc và biến đổi ảnh', durationMin: 13, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c5l2', title: 'Tăng cường dữ liệu ảnh', durationMin: 15, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c5s2',
        title: 'Mô hình thị giác',
        lessons: [
          { id: 'c5l3', title: 'Phân loại ảnh', durationMin: 19, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c5l4', title: 'Phát hiện đối tượng', durationMin: 23, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c6',
    slug: 'prompt-engineering-cho-nguoi-moi',
    title: 'Prompt Engineering cho người mới',
    subtitle: 'Khai thác tối đa các công cụ AI tạo sinh.',
    description:
      'Học cách viết prompt rõ ràng, có cấu trúc để nhận được kết quả chất lượng cao từ các mô hình ngôn ngữ lớn, kèm ví dụ cho công việc văn phòng.',
    thumbnail: '/src/assets/course-c6.png',
    coverImage: '/src/assets/course-c6-cover.png',
    level: 'beginner',
    durationHours: 6,
    lessonCount: 4,
    rating: 4.4,
    enrolledCount: 1580,
    instructorId: 'in2',
    topicIds: ['t1'],
    learnPoints: [
      'Cấu trúc một prompt hiệu quả',
      'Kỹ thuật đưa ví dụ vào prompt',
      'Kiểm soát giọng văn và định dạng đầu ra',
      'Tránh các lỗi thường gặp khi dùng AI',
    ],
    skills: ['Prompt Engineering', 'AI tạo sinh', 'Tự động hoá'],
    sections: [
      {
        id: 'c6s1',
        title: 'Nền tảng prompt',
        lessons: [
          { id: 'c6l1', title: 'Cấu trúc prompt cơ bản', durationMin: 9, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c6l2', title: 'Đưa ngữ cảnh vào prompt', durationMin: 11, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c6s2',
        title: 'Ứng dụng công việc',
        lessons: [
          { id: 'c6l3', title: 'Soạn thảo và tóm tắt', durationMin: 10, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c6l4', title: 'Kiểm tra và tinh chỉnh kết quả', durationMin: 12, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c7',
    slug: 'python-cho-khoa-hoc-du-lieu',
    title: 'Python cho khoa học dữ liệu',
    subtitle: 'Nền tảng lập trình cho người làm dữ liệu.',
    description:
      'Bắt đầu từ cú pháp Python cơ bản tới các thư viện phân tích dữ liệu phổ biến, đủ để tự tin xử lý bộ dữ liệu đầu tiên của bạn.',
    thumbnail: '/src/assets/course-c7.png',
    coverImage: '/src/assets/course-c7-cover.png',
    level: 'beginner',
    durationHours: 14,
    lessonCount: 4,
    rating: 4.7,
    enrolledCount: 1930,
    instructorId: 'in2',
    topicIds: ['t2'],
    learnPoints: [
      'Nắm cú pháp Python nền tảng',
      'Làm việc với danh sách và từ điển',
      'Đọc ghi tệp dữ liệu',
      'Sử dụng thư viện phân tích cơ bản',
    ],
    skills: ['Python', 'NumPy', 'Xử lý tệp'],
    sections: [
      {
        id: 'c7s1',
        title: 'Python nền tảng',
        lessons: [
          { id: 'c7l1', title: 'Biến và kiểu dữ liệu', durationMin: 12, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c7l2', title: 'Vòng lặp và hàm', durationMin: 14, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c7s2',
        title: 'Làm việc với dữ liệu',
        lessons: [
          { id: 'c7l3', title: 'Đọc ghi tệp CSV', durationMin: 13, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c7l4', title: 'Giới thiệu NumPy', durationMin: 16, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
  {
    id: 'c8',
    slug: 'phan-tich-du-lieu-voi-pandas',
    title: 'Phân tích dữ liệu với Pandas',
    subtitle: 'Biến bảng dữ liệu thô thành thông tin hữu ích.',
    description:
      'Sử dụng Pandas để làm sạch, biến đổi, tổng hợp và trực quan hoá dữ liệu, kèm các tình huống phân tích kinh doanh thực tế.',
    thumbnail: '/src/assets/course-c8.png',
    coverImage: '/src/assets/course-c8-cover.png',
    level: 'intermediate',
    durationHours: 15,
    lessonCount: 4,
    rating: 4.6,
    enrolledCount: 1120,
    instructorId: 'in2',
    topicIds: ['t2'],
    learnPoints: [
      'Thao tác với DataFrame',
      'Làm sạch dữ liệu thiếu và trùng lặp',
      'Nhóm và tổng hợp dữ liệu',
      'Trực quan hoá kết quả phân tích',
    ],
    skills: ['Pandas', 'Trực quan hoá', 'Phân tích kinh doanh'],
    sections: [
      {
        id: 'c8s1',
        title: 'Làm chủ DataFrame',
        lessons: [
          { id: 'c8l1', title: 'Tạo và truy vấn DataFrame', durationMin: 15, videoUrl: '/media/sample-lesson.mp4', isPreview: true, resources: [] },
          { id: 'c8l2', title: 'Làm sạch dữ liệu', durationMin: 17, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
      {
        id: 'c8s2',
        title: 'Tổng hợp và trực quan hoá',
        lessons: [
          { id: 'c8l3', title: 'Nhóm và tổng hợp', durationMin: 16, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
          { id: 'c8l4', title: 'Vẽ biểu đồ từ dữ liệu', durationMin: 14, videoUrl: '/media/sample-lesson.mp4', isPreview: false, resources: [] },
        ],
      },
    ],
  },
];

export const collections: Collection[] = [
  {
    id: 'col1',
    title: 'Lộ trình trở thành kỹ sư AI',
    description: 'Chuỗi khoá học được sắp xếp từ nền tảng tới nâng cao dành cho người muốn theo nghề AI.',
    courseIds: ['c1', 'c2', 'c3'],
  },
  {
    id: 'col2',
    title: 'Khởi đầu với dữ liệu',
    description: 'Gợi ý cho người mới: học Python, xử lý dữ liệu và tạo báo cáo đầu tiên.',
    courseIds: ['c7', 'c8', 'c6'],
  },
];

export const comments: Comment[] = [
  {
    id: 'cm1',
    lessonId: 'l1',
    authorName: 'Lê Thu Hà',
    authorAvatar: '/src/assets/avatar-cm1.png',
    text: 'Phần mở đầu rất dễ hiểu, ví dụ gần gũi với người không chuyên kỹ thuật.',
    createdAt: '2026-06-02T09:12:00.000Z',
    likes: 12,
  },
  {
    id: 'cm2',
    lessonId: 'l1',
    authorName: 'Phạm Đức Duy',
    authorAvatar: '/src/assets/avatar-cm2.png',
    text: 'Cho mình hỏi phần so sánh AI với tự động hoá có tài liệu đọc thêm không ạ?',
    createdAt: '2026-06-03T14:40:00.000Z',
    likes: 5,
  },
  {
    id: 'cm3',
    lessonId: 'l1',
    authorName: 'Nguyễn Minh Anh',
    authorAvatar: '/src/assets/avatar-in1.png',
    text: 'Bạn xem mục Tài liệu của bài học nhé, mình có đính kèm slide và một bài đọc thêm.',
    createdAt: '2026-06-03T15:05:00.000Z',
    likes: 9,
  },
  {
    id: 'cm4',
    lessonId: 'l1',
    authorName: 'Vũ Hoàng Nam',
    authorAvatar: '/src/assets/avatar-cm4.png',
    text: 'Tốc độ giảng vừa phải, mình xem ở 1.25x là hợp lý.',
    createdAt: '2026-06-05T08:20:00.000Z',
    likes: 3,
  },
];
