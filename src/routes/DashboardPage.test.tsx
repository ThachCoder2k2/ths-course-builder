import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import App from '../App';

function renderDashboard() {
  return render(
    <MemoryRouter initialEntries={['/']}>
      <App />
    </MemoryRouter>,
  );
}

beforeEach(() => localStorage.clear());

describe('DashboardPage', () => {
  it('renders every section of Figma node 177:2981', () => {
    renderDashboard();
    expect(screen.getByTestId('page-dashboard')).toBeInTheDocument();

    // Thiết kế đặt cùng tiêu đề "Khoá học nổi bật" cho cả hai hàng thẻ; ở đây hàng thứ hai
    // đổi tên vì hai tiêu đề y hệt nhau trên một trang thì người đọc không biết khác gì.
    expect(screen.getByRole('heading', { name: 'Khoá học nổi bật' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Khoá học đang được học nhiều' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Giáo trình theo cấp độ' })).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Những khoá học giúp bạn mở khoá kĩ năng mới' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Các tệp khoá học nổi bật xếp theo chủ đề' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('heading', { name: 'Thiết kế lộ trình học cá nhân hoá dành cho bạn' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Kỹ năng phổ biến' })).toBeInTheDocument();
  });

  it('renders the banner carousel (node 550:11602) with three distinct slides', async () => {
    renderDashboard();
    // Thiết kế lặp cùng một tiêu đề cho cả ba slide; ở đây mỗi slide nói một chuyện riêng,
    // vì ba thẻ giống hệt nhau thì băng chuyền không còn lý do tồn tại.
    //
    // Băng chuyền là một đường ray cuộn ngang, không phải ba trang tách rời, nên cả ba
    // tiêu đề đều nằm trong cây trợ năng cùng lúc — không cái nào bị aria-hidden.
    const headings = [
      'Đột phá vật liệu Graphene mở đường cho chip THz',
      'Học AI bằng cách làm ra thứ chạy được',
      'Nói cho người khác hiểu, không chỉ nói cho xong',
    ];
    for (const h of headings) {
      expect(screen.getByRole('heading', { name: h })).toBeInTheDocument();
    }

    // Đường ray nhận được tiêu điểm bàn phím, nên đi được bằng mũi tên mà không cần chuột.
    expect(screen.getByRole('group', { name: /Đường ray banner/ })).toHaveAttribute('tabindex', '0');
  });

  it('điều khiển băng chuyền: thanh tiến độ, hai mũi điều hướng và nút dừng', async () => {
    renderDashboard();
    // Thay ba dấu tròn bằng thanh tiến độ: ở khổ rộng người ta thấy 2,3 trong 3 slide cùng
    // lúc nên chỉ còn hai vị trí cuộn có nghĩa, ba dấu tròn thì có hai cái trỏ về một chỗ.
    expect(screen.getByRole('progressbar', { name: /Vị trí trên đường ray/ })).toBeInTheDocument();

    // jsdom không có kích thước thật nên đường ray coi như chưa cuộn được: mũi "trước" phải
    // ở trạng thái tắt, đúng như khi người dùng đang đứng ở đầu ray.
    expect(screen.getByRole('button', { name: 'Xem banner trước' })).toBeDisabled();

    const sau = screen.getByRole('button', { name: 'Xem banner sau' });
    expect(sau).toBeEnabled();
    const user = userEvent.setup();
    await user.click(sau);

    // Băng chuyền tự chạy thì bắt buộc phải có cách dừng nhìn thấy được — trên màn cảm ứng
    // không có chuyện "trỏ chuột vào để dừng".
    const dung = screen.getByRole('button', { name: 'Dừng băng chuyền tự chạy' });
    await user.click(dung);
    expect(screen.getByRole('button', { name: 'Cho băng chuyền chạy lại' })).toBeInTheDocument();
  });

  /**
   * Chip kỹ năng là LINK, không phải nút. Trước đây chúng là `<button>` không có việc gì
   * nên test cũ chỉ canh sự tồn tại; giờ canh cả ĐÍCH — đó mới là thứ dễ hỏng lại.
   */
  it('chip kỹ năng ở node 179:7785 là link và có đích thật', () => {
    renderDashboard();
    expect(screen.getByRole('link', { name: 'Công nghệ và lập trình' })).toHaveAttribute(
      'href',
      '/tim-kiem?chu-de=khoa-hoc-du-lieu',
    );
    expect(screen.getByRole('link', { name: 'Tranh biện' })).toHaveAttribute(
      'href',
      '/tim-kiem?chu-de=ky-nang-thuyet-trinh',
    );
    // Nhóm chưa có khoá nào trong thư viện thì mở cả thư viện, không gửi từ khoá rỗng kết quả.
    expect(screen.getByRole('link', { name: 'Nhiếp ảnh' })).toHaveAttribute('href', '/tim-kiem');
  });

  it('links course cards to the course detail route', () => {
    renderDashboard();
    const links = screen.getAllByRole('link', { name: /Trí tuệ nhân tạo \(AI\) từ cơ bản/ });
    expect(links[0]).toHaveAttribute('href', '/courses/ai-co-ban-den-thuc-tien');
  });
});
