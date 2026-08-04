# Bản đồ chỉ số người học — Danh mục tối đa (Learner Analytics)

> Tài liệu tham khảo cho brainstorm "Học tập của tôi" (learner-facing analytics) của `ths-course-builder`.
> Đây là danh mục ĐẦY ĐỦ để tham khảo. Bản demo trên màn hình sẽ chọn lọc (cốt lõi + vài điểm nhấn nâng cao).
>
> Cột **Mức**: `Cốt lõi` = đo dễ, chuẩn mực · `Nâng cao` = cần gắn thêm đo đạc · `Tham vọng` = suy luận/AI, tham vọng.
> Cột **Cá nhân hóa**: chỉ số này mở ra hành động cá nhân hóa gì.
> Ghi chú: một vài chỉ số đánh dấu *(khó dựng trong bản mock)* — cần dữ liệu ngoài phạm vi UI-only.
>
> **PHẠM VI (quan trọng):** Bản demo chỉ theo dõi chỉ số **trong phạm vi sản phẩm khóa học** (học viên khi học các khóa/bài/quiz gắn với khóa) — KHÔNG trace toàn bộ hành trình học trên nền tảng (điểm danh, nhiệm vụ, thông báo, các module khác của hệ sinh thái THS). "Đa khóa" = các khóa trong chính sản phẩm này. Gợi ý "học tiếp" = bài/khóa trong sản phẩm khóa học. Bỏ các chỉ số gắn module khác (giao việc/hạn nộp lớp, ROI nghề nghiệp/thị trường, hồ sơ năng lực xuyên nền tảng). So sánh cohort (nếu có) = trong cùng khóa học.

Bối cảnh dữ liệu hiện có: `Course → Section → Lesson` (video `durationMin/videoUrl`, hoặc module tương tác `contentUrl`, kèm `resources`); `Instructor, Topic, Collection, Comment, Rating, enrolledCount`. Tracking hiện tại: `completedLessonIds[]` + `lastLessonId` trong localStorage. Quiz/bộ đề, Nhiệm vụ, Điểm danh tồn tại như module anh em trong hệ sinh thái THS (có thể nối sau).

---

## 1. Bản đồ thành thạo & Truy vết tri thức
*Phân biệt "đã bấm xong" với "thật sự nắm" — nền để gợi học tiếp đúng chỗ, cấp chứng chỉ theo mastery thật, vá lỗ hổng gốc.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Độ phủ thành thạo chương trình | % khái niệm ĐẠT thành thạo (không chỉ tick xong) | Biết thiếu mảng nào; cấp chứng chỉ theo mastery thật | Progress ring + treemap theo Section | Cốt lõi |
| Bản đồ thành thạo khái niệm | Mức 0–100% từng khái niệm/kỹ năng | "Bạn mạnh X, yếu Y" — nền mọi gợi ý | Radar / heatmap khái niệm | Nâng cao |
| Nhịp tiến bộ & thời gian đạt thành thạo | Số khái niệm thành thạo/tuần, số ngày tới từng mốc | Dự báo ngày xong; cảnh báo khi chậm dần | Line/area lũy tiến + đường dự báo | Cốt lõi |
| Đạt ngưỡng trước khi tiến (mastery gate) | % khái niệm ≥ ngưỡng trước khi mở bài kế | Chặn nhẹ khi tiến quá nhanh | Step funnel đạt/né cổng | Nâng cao |
| Bản đồ kiến thức tiên quyết & lỗ hổng | Mastery các khái niệm nền đang chặn bài hiện tại | "Cần ôn A, B trước khi học C" | Đồ thị DAG, node tô theo mastery | Nâng cao |
| Phổ nhận thức Bloom | Phân bố hoạt động/độ đúng theo 6 bậc Bloom | Phát hiện "kẹt bậc thấp", giao nhiệm vụ bậc cao | Kim tự tháp Bloom / stacked bar | Nâng cao |
| Đường cong học tập | Tốc độ giảm lỗi theo số lần luyện | "Học nhanh bền" vs "nhớ vẹt tạm" | Line error-rate (log-log) | Nâng cao |
| Số lần thử để thành thạo | Trung bình lần luyện để đạt ngưỡng | Xác định khái niệm khó, cá nhân hóa số bài luyện | Bar xếp hạng theo khái niệm | Nâng cao |
| Xác suất tri thức theo thời gian (Knowledge Tracing) | P(đã nắm) cập nhật sau mỗi câu (BKT/DKT) | Dự đoán câu kế đúng/sai, dừng luyện đúng lúc | Line p(mastery) 0–1 | Tham vọng |
| Chỉ số sẵn sàng học bài kế | Điểm tổng hợp đủ nền để vào bài tiếp chưa | Gợi "học tiếp" hay "ôn trước" | Gauge + đèn giao thông theo bài | Tham vọng |
| Khả năng chuyển giao gần/xa | Áp dụng vào bối cảnh mới thay vì lặp y hệt | Hiểu sâu vs thuộc mẫu; gợi bài vận dụng | Grouped bar gần vs xa | Tham vọng |

