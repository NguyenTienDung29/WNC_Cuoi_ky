# SportHub v2 – Cách sửa lỗi 500 và 0 sự kiện trên Windows

## Tại sao ảnh cũ bị lỗi?

Ảnh bạn gửi đang mở `http://192.168.56.1:5173` (Vite dev server), **không phải** web Nginx của Docker Compose trên cổng 3000. Trong bản trước, Vite proxy `/api` tới `http://localhost:4000`, nhưng Compose không công bố cổng API ra máy Windows. Khi frontend không liên hệ được API, trang danh sách có thể báo lỗi 500 và hiển thị 0 sự kiện. Các nguyên nhân khác (database/seed) vẫn cần xác nhận bằng log, không kết luận chỉ qua ảnh.

## Cách chạy ổn định (khuyên dùng): toàn bộ trên Docker

1. Giải nén bộ mới vào thư mục **khác thư mục cũ** (để không lẫn version).
2. Mở Docker Desktop, xác nhận `Engine running`. **Nếu đã chạy SportHub bản cũ với PostgreSQL volume, hãy chép file `.env` của bản cũ sang thư mục bản mới trước khi chạy; nếu thiếu .env và có volume cũ, script sẽ dừng để tránh cấp mật khẩu mới không khớp.**
3. Mở PowerShell ở thư mục có `compose.yaml`; lần đầu chạy `powershell -ExecutionPolicy Bypass -File .\scripts\Start-SportHub.ps1`. Script tự tạo `.env` với mật khẩu ngẫu nhiên khi chưa có, giữ nguyên khi đã có.
4. Mở `http://localhost:3000` và `http://localhost:3000/health`.
5. Chạy `docker compose ps`, `docker compose logs --tail 120 api`, `docker compose logs --tail 120 db` nếu cần.
6. Chạy `powershell -ExecutionPolicy Bypass -File .\scripts\KiemTra-SportHub.ps1` để kiểm thử API.

> Đừng mở `:5173` nếu đang muốn kiểm tra bản build production qua Nginx; sử dụng `:3000` hoặc APP_PORT của `.env`.

## Nếu muốn chạy frontend Vite trên 5173

Đầu tiên chạy `docker compose up --build -d`. Trong bản mới, API publish **chỉ trên loopback** `127.0.0.1:4000`. Kiểm tra `http://127.0.0.1:4000/health`.

Sau đó:

```powershell
cd frontend
npm install
npm run dev
```

Mở `http://localhost:5173` trên máy chạy Vite. Vite proxy request `/api` đến API trên cổng 4000. Không cần chạy backend `npm start` song song.

## Nếu có 0 sự kiện

```powershell
docker compose ps
docker compose logs --tail 120 api
docker compose exec db psql -U sporthub -d sporthub -c 'SELECT COUNT(*) FROM events;'
```

Nếu `.env` đổi tên người dùng hoặc database, thay vào lệnh `psql` cho đúng. Bản mới tự áp migration khi API khởi động và chỉ thêm dữ liệu demo **khi bảng events đang trống** và `SEED_DEMO_EVENTS=true`.

Nếu CSDL cũ chứa sự kiện, bản mới không ghi đè. Đừng chạy `docker compose down -v` vì xóa dữ liệu PostgreSQL!

## Nếu database báo xác thực không thành công

Nếu `.env` đã đổi `POSTGRES_PASSWORD` nhưng named volume PostgreSQL cũ được tạo bằng mật khẩu khác, Postgres **không tự đổi mật khẩu** chỉ vì `.env` được sửa. Dùng lại mật khẩu ban đầu hoặc thực hiện đổi trong PostgreSQL bằng tài khoản có quyền. Không tùy tiện xóa volume.

## Kiểm tra định kỳ

- `GET /health` – kết nối CSDL.
- `GET /api/meta` – tổng số sự kiện và số sự kiện mẫu.
- `GET /api/events` – danh sách sự kiện từ PostgreSQL.
- `GET /api/resources` – liên kết tham khảo công khai.
- `docker compose logs --tail 100 api` – log lỗi backend.
- `docker compose exec db pg_isready -U sporthub -d sporthub` – trạng thái DB.
