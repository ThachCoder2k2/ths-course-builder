import mascot from '../../assets/landing/mascot-robot.png';
import mascotHover from '../../assets/landing/mascot-robot-hover.png';

/**
 * Con robot ở lề trái trang chủ (Figma node 550:11506).
 *
 * Trong thiết kế nó KHÔNG trôi nổi trên trang: nó nằm trong "Testimonial section", đứng ở
 * khe giữa mục nội dung thứ 2 và thứ 3, cách mép cột nội dung 60px và cách lề cửa sổ 60px.
 *
 * Bản cũ treo nó bằng `top-[880px]` tính từ đỉnh trang. Con số cứng đó chỉ gần đúng ở đúng
 * một khổ (1280, lệch 4.87px) và lệch hơn 55px ở mọi khổ từ 1440 lên, vì tiêu đề thẻ gãy
 * dòng khác nhau làm mỗi mục dày thêm 30px. Ở đây thay bằng một mốc cao 0 đặt đúng giữa
 * hai mục, nên vị trí luôn đúng dù nội dung dài ngắn thế nào.
 *
 * Hover (ON_HOVER, SMART_ANIMATE, EASE_OUT, 150ms — số lấy từ file Figma): robot phóng 1.5
 * lần, ĐỔI SANG bản vẽ có đôi mắt to và nghiêng, và hiện bong bóng "Hello, bạn 😘".
 */

/**
 * Bong bóng trong bản vẽ hover của Figma nằm ở (6.67, 5) trong khung 180, cỡ 96.67 × 33.67,
 * bo 8. Chiều cao chữ đo được 10.67px, chia hệ số 0.84 (cao chữ hoa cộng phần dấu tiếng Việt
 * tụt xuống dưới) ra cỡ chữ khoảng 12px — không phải 15px như phép chia hệ số 0.72 lúc đầu.
 * Nó nằm BÊN TRONG lớp phóng, nên mọi số ở đây chia 1.5: chữ 8px, đệm 7.25px.
 *
 * Phải nằm trong lớp phóng chứ không thể để ngoài: bản vẽ hover đã xoá bong bóng đi, chỗ
 * đó là một lỗ khoét vào vòm đầu. Bong bóng phải dính chặt vào lỗ để che nó suốt cú phóng.
 */
const BUBBLE =
  'absolute left-[4.44px] top-[3.33px] w-max rounded-[5.33px] px-[7.25px] py-[7.25px] text-[8px] leading-none';

export function Mascot() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative -mx-4 -mt-7xl h-0 lg:-mx-4xl">
      {/*
        `right-full` neo vào mép cột nội dung, `mr-[60px]` là đúng 60px của Figma.
        `top-[-48px]` đặt đỉnh robot cao hơn đáy mục 2 đúng 48px, nên đáy nó thò 8px vào mục 3.

        Ẩn dưới 1800px. Ngưỡng suy ra từ hình học: mép trái robot = mép cột − 180, nên nó
        chỉ cần máng lề ≥ 180px, tức bề rộng cửa sổ ≥ 1800. Cú phóng thì LUÔN vừa chạm mép
        cột dù khổ nào, vì gốc phóng ở góc dưới-trái: 180 nở thành 180 + gốc đứng yên.
        Lỗi cũ là để nó hiện từ 1280px, ở đó nó chồm 78.5px vào trong và dán lên bảng xanh.
      */}
      <div className="ln-mascot-hit pointer-events-auto absolute right-full top-[-48px] mr-[60px] hidden w-[120px] select-none min-[1800px]:block">
        {/* Ba lớp transform riêng, gộp lại thì chúng ghi đè nhau: lớp ngoài phóng khi hover,
            lớp giữa dểnh theo nhịp thở, trong cùng là hai bản vẽ đổi cho nhau. */}
        <div className="ln-mascot-scale">
          <div className="ln-mascot relative">
            <img src={mascot} alt="" className="ln-face-rest h-auto w-full" />
            <img src={mascotHover} alt="" className="ln-face-hover absolute inset-0 h-full w-full" />
            <div className={`ln-bubble ${BUBBLE} bg-[#0A0D12] font-semibold text-white`}>Hello, bạn 😘</div>
          </div>
        </div>
      </div>
    </div>
  );
}
