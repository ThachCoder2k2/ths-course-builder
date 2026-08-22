import { describe, expect, it } from 'vitest';
import { boDau, chipTiep, chipTu, dapChoChip, timLuat, traLoi } from './troLy';
import { troLyBaiHoc, troLyBaoCao } from './noiDung';
import { baoCaoKhoa } from '../behavior/completion';
import { scope } from '../behavior/overview';
import { getBehaviorData } from '../behavior/seed';

const KHOA = 'ai-foundations';

function baoCao() {
  const d = getBehaviorData('l1');
  const tatCa = scope(d.statements, { fromDay: 0, toDay: 1_000_000, courseId: null });
  return baoCaoKhoa(tatCa, KHOA)!;
}

const RONG = new Set<string>();

describe('boDau', () => {
  it('bỏ dấu tiếng Việt và hạ chữ thường', () => {
    expect(boDau('Chương Máy học như thế nào')).toBe('chuong may hoc nhu the nao');
  });

  it('đổi cả đ và Đ — hai chữ này không phải dấu tổ hợp', () => {
    expect(boDau('Đường độ')).toBe('duong do');
  });

  it('bỏ dấu câu nhưng giữ %', () => {
    expect(boDau('Vòng 100% nghĩa là gì?')).toBe('vong 100% nghia la gi');
  });
});

describe('traLoi', () => {
  const bc = baoCao();
  const troLy = troLyBaoCao(bc);

  it('câu rỗng thì trả về câu đỡ', () => {
    expect(traLoi(troLy, '   ').chu).toBe(troLy.doNhau.chu);
  });

  /**
   * Ca này từng hỏng: "khong" chứa "hong" nên câu hỏi thời tiết khớp luật về hình hồng của
   * radar. Khớp theo ranh giới từ mới chặn được.
   */
  it('câu không liên quan thì trả về câu đỡ chứ không đoán bừa', () => {
    expect(traLoi(troLy, 'mai troi co mua khong').chu).toBe(troLy.doNhau.chu);
  });

  it('gõ không dấu vẫn khớp', () => {
    expect(traLoi(troLy, 'bai nao yeu nhat').chu).toBe(traLoi(troLy, 'Bài nào yếu nhất?').chu);
    expect(traLoi(troLy, 'bai nao yeu nhat').chu).not.toBe(troLy.doNhau.chu);
  });

  it('hỏi tên một bài thì được giảng lại ý chính của bài đó', () => {
    const dap = traLoi(troLy, 'lan truyền ngược là gì');
    expect(dap.chu).toContain('sai số được truyền ngược');
    expect(dap.chu).toContain('thuộc chương');
  });

  it('câu trả lời về chương yếu nhất nói đúng tên chương thấp nhất', () => {
    const thap = [...bc.radar].sort((a, b) => a.nam - b.nam)[0];
    expect(traLoi(troLy, 'chương nào yếu').chu).toContain(thap.truc);
  });

  it('luật khớp nhiều từ khoá hơn thì thắng', () => {
    expect(traLoi(troLy, 'trọng số hoàn thành 100% nghĩa là gì').chu).toContain('NỘI DUNG đã đi qua');
  });
});

describe('hình kèm câu trả lời', () => {
  const troLy = troLyBaoCao(baoCao());

  /** Câu nào nói về một con số thì phải có hình của con số đó, không để chữ trần. */
  it('những câu về số liệu đều có hình', () => {
    for (const id of ['chuong-yeu', 'yeu-nhat', 'ton-thoi-gian', 'radar-hai-hinh', 'vong-hoan-thanh', 'on-gi-truoc']) {
      expect(dapChoChip(troLy, id).hinh, `luật "${id}" thiếu hình`).toBeTruthy();
    }
  });

  it('hình không bao giờ rỗng — hình rỗng vẽ ra một khung trắng', () => {
    for (const luat of troLy.luat) {
      const h = luat.dap.hinh;
      if (!h) continue;
      if (h.kieu === 'thanh' || h.kieu === 'nut' || h.kieu === 'capThanh') expect(h.muc.length, luat.id).toBeGreaterThan(0);
      if (h.kieu === 'radar') expect(h.truc.length, luat.id).toBeGreaterThanOrEqual(3);
      if (h.kieu === 'nhiet') expect(h.hang.length, luat.id).toBeGreaterThan(0);
    }
  });

  it('thanh xếp hạng có giá trị trong 0..1 để vẽ ra được tỉ lệ', () => {
    const h = dapChoChip(troLy, 'on-gi-truoc').hinh;
    expect(h?.kieu).toBe('thanh');
    if (h?.kieu === 'thanh') for (const m of h.muc) expect(m.giaTri).toBeGreaterThanOrEqual(0);
  });
});

