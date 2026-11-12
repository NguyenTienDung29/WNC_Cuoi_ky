# Bộ kiểm thử thực hành – SportHub v2

Dưới đây là **kịch bản cần tự chạy trên Docker Desktop**, không phải kết quả PASS đã được xác nhận.

| Mã | Vai trò | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| T01 | Hệ thống | `docker compose ps` | db, api, web đều healthy / running |
| T02 | Khách | GET `/health` | JSON `status=ok`, `database=connected` |
| T03 | Khách | GET `/api/events` | Danh sách từ PostgreSQL, 8 dữ liệu `[DEMO]` nếu DB mới |
| T04 | Khách | Lọc chạy bộ / tìm kiếm | Chỉ còn sự kiện phù hợp |
| T05 | Khách | Xem trang Kiến thức | Liên kết nguồn chính thức có thể mở |
| T06 | Thành viên | Tạo tài khoản hợp lệ | Thành công, token phiên trả về |
| T07 | Thành viên | Đăng nhập đúng / sai mật khẩu | 200 / 401 |
| T08 | Thành viên | Đăng ký sự kiện còn chỗ | Tăng 1 lượt active |
| T09 | Thành viên | Đăng ký trùng | 409, không tăng thêm lượt |
| T10 | Thành viên | Hủy đăng ký | Cập nhật trạng thái cancelled |
| T11 | Thành viên | Xem Vé của tôi | Hiện mã vé SH-XXXXXX |
| T12 | Quản trị | Tạo sự kiện + email liên hệ | Hiển thị ngay trên danh sách |
| T13 | Quản trị | Sửa/đóng sự kiện | Khách không còn được đăng ký sự kiện đã đóng |
| T14 | Quản trị | Check-in một lượt active | `checked_in_at` được ghi |
| T15 | Quản trị | Check-in trùng | 409, không ghi lần hai |
| T16 | Quản trị | Xuất CSV | Tải file danh sách đăng ký với thông tin hợp lệ |
| T17 | Hệ thống | `docker compose down` và `up -d` | Dữ liệu trong PostgreSQL volume vẫn giữ |
| T18 | Hệ thống | Chạy Vite 5173 + API 4000 | Lấy được danh sách events và stats |
| T19 | Bảo mật | Member gọi `/api/admin/stats` | 403 |
| T20 | Môi trường | Dừng API, thử tải trang | Hiện thông báo lỗi và nút thử lại, không giả `0 sự kiện` |

Chỉ đánh PASS sau khi thu được kết quả và ảnh thật trên máy thực hành; ghi FAIL và log khi không đạt.