## 2. Ghi nhớ dài hạn & Ôn tập giãn cách
*Kiến thức phai theo thời gian; nhắc ôn đúng khái niệm đúng lúc sắp quên là cách củng cố trí nhớ hiệu quả nhất.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Lịch ôn tập giãn cách (SM-2) | Khái niệm nào đến hạn ôn hôm nay | Nhắc ôn đúng thời điểm sắp quên | Calendar heatmap + danh sách ôn hôm nay | Nâng cao |
| Đường cong quên & rủi ro quên | Dự báo mức nhớ còn lại theo thời gian (Ebbinghaus) | Xếp hạng rủi ro quên để nhắc kịp | Đường phân rã + vùng "cần ôn ngay" | Tham vọng |
| Ghi nhớ dài hạn qua kiểm tra trễ | Độ đúng khi gặp lại nội dung cũ sau nhiều ngày | Đo nhớ thật; chỉnh cường độ ôn | Line điểm tức thời vs điểm trễ | Nâng cao |
| Ôn tập chủ động (tự điều chỉnh) | Số lần tự quay lại bài đã xong + khoảng cách | Nhận diện điểm "chưa chắc" để đẩy vào hàng ôn | Heatmap bài × số lần quay lại | Cốt lõi |
| Cân bằng học mới vs ôn tập | Tỉ lệ mở bài mới vs quay lại xem lại | Người chỉ chạy tiến độ được nhắc ôn trước | Area xếp chồng học mới vs ôn tập | Nâng cao |

## 3. Đánh giá & Đo lường tâm trắc (quiz/bộ đề)
*Biến quiz/bộ đề của THS thành tín hiệu năng lực "sạch" — tách hiểu thật khỏi đoán mò, khoanh chủ đề yếu và hiểu lầm cụ thể.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Điểm & tỉ lệ đúng | Điểm thô, % đúng mỗi lượt làm | Mốc năng lực, cổng đạt/chưa | Gauge/donut + bar so sánh | Cốt lõi |
| Đúng lần đầu vs làm lại | Độ chính xác lượt đầu (trước gợi ý) | Tách hiểu thật khỏi thuộc lòng khi làm lại | Slope/paired bar lần 1 vs 2+ | Nâng cao |
| Độ chính xác theo chủ đề | % đúng theo kỹ năng/chủ đề (ma trận Q) | Khoanh chủ đề yếu, đẩy đúng chỗ hổng | Radar/heatmap theo chủ đề | Nâng cao |
| Điểm mạnh theo dạng câu | % đúng theo định dạng (trắc nghiệm, điền, nối…) | Luyện dạng yếu; chỉnh cơ cấu đề | Radar theo dạng câu | Nâng cao |
| Thời gian mỗi câu | Độ trễ trả lời từng câu | Nhận diện vật lộn vs trôi chảy; cảnh báo đoán | Box plot / scatter thời gian vs đúng-sai | Nâng cao |
| Độ khó & độ phân biệt câu hỏi | p-value & point-biserial mỗi câu | Chọn độ khó vừa sức; lọc câu kém | Item map scatter (khó × phân biệt) | Nâng cao |
| Năng lực ẩn IRT (θ) | Năng lực tiềm ẩn trên thang logit chung | So sánh năng lực xuyên các bài; nền thi thích ứng | Line θ có dải tin cậy | Tham vọng |
| Sai số đo lường & độ tin cậy | SEM, thông tin đề, Cronbach α | Biết độ tin cậy trước khi gating | Error bar trên θ | Tham vọng |
| Bản đồ quan niệm sai | Mỗi đáp án sai lộ hiểu lầm cụ thể nào | Chữa lỗi chính xác, phục vụ micro-lesson đúng | Sankey câu→nhiễu→quan niệm sai | Tham vọng |
| Chỉ số đoán mò | Khả năng đúng do đoán may (3PL c) | Trừ may mắn khỏi thành thạo | Scatter tốc độ–độ chính xác | Tham vọng |
| Chỉ số nỗ lực làm bài (RTE) | % câu trả lời nhanh hơn ngưỡng đọc-giải | Điểm thấp là thật hay do lơ là; cho làm lại | Histogram độ trễ có ngưỡng | Tham vọng |
| Tỉ lệ bỏ trống | % câu để trống + vị trí trong đề | Phát hiện lo âu/áp lực thời gian | Stacked bar đúng/sai/trống theo vị trí | Cốt lõi |
| Ngưỡng thành thạo mục tiêu | Từng mục tiêu học đã đạt chưa | Học theo thành thạo, mở bài kế khi đạt | Heatmap lưới thành thạo | Nâng cao |
| Hiệu ứng vị trí & mệt mỏi trong đề | Độ chính xác/thời gian theo thứ tự câu | Khuyên chia phiên ngắn, sắp lại thứ tự câu | Line độ chính xác vs vị trí câu | Nâng cao |

