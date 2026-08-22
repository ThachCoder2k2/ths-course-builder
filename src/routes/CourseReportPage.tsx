import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Flame, TriangleAlert } from 'lucide-react';
import { ReportCard } from '../components/report/ReportCard';
import { StrategyRadar } from '../components/report/charts/StrategyRadar';
import { RhythmHeatmap } from '../components/report/charts/RhythmHeatmap';
import { ConceptNetwork } from '../components/completion/ConceptNetwork';
import { ProgressRing } from '../components/completion/ProgressRing';
import { PairedBars } from '../components/completion/PairedBars';
import { baoCaoKhoa, type NutSoDo } from '../behavior/completion';
import { scope } from '../behavior/overview';
import { getBehaviorData } from '../behavior/seed';
import { COURSES, NOW, SPAN_DAYS, START } from '../behavior/catalog';
import { rhythmMatrix } from '../behavior/rhythm';
import { minutesLabel } from '../behavior/format';
import { Reveal } from '../components/ui/Reveal';
import { cn } from '../lib/cn';

/**
 * Báo cáo sau khi hoàn thành khoá học (Figma node 432:6863).
 *
 * Bố cục toàn màn hình, KHÔNG dùng thanh đầu trang của site: thiết kế cho một dải mảnh
 * riêng chỉ có mũi tên quay lại và tên khoá. Nên route này nằm ngoài PageShell.
 *
 * Số liệu lấy hết từ tầng sự kiện đang chạy trang /hoc-tap-cua-toi, nên hai trang không
 * bao giờ nói khác nhau. Thiết kế gốc viết cho luyện thi TSA; ba chỗ phải đổi ý nghĩa vì
 * khoá thật không có dữ liệu đề thi — xem chú thích trong `behavior/completion.ts`.
 *
 * Những chỗ trong thiết kế còn là bản nháp thì sửa, không sao y: mọi nút sơ đồ đều ghi
 * "Session Summary", cột bản đồ nhiệt có "T8" lặp bảy lần, trục radar có "Reading" và
 * "Vocabulary" mỗi cái hai lần, tiêu đề thẻ thiếu chữ ("tổng qua"), và một dòng mô tả
 * còn nguyên tiếng Anh.
 */
