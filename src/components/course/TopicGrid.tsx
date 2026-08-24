import { useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import CourseCard from '../home/CourseCard';
import { LEVEL_LABEL, type Course, type Level } from '../../mock/types';
import { cn } from '../../lib/cn';

/**
 * Figma: `Section` (node 182:7673) — lưới khoá học của một chủ đề, với hàng lọc căn phải
 * gồm hai ô chọn (node 182:8049).
 *
 * Hai ô đó trong thiết kế là "Tất cả mục đích" và "Tất cả cấp độ", và trước đây chúng là
 * `<button>` không làm gì — bấm vào không có gì xảy ra. Giờ cả hai chạy thật:
 *
 *   - CẤP ĐỘ giữ nguyên nghĩa, lọc theo `course.level`.
 *   - "MỤC ĐÍCH" thì dữ liệu khoá học không có trường nào tương ứng, mà để một ô lọc
 *     không lọc được gì thì vẫn là ngõ cụt. Nên đổi thành SẮP XẾP — dùng `rating` và
 *     `durationHours` là hai trường có thật. Đây là chỗ tôi lệch thiết kế một nhãn, đổi
 *     lại là ô đó có việc để làm.
 */

type Sap = 'mac-dinh' | 'diem-cao' | 'ngan-nhat';

const SAP_NHAN: Record<Sap, string> = {
  'mac-dinh': 'Sắp xếp mặc định',
  'diem-cao': 'Đánh giá cao nhất',
  'ngan-nhat': 'Thời lượng ngắn nhất',
};

const CAP_DO: (Level | 'tat-ca')[] = ['tat-ca', 'beginner', 'intermediate', 'advanced'];

function OChon<T extends string>({
  nhan,
  giaTri,
  chon,
  doi,
  danhSach,
}: {
  nhan: string;
  giaTri: T;
  chon: (v: T) => string;
  doi: (v: T) => void;
  danhSach: T[];
}) {
  const [mo, setMo] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={mo}
        onClick={() => setMo((v) => !v)}
        className="ln-press ln-focus flex items-center gap-md rounded-md border border-primary bg-primary px-[14px] py-[10px] text-md font-medium text-primary shadow-xs"
      >
        {chon(giaTri)}
        <ChevronDown className={cn('h-5 w-5 shrink-0 text-quaternary transition-transform', mo && 'rotate-180')} aria-hidden="true" />
      </button>
      {mo ? (
        <>
          {/* Bấm ra ngoài là đóng — không có lớp này thì ô chọn mở rồi không đóng được. */}
          <button type="button" aria-label={`Đóng ${nhan}`} onClick={() => setMo(false)} className="fixed inset-0 z-10 cursor-default" />
          <ul
            role="listbox"
            aria-label={nhan}
            className="absolute right-0 z-20 mt-xs flex w-max min-w-full flex-col rounded-md border border-secondary bg-primary p-xs shadow-lg"
          >
            {danhSach.map((v) => (
              <li key={v}>
                <button
                  type="button"
                  role="option"
                  aria-selected={v === giaTri}
                  onClick={() => {
                    doi(v);
                    setMo(false);
                  }}
                  className={cn(
                    'ln-focus flex min-h-11 w-full items-center whitespace-nowrap rounded-sm px-lg text-left text-md',
                    v === giaTri ? 'font-semibold text-brand-secondary' : 'text-secondary hover:bg-secondary',
                  )}
                >
                  {chon(v)}
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}

export default function TopicGrid({ courses }: { courses: Course[] }) {
  const [capDo, setCapDo] = useState<Level | 'tat-ca'>('tat-ca');
  const [sap, setSap] = useState<Sap>('mac-dinh');

  const hien = useMemo(() => {
    const loc = capDo === 'tat-ca' ? courses : courses.filter((c) => c.level === capDo);
    if (sap === 'diem-cao') return [...loc].sort((a, b) => b.rating - a.rating);
    if (sap === 'ngan-nhat') return [...loc].sort((a, b) => a.durationHours - b.durationHours);
    return loc;
  }, [courses, capDo, sap]);

  return (
    <section className="flex w-full flex-col gap-xl">
      <div className="flex w-full flex-wrap items-center justify-end gap-lg">
        <OChon
          nhan="Sắp xếp"
          giaTri={sap}
          danhSach={['mac-dinh', 'diem-cao', 'ngan-nhat']}
          chon={(v) => SAP_NHAN[v]}
          doi={setSap}
        />
        <OChon
          nhan="Cấp độ"
          giaTri={capDo}
          danhSach={CAP_DO}
          chon={(v) => (v === 'tat-ca' ? 'Tất cả cấp độ' : LEVEL_LABEL[v])}
          doi={setCapDo}
        />
      </div>

      {hien.length > 0 ? (
        <div className="grid grid-cols-1 gap-4xl md:grid-cols-2 xl:grid-cols-3">
          {hien.map((course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      ) : (
        /* Lọc ra rỗng vẫn phải có đường ra, không để người xem đứng trước một khoảng trắng. */
        <div className="flex flex-col items-center gap-lg rounded-xl bg-secondary px-xl py-4xl text-center">
          <p className="text-md text-tertiary">Chủ đề này chưa có khoá nào ở cấp độ {LEVEL_LABEL[capDo as Level]}.</p>
          <button
            type="button"
            onClick={() => setCapDo('tat-ca')}
            className="ln-press ln-focus flex min-h-11 items-center rounded-pill bg-brand-500 px-2xl text-md font-semibold text-white shadow-xs"
          >
            Xem tất cả cấp độ
          </button>
        </div>
      )}
    </section>
  );
}