## 4. Gắn kết & Telemetry chú ý
*Học viên THỰC SỰ tiêu thụ nội dung ra sao và vật lộn ở đâu, để chèn trợ giúp đúng lúc-đúng chỗ.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Bản đồ nhiệt xem video | Đoạn xem lại/bỏ qua theo timeline | Xem lại nhiều = khó → thêm giải thích | Heatmap ngang theo timeline video | Nâng cao |
| Hành vi tua video | Tua tới (bỏ qua) vs tua lui (xem lại vì khó) | Tua lui nhiều = khó → hạ tốc/thêm gợi ý | Cột phân kỳ tới/lui | Nâng cao |
| Tỉ lệ xem hết video thực | % nội dung thật sự xem (khác bấm "hoàn thành") | Điều kiện cấp chứng nhận; nhắc phần bỏ sót | Vòng tiến trình mỗi bài | Nâng cao |
| Tốc độ phát ưa thích | Phân bố tốc độ 0.5x–2x có trọng số | Đặt mặc định tốc độ; suy độ khó cảm nhận | Donut/histogram theo mức tốc độ | Cốt lõi |
| Thời gian tập trung vs xao nhãng | Tỉ lệ tương tác thật vs idle mỗi bài | Ước lượng "chú ý thật"; chèn tương tác/nghỉ | Cột chồng active vs idle | Nâng cao |
| Thời gian lưu lại mỗi bài (thực vs kỳ vọng) | Thời gian active vs `durationMin` | Lâu = vật lộn; nhanh = học lướt | Diverging bar (thực − kỳ vọng) | Cốt lõi |
| Điểm bỏ dở / điểm rơi | Vị trí hay dừng và không quay lại | Xác định bài gây nản; cảnh báo sớm rời bỏ | Phễu dọc + heatmap điểm rơi | Cốt lõi |
| Luồng điều hướng | Chuỗi bài đi qua (tuyến tính/nhảy cóc) | Đề xuất lộ trình tối ưu | Sankey các luồng chuyển tiếp | Nâng cao |
| Độ sâu cuộn trang | Mức cuộn trên trang mô tả/transcript/tài nguyên | Nổi bật tài nguyên bị bỏ qua | Thanh % đạt từng mốc độ sâu | Cốt lõi |
| Tương tác thành phần (clickstream) | Nhấp tab/tài nguyên/thẻ liên quan/AI | Nổi bật widget hữu ích, ẩn thứ ít dùng | Treemap/cột xếp hạng phần tử | Cốt lõi |
| Chỉ số vật lộn & do dự/bối rối | Tua dồn, dừng lâu, rage-click, dead-click | Tự nổi trợ giúp đúng lúc, đúng chỗ | Bar struggle + timeline sự kiện | Nâng cao |
| Gắn kết module tương tác | Thời gian/chương/thao tác trong module `contentUrl` | Đo học chủ động (hands-on) vs xem thụ động | Cột nhóm tương tác vs video | Tham vọng |
| Dùng trợ lý AI & tài nguyên theo bài | Số lần mở chatbot/panel AI, số câu hỏi theo bài | Bài nhiều lượt hỏi = điểm nóng → chèn FAQ | Cột số lượt cần trợ giúp theo bài | Nâng cao |

## 5. Thời gian, Nhịp điệu & Thói quen
*Biết KHI NÀO và ĐỀU ĐẶN ra sao để nhắc đúng khoảnh khắc, cá nhân hóa khối lượng, cảnh báo trước khi nguội.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Chuỗi ngày học (hiện tại & kỷ lục) | Số ngày liên tiếp + chuỗi dài nhất | Nhắc "giữ chuỗi"; gamification thói quen | Ngọn lửa + badge + calendar heatmap | Cốt lõi |
| Lịch nhiệt hoạt động | Mật độ học theo ngày nhiều tuần/tháng | Phát hiện khoảng trống; gợi lịch bù | Calendar heatmap kiểu GitHub | Cốt lõi |
| Phút học mỗi tuần | Tổng phút thực mỗi tuần | Theo dõi mục tiêu tuần, chỉnh khối lượng | Cột theo tuần + goal line | Cốt lõi |
| Khung giờ vàng | Phân bố hoạt động 24h; giờ tập trung nhất | Đẩy thông báo/mở nội dung đúng giờ vàng | Biểu đồ cực 24h (radial) | Nâng cao |
| Nhịp học theo thứ trong tuần | Học mạnh vào thứ nào | Phân persona; nhắc theo thứ phù hợp | 7 cột / radar 7 trục | Nâng cao |
| Chỉ số đều đặn | Học đều hay dồn cục (biến thiên/entropy) | Người dồn cục cần nhắc rải đều | Gauge chia dải + ridgeline | Nâng cao |
| Số buổi & độ dài mỗi buổi | Số buổi riêng biệt + độ dài điển hình | Buổi ngắn → micro-lesson; dài → module liền | Histogram độ dài + KPI | Nâng cao |
| Khoảng cách giữa hai buổi | Thời gian trung vị giữa các buổi | Hẹn giờ re-engagement chính xác | Histogram + vạch median | Nâng cao |
| Cảnh báo nguy cơ bỏ học theo nhịp | Số ngày vắng vs nhịp thường lệ của chính họ | Win-back đúng thời điểm trước khi churn | Nhiệt kế rủi ro có baseline cá nhân | Tham vọng |
| Đà học (xu hướng tăng/giảm) | Phút 7 ngày gần nhất vs 7 ngày trước | Chúc mừng khi bứt tốc; can thiệp khi tụt | Mũi tên xu hướng + area | Nâng cao |
| Kiểu người học theo giờ (chronotype) | Nhãn: cú đêm/chim sớm/giờ nghỉ trưa | Cá nhân hóa giọng nhắc & thời gian thông báo | Đồng hồ 24h + badge persona | Tham vọng |
| Dự báo thời điểm quay lại | P(quay lại) theo ngày × giờ | Đặt lịch nhắc trước đúng khoảnh khắc | Heatmap dự báo ngày × giờ | Tham vọng |
| Khối tập trung dài nhất & kiểu nghỉ | Đoạn học liên tục dài nhất + kiểu nghỉ | Khớp độ dài chunk bài với sức tập trung; gợi Pomodoro | KPI + timeline gantt active/pause | Nâng cao |

