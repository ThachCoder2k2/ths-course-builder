import { minutesLabel } from '../behavior/format';
import type { BaoCaoKhoa } from '../behavior/completion';
import { GIAI_THICH_BAI } from './kienThuc';
import { boDau, type CauGoiY, type LuatTraLoi, type TroLy } from './troLy';

/**
 * Kho câu trả lời của Course AI — dựng từ số thật của khoá, không có mô hình nào đứng sau.
 *
 * Chia làm ba nhóm, đúng ba việc mà bảng chat này nhận: giải thích chính bản báo cáo, gợi ý
 * bước tiếp theo, và hỏi đáp kiến thức trong khoá.
 *
 * Cách viết: nói con số trước, rồi nói con số đó nghĩa là gì, rồi một việc làm được ngay.
 * Không khen, không hứa, không "AI phân tích cho thấy".
 */

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Câu chốt cho một bài: nằm chương nào, chiếm bao nhiêu khoá, đang nắm bao nhiêu. */
function viTriBai(bc: BaoCaoKhoa, label: string): string {
  const nut = bc.nut.find((n) => n.label === label);
  if (!nut) return '';
  return ` Trong khoá này bài đó thuộc chương "${nut.chuong}", chiếm ${pct(nut.phan)} khoá, và bạn đang nắm ${pct(nut.mastery)}.`;
}

/** Một luật cho mỗi bài của khoá: hỏi tên bài thì được giảng lại ý chính. */
function luatKienThuc(bc: BaoCaoKhoa): LuatTraLoi[] {
  return bc.nut.map((n) => ({
    id: `bai:${n.id}`,
    tu: [boDau(n.label)],
    dap: (GIAI_THICH_BAI[n.label] ?? `"${n.label}" là một bài trong khoá này.`) + viTriBai(bc, n.label),
  }));
}

