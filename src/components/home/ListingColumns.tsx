import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { Reveal } from '../ui/Reveal';
import { courseThumb } from './courseImage';
import { courseExp, courseMinutes, getCourses } from '../../mock';

/**
 * Khoá học nổi bật gom theo chủ đề: ba cột, mỗi cột ba khoá.
 *
 * Bản thiết kế lặp đúng một dòng "Khoá học Python · $540 AUD · Rare find" chín lần cho
 * mọi ô. Ở đây thay bằng chín khoá thật khác nhau, và bỏ hẳn phần giá — trang này không
 * bán khoá theo đô Úc, để con số đó lại chỉ gây hiểu sai.
 */
const COLUMNS = [
  { label: 'Trí tuệ nhân tạo', slugs: ['ai-co-ban-den-thuc-tien', 'machine-learning-thuc-chien', 'prompt-engineering-cho-nguoi-moi'] },
  { label: 'Dữ liệu và lập trình', slugs: ['python-cho-khoa-hoc-du-lieu', 'phan-tich-du-lieu-voi-pandas', 'computer-vision-ung-dung'] },
  { label: 'Kỹ năng đi làm', slugs: ['tieng-anh-giao-tiep-co-ban', 'ky-nang-thuyet-trinh-hieu-qua', 'co-vua-tuong-tac'] },
];

export default function ListingColumns({
  title = 'Các tệp khoá học nổi bật xếp theo chủ đề',
}: {
  title?: string;
}) {
  const all = getCourses();
  const columns = COLUMNS.map((c) => ({
    label: c.label,
    items: c.slugs.map((s) => all.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => !!x),
  })).filter((c) => c.items.length > 0);

  return (
    <section className="flex w-full flex-col gap-xl">
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <div className="grid w-full grid-cols-1 gap-3xl xl:grid-cols-3">
        {columns.map((column, ci) => (
          <Reveal key={column.label} order={ci} className="flex">
            <div className="flex w-full min-w-0 flex-col items-start gap-md rounded-3xl bg-utility-brand-50 p-xl">
              <span className="flex items-center justify-center gap-sm text-md font-semibold text-brand-secondary">
                {column.label}
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </span>

              {column.items.map((course, ri) => (
                <Link
                  key={course.id}
                  to={'/courses/' + course.slug}
                  className="group flex w-full min-w-0 items-start gap-xl rounded-xl bg-primary p-xl shadow-xs-ring-secondary transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <img
                    src={courseThumb(course.id, ci * 3 + ri)}
                    alt=""
                    loading="lazy"
                    className="h-[84px] w-[116px] shrink-0 rounded-md object-cover"
                  />

                  <div className="flex min-w-0 flex-1 flex-col gap-md">
                    <h3 className="line-clamp-2 text-md font-semibold text-primary transition-colors group-hover:text-brand-secondary">
                      {course.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-md">
                      <IconBadge icon={<Star className="h-3 w-3 text-utility-orange-500" />}>
                        +{courseExp(course)} exp
                      </IconBadge>
                      <IconBadge icon={<Clock className="h-3 w-3" />}>{courseMinutes(course)} phút</IconBadge>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