## 6. Cảm xúc, Động lực & Siêu nhận thức
*Đọc trạng thái nội tâm và khả năng tự điều chỉnh để chọn giọng hỗ trợ, mức giàn giáo và can thiệp động lực.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Chỉ số tự tin (tự báo cáo) | Mức tự tin tự khai trước/sau bài (1–5) | Tự tin thấp → ưu tiên ôn/bài nền | Gauge + sparkline theo bài | Nâng cao |
| Độ chuẩn xác của tự tin (calibration) | Lệch giữa tự tin dự đoán và kết quả thực (Brier) | Tự cao → chèn câu kiểm chứng; tự thấp → trấn an | Reliability diagram (kèm đường 45°) | Nâng cao |
| Ảo tưởng đã hiểu | "Xong" + tự tin cao nhưng điểm thấp | Chặn nhẹ trước khi qua bài; chống học vẹt trôi | Scatter (tự tin × điểm thực) | Nâng cao |
| Chỉ số kiên trì (grit) | Số lần quay lại bài khó, bám bài trước khi vượt | Grit cao → thử thách; thấp → chia nhỏ, thắng nhỏ | Bar theo bài + badge ý chí | Nâng cao |
| Hành vi tìm trợ giúp | Tần suất/loại trợ giúp chủ động | Vật lộn mà không hỏi → chủ động mời gợi ý | Stacked bar theo loại + heatmap | Cốt lõi |
| Chất lượng tìm trợ giúp (thích ứng vs né tránh) | Hỏi để học vs xin đáp án ngay | Né tránh → chuyển gợi ý Socratic | Diverging bar theo tuần | Tham vọng |
| Phụ thuộc trợ lý AI | Hỏi AI trước khi tự thử, có kiểm chứng không | Lệ thuộc → giữ "khoảng tự vật lộn" | Diverging bar tự lực ↔ lệ thuộc | Nâng cao |
| Năng lực tự điều chỉnh học tập | Lập kế hoạch – theo dõi – kiểm soát | Yếu → bật giàn giáo; mạnh → trao tự chủ | Radar 3 trục + điểm tổng | Nâng cao |
| Chất lượng suy ngẫm (reflection) | Độ sâu phần tự suy ngẫm sau bài | Hời hợt → gợi mở bằng câu hỏi dẫn dắt | Line điểm + word cloud | Tham vọng |
| Tín hiệu tư duy phát triển | Xu hướng phát triển vs cố định qua ngôn ngữ | Cố định → định khung lại thất bại là bước học | Diverging gauge + timeline câu trích | Tham vọng |
| Quỹ đạo cảm xúc | Diễn biến tâm trạng khi học theo thời gian | Chuỗi tụt dốc → giảm tải, đổi giọng đồng cảm | Area tâm trạng mượt theo thời gian | Nâng cao |
| Sản xuất vs tiêu thụ | Tỉ lệ tạo (ghi chú, câu hỏi) vs xem/đọc thụ động | Khuyến khích người chỉ "xem" bắt đầu ghi chú | Donut + xu hướng theo thời gian | Nâng cao |
| Quỹ đạo tự hiệu năng theo khóa | Xu hướng niềm tin vào năng lực bản thân | Đang xuống → nhắc thành tựu, hạ độ khó | Line xu hướng + annotation mốc gãy | Tham vọng |

