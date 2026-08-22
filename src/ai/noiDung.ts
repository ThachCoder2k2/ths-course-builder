import { minutesLabel } from '../behavior/format';
import type { BaoCaoKhoa } from '../behavior/completion';
import type { RhythmMatrix } from '../behavior/rhythm';
import { GIAI_THICH_BAI } from './kienThuc';
import { boDau, type HinhTraLoi, type LuatTraLoi, type TroLy } from './troLy';

/**
 * Kho câu trả lời của Course AI — dựng từ số thật của khoá, không có mô hình nào đứng sau.
 *
 * Chia làm ba nhóm, đúng ba việc mà bảng chat này nhận: giải thích chính bản báo cáo, gợi ý
 * bước tiếp theo, và hỏi đáp kiến thức trong khoá.
 *
 * Câu nào nói về một con số thì kèm HÌNH của con số đó. Chữ trần bắt người đọc tự dựng hình
 * trong đầu; một dãy thanh hay một vòng nhỏ nói cùng ý đó trong một cái nhìn.
 *
 * Cách viết chữ: nói con số trước, rồi nói con số đó nghĩa là gì, rồi một việc làm được ngay.
 * Không khen, không hứa, không "AI phân tích cho thấy".
 */

const pct = (v: number) => `${Math.round(v * 100)}%`;

/** Ba bậc màu của sơ đồ mạng lưới — dùng lại cho hình trong câu trả lời cho khỏi lệch nhau. */
export function mauTheoNam(nam: number): string {
  if (nam >= 0.75) return '#75E0A7';
  if (nam >= 0.5) return '#F7B27A';
  return '#FDE272';
}

/** Câu chốt cho một bài: nằm chương nào, chiếm bao nhiêu khoá, đang nắm bao nhiêu. */
function viTriBai(bc: BaoCaoKhoa, label: string): string {
  const nut = bc.nut.find((n) => n.label === label);
  if (!nut) return '';
  return ` Trong khoá này bài đó thuộc chương "${nut.chuong}", chiếm ${pct(nut.phan)} khoá, và bạn đang nắm ${pct(nut.mastery)}.`;
}

/** Dải nhiệt thu nhỏ: lấy 10 cột cuối cho vừa bề rộng bảng chat 360px. */
function hinhNhiet(nhiet: RhythmMatrix | null): HinhTraLoi | undefined {
  if (!nhiet || nhiet.mode !== 'weekday') return undefined;
  const lay = 10;
  const hang = nhiet.rowLabels.map((ten, r) => ({
    ten,
    o: (nhiet.cells[r] ?? []).slice(-lay).map((c) => c?.minutes ?? 0),
  }));
  return { kieu: 'nhiet', hang };
}

