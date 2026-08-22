/**
 * Lời giải thích ngắn cho từng bài trong khoá — phần "hỏi đáp kiến thức" của Course AI.
 *
 * Đây là NỘI DUNG KHOÁ HỌC, không phải số liệu học tập: mỗi bài một hai câu nói cho người
 * mới hiểu ý chính. Khoá thật thì mấy dòng này do người soạn bài viết; ở bản demo tôi viết
 * sẵn cho 14 bài của khoá "AI cơ bản đến thực tiễn" vì đó là khoá mở được báo cáo cuối khoá.
 *
 * Khớp theo TÊN BÀI chứ không theo id: id sinh ra từ vị trí bài trong danh sách
 * (`courseId:c-3-hoc-may-co-ban`) nên đổi thứ tự bài là vỡ hết, còn tên bài thì bền.
 *
 * Bài nào chưa có dòng nào ở đây thì Course AI trả lời bằng vị trí của bài trong khoá và
 * mức nắm — vẫn đúng, chỉ là không giảng lại nội dung.
 */
export const GIAI_THICH_BAI: Record<string, string> = {
  'AI là gì':
    'AI là máy làm được những việc trước đây phải cần đến người: nhận ra vật trong ảnh, hiểu câu nói, chọn nước đi. Nó không "biết" gì cả — nó tìm ra quy luật từ rất nhiều ví dụ rồi làm theo quy luật đó.',
  'Lịch sử ngắn của AI':
    'Ý tưởng máy biết suy nghĩ có từ những năm 1950. Suốt mấy chục năm nó đi chậm vì thiếu dữ liệu và thiếu máy mạnh; từ khoảng 2012 hai thứ đó mới đủ nhiều, và AI bùng lên từ đấy.',
  'AI quanh ta mỗi ngày':
    'Gợi ý video, lọc thư rác, gõ tiếng Việt có đoán chữ, mở khoá điện thoại bằng mặt — đều là AI. Điểm chung của chúng: chúng đoán, và đoán sai được, nên việc nào quan trọng thì vẫn phải có người kiểm lại.',
  'Học máy cơ bản':
    'Học máy là cách làm AI mà ta không viết luật, ta đưa ví dụ. Máy nhìn nhiều cặp "đầu vào — đáp án" rồi tự dò ra cách biến đầu vào thành đáp án.',
  'Dữ liệu huấn luyện':
    'Là bộ ví dụ dùng để dạy máy. Dữ liệu lệch thì máy lệch theo: cho xem toàn mèo trắng thì gặp mèo đen nó đoán kém. Nhiều dữ liệu là tốt, nhưng đủ đa dạng còn quan trọng hơn nhiều.',
  'Học có giám sát':
    'Kiểu học mà mỗi ví dụ đều kèm đáp án đúng. Máy đoán, so với đáp án, sai thì sửa dần. Phần lớn ứng dụng đang chạy ngoài đời là kiểu này.',
  'Mạng nơ-ron':
    'Một cách xếp phép tính thành nhiều tầng, tầng sau nhận kết quả của tầng trước. Từng phép rất đơn giản; xếp nhiều tầng thì cả mạng học được những quy luật phức tạp.',
  'Tầng và trọng số':
    'Trọng số là những con số quyết định mỗi đầu vào quan trọng đến đâu. Học chính là chỉnh dần các trọng số đó. Một mạng lớn có hàng triệu trọng số, không ai đặt tay từng cái.',
  'Lan truyền ngược':
    'Cách máy biết phải chỉnh trọng số nào. Sau mỗi lần đoán sai, sai số được truyền ngược từ đầu ra về từng tầng; tầng nào góp phần gây sai nhiều thì bị chỉnh nhiều.',
  'Nhận diện ảnh':
    'Máy học từ các mảng điểm ảnh: tầng đầu nhìn ra cạnh và góc, tầng sau ghép thành hình, tầng cuối gọi tên. Nó không nhìn ảnh như người, nên đổi góc chụp hay đổi ánh sáng là kết quả đổi theo.',
  'Xử lý ngôn ngữ':
    'Chữ được đổi thành số trước, rồi máy học xác suất từ nào thường đi với từ nào. Vì vậy nó viết trôi chảy mà vẫn có thể nói sai — trôi chảy và đúng là hai việc khác nhau.',
  'Mô hình sinh':
    'Loại mô hình tạo ra cái mới thay vì chỉ phân loại: viết đoạn văn, vẽ ảnh, ghép nhạc. Nó ghép theo quy luật đã học, nên hay đúng dáng mà sai chi tiết.',
  'Giới hạn và rủi ro':
    'Máy chỉ giỏi trong vùng dữ liệu nó từng thấy. Ra ngoài vùng đó nó vẫn trả lời chắc nịch mà sai. Thêm hai chuyện nữa phải để ý: dữ liệu cá nhân, và dữ liệu lệch làm kết quả thiên vị.',
  'Ứng dụng thực tế':
    'Chọn việc mà sai một chút không gây hại lớn, có sẵn dữ liệu, và có người kiểm ở cuối. Ba điều đó quyết định một ứng dụng AI chạy được hay không, hơn cả việc dùng mô hình nào.',
};