## 7. Xã hội, Cộng tác & So sánh
*Định vị học viên trong tương quan cohort và kích hoạt học qua cộng đồng — đối chuẩn công bằng, gamification lành mạnh, học bằng cách dạy lại.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Xếp hạng phần trăm tiến độ | Percentile % hoàn thành so toàn khóa | "Bạn ở top 20%"; cảnh báo khi tụt nhóm cuối | Percentile gauge / bell-curve | Nâng cao |
| So sánh nhịp học với cohort | Tốc độ tích lũy vs trung vị cohort | Nhận diện nhanh/chậm hơn bạn học | Dual cumulative line | Nâng cao |
| Vị trí bảng xếp hạng | Hạng theo điểm tổng hợp | Gamification cạnh tranh lành mạnh | Leaderboard highlight "bạn" | Nâng cao |
| Điểm quiz so với cohort | Điểm bài ở percentile nào | Ôn chủ đề dưới trung vị cohort | Box plot + marker "bạn" | Nâng cao |
| Mức tham gia thảo luận | Số bình luận/câu hỏi, chuẩn hóa theo bài | Nudge người thụ động đặt câu hỏi | Bar theo section + heatmap | Cốt lõi |
| Lượt thích nhận được | Tổng likes cộng đồng cho bình luận | Trao badge helpfulness | KPI + sparkline theo tuần | Cốt lõi |
| Đóng góp đánh giá & nhận xét | Đã Rating/review chưa, so trung bình | Nhắc review đúng lúc (sau ≥80%) | Donut + thanh so sánh | Cốt lõi |
| Khối lượng ghi chú | Số ghi chú + độ dài theo bài | Suy bài khó; gợi ôn bài ghi chú dày | Bar theo bài + cumulative | Nâng cao |
| Chỉ số hỏi–đáp | Tỉ lệ câu hỏi đặt vs trả lời cho bạn | Định vị vai trò (người hỏi vs dẫn dắt) | Stacked bar / sankey hỏi→đáp | Nâng cao |
| Học bằng cách dạy lại | Reply giải thích được peer công nhận | Kích hoạt "dạy để học"; nuôi mentor | Bar theo bài + tỉ lệ | Nâng cao |
| Chất lượng bình luận (AI) | Bình luận thực chất hay hời hợt (AI suy) | Chấm đóng góp chất lượng vượt vanity | Scatter (độ dài × likes) tô theo điểm | Tham vọng |
| Chất lượng ghi chú (AI) | Ghi chú phủ được khái niệm cốt lõi (AI) | Chỉ khái niệm bỏ sót; sinh tóm tắt bổ khuyết | Radar phủ khái niệm | Tham vọng |
| Ảnh hưởng trong mạng thảo luận | Mức trung tâm trong mạng hỏi–đáp | Phát hiện người dẫn dắt để mời mentor | Network graph, node theo centrality | Tham vọng |
| Nhóm học tương đồng | Cụm bạn học hành vi giống | "Người giống bạn cũng học X"; đối chuẩn công bằng | Cluster scatter 2D (t-SNE/UMAP) | Tham vọng |
| Chuỗi ngày & chỉ số hoạt động so với lớp | Streak + phút/phiên quy về mốc lớp = 100 | Một con số "sức khỏe học tập" so lớp | Calendar heatmap + bullet vs 100 | Nâng cao |
| Chia sẻ & giới thiệu | Số lần chia sẻ + bạn ghi danh nhờ link | Nhận diện "đại sứ" để tặng thưởng | Funnel chia sẻ → click → ghi danh | Nâng cao |

## 8. Cá nhân hóa thích ứng & Gợi ý
*Trái tim biến mọi tín hiệu thành hành động — học gì tiếp, độ khó nào, định dạng nào, đúng người-đúng lúc.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Định dạng học ưa thích | Tỉ trọng hoàn tất theo video/tương tác/tài liệu | Ưu tiên đẩy định dạng người học thích | Donut + stacked bar hoàn tất | Cốt lõi |
| Ái lực chủ đề | Trọng số quan tâm từng Topic (có suy giảm) | Cá nhân hóa trang chủ & gợi ý theo lĩnh vực | Radar/treemap theo chủ đề | Cốt lõi |
| Nhịp học (thực vs dự kiến) | Dồn dập/đều đặn/chậm ngắt quãng | Điều tiết khối lượng gợi ý mỗi lần | Line/area thực vs dự kiến | Nâng cao |
| Mức bám lộ trình | Đúng thứ tự khuyến nghị hay nhảy cóc (Kendall τ) | Bám → gợi tuần tự; nhảy cóc → cảnh báo tiên quyết | Sankey + đồng hồ mức bám | Nâng cao |
| Hành vi nhấp gợi ý (rec CTR) | Tỉ lệ click & chuyển đổi khối gợi ý | Đề cao loại gợi ý hay nhận, bỏ loại bị phớt lờ | Phễu impression → click → học | Nâng cao |
| Vùng phát triển gần (ZPD) | Dải độ khó nơi tỉ lệ đúng ~70–85% | Chọn bài kế đúng ZPD; tự nâng/hạ độ khó | Line tỉ lệ đúng theo độ khó, tô dải | Tham vọng |
| Nội dung nên học tiếp (next-best-content) | Điểm xếp hạng nên học ngay bây giờ | Quyết định chính xác "học gì tiếp" kèm lý do | Ranked leaderboard + lý do | Tham vọng |
| Bản đồ khuyết kỹ năng | Vector mastery hiện tại vs mục tiêu (skills) | Đề xuất bài lấp đúng kỹ năng yếu | Radar chồng lớp + thanh khoảng trống | Tham vọng |
| Độ sẵn sàng lên cấp | Sẵn sàng Cơ bản → Trung cấp → Nâng cao | Tự mở khóa nội dung nâng cao đúng lúc | Stepper theo bậc với cổng mở khóa | Tham vọng |
| Độ đa dạng khám phá (entropy) | Mở rộng nhiều chủ đề vs tập trung hẹp | Hẹp → gợi chủ đề liền kề; đa dạng → đào sâu | Gauge entropy + xu hướng | Nâng cao |
| Khung giờ & bối cảnh học hiệu quả | Giờ + thiết bị học tốt nhất | Đẩy gợi ý vào giờ vàng; hợp thiết bị | Heatmap giờ × thứ tô theo hiệu quả | Nâng cao |
| Phong cách tương tác học liệu | Cách vận hành trong module (`contentUrl`) | Tự lực vs cần dẫn dắt; chỉnh mức trợ giúp | Phễu hoàn tất theo bước trong module | Nâng cao |
| Độ nhạy gợi ý AI | Tương tác AI + làm theo gợi ý có cải thiện không | Chỉnh mức chủ động của AI theo từng người | Phễu tương tác AI + cột trước/sau | Tham vọng |
| Hồ sơ động lực & mục tiêu | Ý định: luyện thi/tò mò/xây kỹ năng nghề | Chỉnh giọng, nội dung, lịch nhắc theo động lực | Streak heatmap + nhãn ý định | Tham vọng |

