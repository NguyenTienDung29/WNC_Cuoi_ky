> **Cập nhật giao diện:** phiên bản PLAYGROUND Edition. Xem [THIET_KE_GIAO_DIEN_MOI.md](THIET_KE_GIAO_DIEN_MOI.md) để cập nhật giao diện bằng Docker Compose.

# SportHub — Đồ án cuối kỳ Docker Containers

## CẬP NHẬT v2 – Khắc phục lỗi 500 / danh sách trống

Đã bổ sung **API loopback 4000 cho Vite**, migration schema tự động khi volume đã tồn tại, seed DEMO có điều kiện khi bảng trống, lỗi API có nút thử lại, trang Kiến thức thể thao có nguồn IFAB/FIBA/BWF/World Athletics/World Aquatics/WHO, thông tin đơn vị tổ chức, mã vé, check-in admin, xuất CSV và hướng dẫn Windows.

**Chạy nhanh:** Mở Docker Desktop -> PowerShell tại thư mục có `compose.yaml` -> `powershell -ExecutionPolicy Bypass -File .\scripts\Start-SportHub.ps1` -> mở **http://localhost:3000**. Kiểm tra bằng `powershell -ExecutionPolicy Bypass -File .\scripts\KiemTra-SportHub.ps1`.

**Nếu đang xem trang ở `192.168.56.1:5173`:** Đây là Vite dev, không phải bản Docker Nginx. Chạy Compose trước để API ở `127.0.0.1:4000` hoạt động. Xem `docs/KHAC_PHUC_LOI_500.md`.

**Dữ liệu và hạn chế:** `docs/DU_LIEU_THAM_KHAO.md` và `docs/BAO_MAT_VA_GIOI_HAN.md`. Không gọi các sự kiện giả lập là lịch thi đấu thật và không nhận thanh toán.

---


**Chủ đề học phần:** Docker Containers.  
**Sản phẩm thực hành:** Website quản lý và đăng ký sự kiện thể thao **SportHub**.  
**Kiến trúc:** React (frontend) + Node.js/Express (REST API) + PostgreSQL (CSDL) + Nginx (reverse proxy) + Docker Compose.

## 1. Các chức năng đã viết trong mã nguồn

**Khách:** xem danh sách và thông tin sự kiện, tìm kiếm, lọc môn thể thao, sắp xếp, xem thống kê chung, tham khảo luật thi đấu chính thức và nội dung FAQ.

**Thành viên:** đăng ký tài khoản, đăng nhập, đăng ký tham gia, xem mã vé, trạng thái check-in, danh sách các sự kiện đã đăng ký và hủy đăng ký. Hệ thống không cho đăng ký trùng và kiểm tra sức chứa bằng giao dịch trong PostgreSQL.

**Quản trị viên:** đăng nhập, xem số liệu, tạo/sửa/xóa sự kiện, quản lý thông tin đơn vị tổ chức, xem danh sách người tham gia, check-in, xuất CSV, mở/đóng đăng ký.

**Nền tảng Docker:** ba container, mạng bridge riêng, named volume PostgreSQL, healthchecks, Dockerfile riêng cho web/API, Nginx proxy `/api` và `/health`, API loopback cổng 4000 cho Vite.

> Đây là mã nguồn thực hành và báo cáo học thuật. Không dùng tài khoản demo/mật khẩu mặc định để xuất bản Internet. Code được kiểm tra cú pháp và cấu trúc tĩnh trong môi trường tạo file; môi trường này **không có Docker daemon hoặc quyền tải gói npm**, vì vậy bạn cần chạy kiểm thử tích hợp thực tế trên Docker Desktop của mình và chụp minh chứng trước khi nộp.

## 2. Chạy toàn bộ hệ thống bằng Docker (khuyến nghị)

Điều kiện: Windows 10/11, Docker Desktop **Engine running**, dùng Linux containers/WSL 2, dung lượng trống cho images.

**Bước 1.** Giải nén ZIP, mở PowerShell/CMD tại thư mục có `compose.yaml`.

**Bước 2.** Dùng cấu hình mẫu cho máy thực hành. Phải tạo `.env` chứa các bí mật riêng (hoặc dùng script Start-SportHub.ps1 để tự tạo):

```powershell
Copy-Item .env.example .env
```

Mở `.env`, chỉnh `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_PASSWORD` thành các giá trị của riêng bạn. **Không chia sẻ `.env`**.

**Bước 3.** Xây dựng và khởi chạy:

```powershell
docker compose up --build -d
```

**Bước 4.** Kiểm tra container:

```powershell
docker compose ps
docker compose logs --tail 40 api
```

**Bước 5.** Mở trình duyệt:

- Giao diện: <http://localhost:3000>
- API health: <http://localhost:3000/health>
- Danh sách sự kiện (JSON): <http://localhost:3000/api/events>
- Thống kê (JSON): <http://localhost:3000/api/stats>

Trong `/health`, mong đợi JSON tương tự:

```json
{"status":"ok","service":"sporthub-api","database":"connected"}
```

**Đăng nhập quản trị:**
- Email: theo `ADMIN_EMAIL` trong `.env` (mặc định `admin@sporthub.local`).
- Mật khẩu: theo `ADMIN_PASSWORD` được tạo riêng trong `.env` (không phải mật khẩu công khai).

