import { describe, expect, it } from 'vitest';
import { boDau, dapChoGoiY, traLoi } from './troLy';
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

describe('boDau', () => {
  it('bỏ dấu tiếng Việt và hạ chữ thường', () => {
    expect(boDau('Chương Máy học như thế nào')).toBe('chuong may hoc nhu the nao');
  });

  it('đổi cả đ và Đ — hai chữ này không phải dấu tổ hợp', () => {
    expect(boDau('Đường độ')).toBe('duong do');
  });

  it('gom khoảng trắng thừa', () => {
    expect(boDau('  Lan   truyền  ngược ')).toBe('lan truyen nguoc');
  });
});

describe('traLoi', () => {
  const bc = baoCao();
  const troLy = troLyBaoCao(bc);

  it('câu rỗng thì trả về câu đỡ', () => {
    expect(traLoi(troLy, '   ')).toBe(troLy.doNhau);
  });

  it('câu không liên quan thì trả về câu đỡ chứ không đoán bừa', () => {
    expect(traLoi(troLy, 'mai troi co mua khong')).toBe(troLy.doNhau);
  });

  it('gõ không dấu vẫn khớp', () => {
    expect(traLoi(troLy, 'bai nao yeu nhat')).not.toBe(troLy.doNhau);
    expect(traLoi(troLy, 'bai nao yeu nhat')).toBe(traLoi(troLy, 'Bài nào yếu nhất?'));
  });

  it('hỏi tên một bài thì được giảng lại ý chính của bài đó', () => {
    const dap = traLoi(troLy, 'lan truyền ngược là gì');
    expect(dap).toContain('sai số được truyền ngược');
    // và luôn kèm vị trí của bài trong khoá, để câu trả lời gắn với chính khoá này
    expect(dap).toContain('thuộc chương');
  });

  it('câu trả lời về chương yếu nhất nói đúng tên chương thấp nhất', () => {
    const thap = [...bc.radar].sort((a, b) => a.nam - b.nam)[0];
    expect(traLoi(troLy, 'chương nào yếu')).toContain(thap.truc);
  });

  /**
   * Luật cụ thể không được để luật chung nuốt: "trọng số hoàn thành" phải ra câu về vòng
   * tiến trình, không ra câu về sơ đồ — dù cả hai đều có từ "trọng số".
   */
  it('luật khớp nhiều từ khoá hơn thì thắng', () => {
    const dap = traLoi(troLy, 'trọng số hoàn thành 100% nghĩa là gì');
    expect(dap).toContain('NỘI DUNG đã đi qua');
  });
});

describe('chip gợi ý', () => {
  /**
   * Test quan trọng nhất của file: chip nào cũng phải ra câu trả lời thật. Một chip rơi
   * vào câu đỡ là ngõ cụt ngay trước mắt người học — mời họ bấm rồi bảo "chưa có sẵn".
   */
  it('mọi chip của báo cáo đều có luật khớp, không cái nào rơi vào câu đỡ', () => {
    const troLy = troLyBaoCao(baoCao());
    for (const g of troLy.goiY) {
      expect(dapChoGoiY(troLy, g), `chip "${g.hoi}" không có câu trả lời`).not.toBe(troLy.doNhau);
    }
  });

  it('mọi chip của trang học bài cũng vậy', () => {
    const troLy = troLyBaiHoc({ khoa: 'AI cơ bản đến thực tiễn', bai: 'Lan truyền ngược' });
    for (const g of troLy.goiY) {
      expect(dapChoGoiY(troLy, g), `chip "${g.hoi}" không có câu trả lời`).not.toBe(troLy.doNhau);
    }
  });

  it('chip nào cũng gõ tay lại được — id không phải đường duy nhất', () => {
    const troLy = troLyBaoCao(baoCao());
    for (const g of troLy.goiY) {
      expect(traLoi(troLy, g.hoi), `gõ tay "${g.hoi}" lại rơi vào câu đỡ`).not.toBe(troLy.doNhau);
    }
  });
});

describe('troLyBaiHoc', () => {
  it('bài có sẵn lời giải thích thì dùng lời đó', () => {
    const troLy = troLyBaiHoc({ khoa: 'AI cơ bản đến thực tiễn', bai: 'Dữ liệu huấn luyện' });
    expect(traLoi(troLy, 'dữ liệu huấn luyện')).toContain('bộ ví dụ dùng để dạy máy');
  });

  it('bài chưa có lời giải thích thì vẫn trả lời được, không rơi vào câu đỡ', () => {
    const troLy = troLyBaiHoc({ khoa: 'Khoá nào đó', bai: 'Một bài chưa soạn lời' });
    const dap = traLoi(troLy, 'một bài chưa soạn lời');
    expect(dap).not.toBe(troLy.doNhau);
    expect(dap).toContain('Khoá nào đó');
  });
});