## 9. Kết quả, Kỹ năng & Giá trị
*Chứng minh học viên đạt được gì — nền cho chứng chỉ, portfolio, định hướng mục tiêu/nghề; cũng là chân dung "một học viên" gộp mọi khóa.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Tỉ lệ hoàn thành | % bài xong theo khóa và tổng thể | Nhắc hoàn tất khóa gần xong (80–95%) | Radial gauge + stacked bar | Cốt lõi |
| Chất lượng hoàn thành | Bao nhiêu là học thực chất vs chỉ tick xong | Phát hiện hoàn thành hời hợt; giữ giá trị chứng chỉ | Thanh phân đoạn thực chất vs lướt | Nâng cao |
| Đồ thị năng lực | Độ phủ & độ sâu kỹ năng (`skills`) | Gợi khóa lấp mắt xích yếu | Radar + mạng lưới kỹ năng | Nâng cao |
| Độ sâu thành thạo theo cấp độ | Phân bố làm chủ theo Cơ bản/Trung cấp/Nâng cao | Nhận biết sẵn sàng lên cấp | Kim tự tháp 3 tầng | Cốt lõi |
| Chứng chỉ & huy hiệu | Số & danh sách chứng chỉ + huy hiệu mốc | Trò chơi hóa: huy hiệu kế còn cách bao nhiêu | Tường huy hiệu + timeline mốc | Cốt lõi |
| Thiết lập & mức độ đạt mục tiêu | Có tự đặt mục tiêu không, tỉ lệ đạt | Mục tiêu quá cao liên tục trượt → gợi thực tế hơn | Bullet chart theo kỳ | Nâng cao |
| Vận tốc học & ngày dự kiến hoàn thành | Bài/phút mỗi tuần + ETA | "Với nhịp này bạn xong ngày X" | Burn-up + dự phóng + đếm ngược | Nâng cao |
| Danh mục khái niệm thành thạo | Bộ khái niệm có thể tuyên bố làm chủ | Dựng hồ sơ "tôi làm được gì" cho CV/portfolio | Ma trận thành thạo / tag cloud | Nâng cao |
| Tín hiệu kiến thức áp dụng | Module tương tác, điểm bộ đề/nhiệm vụ, bài nộp | Phân biệt "đã xem" với "làm được" | Cột nhóm "đã xem" vs "đã áp dụng" | Tham vọng |
| Tiến độ lộ trình học (Collection) | % hoàn tất lộ trình nhiều khóa | Gợi khóa kế trong lộ trình | Stepper / roadmap chặng đã qua | Nâng cao |
| Điểm thành thạo tổng hợp | Chỉ số 0–100 pha nhiều yếu tố | Nhìn phát biết trình độ; nền xếp hạng | Gauge lớn + waterfall phân rã | Nâng cao |
| Độ rộng lĩnh vực học | Trải rộng trên các Topic | Khuyến khích mở rộng hay tập trung | Treemap/radar phân bố lĩnh vực | Cốt lõi |
| Khoảng trống kỹ năng tới mục tiêu | Kỹ năng còn thiếu để đạt vai trò chọn | Đề xuất bài/khóa lấp đúng lỗ hổng | Radar "đang có vs cần có" | Tham vọng |
| Giá trị giờ học quy đổi | Tổng giờ + hiệu suất (kỹ năng/giờ) | Cho thấy "học hiệu quả"; động viên | KPI + area tích lũy giờ | Cốt lõi |
| Chân dung học tập toàn cảnh (đa khóa) | Gộp mọi khóa: dở/xong/bỏ, phân bổ nỗ lực | Nhắc dồn sức khóa gần xong; phát hiện dàn trải | Stacked bar đa khóa + treemap | Cốt lõi |
| Chuyển giao kỹ năng liên khóa | Kỹ năng tái dùng ở khóa khác (`skills` trùng) | Rút ngắn lộ trình; đo học sâu | Bipartite khóa↔kỹ năng + bar | Tham vọng |
| ROI kỹ năng nghề nghiệp | Giá trị nghề của bộ kỹ năng, ánh xạ vai trò | "Bạn 70% sẵn sàng cho vai trò X" | Gauge sẵn sàng + Sankey kỹ năng→vai trò | Tham vọng *(khó dựng trong bản mock)* |