Tài khoản quản trị chỉ được tạo khi API khởi chạy lần đầu trên CSDL chưa có email này. Nếu đã tạo trước đó, thay đổi `ADMIN_PASSWORD` trong `.env` **không đổi mật khẩu của tài khoản cũ**. Khi dùng dữ liệu hiện có, hãy dùng mật khẩu ban đầu hoặc cập nhật dữ liệu theo quy trình an toàn.

### Nếu cổng 3000 đang bị chiếm

Bạn có thể vẫn đang chạy `npm start` của bài demo cũ ở cổng 3000. Hãy dừng tiến trình cũ (`Ctrl+C`) **hoặc** đổi trong `.env`:

```
APP_PORT=3001
```

Sau đó chạy `docker compose up -d` và mở `http://localhost:3001`. Phía trong container Nginx vẫn dùng cổng 80; API vẫn dùng cổng 4000.

### Lệnh Docker phục vụ thuyết trình

```powershell
docker images
docker compose ps
docker compose logs --tail 30 web
docker compose logs --tail 30 api
docker network ls
docker volume ls
docker compose exec api sh
docker compose exec db psql -U sporthub -d sporthub -c "SELECT id,title FROM events LIMIT 5;"
```

Nếu trong `.env` bạn đổi `POSTGRES_USER` / `POSTGRES_DB`, hãy sửa tương ứng trong lệnh `psql`.

**Dừng mà vẫn giữ dữ liệu:**

```powershell
docker compose down
```

**KHÔNG chạy `docker compose down -v`** trừ khi bạn thực sự muốn xóa dữ liệu PostgreSQL đã lưu trong volume.

## 3. Chạy thủ công để phát triển (tùy chọn)

Để chạy ngoài Docker, cần cài Node.js từ 20 trở lên và PostgreSQL có schema trong `backend/sql/schema.sql` (backend tự áp dụng khi khởi động).

Ở `backend`, đặt biến môi trường `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`, sau đó:

```powershell
cd backend
npm install
npm start
```

Mở terminal khác cho frontend:

```powershell
cd frontend
npm install
npm run dev
```

Truy cập `http://localhost:5173`. Vite proxy `/api` và `/health` sang `localhost:4000`.

**Lưu ý:** Khi dùng Docker Compose, **không cần** chạy thủ công Node.js hay PostgreSQL trên Windows.

## 4. Cấu trúc mã nguồn

```text
SportHub_Docker_Fullstack/
├── compose.yaml               # 3 dịch vụ và cách ghép container
├── .env.example               # mẫu biến môi trường
├── backend/
│   ├── Dockerfile
│   ├── sql/schema.sql          # 3 bảng + migrations
│   ├── sql/seed.sql            # sự kiện DEMO có điều kiện
│   ├── src/server.js          # REST API + auth + transactions
│   └── package.json
├── frontend/
│   ├── Dockerfile             # multi-stage Node build -> Nginx
│   ├── nginx.conf             # reverse proxy và SPA fallback
│   ├── index.html
│   ├── public/favicon.svg
│   └── src/{App.jsx,api.js,main.jsx,styles.css}
├── scripts/smoke-test.ps1
└── docs/
    ├── API.md
    ├── KIEM_THU.md
    └── KICH_BAN_THUYET_TRINH.md
```

## 5. Mô hình dữ liệu

- `users`: tài khoản, vai trò `member/admin`, mật khẩu lưu dưới dạng hash bcrypt.
- `events`: thông tin, địa điểm, thời gian, giá, sức chứa, trạng thái sự kiện.
- `registrations`: liên kết người dùng ↔ sự kiện, trạng thái `active/cancelled`, ràng buộc UNIQUE chống trùng.

PostgreSQL lưu trên volume `sporthub_pgdata`. Sự kiện DEMO chỉ được tạo nếu `SEED_DEMO_EVENTS=true` và bảng `events` trống; không phải lịch thi đấu thật.

## 6. Kiểm thử

Chạy PowerShell script bên dưới sau khi dịch vụ đã healthy:

```powershell
powershell -ExecutionPolicy Bypass -File .\scripts\smoke-test.ps1
```

Tài liệu `docs/KIEM_THU.md` hướng dẫn thêm kiểm thử người dùng và quản trị. Các ảnh kiểm thử phải lấy từ **máy Docker Desktop của người thực hiện**, không thay bằng ảnh thiết kế hoặc giả lập.

## 7. Minh chứng cần chụp cho báo cáo Word

1. VS Code: cấu trúc dự án + `compose.yaml`.
2. `docker compose up --build -d`, dòng build & container healthy.
3. `docker compose ps` cho thấy `sporthub-web`, `sporthub-api`, `sporthub-db` (tên thực tế dạng `sporthub-web-1`,...).
4. `http://localhost:3000` giao diện trang chủ + danh sách sự kiện.
5. `http://localhost:3000/health` trả về JSON thành công.
6. Đăng ký tài khoản, đăng ký/hủy một sự kiện, mục Vé của tôi.
7. Giao diện quản trị tạo/sửa sự kiện và thay đổi hiển thị trên trang web.
8. `docker volume ls`, `docker network ls` và `docker compose logs`.
9. Kiểm tra dữ liệu vẫn còn sau `docker compose down` rồi `docker compose up -d`.

## 8. Tài liệu tham khảo

- Docker Docs: https://docs.docker.com/
- Docker Compose: https://docs.docker.com/compose/
- Dockerfile reference: https://docs.docker.com/reference/dockerfile/
- Docker Node.js guide: https://docs.docker.com/guides/nodejs/
- Express: https://expressjs.com/
- React: https://react.dev/
- PostgreSQL: https://www.postgresql.org/docs/
