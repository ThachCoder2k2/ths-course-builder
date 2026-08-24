import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AlertCircle, ArrowLeft, Flame, PartyPopper } from 'lucide-react';
import { ReportCard } from '../components/report/ReportCard';
import { RhythmHeatmap } from '../components/report/charts/RhythmHeatmap';
import { ConceptNetwork } from '../components/completion/ConceptNetwork';
import { CompetencyRadar } from '../components/completion/CompetencyRadar';
import { ProgressRing } from '../components/completion/ProgressRing';
import { PairedBars } from '../components/completion/PairedBars';
import { baoCaoKhoa, type NutSoDo } from '../behavior/completion';
import { scope } from '../behavior/overview';
import { getBehaviorData } from '../behavior/seed';
import { COURSES, NOW, SPAN_DAYS } from '../behavior/catalog';
import { baoCaoTuKhoaMock, luoiNhietMock } from '../behavior/baoCaoMock';
import { getCourseBySlug } from '../mock';
import { dropHint, rhythmMatrix } from '../behavior/rhythm';
import { minutesLabel } from '../behavior/format';
import { Reveal } from '../components/ui/Reveal';
import FloatingChatbot from '../components/learn/FloatingChatbot';
import CourseAiPanel from '../components/learn/CourseAiPanel';
import { troLyBaoCao } from '../ai/noiDung';
import { PhaoBong } from '../components/completion/PhaoBong';
import { useMoDong } from '../lib/useMoDong';
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

  /**
   * Báo cáo mở được cho MỌI khoá của thư viện.
   *
   * Tầng sự kiện chỉ phủ 18 khoá của `behavior/catalog`, mà thư viện site có 19 khoá khác
   * và hai bộ chỉ trùng nhau một slug. Nên khoá nào không có sự kiện thì dựng báo cáo từ
   * chính bài học của nó trong thư viện — xem `behavior/baoCaoMock.ts`.
   */
  const bc = useMemo(() => {
    const thuc = khoa ? baoCaoKhoa(tatCa, khoa.id) : null;
    if (thuc) return thuc;
    const trongThuVien = slug ? getCourseBySlug(slug) : undefined;
    return trongThuVien ? baoCaoTuKhoaMock(trongThuVien) : null;
  }, [tatCa, khoa, slug]);

  // Bài đang chọn trên sơ đồ. Mặc định chọn bài YẾU NHẤT: mở báo cáo ra là thấy ngay chỗ
  // cần xem lại, chứ không phải bài đầu tiên vốn thường đã vững.
  const [chon, setChon] = useState<NutSoDo | null>(null);
  const [aiMo, setAiMo] = useState(false);
  // Chỉ trả tiêu điểm về con robot SAU lần mở đầu tiên; lúc mới vào trang thì không.
  const [daMoAi, setDaMoAi] = useState(false);
  // Một lượt bắn mỗi lần vào trang: component dựng lại là `lanPhao` mới, `PhaoBong` dựng lại
  // hình mảnh giấy theo đó.
  const [lanPhao] = useState(() => Math.floor(Math.random() * 100000));
  // Bảng chat ra khỏi DOM sau 170ms để chạy được animation đóng, không biến mất đột ngột.
  const { hienThi: aiHien, dangDong: aiDangDong } = useMoDong(aiMo, 170);
  const dangChon = chon ?? bc?.yeuNhat ?? bc?.nut[0] ?? null;

  /**
   * Bản đồ nhiệt chỉ lấy 12 tuần gần nhất, không lấy cả năm.
   *
   * Cả năm thì `rhythmMatrix` chuyển sang chế độ theo tháng và ra 64 cột — 64 × 12px là
   * 768px, không vừa một thẻ nửa trang, nên lưới bị bóp đến mức không đọc được. 12 tuần
   * thì nó ra chế độ tuần × thứ: 12 cột, 7 hàng, đúng hình dạng của thiết kế.
   */
  const nhiet = useMemo(() => {
    // Khoá không có sự kiện thì lưới nhiệt cũng dựng ra, để thẻ nhịp độ không trống trơn.
    if (!khoa) return slug ? { luoi: luoiNhietMock(slug), boDo: null } : null;
    const TUAN = 12;
    const tu = new Date(NOW.getTime() - TUAN * 7 * 86400000);
    const tuNgay = Math.max(0, SPAN_DAYS - TUAN * 7);
    const trongKhoang = scope(sts, { fromDay: tuNgay, toDay: SPAN_DAYS + 1, courseId: khoa.id });
    const luoi = rhythmMatrix(trongKhoang, tu, NOW);
    // Thiết kế có một dòng "Phát hiện vùng bỏ dở ở …" ngay dưới lưới. `dropHint` đã có
    // sẵn cho thẻ nhịp độ ở trang Học tập của tôi nên dùng lại, không viết mới.
    return { luoi, boDo: dropHint(trongKhoang, luoi.mode) };
  }, [sts, khoa]);

  // Truyền cả lưới nhiệt vào kho câu trả lời: câu về nhịp độ mới vẽ được dải ô, chứ không
  // chỉ tả bằng chữ. Phải khai báo SAU `nhiet` — trước thì dùng biến chưa có.
  const troLy = useMemo(() => (bc ? troLyBaoCao(bc, nhiet?.luoi ?? null) : null), [bc, nhiet]);

  if (!bc || !dangChon) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-xl px-4 text-center">
        <h1 className="text-display-xs text-primary">Chưa có gì để báo cáo</h1>
        <p className="max-w-[420px] text-md text-tertiary">
          Khoá này bạn chưa có buổi học nào. Học một bài rồi quay lại đây là có báo cáo ngay — không phải
          học hết khoá mới xem được.
        </p>
        <Link to="/hoc-tap-cua-toi" className="ln-press ln-focus rounded-md bg-brand-500 px-xl py-lg text-md font-semibold text-white">
          Về Học tập của tôi
        </Link>
      </div>
    );
  }

  const chuoi = bc.chuoi;
  /**
   * Báo cáo mở được BẤT CỨ LÚC NÀO, không đợi học hết khoá. Cờ này chỉ để đổi lời chào và
   * để bắn pháo bông — nội dung báo cáo thì giống nhau, chỉ khác con số.
   *
   * "Hoàn thành khoá" ở đây là ĐÃ ĐI HẾT BÀI, cùng con số với vòng tiến trình ngay bên dưới.
   * Có thử lấy mốc "mọi bài đạt mức nắm 50%" cho chặt hơn, nhưng thế thì một khoá xem trọn
   * vẹn lại hiện vòng 100% kèm dòng "chưa xong" — hai câu chỏi nhau ngay cạnh nhau. Hoàn
   * thành và nắm vững là hai chuyện; chỗ nào chưa vững thì nói riêng ở dòng dưới.
   */
  const xongKhoa = bc.hoanThanh >= 0.999;
  const chuaVung = bc.nut.filter((n) => n.mastery < 0.5).length;

  /**
   * Hai con số và một nhận xét cho dải chi tiết, đúng ba ô mà thiết kế đã chừa.
   *
   * Nhận xét chỉ nói lại điều số liệu đã cho thấy — bài tốn thời gian nhất, hoặc bài nắm
   * thấp nhất, hoặc so thời gian bỏ ra với độ dài bài giảng. Thiết kế còn thêm một câu
   * khuyên cách học cụ thể ("Đọc kỹ quy tắc phép quay khối đa diện"); câu đó phải do người
   * soạn nội dung viết cho từng bài, tôi không tự sinh ra ở đây.
   */
  const thanhBai = bc.thanh.find((t) => t.conceptId === dangChon.id);
  const phutBai = thanhBai?.thucTe ?? 0;
  const tonNhat = bc.thanh.reduce<typeof thanhBai>((a, t) => (!a || t.thucTe > a.thucTe ? t : a), undefined);
  const nhanXet =
    tonNhat && tonNhat.conceptId === dangChon.id
      ? `Đây là phần tốn nhiều thời gian nhất của bạn (${minutesLabel(phutBai)}).`
      : bc.yeuNhat && bc.yeuNhat.id === dangChon.id
        ? `Đây là phần bạn nắm thấp nhất khoá (${Math.round(dangChon.mastery * 100)}%).`
        : `Bạn bỏ ra ${minutesLabel(phutBai)} cho phần này, bài giảng dài ${minutesLabel(thanhBai?.chuan ?? 0)}.`;

  return (
    /* Nền trang #FAFAFA, chỉ dải đầu trang và các thẻ mới trắng — đo từ ảnh xuất của
       frame. Trước đây cả trang trắng nên thẻ chìm hẳn vào nền. */
    <div className="flex min-h-dvh flex-col bg-secondary">
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
        <p className="min-w-0 truncate text-lg font-semibold text-primary">{bc.title}</p>
      </header>

      {/*
        Mở bảng chat thì ĐẨY nội dung sang, không phủ lên — người học phần lớn hỏi về con số
        đang xem, phủ lên là che mất thứ họ đang hỏi. Nên hàng này chứa hai cột.

        Chỉ đẩy từ xl. Ở 1024 mà cắt 360px thì sơ đồ mạng lưới và cặp thanh không còn bề
        ngang để đọc, nên dưới xl bảng thành tấm phủ (xem class của CourseAiPanel bên dưới).
      */}
      {/*
        Mở bảng chat thì NỚI LỀ, không bóp nội dung.

        Bình thường khung nội dung chốt 1440px và căn giữa, nên ở 1920 mỗi bên còn 240px lề
        trắng. Mở bảng thì nới trần lên 1824 (1440 + 24 khe + 360 bảng): phần chỗ cho bảng
        lấy từ LỀ trước, cột báo cáo giữ nguyên bề rộng. Chỉ khi lề hết mới đến lượt cột
        báo cáo hẹp lại — ở 1920 thì không bao giờ tới lượt đó.

        `transition-[max-width]`: nới đột ngột thì cả trang giật một nhịp, còn nới có
        chuyển tiếp thì nó đi cùng nhịp với bảng đang trượt vào.
      */}
      <div
        className={cn(
          'mx-auto flex w-full flex-1 items-start gap-3xl px-4 pb-9xl pt-6xl transition-[max-width] duration-300 ease-out lg:px-6xl',
          aiMo ? 'xl:max-w-[1824px]' : 'max-w-[1440px]',
          !aiMo && 'max-w-[1440px]',
        )}
      >
      <main className="flex min-w-0 flex-1 flex-col gap-3xl">
        <div className="flex flex-col items-center gap-md text-center">
          {xongKhoa ? (
            <p className="ln-chuc-mung flex items-center gap-sm rounded-pill bg-success-50 px-xl py-md text-sm font-semibold text-success-700 ring-1 ring-success-200">
              <PartyPopper className="h-4 w-4" aria-hidden="true" />
              Chúc mừng, bạn đã hoàn thành khoá học
            </p>
          ) : (
            <p className="text-sm font-semibold text-brand-secondary">
              Bạn đã đi qua {Math.round(bc.hoanThanh * 100)}% khoá này
            </p>
          )}
          <h1 className="text-display-sm text-primary lg:text-display-lg">Báo cáo kết quả toàn khoá</h1>
          {/* Đi hết bài không có nghĩa là nắm hết. Nói thẳng chỗ chưa vững ngay dưới lời
              chúc, để bản báo cáo không thành một lời khen suông. */}
          {chuaVung > 0 ? (
            <p className="text-sm text-tertiary">
              Còn <strong className="font-semibold text-secondary">{chuaVung} bài</strong> chưa vững — xem sơ đồ bên dưới,
              nút nào còn vàng là bài đó.
            </p>
          ) : null}
        </div>

        {/* Hàng 1: sơ đồ mạng lưới (rộng) + vòng tiến trình (hẹp) */}
        <div className="grid w-full grid-cols-1 gap-3xl xl:grid-cols-[minmax(0,2.75fr)_minmax(0,1fr)]">
          {/* Bọc Reveal không chỉ để có hiệu ứng hiện khi cuộn tới: các ô của bản đồ nhiệt
              mang class `rp-cell` với `opacity: 0` cho tới khi một tổ tiên có `rp-in`, mà
              chính Reveal là thứ gắn class đó. Thiếu nó thì 366 ô vẫn nằm trong DOM nhưng
              vô hình — đúng lỗi đã gặp. */}
          <Reveal className="flex">
          <ReportCard
            title="Sơ đồ mạng lưới chủ đề theo trọng số"
            subtitle="Kích thước nút biểu diễn trọng số của bài trong khoá học"
          >
            <div className="flex flex-col gap-xl">
              {/*
                Sơ đồ CUỘN NGANG ở khung hẹp thay vì co lại.

                Trước đây tôi thêm bên dưới một dải chip "mỗi bài một nhãn" để có đủ ngưỡng
                chạm 44px. Thiết kế không có dải đó, và ở 1440 nó còn bị mép thẻ cắt mất
                chữ. Cách của chính thiết kế là bấm thẳng vào nút, nên giữ cách đó: khoá bề
                rộng tối thiểu của sơ đồ lại, khung hẹp thì kéo ngang. Nút không bị co nữa
                nên vẫn đủ to để chạm, và mỗi nút là một nút bấm đi được bằng bàn phím.
              */}
              <div className="-mx-xs overflow-x-auto overscroll-x-contain px-xs pb-xs">
                <div className="min-w-[720px]">
                  <ConceptNetwork bc={bc} dangChon={dangChon} onChon={setChon} />
                </div>
              </div>

              {/* Dải chi tiết của bài đang chọn. Thiết kế xếp đúng ba dòng: tên bài (màu
                  #20447E) kèm chip chuỗi ngày, một dòng hai số liệu, rồi một dòng
                  "AI khuyến nghị" mở đầu bằng mũi tên màu #FA4C2F. */}
              <div className="flex flex-col gap-md rounded-lg bg-secondary p-xl">
                <div className="flex flex-wrap items-start justify-between gap-lg">
                  <p className="text-md font-semibold text-[#20447E]">Bài: {dangChon.label}</p>
                  {chuoi > 0 ? (
                    <span className="flex shrink-0 items-center gap-sm rounded-pill bg-success-50 px-md py-xxs text-xs font-semibold text-success-700 ring-1 ring-success-200">
                      <Flame className="h-3 w-3" aria-hidden="true" />
                      Chuỗi {chuoi} ngày
                    </span>
                  ) : null}
                </div>
                <p className="flex flex-wrap gap-x-3xl gap-y-xs text-sm text-tertiary">
                  <span>
                    Trọng số trong khoá:{' '}
                    <strong className="font-semibold text-secondary">{Math.round(dangChon.phan * 100)}%</strong>
                  </span>
                  <span>
                    Thời gian đã học: <strong className="font-semibold text-secondary">{minutesLabel(phutBai)}</strong>
                  </span>
                </p>
                <p className="text-sm text-tertiary">
                  <span className="font-semibold text-[#FA4C2F]">→ AI khuyến nghị: </span>
                  {nhanXet}
                </p>
              </div>
            </div>
          </ReportCard>
          </Reveal>

          <Reveal order={1} className="flex">
          <ReportCard title="Tiến trình khoá học tổng quan" subtitle="Kết quả tổng quan">
            <div className="flex flex-1 flex-col items-center justify-center gap-2xl">
              <ProgressRing giaTri={bc.hoanThanh} nhan="Trọng số hoàn thành" />
              {/* Câu này là chữ của thiết kế, không phải tôi viết thêm — và nó chính là
                  thứ giải thích cho việc bấm được vào các nút bên cạnh. */}
              <p className="text-center text-sm text-tertiary">
                Nhấp chọn các nút trên sơ đồ mạng lưới bên cạnh để xem chi tiết học tập và cập nhật tiến trình
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
            subtitle="Viền hồng là phần nội dung đã đi qua, hình xanh là mức bạn nắm được"
          >
            {/* Hai lớp như thiết kế, cả hai đều là số thật: lớp ngoài là tiến độ của
                chương, lớp trong là mức nắm. Tên chương ghi thẳng lên trục kèm giá trị,
                nên không cần bảng chú giải nào ở dưới. */}
            <CompetencyRadar truc={bc.radar.map((r) => ({ label: r.truc, nam: r.nam, tienDo: r.tienDo }))} />
          </ReportCard>
          </Reveal>

          <Reveal order={1} className="flex">
          <ReportCard
            title="Bản đồ nhiệt tính đều đặn học tập"
            subtitle="Mỗi ô là một ngày; càng đậm là ngày đó học càng nhiều"
            badge={
              chuoi > 0 ? (
                <span className="flex items-center gap-sm rounded-pill bg-success-50 px-md py-xxs text-xs font-semibold text-success-700 ring-1 ring-success-200">
                  <Flame className="h-3 w-3" aria-hidden="true" />
                  Chuỗi {chuoi} ngày
                </span>
              ) : undefined
            }
          >
            {nhiet ? (
              <div className="flex flex-col gap-xl">
                <RhythmHeatmap matrix={nhiet.luoi} nhan={['Thấp', 'Cao']} />
                {nhiet.boDo ? (
                  <p className="flex items-start gap-md text-sm text-quaternary">
                    <AlertCircle className="mt-xxs h-5 w-5 shrink-0 text-error-600" aria-hidden="true" />
                    <span>
                      Phát hiện vùng bỏ dở {nhiet.boDo.when} — {nhiet.boDo.count} lần dừng giữa bài.
                    </span>
                  </p>
                ) : null}
              </div>
            ) : null}
          </ReportCard>
          </Reveal>
        </div>

        {/* Hàng 3: cặp thanh thời gian, chạy hết bề ngang */}
        <Reveal className="flex">
        <ReportCard
          title="Thời gian nghiên cứu từng chủ đề bài giảng"
          subtitle="So sánh thời gian học thực tế (phút) của bạn với độ dài bài giảng"
        >
          <PairedBars rows={bc.thanh} />
        </ReportCard>
        </Reveal>
      </main>

      {/*
        MỘT thẻ duy nhất, đổi cách định vị theo khổ — không dựng hai bản, vì hai bản là hai
        cuộc hội thoại riêng và người học đóng bảng ở khổ này mở ở khổ kia là mất hết.

        Dưới xl: fixed, nên nó ra khỏi luồng và hàng không chừa chỗ.
        Từ xl: static rồi sticky, dính dưới dải đầu trang cao 80px cộng 24px lề trên.
      */}
      {aiHien && troLy ? (
        <CourseAiPanel
          troLy={troLy}
          onClose={() => setAiMo(false)}
          className={cn(
            'fixed inset-x-4 bottom-4 top-[104px] z-40 shadow-lg xl:sticky xl:inset-auto xl:top-[104px] xl:z-auto xl:h-[calc(100dvh-128px)] xl:shadow-none',
            aiDangDong ? 'ln-ai-ra' : 'ln-ai-vao',
          )}
        />
      ) : null}
      </div>

      {/* Khổ hẹp: bảng phủ gần hết màn nên cần một lớp mờ phía sau, bấm ra ngoài là đóng. */}
      {aiHien ? (
        <button
          type="button"
          aria-label="Đóng Course AI"
          onClick={() => setAiMo(false)}
          className={cn('fixed inset-0 z-30 bg-black/20 transition-opacity duration-200 xl:hidden', aiDangDong && 'opacity-0')}
        />
      ) : null}

      {aiHien ? null : (
        <FloatingChatbot
          onOpen={() => {
            setAiMo(true);
            setDaMoAi(true);
          }}
          traLaiTieuDiem={daMoAi}
        />
      )}

      {/* Pháo bông bắn mỗi lần vào báo cáo của một khoá đã học hết. */}
      {xongKhoa ? <PhaoBong lan={lanPhao} /> : null}
    </div>
  );
}