## 10. Sức khỏe học tập, Liêm chính & Niềm tin
*Cá nhân hóa có trách nhiệm — bảo vệ sức khỏe người học, giữ giá trị chứng chỉ, tôn trọng quyền riêng tư; tránh quy oan "lười" cho kiệt sức hay lỗi kỹ thuật.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Mệt mỏi & tải nhận thức trong phiên | Độ đúng giảm, phản hồi chậm về cuối phiên dài | Đề nghị nghỉ đúng lúc, cắt phiên ngắn | Line accuracy/thời gian + vạch "nên nghỉ" | Nâng cao |
| Học khuya lấn giấc | Tỉ lệ hoạt động 23h–4h | Nhắc nhẹ giấc ngủ; ưu tiên sức khỏe | Polar 24h tô vùng đêm | Cốt lõi |
| Nguy cơ kiệt sức (burnout) | Nỗ lực tăng nhưng đầu ra giảm + cảm xúc tiêu cực | Chủ động giảm tải, đổi giọng đồng cảm | Gauge nguy cơ + sparkline nỗ lực-vs-kết quả | Tham vọng |
| Kiểu bắt đầu rồi bỏ & quá tải đa khóa | Ghi danh nhiều, hoàn thành ít, nhiều khóa cùng lúc | Khuyên tập trung 1–2 khóa | Funnel + KPI khóa hoạt động đồng thời | Nâng cao |
| Rời màn hình khi làm bài (soft-flag) | Số lần tab mất tiêu điểm khi làm bài tính điểm — *tín hiệu rà soát, không phải bằng chứng gian lận* | Gắn cờ mềm lượt cần xem lại; hỗ trợ GV đối chiếu | Timeline sự kiện blur trên tiến trình bài | Nâng cao |
| Bất thường tốc độ & cách nhập đáp án | Đúng nhanh bất thường, dán văn bản dài | Mời "làm lại không gợi ý" để xác minh | Scatter tốc độ × độ khó, tô vùng nghi vấn | Nâng cao |
| Minh bạch dữ liệu & quyền lựa chọn | Học viên biết/kiểm soát dữ liệu tới đâu | Cá nhân hóa có đạo đức, hợp quy; tăng lòng tin | Bảng điều khiển quyền riêng tư (toggle) | Nâng cao |
| Trùng lặp câu trả lời trong nhóm | Giống nhau bất thường giữa các học viên — *xét nhóm, không quy kết cá nhân* | Cảnh báo GV rà soát đề lộ/chép bài | Heatmap ma trận tương đồng | Tham vọng *(khó dựng trong bản mock)* |

## 11. Trợ năng, Bối cảnh & Chất lượng nội dung
*Công bằng tiếp cận; không quy oan rào cản kỹ thuật/ngôn ngữ thành "thiếu động lực"; dùng chính tiếng nói người học để cải thiện nội dung.*

| Chỉ số | Đo gì | Cá nhân hóa | Biểu đồ | Mức |
|---|---|---|---|---|
| Phụ thuộc phụ đề & bản ghi | Tỉ lệ bật phụ đề + dùng transcript | Bật phụ đề mặc định; suy môi trường ồn/ngôn ngữ 2 | Stacked bar bật/tắt + KPI transcript | Cốt lõi |
| Thiết lập trợ năng | Chữ to, giảm chuyển động, tương phản cao, bàn phím | Tự bật giao diện dễ tiếp cận — công bằng | Bảng hồ sơ trợ năng | Cốt lõi |
| Rào cản ngôn ngữ & độ khó văn bản | Chênh độ khó nội dung vs năng lực đọc suy ra | Gợi bản đơn giản hơn, chú giải thuật ngữ | Diverging bar (độ khó − năng lực đọc) | Nâng cao |
| Thiết bị & bối cảnh | Thiết bị/HĐH/trình duyệt/màn hình/mạng | Di động → nội dung ngắn; mạng yếu → hạ video | Cột chồng theo nhóm thiết bị | Cốt lõi |
| Chuyển tiếp & bối cảnh đa thiết bị | Bắt đầu thiết bị này, tiếp thiết bị khác | Đồng bộ điểm dừng liền mạch | Sankey chuyển tiếp thiết bị | Cốt lõi |
| Chất lượng kỹ thuật trải nghiệm (QoE) | Thời gian tải, giật/buffer, lỗi phát, sập | Phân biệt "bỏ vì nội dung" vs "bỏ vì lag" | Line thời gian tải + cột lỗi theo bài | Cốt lõi |
| Bối cảnh lớp học & giao việc | Bài GV giao vs tự chọn, hạn nộp, tuân thủ | Tách động lực nội tại khỏi bắt buộc; GV thấy tiến độ lớp | Stacked bar giao vs tự chọn + bullet hạn | Nâng cao |
| Phản hồi chất lượng bài học | Đánh giá nhanh: hữu ích, độ khó, "chỗ khó hiểu" | Bài chấm khó → chèn giải thích đơn giản | Heatmap "chỗ khó hiểu" theo timeline | Cốt lõi |
| Báo lỗi & gắn cờ nội dung | Video hỏng, đáp án sai, link chết… | Phân biệt "nản do lỗi" vs "nản do khó" | Ranked bar phần tử bị gắn cờ | Cốt lõi |
| Chất lượng nội dung suy từ hành vi tập thể | Xem-lại nhiều = khó, tua qua = thừa, điểm rơi = nản | Gắn cờ nội dung cần biên tập; tách lỗi nội dung khỏi lỗi người học | Timeline chú thích theo vị trí | Nâng cao |
| Tìm kiếm & truy vấn trong khóa | Tìm gì, truy vấn nào không ra kết quả | Lộ nội dung cần mà khóa chưa có | Bảng truy vấn hàng đầu + "tìm không thấy" | Nâng cao |
| Kích hoạt & trải nghiệm buổi đầu | Time-to-first-value, thắng đầu tiên, quay lại 7 ngày | Cải thiện onboarding; nudge thắng nhỏ sớm | Funnel ghi danh → bài đầu → quay lại | Cốt lõi |
| Học ngoại tuyến & tải về | Học khi mất mạng, đồng bộ lại khi có mạng | Không tính nhầm mạng yếu là "không hoạt động" | Cột online vs offline + KPI đồng bộ trễ | Nâng cao *(khó dựng trong bản mock)* |

