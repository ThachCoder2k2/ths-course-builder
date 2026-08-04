import { Link } from 'react-router-dom';
import { Award, CalendarClock } from 'lucide-react';
import { Section } from '../Section';
import { ChartCard, Legend } from '../charts/ChartCard';
import { RadialRing } from '../charts/gauges';
import { LineChart } from '../charts/LineChart';
import { Pyramid, BadgeShelf } from '../charts/simple';
import { AiInsightCard } from '../AiInsightCard';
import { BRAND, cat, SERIES } from '../palette';
import type { LearnerAnalytics } from '../../../mock/analytics';

export function ProgressSection({ a }: { a: LearnerAnalytics }) {
  const p = a.progress;
  const labels = p.velocity.map((v) => v.week);
  const pyramidRows = [...p.levels].reverse().map((l) => ({ label: l.level, value: Math.round((l.mastered / l.total) * 100), sub: `${l.mastered}/${l.total}` }));
  const groups = a.topics
    .map((t, i) => ({ topic: t.name, color: cat(i), courses: p.courses.filter((c) => c.topic === t.name) }))
    .filter((g) => g.courses.length);
  const certificates = p.courses.filter((c) => c.progress === 100);

  return (
    <Section index={1} id="tien-do" title="Tiến độ & Kết quả" subtitle="Bạn đã đi tới đâu trong các khóa của mình, chất lượng ra sao và dự kiến hoàn thành khi nào.">
      <AiInsightCard label="Tiến độ">
        Khóa “{a.learner.currentCourse}” bạn đã đi được {p.courses[0].progress}%, chỉ còn vài bài nữa. Nếu giữ nhịp học đều như mấy tuần gần
        đây, khoảng ngày {p.etaLabel} là bạn hoàn thành. Các chủ đề khác cũng đang nhích đều, chưa có khóa nào bị bỏ quên lâu.
      </AiInsightCard>

      <div className="grid gap-xl lg:grid-cols-2">
        <ChartCard
          title="Tiến độ từng khóa"
          subtitle="Nhóm theo chủ đề · bấm để mở khóa"
          info={{
            what: 'Phần trăm bài đã hoàn thành trong mỗi khóa, xếp theo từng chủ đề.',
            how: 'Số bài đã hoàn thành chia cho tổng số bài của khóa. Bấm vào một vòng để mở trang khóa đó.',
            formula: 'Tiến độ khóa = số bài đã hoàn thành / tổng số bài × 100%.',
          }}
        >
          <div className="dv-scroll flex max-h-[460px] flex-col gap-xl overflow-y-auto pr-xs pt-xs">
            {groups.map((g) => (
              <div key={g.topic} className="flex flex-col gap-md">
                <span className="flex items-center gap-xs text-xs font-semibold uppercase tracking-wide text-quaternary">
                  <span className="h-2 w-2 rounded-full" style={{ background: g.color }} />
                  {g.topic}
                </span>
                <div className="flex flex-wrap gap-lg">
                  {g.courses.map((c) => (
                    <Link key={c.slug} to={`/courses/${c.slug}`} className="rounded-xl p-xs transition hover:bg-secondary">
                      <RadialRing value={c.progress} label={c.title} color={g.color} />
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ChartCard>

        <ChartCard
          title="Độ sâu thành thạo theo cấp độ"
          subtitle="Số khái niệm đã làm chủ ở mỗi bậc"
          info={{
            what: 'Số khái niệm bạn đã làm chủ ở từng bậc độ khó (Cơ bản, Trung cấp, Nâng cao), gộp mọi chủ đề.',
            how: 'Mỗi tầng đối chiếu số khái niệm đã đạt với tổng số ở bậc đó; bậc càng cao càng ít khái niệm đạt nên hình thu hẹp dần lên trên.',
            formula: 'Độ sâu(bậc) = khái niệm đã đạt ở bậc / tổng khái niệm ở bậc × 100%.',
          }}
          note={<p className="text-sm text-tertiary">Nền tảng đã vững; phần Trung cấp và Nâng cao vẫn còn nhiều chỗ để tiến thêm.</p>}
        >
          <Pyramid rows={pyramidRows} />
        </ChartCard>

        <ChartCard
          title="Tốc độ học & dự kiến hoàn thành"
          subtitle="Số bài tích lũy theo tuần"
          className="lg:col-span-2"
          info={{
            what: 'Số bài tích lũy theo tuần, đặt cạnh kế hoạch và đường dự kiến, kèm ngày hoàn thành khóa trọng tâm.',
            how: '“Thực tế” cộng dồn số bài mỗi tuần; “Kế hoạch” là mục tiêu đặt trước; “Dự kiến” ngoại suy theo nhịp gần đây.',
            formula: 'Vận tốc = số bài trung bình mỗi tuần gần đây; Ngày xong = số bài còn lại / vận tốc.',
          }}
          aside={
            <span className="inline-flex items-center gap-xs rounded-pill bg-brand-50 px-lg py-xs text-sm font-semibold text-brand-secondary">
              <CalendarClock className="h-4 w-4" aria-hidden="true" />
              {p.etaCourse}: {p.etaLabel} · còn {p.daysLeft} ngày
            </span>
          }
          note={<Legend items={[{ label: 'Thực tế', color: BRAND.blue }, { label: 'Kế hoạch', color: SERIES.greenBlue, dashed: true }, { label: 'Dự kiến', color: SERIES.orange, dashed: true }]} />}
        >
          <LineChart
            ariaLabel="Tốc độ học theo tuần so với kế hoạch và dự kiến"
            labels={labels}
            unit=" bài"
            yMax={30}
            yTicks={6}
            series={[
              { name: 'Thực tế', color: BRAND.blue, points: p.velocity.map((v) => v.actual), area: true },
              { name: 'Kế hoạch', color: SERIES.greenBlue, points: p.velocity.map((v) => v.planned), dashed: true },
              { name: 'Dự kiến', color: SERIES.orange, points: p.velocity.map((v) => v.projected), dashed: true },
            ]}
          />
        </ChartCard>

        <ChartCard
          title="Chứng chỉ & huy hiệu"
          subtitle="Cột mốc bạn đã đạt được"
          className="lg:col-span-2"
          info={{
            what: 'Chứng chỉ theo khóa đã hoàn thành và các huy hiệu cột mốc.',
            how: 'Chứng chỉ mở khi bạn hoàn tất 100% một khóa (bấm để mở khóa); huy hiệu mở khi đạt điều kiện chung như chuỗi ngày hay điểm quiz.',
            formula: 'Chứng chỉ khóa mở khi tiến độ khóa = 100%.',
          }}
        >
          <div className="flex flex-col gap-xl">
            {certificates.length ? (
              <div className="flex flex-col gap-md">
                <span className="text-xs font-semibold uppercase tracking-wide text-quaternary">Chứng chỉ đã đạt</span>
                <div className="flex flex-wrap gap-md">
                  {certificates.map((c) => (
                    <Link key={c.slug} to={`/courses/${c.slug}`} className="inline-flex items-center gap-md rounded-xl border border-secondary bg-accent-peach px-lg py-md transition hover:border-brand-alt">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brandOrange text-white">
                        <Award className="h-4 w-4" aria-hidden="true" />
                      </span>
                      <span className="text-sm font-semibold text-primary">{c.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ) : null}
            <div className="flex flex-col gap-md">
              <span className="text-xs font-semibold uppercase tracking-wide text-quaternary">Huy hiệu</span>
              <BadgeShelf badges={p.badges} />
            </div>
          </div>
        </ChartCard>
      </div>
    </Section>
  );
}
