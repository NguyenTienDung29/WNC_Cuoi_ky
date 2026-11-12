# Phạm vi triển khai SportHub

Đây là **ứng dụng full-stack chạy thật trên máy cá nhân / mạng nội bộ cho mục đích học thuật**, KHÔNG phải dịch vụ thương mại sản xuất đã được kiểm định.

- Các sự kiện `[DEMO]` và địa điểm mô phỏng là dữ liệu giả lập. Không dùng chúng để mời người thật đóng tiền hoặc tham dự ngoài đời.
- **Không có thanh toán trực tuyến**, không có email xác minh, khôi phục mật khẩu qua email, SMS, hợp đồng với địa điểm, chính sách bảo vệ dữ liệu cá nhân hoàn chỉnh hoặc kết nối lịch sự kiện từ API có bản quyền.
- Giá sự kiện do admin nhập chỉ mang tính thông tin, không phải thanh toán đã thu; muốn vận hành có thu phí cần quy trình thu tiền an toàn với nhà cung cấp được cấp phép.
- Các nguồn IFAB, FIBA, BWF, World Athletics, World Aquatics, WHO được sử dụng **chỉ để trỏ liên kết tư liệu chính thức**; không tuyên bố liên kết đối tác, không sao chép bài viết/hình ảnh độc quyền.
- Việc phát hành công khai Internet cần HTTPS, domain, cơ chế xác thực và quản lý phiên mạnh hơn, reset mật khẩu, email, bảo vệ API, chính sách quyền riêng tư, chống spam, monitoring, backup, kiểm thử bảo mật và pháp lý.
- Không commit file `.env`, không công bố mật khẩu admin hoặc chuỗi kết nối cơ sở dữ liệu.
- CSV chỉ export qua quyền admin; file chứa email người tham dự, cần xử lý riêng tư.
- Để backup CSDL: `docker compose exec -T db pg_dump -U sporthub -d sporthub > sporthub_backup.sql` (điều chỉnh user/database theo .env). Lưu backup ở nơi an toàn và thử khôi phục trước khi cần dùng.
