# KỊCH BẢN THUYẾT TRÌNH ĐỒ ÁN DOCKER CONTAINERS – SPORTHUB

**Mở đầu (1–2 phút):** Đề tài học phần là Docker Containers. SportHub là bài toán ứng dụng thể thao được xây dựng để minh họa đóng gói và triển khai nhiều dịch vụ. Không nhầm chủ đề học phần với ứng dụng nghiệp vụ.

**Kiến thức nền (2–3 phút):** Giải thích image, container, Dockerfile, registry, volume, network, Docker Compose. So sánh VM và container; nêu ưu điểm và các hạn chế.

**Kiến trúc (2 phút):** Sơ đồ Chrome → Nginx/web port 3000 → API Express → PostgreSQL. `db` lưu vào volume; ba container dùng mạng bridge riêng. `health` được reverse proxy tới Express.

**Demo chính (5–7 phút):**

1. Mở Docker Desktop (Engine running) và thư mục source.
2. Chạy `docker compose up --build -d` (nếu đã build trước: `docker compose up -d`).
3. Chạy `docker compose ps`, cho thấy web/api/db đang Up/healthy.
4. Mở `http://localhost:3000`, lọc sự kiện Bóng đá hoặc Bóng rổ.
5. Đăng ký tài khoản thành viên, mở một sự kiện, đăng ký và xem mục Vé của tôi.
6. Đăng xuất, đăng nhập Admin, tạo sự kiện mới và xác nhận nó xuất hiện trên trang Sự kiện.
7. Mở `/health`, `/api/events` chứng minh frontend giao tiếp API và CSDL.
8. Chạy `docker compose logs --tail 20 api`, `docker volume ls`, `docker network ls`.
9. Giải thích data volume tồn tại khi `docker compose down` (không kèm `-v`).

**Kết luận (1–2 phút):** Các thành phần full-stack được khởi chạy bằng một lệnh Compose; rút ra bài học về tái tạo môi trường, quản lý tài nguyên, cấu hình bảo mật. Hướng phát triển: CI/CD GitHub Actions, quản lý secret, triển khai cloud.

## Câu hỏi phản biện dự kiến

- Tại sao dùng Docker thay vì chạy từng chương trình trực tiếp? Vì cấu hình và dependency được mô tả trong code và cô lập theo dịch vụ.
- Vì sao cần Docker Compose? Vì có ba dịch vụ cần network và vòng đời phối hợp.
- Volume khác image? Image dùng làm khuôn mẫu, volume giữ dữ liệu DB khi container được tạo lại.
- PostgreSQL được công khai ra Internet không? Không, compose không mở port 5432 ra host.
- Frontend gọi backend thế nào? Nginx proxy `/api` tới hostname `api:4000` trên mạng nội bộ Docker.
- Nếu API chưa kết nối DB? Healthcheck DB và `depends_on` yêu cầu database healthy trước khi API được tạo.
- Khi sửa code phải làm gì? Build lại bằng `docker compose up --build -d`.
- Làm sao đảm bảo an toàn? Hash mật khẩu, xác thực JWT, phân quyền admin, giới hạn request auth; không dùng mật khẩu demo trên môi trường thật.

**Dự phòng khi demo bị lỗi:** Có file README, code, test case và các ảnh chụp màn hình thực tế trước buổi báo cáo. Nếu cổng 3000 bị chiếm, sửa `APP_PORT=3001` trong `.env` rồi khởi động lại web.
