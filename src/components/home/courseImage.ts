import dayNhom from '../../assets/landing/cards/day-nhom.jpg';
import docSach from '../../assets/landing/cards/doc-sach.jpg';
import elearning from '../../assets/landing/cards/elearning.jpg';
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
 * Tranh minh hoạ của trang chủ, cắt ra từ chính bản thiết kế (Figma node 550:11174).
 * Sáu ảnh lớn cho thẻ khoá học, tám ảnh nhỏ cho các cột xếp theo chủ đề.
 */
const LARGE = [elearning, hocOnline, lopHoc, docSach, dayNhom, tuHoc];
const THUMBS = [tnMayTinh, tnThuVien, tnBangDen, tnHocNhom, tnHoiHoc, tnBeGai, tnHoiThao, tnLopVe];

/**
 * Chia ảnh theo thứ tự khoá học trong danh sách, không băm mã khoá. Băm thì hay đụng:
 * ba trong bốn thẻ của hàng đầu từng ra cùng một ảnh, nhìn như trang bị lỗi tải ảnh.
 * Chia đều theo thứ tự thì mỗi hàng bốn thẻ luôn được bốn ảnh khác nhau.
 */
const ORDER: Map<string, number> = new Map(getCourses().map((c, i) => [c.id, i]));

const indexOf = (id: string): number => ORDER.get(id) ?? 0;

/**
 * Ảnh lớn của một khoá.
 *
 * `slot` là vị trí của thẻ trong hàng đang vẽ. Truyền nó vào thì một hàng bốn thẻ chắc
 * chắn được bốn ảnh khác nhau — dựa vào mã khoá thì hai khoá cách nhau đúng sáu bậc lại
 * ra cùng ảnh, và một hàng có hai thẻ giống nhau trông như trang lỗi tải ảnh.
 * Không truyền thì rơi về thứ tự khoá, dùng cho những chỗ vẽ lẻ một thẻ.
 */
export function courseImage(id: string, slot?: number): string {
  const i = slot ?? indexOf(id);
  return LARGE[((i % LARGE.length) + LARGE.length) % LARGE.length];
}

/** Ảnh nhỏ cho các cột xếp theo chủ đề. */
export function courseThumb(id: string, slot?: number): string {
  const i = slot ?? indexOf(id);
  return THUMBS[((i % THUMBS.length) + THUMBS.length) % THUMBS.length];
}