export function troLyBaoCao(bc: BaoCaoKhoa, nhiet: RhythmMatrix | null = null): TroLy {
  const theoNam = [...bc.radar].sort((a, b) => a.nam - b.nam);
  const chuongThap = theoNam[0];
  const chuongCao = theoNam[theoNam.length - 1];
  const yeu = bc.yeuNhat;
  const tonNhat = [...bc.thanh].sort((a, b) => b.thucTe - a.thucTe)[0];
  const lechNhat = [...bc.thanh].sort((a, b) => b.thucTe - b.chuan - (a.thucTe - a.chuan))[0];
  const baBaiYeu = [...bc.nut].sort((a, b) => a.mastery - b.mastery).slice(0, 3);
  const phutOn = baBaiYeu.reduce(
    (a, n) => a + Math.max(5, Math.round((bc.thanh.find((t) => t.conceptId === n.id)?.chuan ?? 5) / 2)),
    0,
  );
  const nhietHinh = hinhNhiet(nhiet);
  const idBaiYeu = yeu ? `bai:${yeu.id}` : null;

  const hinhRadar: HinhTraLoi = {
    kieu: 'radar',
    truc: bc.radar.map((r) => ({ label: r.truc, nam: r.nam, tienDo: r.tienDo })),
  };

  const luat: LuatTraLoi[] = [
    {
      id: 'chuong-yeu',
      tu: ['chuong nao yeu', 'chuong thap', 'chuong yeu', boDau(chuongThap.truc), 'vi sao chuong'],
      tiep: ['on-gi-truoc', 'radar-hai-hinh', ...(idBaiYeu ? [idBaiYeu] : [])],
      dap: {
        chu:
          `Trong ${bc.radar.length} chương thì "${chuongThap.truc}" đang thấp nhất: ${pct(chuongThap.nam)} trung bình của ${chuongThap.soBai} bài. ` +
          `Chương cao nhất là "${chuongCao.truc}" với ${pct(chuongCao.nam)}. ` +
          `Chênh kiểu này thường do một hai bài trong chương chưa vững chứ không phải cả chương.`,
        hinh: {
          kieu: 'thanh',
          muc: theoNam.map((r) => ({
            ten: r.truc,
            giaTri: r.nam,
            phu: pct(r.nam),
            mau: mauTheoNam(r.nam),
          })),
        },
      },
    },
    {
      id: 'yeu-nhat',
      tu: ['bai nao yeu', 'yeu nhat', 'nam thap nhat', 'thap nhat', 'kem nhat', 'bai te nhat'],
      tiep: ['on-gi-truoc', 'khi-nao-quay-lai', ...(idBaiYeu ? [idBaiYeu] : [])],
      dap: yeu
        ? {
            chu:
              `Bài bạn nắm thấp nhất khoá là "${yeu.label}", ${pct(yeu.mastery)}, thuộc chương "${yeu.chuong}". ` +
              `Bài đó chiếm ${pct(yeu.phan)} khoá nên nó có sức nặng thật. ` +
              `Mở lại bài, làm lại phần bài tập một lượt rồi tự chấm — đọc lại đáp án thì thường vẫn quên.`,
            hinh: { kieu: 'nut', muc: baBaiYeu.map((n) => ({ ten: n.label, nam: n.mastery })) },
          }
        : { chu: 'Khoá này chưa có bài nào thấp hẳn so với các bài còn lại.' },
    },
    {
      id: 'ton-thoi-gian',
      tu: ['ton thoi gian', 'lau nhat', 'nhieu thoi gian nhat', 'bai nao lau', 'mat nhieu thoi gian'],
      tiep: ['cap-thanh', 'yeu-nhat'],
      dap: tonNhat
        ? {
            chu:
              `Bài tốn nhiều thời gian nhất là "${tonNhat.label}": bạn bỏ ra ${minutesLabel(tonNhat.thucTe)} cho một bài giảng dài ${minutesLabel(tonNhat.chuan)}. ` +
              `Phần chênh thường là lúc tua lại hoặc dừng lại ngẫm. Bài lệch nhiều nhất so với độ dài bài giảng là "${lechNhat.label}".`,
            hinh: {
              kieu: 'capThanh',
              muc: [...bc.thanh].sort((a, b) => b.thucTe - a.thucTe).slice(0, 4).map((t) => ({
                ten: t.label,
                thucTe: t.thucTe,
                chuan: t.chuan,
              })),
            },
          }
        : { chu: 'Khoá này chưa đủ dữ liệu thời gian để so.' },
    },
    {
      id: 'radar-hai-hinh',
      tu: ['hinh hong', 'hong', 'hai hinh', 'radar', 'chan dung nang luc', 'hinh xanh', 'khac nhau cho nao'],
      tiep: ['chuong-yeu', 'vong-hoan-thanh'],
      dap: {
        chu:
          'Hình hồng bên ngoài là phần nội dung của mỗi chương bạn đã đi qua. Hình xanh bên trong là mức bạn nắm được. ' +
          `Khoảng hở giữa hai hình chính là chỗ đã học qua mà chưa đọng lại, và chỗ hở rộng nhất là chương "${chuongThap.truc}".`,
        hinh: hinhRadar,
      },
    },
    {
      id: 'vong-hoan-thanh',
      tu: ['100%', 'trong so hoan thanh', 'vong tron', 'tien trinh', 'hoan thanh', 'vong xanh'],
      tiep: ['radar-hai-hinh', 'so-do'],
      dap: {
        chu:
          `Vòng đó đếm phần NỘI DUNG đã đi qua, tính theo độ dài bài giảng — không phải mức nắm. ${pct(bc.hoanThanh)} là phần bạn đã xem trong ${bc.soBai} bài. ` +
          `Mức nắm là con số khác: trung bình cả khoá ${pct(bc.nam)}.`,
        hinh: { kieu: 'vong', giaTri: bc.hoanThanh, nhan: 'Đã đi qua' },
      },
    },
    {
      id: 'so-do',
      tu: ['so do', 'mang luoi', 'nut to nho', 'mau nut', 'nut mau', 'trong so cua bai', 'vong tron mau'],
      tiep: ['yeu-nhat', 'chuong-yeu'],
      dap: {
        chu:
          'Mỗi nút là một bài. Nút to nhỏ theo phần bài đó chiếm trong khoá, tính theo độ dài bài giảng — bài nặng thì nút to. ' +
          'Màu theo mức nắm: xanh là đã vững từ 75% trở lên, cam là tạm được, vàng là còn yếu.',
        hinh: {
          kieu: 'nut',
          muc: [...bc.nut].sort((a, b) => b.mastery - a.mastery).filter((_, i, all) => i === 0 || i === Math.floor(all.length / 2) || i === all.length - 1).map((n) => ({ ten: n.label, nam: n.mastery })),
        },
      },
    },
    {
      id: 'ban-do-nhiet',
      tu: ['ban do nhiet', 'o dam', 'o nhat', 'deu dan', 'nhiet', 'thap cao', 'o vuong'],
      tiep: ['chuoi-ngay', 'khi-nao-quay-lai'],
      dap: {
        chu:
          'Mỗi ô là một ngày, ô càng đậm là ngày đó học càng nhiều. Hàng là thứ trong tuần, cột là tuần. ' +
          'Nhìn ngang một hàng là biết bạn có đều vào thứ đó hay không; cột trắng là tuần nghỉ.' +
          (bc.chuoi > 0 ? ` Hiện bạn đang có chuỗi ${bc.chuoi} ngày liền.` : ''),
        hinh: nhietHinh,
      },
    },
    {
      id: 'cap-thanh',
      tu: ['cap thanh', 'thanh dam', 'thanh nhat', 'thoi gian nghien cuu', 'thoi gian hoc chuan', 'bieu do thanh'],
      tiep: ['ton-thoi-gian', 'mat-bao-lau'],
      dap: {
        chu:
          'Thanh đậm là thời gian bạn thật sự bỏ ra, thanh nhạt là độ dài bài giảng. ' +
          'Thanh đậm dài hơn nhiều là bài phải vật lộn; ngắn hơn là bài xem một lượt cho trôi. ' +
          `Trong khoá này lệch nhiều nhất là "${lechNhat.label}".`,
        hinh: {
          kieu: 'capThanh',
          muc: [...bc.thanh]
            .sort((a, b) => b.thucTe - b.chuan - (a.thucTe - a.chuan))
            .slice(0, 4)
            .map((t) => ({ ten: t.label, thucTe: t.thucTe, chuan: t.chuan })),
        },
      },
    },
    {
      id: 'on-gi-truoc',
      tu: ['on gi truoc', 'on lai gi', 'lam gi tiep', 'buoc tiep theo', 'bat dau tu dau', 'uu tien', 'nen on'],
      tiep: ['mat-bao-lau', 'khi-nao-quay-lai', ...(idBaiYeu ? [idBaiYeu] : [])],
      dap: {
        chu:
          'Ba bài nên vào trước, xếp từ thấp lên. ' +
          `Làm lại bài tập của ba bài này mất khoảng ${minutesLabel(phutOn)}. Làm một bài một lượt, đừng dồn cả ba vào một buổi.`,
        hinh: {
          kieu: 'thanh',
          muc: baBaiYeu.map((n) => ({
            ten: n.label,
            giaTri: n.mastery,
            phu: pct(n.mastery),
            mau: mauTheoNam(n.mastery),
          })),
        },
      },
    },
    {
      id: 'mat-bao-lau',
      tu: ['bao lau', 'may phut', 'mat bao nhieu thoi gian', 'ton bao lau'],
      tiep: ['on-gi-truoc', 'khi-nao-quay-lai'],
      dap: {
        chu:
          `Ba bài yếu nhất, mỗi bài làm lại bài tập một lượt, tổng khoảng ${minutesLabel(phutOn)}. ` +
          `Cả khoá bạn đã bỏ ra ${minutesLabel(bc.phut)}, nên phần ôn này nhỏ hơn hẳn phần đã học.`,
        hinh: {
          kieu: 'capThanh',
          muc: baBaiYeu.map((n) => {
            const t = bc.thanh.find((x) => x.conceptId === n.id);
            return { ten: n.label, thucTe: t?.thucTe ?? 0, chuan: t?.chuan ?? 0 };
          }),
        },
      },
    },
    {
      id: 'khi-nao-quay-lai',
      tu: ['quay lai', 'khi nao on', 'bao lau thi quen', 'quay lai luc nao', 'on lai khi nao'],
      tiep: ['on-gi-truoc', 'ban-do-nhiet'],
      dap: {
        chu:
          'Chỗ mới học mờ nhanh nhất trong tuần đầu. Với khoá này, ôn lần đầu sau 2–3 ngày và lần hai sau khoảng một tuần là đủ để giữ. ' +
          'Ba bài yếu nên vào lượt đầu; những bài đã trên 75% thì để lượt sau cũng được.',
      },
    },
    {
      id: 'chuoi-ngay',
      tu: ['chuoi', 'bao nhieu ngay lien', 'streak', 'hoc lien tuc'],
      tiep: ['ban-do-nhiet', 'khi-nao-quay-lai'],
      dap: {
        chu:
          bc.chuoi > 0
            ? `Bạn đang có chuỗi ${bc.chuoi} ngày học liền. Chuỗi tính theo ngày có ít nhất một buổi học, không tính theo số phút.`
            : 'Hiện chưa có chuỗi ngày nào đang chạy. Chuỗi tính theo ngày có ít nhất một buổi học.',
        hinh: nhietHinh,
      },
    },
    // Một luật cho mỗi bài: hỏi tên bài thì được giảng lại ý chính, kèm vòng mức nắm của bài.
    ...bc.nut.map<LuatTraLoi>((n) => ({
      id: `bai:${n.id}`,
      tu: [boDau(n.label)],
      tiep: ['on-gi-truoc', 'chuong-yeu'],
      dap: {
        chu: (GIAI_THICH_BAI[n.label] ?? `"${n.label}" là một bài trong khoá này.`) + viTriBai(bc, n.label),
        hinh: { kieu: 'vong', giaTri: n.mastery, nhan: 'Bạn đang nắm' },
      },
    })),
  ];

  const cauChip: Record<string, string> = {
    'chuong-yeu': `Vì sao chương "${chuongThap.truc}" chỉ ${pct(chuongThap.nam)}?`,
    'yeu-nhat': 'Bài nào mình nắm yếu nhất?',
    'ton-thoi-gian': 'Bài nào tốn nhiều thời gian nhất?',
    'radar-hai-hinh': 'Hình hồng với hình xanh khác nhau chỗ nào?',
    'vong-hoan-thanh': `Vòng ${pct(bc.hoanThanh)} đếm cái gì?`,
    'so-do': 'Nút to nhỏ và màu trên sơ đồ nghĩa là gì?',
    'ban-do-nhiet': 'Bản đồ nhiệt đọc thế nào?',
    'cap-thanh': 'Thanh đậm với thanh nhạt khác gì nhau?',
    'on-gi-truoc': 'Bài nào nên ôn lại trước?',
    'mat-bao-lau': 'Ôn lại mất khoảng bao lâu?',
    'khi-nao-quay-lai': 'Khi nào nên quay lại ôn?',
    'chuoi-ngay': 'Chuỗi ngày học của mình thế nào?',
    ...(yeu ? { [`bai:${yeu.id}`]: `"${yeu.label}" là gì?` } : {}),
  };

  return {
    chao: `Đây là báo cáo khoá "${bc.title}". Bạn hỏi về bất cứ con số nào đang thấy trên màn, hoặc về một bài trong khoá cũng được.`,
    cauChip,
    moDau: ['chuong-yeu', 'on-gi-truoc', 'radar-hai-hinh'],
    duTru: [
      'on-gi-truoc',
      'yeu-nhat',
      'ton-thoi-gian',
      'vong-hoan-thanh',
      'so-do',
      'ban-do-nhiet',
      'cap-thanh',
      'khi-nao-quay-lai',
      'mat-bao-lau',
      'chuoi-ngay',
      'chuong-yeu',
      'radar-hai-hinh',
    ],
    luat,
    doNhau: {
      chu: 'Câu này chưa có sẵn trong bản demo. Bạn thử hỏi về một con số trên báo cáo — chương nào yếu, bài nào tốn thời gian, nên ôn gì trước — hoặc gõ tên một bài trong khoá.',
    },
  };
}

