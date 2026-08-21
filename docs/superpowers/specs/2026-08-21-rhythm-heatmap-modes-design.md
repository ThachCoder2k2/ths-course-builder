# Lưới nhịp học đổi kiểu theo bộ lọc + sticky header

Ngày 21/08/2026. Trang `/hoc-tap-cua-toi`.

## Vấn đề

1. Lưới nhịp học luôn xếp hàng = thứ, cột = tuần trong tháng. Sau khi mọi thẻ chuyển sang
   đọc dữ liệu đã lọc, các mốc ngắn (24 giờ, 7 ngày) chỉ còn một hai cột, lưới trống hoác
   giữa một cái thẻ rất rộng.
2. Tên người học và bộ lọc cuộn mất khi đọc xuống dưới.
3. Bấm đổi bộ lọc thì cả trang bị kéo về đầu.

## Gốc của vấn đề 3

Không có dòng code nào tự cuộn. Đo được: bấm bằng JS thuần thì `scrollY 1400 → 1364`,
nhưng `focus()` rồi click thì `1400 → 0`. Chuột thật có focus, và trình duyệt luôn cuộn
phần tử đang focus vào tầm nhìn — thanh bộ lọc nằm trên đỉnh document nên cả trang bị kéo
lên. Vậy (2) và (3) cùng một gốc: làm thanh đó dính lại là hết cả hai.

## Thiết kế

### Bốn kiểu lưới, chọn theo độ dài khoảng

| Độ dài | Kiểu | Hàng × Cột |
|---|---|---|
| ≤ 2 ngày | `hour` | 1 × 24 giờ |
| 3–14 ngày | `dayHour` | 6 khung 4 giờ × N ngày |
| 15–183 ngày | `weekday` | 7 thứ × N tuần liền mạch |
| > 183 ngày | `month` | 7 thứ × tuần, chia khối tháng |

`weekday` không chia khối tháng nên lưới kín, chỉ hai cột mép có ô giữ chỗ. Nhãn tháng đặt
thưa ở cột mở đầu mỗi tháng.

### Kiến trúc

Một selector trả về ma trận chung, một component vẽ:

- `src/behavior/rhythm.ts` — `rhythmModeFor`, `rhythmMatrix`, `dropHint`. Hàm thuần, không
  phụ thuộc React, test được trực tiếp. Bốn kiểu là bốn nhánh nhưng cùng trả về
  `{ mode, rowLabels, colLabels, colGroups, cells, cols, grouped }`.
- `src/components/report/charts/RhythmHeatmap.tsx` — vẽ ma trận. Thang màu, legend, tooltip,
  co giãn ô, cuộn ngang nằm một chỗ. Thêm kiểu thứ năm sau này không phải sửa file này.
- `src/components/report/RhythmCard.tsx` — vỏ thẻ, chữ đổi theo `mode`.

Gom phút theo **giờ bắt đầu buổi học**, cùng cách với `goldenHours`, để con số trên biểu đồ
và câu "giờ vàng" bên dưới không nói hai chuyện khác nhau.

### Co giãn ô

Nhiều cột (> 26) thì ô vuông 14–24px cho giống thiết kế. Ít cột thì ô thành hình chữ nhật
rộng 24–160px, cao `250 / số hàng` (20–56px), để lưới lấp khung thay vì teo thành một vệt.

### Chữ đổi theo kiểu

| Kiểu | Tiêu đề | Câu phụ |
|---|---|---|
| `hour` | Giờ học trong ngày | Mỗi ô là một giờ, ô càng đậm là học càng lâu |
| `dayHour` | Khung giờ học trong tuần | Mỗi ô là một khung bốn giờ của một ngày |
| `weekday` | Nhịp độ học của bạn | Mỗi ô là một ngày, xếp theo tuần |
| `month` | Nhịp độ học của bạn | Mỗi ô là một ngày, xếp theo từng tháng |

`dropHint` nói theo đơn vị mà lưới đang dùng: "vào quãng 21h" / "hôm Thứ 5 16/8" /
"trong tuần 2 tháng 8". Câu đúc kết ở mốc `hour` nói tổng thời gian học (thứ mà hình không
nói được) thay vì nhắc lại giờ cao điểm; nếu ngày đang xem không phải hôm nay thì gọi đúng
ngày đó chứ không gọi "Hôm nay".

### Sticky

Tên + bộ lọc trong một thanh `sticky top-[76px] z-30`, nền trắng, kẻ dưới. Dưới TopNav
(`z-40`), trên các thẻ. Thêm `scroll-margin-top: 96px` cho các nút trong thanh làm chốt
phòng xa, nếu trình duyệt vẫn quyết định cuộn phần tử focus vào tầm nhìn.

## Kiểm tra

- 9 test đơn cho `rhythm.ts`: đúng kiểu theo từng độ dài, `dayHour` kín hoàn toàn,
  `weekday` chỉ hở hai cột mép, `month` phủ liền mạch hết số cột, mọi hàng dài bằng số cột.
- Chạy thật: 4 kiểu render đúng; `scrollY` giữ được vị trí khi bấm bộ lọc (1500 → 1461);
  tràn ngang 0px ở 390/768/1440 qua cả 5 mốc.
