import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Star } from 'lucide-react';
import IconBadge from '../ui/IconBadge';
import { Reveal } from '../ui/Reveal';
import CardRail from '../ui/CardRail';
import { courseThumb } from './courseImage';
import { courseExp, courseMinutes, getCourses } from '../../mock';

/**
 * Khoá học nổi bật gom theo chủ đề: ba cột, mỗi cột ba khoá.
 *
 * Bản thiết kế lặp đúng một dòng "Khoá học Python · $540 AUD · Rare find" chín lần cho
 * mọi ô. Ở đây thay bằng chín khoá thật khác nhau, và bỏ hẳn phần giá — trang này không
 * bán khoá theo đô Úc, để con số đó lại chỉ gây hiểu sai.
 */
/**
 * `den` là đích của tiêu đề cột.
 *
 * Tiêu đề cột trước đây là `<span>` kèm mũi tên — nhìn đúng như một đường dẫn nhưng bấm vào
 * không đi đâu. Giờ mỗi cột mở trang tìm kiếm đã lọc sẵn. Cột "Kỹ năng đi làm" gộp hai chủ
 * đề nên truyền cả hai, cách nhau bằng dấu phẩy — trang tìm nhận được nhiều chủ đề một lúc.
 */
const COLUMNS = [
  {
    label: 'Trí tuệ nhân tạo',
    den: '/tim-kiem?chu-de=tri-tue-nhan-tao',
    slugs: ['ai-co-ban-den-thuc-tien', 'machine-learning-thuc-chien', 'prompt-engineering-cho-nguoi-moi'],
  },
  {
    label: 'Dữ liệu và lập trình',
    den: '/tim-kiem?chu-de=khoa-hoc-du-lieu',
    slugs: ['python-cho-khoa-hoc-du-lieu', 'phan-tich-du-lieu-voi-pandas', 'computer-vision-ung-dung'],
  },
  {
    label: 'Kỹ năng đi làm',
    den: '/tim-kiem?chu-de=tieng-anh-giao-tiep,ky-nang-thuyet-trinh',
    slugs: ['tieng-anh-giao-tiep-co-ban', 'ky-nang-thuyet-trinh-hieu-qua', 'co-vua-tuong-tac'],
  },
];

export default function ListingColumns({
  title = 'Các tệp khoá học nổi bật xếp theo chủ đề',
}: {
  title?: string;
}) {
  const all = getCourses();
  const columns = COLUMNS.map((c) => ({
    label: c.label,
    den: c.den,
    items: c.slugs.map((s) => all.find((x) => x.slug === s)).filter((x): x is NonNullable<typeof x> => !!x),
  })).filter((c) => c.items.length > 0);

  return (
    <section className="flex w-full flex-col gap-xl">
      <Reveal>
        <h2 className="w-full text-display-xs text-primary">{title}</h2>
      </Reveal>

      <CardRail nhan={title} className="xl:!grid-cols-3">
        {columns.map((column, ci) => (
          <Reveal key={column.label} order={ci} className="flex">
            <div className="flex w-full min-w-0 flex-col items-start gap-md rounded-3xl bg-utility-brand-50 p-xl">
              <Link
                to={column.den}
                className="ln-press ln-focus-flat flex min-h-11 items-center gap-sm rounded-sm text-md font-semibold text-brand-secondary"
              >
                {column.label}
                <ArrowRight className="h-5 w-5 shrink-0" aria-hidden="true" />
              </Link>

              {column.items.map((course, ri) => (
                <Link
                  key={course.id}
                  to={'/courses/' + course.slug}
                  className="ln-press ln-press-soft ln-focus group flex w-full min-w-0 items-start gap-xl rounded-xl bg-primary p-xl shadow-xs-ring-secondary"
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
      </CardRail>
    </section>
  );
}