/**
 * Trợ lý ở trang học bài. Cùng bộ máy, khác kho câu trả lời: ở đây chưa mở báo cáo nên
 * không nói được số liệu tổng, chỉ nói về bài đang mở.
 */
export function troLyBaiHoc({ khoa, bai }: { khoa: string; bai: string }): TroLy {
  const giaiThich = GIAI_THICH_BAI[bai];

  const luat: LuatTraLoi[] = [
    {
      id: 'bai-nay',
      tu: [boDau(bai), 'bai nay la gi', 'noi dung bai', 'bai nay noi ve gi'],
      tiep: ['kho-o-cho-nao', 'xem-xong-lam-gi'],
      dap: {
        chu: giaiThich ?? `"${bai}" là bài bạn đang mở trong khoá "${khoa}". Phần giảng nằm ngay trong video ở giữa trang.`,
      },
    },
    {
      id: 'kho-o-cho-nao',
      tu: ['kho o cho nao', 'kho nhat', 'de sai', 'de vap', 'hay sai'],
      tiep: ['ghi-chu', 'tua-lai'],
      dap: {
        chu:
          'Chỗ hay vấp nhất thường là đoạn có nhiều bước liên tiếp: xem một lượt thì hiểu, nhưng tự làm lại thì tắc ở bước giữa. ' +
          'Cách kiểm nhanh: tắt video, tự kể lại bài theo ba bước. Kể tới đâu tắc thì tua lại đúng đoạn đó.',
      },
    },
    {
      id: 'xem-xong-lam-gi',
      tu: ['xem xong', 'lam gi tiep', 'buoc tiep theo', 'sau bai nay'],
      tiep: ['ghi-chu', 'kho-o-cho-nao'],
      dap: {
        chu:
          'Xem xong thì làm phần bài tập của bài trước khi sang bài mới — làm ngay lúc còn nhớ thì đỡ phải xem lại cả video. ' +
          'Nếu đang bí, mở lại đúng đoạn có chỗ bí thay vì xem lại từ đầu.',
      },
    },
    {
      id: 'tua-lai',
      tu: ['tua lai', 'xem lai', 'nghe lai', 'toc do'],
      tiep: ['kho-o-cho-nao', 'ghi-chu'],
      dap: {
        chu:
          'Tua lại một đoạn hai ba lần là chuyện thường, không phải dấu hiệu học kém. ' +
          'Nhưng nếu tua lại cả bài lần thứ ba mà vẫn thấy mờ thì thường là thiếu bài trước nó, không phải bài này khó.',
      },
    },
    {
      id: 'ghi-chu',
      tu: ['ghi chu', 'ghi lai', 'note', 'chep bai'],
      tiep: ['xem-xong-lam-gi', 'tua-lai'],
      dap: {
        chu:
          'Ghi ba dòng là đủ: bài này giải quyết chuyện gì, làm theo mấy bước, và chỗ nào mình còn chưa chắc. ' +
          'Dòng thứ ba mới là dòng có giá trị lúc ôn lại.',
      },
    },
  ];

  return {
    chao: `Bạn đang học bài "${bai}" trong khoá "${khoa}". Hỏi về bài này, hoặc bấm một câu gợi ý bên dưới.`,
    cauChip: {
      'bai-nay': `"${bai}" là gì?`,
      'kho-o-cho-nao': 'Bài này khó ở chỗ nào?',
      'xem-xong-lam-gi': 'Xem xong nên làm gì?',
      'tua-lai': 'Tua lại nhiều có sao không?',
      'ghi-chu': 'Nên ghi chú thế nào?',
    },
    moDau: ['bai-nay', 'kho-o-cho-nao', 'xem-xong-lam-gi'],
    duTru: ['kho-o-cho-nao', 'xem-xong-lam-gi', 'ghi-chu', 'tua-lai', 'bai-nay'],
    luat,
    doNhau: {
      chu: 'Câu này chưa có sẵn trong bản demo. Bạn thử hỏi về bài đang mở, hoặc bấm một câu gợi ý bên dưới.',
    },
  };
}
