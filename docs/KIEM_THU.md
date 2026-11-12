# KẾ HOẠCH VÀ KỊCH BẢN KIỂM THỬ SPORTHUB

Các trường hợp dưới đây là **kịch bản cần thực thi**, không phải kết quả kiểm thử đã đạt. Sau khi chạy trên Docker Desktop, điền PASS/FAIL theo thực tế và chụp minh chứng.

| Mã | Nội dung | Thao tác | Kết quả mong đợi |
|---|---|---|---|
| TC01 | Khởi chạy stack | `docker compose up --build -d` | web/api/db Running/healthy |
| TC02 | Kiểm tra backend | Truy cập `/health` | JSON status `ok`, database connected |
| TC03 | Danh sách sự kiện | Mở trang Sự kiện | Tối thiểu một event mẫu |
| TC04 | Lọc môn thể thao | Chọn Bóng rổ | Chỉ còn sự kiện bóng rổ |
| TC05 | Tìm kiếm | Gõ tên sự kiện | Kết quả phù hợp từ khóa |
| TC06 | Đăng ký thành viên | Đăng ký email mới + mật khẩu ≥8 | Tài khoản member được tạo |
| TC07 | Email trùng | Đăng ký lại cùng email | HTTP 409 / thông báo email tồn tại |
| TC08 | Đăng nhập | Nhập tài khoản đã tạo | Header hiện tên người dùng |
| TC09 | Đăng ký sự kiện | Chọn sự kiện còn chỗ → đăng ký | Xác nhận thành công, xuất hiện trong Vé của tôi |
| TC10 | Đăng ký trùng | Thử đăng ký cùng sự kiện lần nữa | Cảnh báo đã đăng ký (409) |
| TC11 | Hủy đăng ký | Trong Vé của tôi → Hủy | Lượt đăng ký chuyển trạng thái cancelled |
| TC12 | Phân quyền | Member mở chức năng admin | API từ chối 403 / không thấy menu admin |
| TC13 | Đăng nhập quản trị | Dùng admin demo | Xuất hiện menu Quản trị |
| TC14 | Thêm sự kiện | Admin nhập đủ thông tin | Event mới xuất hiện ở danh sách |
| TC15 | Sửa sự kiện | Thay tên/địa điểm | Dữ liệu hiển thị được cập nhật |
| TC16 | Xóa sự kiện | Chọn Xóa → xác nhận | Event không còn trong danh sách |
| TC17 | Đóng đăng ký | Admin đổi status closed | User không thể đăng ký |
| TC18 | Docker logs | `docker compose logs --tail 30 api` | Hiển thị log ứng dụng |
| TC19 | Volume giữ dữ liệu | Tạo event, `docker compose down`, `docker compose up -d` | Event vẫn còn |
| TC20 | Network nội bộ | `docker network ls` | Có mạng `sporthub_sporthub_internal` hoặc tên dự án tương ứng |

**Lưu ý:** `docker compose down -v` xóa dữ liệu DB và không được dùng trong TC19.

## Bảng tổng hợp kết quả thực tế (điền sau khi chạy)

- Số ca đã chạy: __________ / 20
- PASS: __________
- FAIL: __________
- Tỷ lệ đạt: __________ %
- Người thực hiện: __________
- Ngày thực hiện: __________
- Các lỗi còn tồn tại / hướng khắc phục: __________________________________