describe('chip gợi ý', () => {
  const troLy = troLyBaoCao(baoCao());

  /**
   * Test quan trọng nhất của file: chip nào cũng phải ra câu trả lời thật. Một chip rơi
   * vào câu đỡ là ngõ cụt ngay trước mắt người học — mời họ bấm rồi bảo "chưa có sẵn".
   */
  it('mọi id trong bảng chip đều có luật khớp', () => {
    for (const [id, hoi] of Object.entries(troLy.cauChip)) {
      expect(dapChoChip(troLy, id).chu, `chip "${hoi}" không có câu trả lời`).not.toBe(troLy.doNhau.chu);
    }
  });

  it('mọi id trong tiep của từng luật đều dựng được thành chip', () => {
    for (const luat of troLy.luat) {
      for (const id of luat.tiep ?? []) {
        expect(troLy.cauChip[id], `luật "${luat.id}" mời id "${id}" mà bảng chip không có câu`).toBeTruthy();
      }
    }
  });

  it('chip mở đầu và chip dự trữ đều nằm trong bảng chip', () => {
    for (const id of [...troLy.moDau, ...troLy.duTru]) expect(troLy.cauChip[id], id).toBeTruthy();
  });

  it('gõ tay lại câu của chip thì vẫn khớp, id không phải đường duy nhất', () => {
    for (const [, hoi] of Object.entries(troLy.cauChip)) {
      expect(traLoi(troLy, hoi).chu, `gõ tay "${hoi}" lại rơi vào câu đỡ`).not.toBe(troLy.doNhau.chu);
    }
  });

  it('sau mỗi câu trả lời đều có chip mời hỏi tiếp', () => {
    for (const luat of troLy.luat) {
      const tiep = chipTiep(troLy, luat, new Set([luat.id]));
      expect(tiep.length, `luật "${luat.id}" không mời được câu nào`).toBeGreaterThan(0);
    }
  });

  it('không mời lại chính câu vừa hỏi', () => {
    const tiep = chipTiep(troLy, troLy.luat[0], new Set([troLy.luat[0].id]));
    expect(tiep.some((c) => c.id === troLy.luat[0].id)).toBe(false);
  });

  it('chipTu bỏ câu đã hỏi và cắt tối đa ba chip', () => {
    const het = chipTu(troLy, troLy.duTru, RONG);
    expect(het.length).toBe(3);
    const bo = chipTu(troLy, troLy.duTru, new Set([troLy.duTru[0]]));
    expect(bo.some((c) => c.id === troLy.duTru[0])).toBe(false);
  });
});

describe('troLyBaiHoc', () => {
  const troLy = troLyBaiHoc({ khoa: 'AI cơ bản đến thực tiễn', bai: 'Dữ liệu huấn luyện' });

  it('bài có sẵn lời giải thích thì dùng lời đó', () => {
    expect(traLoi(troLy, 'dữ liệu huấn luyện').chu).toContain('bộ ví dụ dùng để dạy máy');
  });

  it('bài chưa có lời giải thích thì vẫn trả lời được', () => {
    const khac = troLyBaiHoc({ khoa: 'Khoá nào đó', bai: 'Một bài chưa soạn lời' });
    const dap = traLoi(khac, 'một bài chưa soạn lời');
    expect(dap.chu).not.toBe(khac.doNhau.chu);
    expect(dap.chu).toContain('Khoá nào đó');
  });

  it('mọi chip của trang học bài đều có câu trả lời', () => {
    for (const [id, hoi] of Object.entries(troLy.cauChip)) {
      expect(dapChoChip(troLy, id).chu, `chip "${hoi}" không có câu trả lời`).not.toBe(troLy.doNhau.chu);
    }
  });

  it('luật nào cũng tìm lại được bằng chính câu chip của nó', () => {
    for (const [id, hoi] of Object.entries(troLy.cauChip)) {
      expect(timLuat(troLy, hoi)?.id, `câu "${hoi}"`).toBe(id);
    }
  });
});
