import dayNhom from '../../assets/landing/cards/day-nhom.jpg';
import hocTuongTac from '../../assets/landing/cards/hoc-tuong-tac.jpg';
import docSach from '../../assets/landing/cards/doc-sach.jpg';
import hocOnline from '../../assets/landing/cards/hoc-online.jpg';
import lopHoc from '../../assets/landing/cards/lop-hoc.jpg';
import tuHoc from '../../assets/landing/cards/tu-hoc.jpg';

import tnBangDen from '../../assets/landing/cards/tn-bang-den.jpg';
import tnBeGai from '../../assets/landing/cards/tn-be-gai.jpg';
import tnHocNhom from '../../assets/landing/cards/tn-hoc-nhom.jpg';
import tnHoiHoc from '../../assets/landing/cards/tn-hoi-hoc.jpg';
import tnHoiThao from '../../assets/landing/cards/tn-hoi-thao.jpg';
import tnLopVe from '../../assets/landing/cards/tn-lop-ve.jpg';
import tnMayTinh from '../../assets/landing/cards/tn-may-tinh.jpg';
import tnThuVien from '../../assets/landing/cards/tn-thu-vien.jpg';
import { getCourses } from '../../mock';

/**
 * Tranh minh hoạ cho thẻ khoá học, cắt ra từ chính bản thiết kế (Figma node 550:11174).
 *
 * `elearning.jpg` — ảnh của thẻ đầu tiên trong thiết kế — có logo VNPT ở góc trên trái và
 * logo oneSKILL ở góc trên phải, nướng sẵn vào ảnh gốc của Figma. Dùng logo đơn vị khác
 * trên một trang thật là không được, nên tấm đó đã bị cắt bỏ 64px phần trên (chỗ chứa cả
 * hai logo) và lưu lại thành `hoc-tuong-tac.jpg`. Phần tranh còn lại giữ nguyên.
 *
 * MỖI KHOÁ MỘT ẢNH RIÊNG. Bản trước nhận thêm tham số `slot` là vị trí của thẻ trong hàng
 * và ưu tiên nó tuyệt đối (`slot ?? indexOf(id)`), nên mọi hàng bốn thẻ đều lấy đúng bốn
 * ảnh đầu kho theo đúng một thứ tự: 16 ô trên trang chỉ hiện 4 tấm, còn hai tấm thì không
 * bao giờ được vẽ. Ý ban đầu là chống trùng TRONG một hàng, nhưng hệ quả là bốn hàng
 * giống hệt nhau — tệ hơn hẳn cái nó định chữa.
 *
 * Nay chia theo thứ tự khoá: hàng nào hiện khoá khác thì tự nhiên ra ảnh khác.
 *
 * `tn-hoi-hoc.jpg` KHÔNG có trong kho ảnh lớn dù nó là một file riêng: so pixel thì nó và
 * `day-nhom.jpg` là CÙNG MỘT TRANH cắt ở hai cỡ (khoảng cách 7.8, trong khi mọi cặp còn
 * lại đều từ 36.7 trở lên). Để cả hai thì hai thẻ cạnh nhau vẫn trông y nhau dù là hai
 * file khác — đúng cái lỗi đang muốn chữa. Nó vẫn dùng cho các ô ảnh nhỏ 116×84 bên dưới,
 * nơi nó không bao giờ đứng cạnh `day-nhom`.
 *
 * Còn 13 tranh cho 14 khoá, nên đúng một cặp khoá buộc phải dùng chung ảnh. Bảng `GAN`
 * bên dưới đặt cặp đó vào khoá thứ 4 và thứ 8 — hai khoá này chỉ xuất hiện ở hai mục KHÁC
 * nhau nên không bao giờ đứng cùng một hàng. Nếu để mặc định (chia lấy dư 13) thì cặp đụng
 * rơi vào khoá thứ 0 và thứ 13, mà hai khoá đó cùng nằm trong "Khoá học nổi bật".
 *
 * Bảng này gắn với danh sách 14 khoá hiện tại. Có một test canh việc "không hàng nào chứa
 * hai ảnh giống nhau", nên đổi dữ liệu khoá mà quên sửa bảng thì test sẽ đỏ.
 */
const ANH = [
  hocTuongTac,
  hocOnline,
  lopHoc,
  docSach,
  dayNhom,
  tuHoc,
  tnMayTinh,
  tnThuVien,
  tnBangDen,
  tnHocNhom,
  tnBeGai,
  tnHoiThao,
  tnLopVe,
];

/** Tám tấm nhỏ dùng cho các cột xếp theo chủ đề, nơi ô ảnh chỉ 116×84. */
const NHO = [tnMayTinh, tnThuVien, tnBangDen, tnHocNhom, tnHoiHoc, tnBeGai, tnHoiThao, tnLopVe];

const THU_TU: Map<string, number> = new Map(getCourses().map((c, i) => [c.id, i]));

const viTri = (id: string): number => THU_TU.get(id) ?? 0;

/**
 * Khoá thứ mấy dùng tranh thứ mấy. Khoá 4 và khoá 8 dùng chung tranh thứ 4 — đó là cặp
 * buộc phải trùng vì kho ít hơn số khoá một tấm, và hai khoá đó nằm ở hai mục khác nhau.
 */
const GAN = [0, 1, 2, 3, 4, 5, 6, 7, 4, 8, 9, 10, 11, 12];

/** Ảnh của một khoá. Cùng một khoá thì luôn cùng một ảnh, ở bất cứ chỗ nào trên trang. */
export function courseImage(id: string): string {
  const i = viTri(id);
  const chiSo = i < GAN.length ? GAN[i] : i % ANH.length;
  return ANH[chiSo % ANH.length];
}

/** Ảnh nhỏ cho các cột xếp theo chủ đề. */
export function courseThumb(id: string, slot?: number): string {
  const i = slot ?? viTri(id);
  return NHO[((i % NHO.length) + NHO.length) % NHO.length];
}