export function troLyBaoCao(bc: BaoCaoKhoa): TroLy {
  const chuongThap = [...bc.radar].sort((a, b) => a.nam - b.nam)[0];
  const chuongCao = [...bc.radar].sort((a, b) => b.nam - a.nam)[0];
  const yeu = bc.yeuNhat;
  const tonNhat = [...bc.thanh].sort((a, b) => b.thucTe - a.thucTe)[0];
  const lechNhat = [...bc.thanh].sort((a, b) => b.thucTe - b.chuan - (a.thucTe - a.chuan))[0];
  const baBaiYeu = [...bc.nut].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const phutOn = baBaiYeu.reduce((a, n) => a + Math.max(5, Math.round((bc.thanh.find((t) => t.conceptId === n.id)?.chuan ?? 5) / 2)), 0);

  const luat: LuatTraLoi[] = [
    {
      id: 'chuong-yeu',
      tu: ['chuong nao yeu', 'chuong thap', 'chuong yeu', boDau(chuongThap.truc), 'vi sao chuong'],
      dap:
        `Trong ${bc.radar.length} chương thì "${chuongThap.truc}" đang thấp nhất: ${pct(chuongThap.nam)} trung bình của ${chuongThap.soBai} bài. ` +
        `Chương cao nhất là "${chuongCao.truc}" với ${pct(chuongCao.nam)}. ` +
        `Chênh kiểu này thường do một hai bài trong chương chưa vững chứ không phải cả chương — xem sơ đồ, nút nào còn vàng thì bắt đầu từ đó.`,
    },
    {
      id: 'yeu-nhat',
      tu: ['bai nao yeu', 'yeu nhat', 'nam thap nhat', 'thap nhat', 'kem nhat', 'bai te nhat'],
      dap: yeu
        ? `Bài bạn nắm thấp nhất khoá là "${yeu.label}", ${pct(yeu.mastery)}, thuộc chương "${yeu.chuong}". ` +
          `Bài đó chiếm ${pct(yeu.phan)} khoá nên nó có sức nặng thật. ` +
          `Mở lại bài, làm lại phần bài tập một lượt rồi tự chấm — đọc lại đáp án thì thường vẫn quên.`
        : 'Khoá này chưa có bài nào thấp hẳn so với các bài còn lại.',
    },
    {
      id: 'ton-thoi-gian',
      tu: ['ton thoi gian', 'lau nhat', 'nhieu thoi gian nhat', 'bai nao lau', 'mat nhieu thoi gian'],
      dap: tonNhat
        ? `Bài tốn nhiều thời gian nhất là "${tonNhat.label}": bạn bỏ ra ${minutesLabel(tonNhat.thucTe)} cho một bài giảng dài ${minutesLabel(tonNhat.chuan)}. ` +
          `Phần chênh thường là lúc tua lại hoặc dừng lại ngẫm. Bài lệch nhiều nhất so với độ dài bài giảng là "${lechNhat.label}".`
        : 'Khoá này chưa đủ dữ liệu thời gian để so.',
    },
    {
      id: 'radar-hai-hinh',
      tu: ['hinh hong', 'hong', 'hai hinh', 'radar', 'chan dung nang luc', 'hinh xanh', 'khac nhau cho nao'],
      dap:
        'Hình hồng bên ngoài là phần nội dung của mỗi chương bạn đã đi qua. Cả khoá đã xem hết nên nó gần như đều tăm tắp. ' +
        'Hình xanh bên trong là mức bạn nắm được. ' +
        `Khoảng hở giữa hai hình chính là chỗ đã học qua mà chưa đọng lại, và chỗ hở rộng nhất là chương "${chuongThap.truc}".`,
    },
    {
      id: 'vong-hoan-thanh',
      tu: ['100%', 'trong so hoan thanh', 'vong tron', 'tien trinh', 'hoan thanh', 'vong xanh'],
      dap:
        `Vòng đó đếm phần NỘI DUNG đã đi qua, tính theo độ dài bài giảng — không phải mức nắm. ${pct(bc.hoanThanh)} nghĩa là bạn đã xem hết ${bc.soBai} bài. ` +
        `Mức nắm là con số khác: trung bình cả khoá ${pct(bc.nam)}. Nó nằm ở radar và ở màu các nút trên sơ đồ.`,
    },
    {
      id: 'so-do',
      tu: ['so do', 'mang luoi', 'nut to nho', 'mau nut', 'nut mau', 'trong so cua bai', 'vong tron mau'],
      dap:
        'Mỗi nút là một bài. Nút to nhỏ theo phần bài đó chiếm trong khoá, tính theo độ dài bài giảng — bài nặng thì nút to. ' +
        'Màu theo mức nắm: xanh là đã vững từ 75% trở lên, cam là tạm được, vàng là còn yếu. ' +
        'Bấm vào một nút thì dải chi tiết bên dưới đổi theo bài đó.',
    },
    {
      id: 'ban-do-nhiet',
      tu: ['ban do nhiet', 'o dam', 'o nhat', 'deu dan', 'nhiet', 'thap cao', 'o vuong'],
      dap:
        'Mỗi ô là một ngày trong 12 tuần gần đây, ô càng đậm là ngày đó học càng nhiều. Hàng là thứ trong tuần, cột là tuần. ' +
        'Nhìn ngang một hàng là biết bạn có đều vào thứ đó hay không; cột trắng là tuần nghỉ.' +
        (bc.chuoi > 0 ? ` Hiện bạn đang có chuỗi ${bc.chuoi} ngày liền.` : ''),
    },
    {
      id: 'cap-thanh',
      tu: ['cap thanh', 'thanh dam', 'thanh nhat', 'thoi gian nghien cuu', 'thoi gian hoc chuan', 'bieu do thanh'],
      dap:
        'Thanh đậm là thời gian bạn thật sự bỏ ra, thanh nhạt là độ dài bài giảng. ' +
        'Thanh đậm dài hơn nhiều là bài phải vật lộn; ngắn hơn là bài xem một lượt cho trôi. ' +
        `Trong khoá này lệch nhiều nhất là "${lechNhat.label}".`,
    },
    {
      id: 'on-gi-truoc',
      tu: ['on gi truoc', 'on lai gi', 'lam gi tiep', 'buoc tiep theo', 'bat dau tu dau', 'uu tien', 'nen on'],
      dap:
        'Ba bài nên vào trước, xếp từ thấp lên:\n' +
        baBaiYeu.map((n, i) => `${i + 1}. ${n.label} — đang ${pct(n.mastery)}, chương "${n.chuong}"`).join('\n') +
        `\nLàm lại bài tập của ba bài này mất khoảng ${minutesLabel(phutOn)}. Làm một bài một lượt, đừng dồn cả ba vào một buổi.`,
    },
    {
      id: 'mat-bao-lau',
      tu: ['bao lau', 'may phut', 'mat bao nhieu thoi gian', 'ton bao lau'],
      dap:
        `Ba bài yếu nhất, mỗi bài làm lại bài tập một lượt, tổng khoảng ${minutesLabel(phutOn)}. ` +
        `Cả khoá bạn đã bỏ ra ${minutesLabel(bc.phut)} cho ${bc.soBai} bài, nên phần ôn này nhỏ hơn hẳn phần đã học.`,
    },
    {
      id: 'khi-nao-quay-lai',
      tu: ['khi nao quay lai', 'khi nao on', 'bao lau thi quen', 'quay lai luc nao', 'on lai khi nao'],
      dap:
        'Chỗ mới học mờ nhanh nhất trong tuần đầu. Với khoá này, ôn lần đầu sau 2–3 ngày và lần hai sau khoảng một tuần là đủ để giữ. ' +
        `Ba bài yếu ở trên nên vào lượt đầu; những bài đã trên 75% thì để lượt sau cũng được.`,
    },
    {
      id: 'chuoi-ngay',
      tu: ['chuoi', 'bao nhieu ngay lien', 'streak', 'hoc lien tuc'],
      dap:
        bc.chuoi > 0
          ? `Bạn đang có chuỗi ${bc.chuoi} ngày học liền. Chuỗi tính theo ngày có ít nhất một buổi học, không tính theo số phút.`
          : 'Hiện chưa có chuỗi ngày nào đang chạy. Chuỗi tính theo ngày có ít nhất một buổi học.',
    },
    ...luatKienThuc(bc),
  ];

  const goiY: CauGoiY[] = [
    { id: 'chuong-yeu', hoi: `Vì sao chương "${chuongThap.truc}" chỉ ${pct(chuongThap.nam)}?` },
    { id: 'on-gi-truoc', hoi: 'Bài nào nên ôn lại trước?' },
    { id: 'radar-hai-hinh', hoi: 'Hình hồng với hình xanh khác nhau chỗ nào?' },
    ...(yeu ? [{ id: `bai:${yeu.id}`, hoi: `"${yeu.label}" là gì?` }] : []),
  ];

  return {
    chao: `Đây là báo cáo khoá "${bc.title}". Bạn hỏi về bất cứ con số nào đang thấy trên màn, hoặc về một bài trong khoá cũng được.`,
    goiY,
    luat,
    doNhau:
      'Câu này chưa có sẵn trong bản demo. Bạn thử hỏi về một con số trên báo cáo — chương nào yếu, bài nào tốn thời gian, nên ôn gì trước — hoặc gõ tên một bài trong khoá.',
  };
}