---

## Bố cục dashboard đề xuất (đầy đủ) & khối AI

12 section theo thứ tự trên→dưới, khối "AI đánh giá" chen giữa các cụm biểu đồ:

1. **Hero — Chân dung học viên**: gauge "Sức khỏe học tập" 0–100 + KPI (chuỗi ngày, % hoàn thành, phút tuần, khái niệm thành thạo) + pill trạng thái/persona. → *AI: nhận định tổng quan.*
2. **Tiến độ & Kết quả** → *AI: đặt tiến độ trong bối cảnh thời gian, ETA.*
3. **Bản đồ thành thạo & Tri thức** → *AI: chẩn đoán mạnh–yếu + nguyên nhân gốc.*
4. **Ghi nhớ & Ôn tập** → *AI: nhắc ôn giãn cách đúng khái niệm.*
5. **Đánh giá & Năng lực (quiz/bộ đề)** → *AI: giải thích hiểu lầm cụ thể.*
6. **Gắn kết & Chú ý** → *AI: phản chiếu hành vi xem.*
7. **Thời gian, Nhịp & Thói quen** → *AI: đúc kết nhịp cá nhân, nhắc đúng giờ.*
8. **Cảm xúc, Động lực & Siêu nhận thức** → *AI: động viên, định khung thất bại.*
9. **Xã hội & So sánh** → *AI: định vị so lớp, gợi vai trò cộng đồng.*
10. **Cá nhân hóa & Gợi ý cho bạn** (cao trào) → *AI trọng tâm: kế hoạch học tiếp cụ thể.*
11. **Sức khỏe, Trợ năng & Niềm tin** → *AI: chăm sóc + trấn an quyền riêng tư.*

> Giọng khối AI: viết như một người kèm học nói với **bạn** (ngôi thứ hai, trung tính lứa tuổi), bắt đầu bằng sự thật quan sát được, nói nó có thể nghĩa là gì, rồi một bước làm tiếp cụ thể. Không sáo rỗng, không quảng cáo, không emoji.

## 14 hành động cá nhân hóa giá trị nhất (tóm tắt)

1. Đề xuất "bài học tiếp theo" chính xác (next-best-content) từ đồ thị tiên quyết + ái lực chủ đề + ZPD + khuyết kỹ năng, kèm lý do.
2. Tự lên lịch ôn tập giãn cách theo đường cong quên + SM-2.
3. Nhắc học đúng khung giờ vàng, đúng thứ, đúng thiết bị theo chronotype + dự báo quay lại.
4. Cảnh báo sớm nguy cơ bỏ dở/kiệt sức rồi win-back trước điểm rơi.
5. Điều chỉnh độ khó & khối lượng theo ZPD và nhịp học.
6. Chọn định dạng hợp gu (video/tương tác/văn bản) + đặt sẵn tốc độ phát.
7. Chèn trợ giúp đúng lúc-đúng chỗ khi phát hiện vật lộn.
8. Chỉnh giọng & mức "cầm tay chỉ việc" của AI theo tự tin/grit/lệ thuộc.
9. Gắn cờ "ảo tưởng đã hiểu" + mastery gate chống học vẹt trôi.
10. Cá nhân hóa trang chủ theo ái lực chủ đề; cân bằng khám phá vs đào sâu.
11. Tự bật trợ năng (chữ to, ít animation, phụ đề mặc định) theo hồ sơ.
12. Tách "lỗi nội dung/kỹ thuật" khỏi "lỗi động lực" trước khi kết luận.
13. Trong hệ THS: tách bài tự chọn vs được giao, hiển thị tuân thủ hạn nộp cho GV, đồng bộ điểm dừng xuyên thiết bị.
14. Gợi mục tiêu tuần thực tế, tự nâng/hạ theo tỉ lệ đạt; neo động lực bằng streak.