export default function CourseReportPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const khoa = COURSES.find((c) => c.slug === slug);
  const sts = useMemo(() => getBehaviorData('l1').statements, []);
  const tatCa = useMemo(() => scope(sts, { fromDay: 0, toDay: SPAN_DAYS + 1, courseId: null }), [sts]);
  const bc = useMemo(() => (khoa ? baoCaoKhoa(tatCa, khoa.id) : null), [tatCa, khoa]);

  // Bài đang chọn trên sơ đồ. Mặc định chọn bài YẾU NHẤT: mở báo cáo ra là thấy ngay chỗ
  // cần xem lại, chứ không phải bài đầu tiên vốn thường đã vững.
  const [chon, setChon] = useState<NutSoDo | null>(null);
  const dangChon = chon ?? bc?.yeuNhat ?? bc?.nut[0] ?? null;

  /**
   * Bản đồ nhiệt chỉ lấy 12 tuần gần nhất, không lấy cả năm.
   *
   * Cả năm thì `rhythmMatrix` chuyển sang chế độ theo tháng và ra 64 cột — 64 × 12px là
   * 768px, không vừa một thẻ nửa trang, nên lưới bị bóp đến mức không đọc được. 12 tuần
   * thì nó ra chế độ tuần × thứ: 12 cột, 7 hàng, đúng hình dạng của thiết kế.
   */
  const nhiet = useMemo(() => {
    if (!khoa) return null;
    const TUAN = 12;
    const tu = new Date(NOW.getTime() - TUAN * 7 * 86400000);
    const tuNgay = Math.max(0, SPAN_DAYS - TUAN * 7);
    return rhythmMatrix(scope(sts, { fromDay: tuNgay, toDay: SPAN_DAYS + 1, courseId: khoa.id }), tu, NOW);
  }, [sts, khoa]);

  if (!khoa || !bc || !dangChon) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-xl px-4 text-center">
        <h1 className="text-display-xs text-primary">Chưa có báo cáo cho khoá này</h1>
        <p className="max-w-[420px] text-md text-tertiary">
          Báo cáo chỉ mở khi bạn đã đi hết các bài của khoá. Hãy học tiếp rồi quay lại đây.
        </p>
        <Link to="/hoc-tap-cua-toi" className="ln-press ln-focus rounded-md bg-brand-500 px-xl py-lg text-md font-semibold text-white">
          Về Học tập của tôi
        </Link>
      </div>
    );
  }

  const chuoi = bc.chuoi;

  return (
    <div className="flex min-h-dvh flex-col bg-primary">
      {/* Dải đầu trang riêng: mũi tên quay lại và tên khoá, đúng như thiết kế. */}
      <header className="sticky top-0 z-30 flex h-20 shrink-0 items-center gap-xl border-b border-secondary bg-white/90 px-4 backdrop-blur lg:px-6xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          aria-label="Quay lại"
          className="ln-press ln-focus flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-secondary hover:bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <p className="min-w-0 truncate text-lg font-semibold text-primary">{khoa.title}</p>
      </header>

      <main className="mx-auto flex w-full max-w-[1440px] flex-col gap-3xl px-4 pb-9xl pt-6xl lg:px-6xl">
        <div className="flex flex-col items-center gap-xs text-center">
          <p className="text-sm font-semibold text-brand-secondary">Bạn đã hoàn thành khoá học</p>
          <h1 className="text-display-sm text-primary lg:text-display-lg">Báo cáo kết quả toàn khoá</h1>
        </div>

        {/* Hàng 1: sơ đồ mạng lưới (rộng) + vòng tiến trình (hẹp) */}
        <div className="grid w-full grid-cols-1 gap-3xl xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)]">
          {/* Bọc Reveal không chỉ để có hiệu ứng hiện khi cuộn tới: các ô của bản đồ nhiệt
              mang class `rp-cell` với `opacity: 0` cho tới khi một tổ tiên có `rp-in`, mà
              chính Reveal là thứ gắn class đó. Thiếu nó thì 366 ô vẫn nằm trong DOM nhưng
              vô hình — đúng lỗi đã gặp. */}
          <Reveal className="flex">
          <ReportCard
            title="Sơ đồ mạng lưới các bài trong khoá"
            subtitle="Nút to nhỏ theo phần bài đó chiếm trong khoá; màu theo mức bạn đã nắm"
          >
            <div className="flex flex-col gap-xl">
              <ConceptNetwork bc={bc} dangChon={dangChon} onChon={setChon} />

              {/*
                Dải nhãn này là đường chọn BẢO ĐẢM, không phải phần trang trí. Vòng tròn
                trên sơ đồ nhỏ nhất chỉ 36px và ở khổ hẹp còn co lại nữa, mà 14 nút × 44px
                là 616px — rộng hơn cả màn hình 390px, nên không có cách xê dịch nào cho
                đủ ngưỡng chạm trên chính sơ đồ. Ở đây mỗi bài một nhãn cao 44px, cuộn
                ngang được, đi bằng bàn phím được, và là thứ trình đọc màn hình đọc thấy.
              */}
              <ul
                className="cp-chips flex gap-md overflow-x-auto overscroll-x-contain pb-xs"
                aria-label="Chọn bài để xem chi tiết"
              >
                {bc.nut.map((n) => (
                  <li key={n.id} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => setChon(n)}
                      aria-pressed={n.id === dangChon.id}
                      className={cn(
                        'ln-press ln-focus-flat flex h-11 items-center gap-sm whitespace-nowrap rounded-pill px-lg text-sm',
                        n.id === dangChon.id
                          ? 'bg-brand-500 font-semibold text-white'
                          : 'bg-secondary text-secondary hover:bg-tertiary',
                      )}
                    >
                      <span
                        aria-hidden="true"
                        className="h-2 w-2 shrink-0 rounded-full"
                        style={{ background: n.mastery >= 0.75 ? '#17B26A' : n.mastery >= 0.5 ? '#F79009' : '#EAAA08' }}
                      />
                      {n.label}
                    </button>
                  </li>
                ))}
              </ul>

              {/* Dải chi tiết của bài đang chọn — đúng chỗ thiết kế đặt nó, và là thứ mà
                  câu "Nhấp chọn các nút…" ở thẻ bên cạnh hứa. */}
              <div className="flex flex-col gap-md rounded-lg bg-secondary p-xl">
                <div className="flex flex-wrap items-start justify-between gap-lg">
                  <p className="text-md font-semibold text-brand-secondary">Bài: {dangChon.label}</p>
                  {chuoi > 0 ? (
                    <span className="flex shrink-0 items-center gap-sm rounded-pill bg-utility-success-50 px-md py-xxs text-xs font-semibold text-utility-success-700">
                      <Flame className="h-3 w-3" aria-hidden="true" />
                      Chuỗi {chuoi} ngày
                    </span>
                  ) : null}
                </div>
                <p className="text-sm text-tertiary">
                  Thuộc chương <strong className="font-semibold text-secondary">{dangChon.chuong}</strong> · Chiếm{' '}
                  <strong className="font-semibold text-secondary">{Math.round(dangChon.phan * 100)}%</strong> khoá · Đã nắm{' '}
                  <strong className="font-semibold text-secondary">{Math.round(dangChon.mastery * 100)}%</strong>
                </p>
                {bc.yeuNhat && dangChon.id === bc.yeuNhat.id ? (
                  <p className="flex items-start gap-sm text-sm text-utility-orange-700">
                    <TriangleAlert className="mt-[3px] h-4 w-4 shrink-0" aria-hidden="true" />
                    <span>
                      Đây là bài bạn nắm thấp nhất khoá. Nếu ôn lại một bài thôi thì nên là bài này — mở lại phần bài tập
                      rồi tự làm lại một lượt, đừng chỉ xem đáp án.
                    </span>
                  </p>
                ) : null}
              </div>
            </div>
          </ReportCard>
          </Reveal>

          <Reveal order={1} className="flex">
          <ReportCard title="Tiến trình khoá học tổng quan" subtitle="Phần nội dung bạn đã đi qua">
            <div className="flex flex-1 flex-col items-center justify-center gap-xl">
              <ProgressRing giaTri={bc.hoanThanh} nhan="Đã hoàn thành" />
              <p className="text-center text-sm text-tertiary">
                Bấm vào các nút trên sơ đồ bên cạnh để xem chi tiết từng bài. Cả khoá có{' '}
                <strong className="font-semibold text-secondary">{bc.soBai} bài</strong>, bạn đã học{' '}
                <strong className="font-semibold text-secondary">{minutesLabel(bc.phut)}</strong>.
              </p>
            </div>
          </ReportCard>
          </Reveal>
        </div>

        {/* Hàng 2: radar theo chương + bản đồ nhiệt */}
        <div className="grid w-full grid-cols-1 gap-3xl xl:grid-cols-2">
          <Reveal className="flex">
          <ReportCard
            title="Chân dung năng lực theo chương"
            subtitle={`Mỗi trục là một chương của khoá; giá trị là mức nắm trung bình các bài trong chương`}
          >
            <div className="flex flex-col gap-xl">
              {/* Tên chương đầy đủ dài tới bốn năm chữ, đặt quanh radar là bị mép thẻ cắt.
                  Nên trục dùng tên ngắn, còn tên đầy đủ để ở danh sách bên dưới kèm con số —
                  đọc được cả hai thứ mà không chồng chữ. */}
              <StrategyRadar axes={bc.radar.map((r, i) => ({ key: r.truc, label: `C${i + 1}`, value: r.nam }))} />
              <ul className="flex flex-col gap-md">
                {bc.radar.map((r, i) => (
                  <li key={r.truc} className="flex items-baseline justify-between gap-lg text-sm">
                    <span className="min-w-0 text-tertiary">
                      <strong className="font-semibold text-secondary">C{i + 1}</strong> · {r.truc}
                    </span>
                    <span className="shrink-0 tabular-nums font-semibold text-secondary">{Math.round(r.nam * 100)}%</span>
                  </li>
                ))}
              </ul>
            </div>
          </ReportCard>
          </Reveal>

          <Reveal order={1} className="flex">
          <ReportCard
            title="Bản đồ nhiệt tính đều đặn"
            subtitle="Mỗi ô là một ngày; càng đậm là ngày đó học càng nhiều"
            badge={
              chuoi > 0 ? (
                <span className="flex items-center gap-sm rounded-pill bg-utility-success-50 px-md py-xxs text-xs font-semibold text-utility-success-700">
                  <Flame className="h-3 w-3" aria-hidden="true" />
                  Chuỗi {chuoi} ngày
                </span>
              ) : undefined
            }
          >
            {nhiet ? <RhythmHeatmap matrix={nhiet} /> : null}
          </ReportCard>
          </Reveal>
        </div>

        {/* Hàng 3: cặp thanh thời gian, chạy hết bề ngang */}
        <Reveal className="flex">
        <ReportCard
          title="Thời gian học từng bài"
          subtitle="So thời gian bạn thật sự bỏ ra với độ dài bài giảng — bài nào lệch nhiều là bài phải vật lộn"
        >
          <PairedBars rows={bc.thanh} />
        </ReportCard>
        </Reveal>
      </main>
    </div>
  );
}