/**
 * Trợ lý ở trang học bài. Cùng bộ máy, khác kho câu trả lời: ở đây chưa có báo cáo cuối
 * khoá nên không nói được số liệu tổng, chỉ nói về bài đang mở.
 */
export function troLyBaiHoc({ khoa, bai }: { khoa: string; bai: string }): TroLy {
  const giaiThich = GIAI_THICH_BAI[bai];

  const luat: LuatTraLoi[] = [
    {
      id: 'bai-nay',
      tu: [boDau(bai), 'bai nay la gi', 'noi dung bai', 'bai nay noi ve gi'],
      dap: giaiThich ?? `"${bai}" là bài bạn đang mở trong khoá "${khoa}". Phần giảng nằm ngay trong video ở giữa trang.`,
    },
    {
      id: 'kho-o-cho-nao',
      tu: ['kho o cho nao', 'kho nhat', 'de sai', 'de vap', 'hay sai'],
      dap:
        'Chỗ hay vấp nhất thường là đoạn có nhiều bước liên tiếp: xem một lượt thì hiểu, nhưng tự làm lại thì tắc ở bước giữa. ' +
        'Cách kiểm nhanh: tắt video, tự kể lại bài theo ba bước. Kể tới đâu tắc thì tua lại đúng đoạn đó.',
    },
    {
      id: 'xem-xong-lam-gi',
      tu: ['xem xong', 'lam gi tiep', 'buoc tiep theo', 'sau bai nay'],
      dap:
        'Xem xong thì làm phần bài tập của bài trước khi sang bài mới — làm ngay lúc còn nhớ thì đỡ phải xem lại cả video. ' +
        'Nếu đang bí, mở lại đúng đoạn có chỗ bí thay vì xem lại từ đầu.',
    },
    {
      id: 'tua-lai',
      tu: ['tua lai', 'xem lai', 'nghe lai', 'toc do'],
      dap:
        'Tua lại một đoạn hai ba lần là chuyện thường, không phải dấu hiệu học kém. ' +
        'Nhưng nếu tua lại cả bài lần thứ ba mà vẫn thấy mờ thì thường là thiếu bài trước nó, không phải bài này khó.',
    },
    {
      id: 'ghi-chu',
      tu: ['ghi chu', 'ghi lai', 'note', 'chep bai'],
      dap:
        'Ghi ba dòng là đủ: bài này giải quyết chuyện gì, làm theo mấy bước, và chỗ nào mình còn chưa chắc. ' +
        'Dòng thứ ba mới là dòng có giá trị lúc ôn lại.',
    },
  ];

  return {
    chao: `Bạn đang học bài "${bai}" trong khoá "${khoa}". Hỏi về bài này, hoặc bấm một câu gợi ý bên dưới.`,
    goiY: [
      { id: 'bai-nay', hoi: `"${bai}" là gì?` },
      { id: 'kho-o-cho-nao', hoi: 'Bài này khó ở chỗ nào?' },
      { id: 'xem-xong-lam-gi', hoi: 'Xem xong nên làm gì?' },
    ],
    luat,
    doNhau:
      'Câu này chưa có sẵn trong bản demo. Bạn thử hỏi về bài đang mở, hoặc bấm một câu gợi ý bên dưới.',
  };
}
