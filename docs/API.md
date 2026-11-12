# Danh sách REST API của SportHub

Đường dẫn trình duyệt qua Nginx: `http://localhost:3000`. Khi dùng môi trường Vite dev: `http://localhost:5173` (được proxy sang API port 4000).

| Phương thức | Endpoint | Quyền | Chức năng |
|---|---|---|---|
| GET | `/health` | Công khai | Trạng thái API và database |
| GET | `/api/sports` | Công khai | Danh sách môn thể thao |
| GET | `/api/stats` | Công khai | Thống kê tổng quát |
| GET | `/api/events` | Công khai | Danh sách, lọc `q`, `sport`, `sort` |
| GET | `/api/events/:id` | Công khai | Chi tiết sự kiện |
| POST | `/api/auth/register` | Công khai | Tạo tài khoản member |
| POST | `/api/auth/login` | Công khai | Đăng nhập, nhận JWT |
| GET | `/api/auth/me` | Member/Admin | Thông tin tài khoản |
| GET | `/api/me/registrations` | Member/Admin | Sự kiện đã tham gia |
| POST | `/api/events/:id/register` | Member/Admin | Đăng ký một sự kiện |
| DELETE | `/api/events/:id/register` | Member/Admin | Hủy đăng ký |
| GET | `/api/admin/stats` | Admin | Thống kê quản trị |
| GET | `/api/admin/registrations` | Admin | Danh sách lượt đăng ký |
| POST | `/api/admin/events` | Admin | Tạo sự kiện |
| PUT | `/api/admin/events/:id` | Admin | Cập nhật sự kiện |
| DELETE | `/api/admin/events/:id` | Admin | Xóa sự kiện |

## Ví dụ kiểm thử

```powershell
Invoke-RestMethod http://localhost:3000/health
Invoke-RestMethod http://localhost:3000/api/stats
Invoke-RestMethod http://localhost:3000/api/events
```

Đăng ký tài khoản:

```powershell
$payload = @{full_name='Nguoi Demo';email='demo-test@example.com';password='DemoTest123'} | ConvertTo-Json
$auth = Invoke-RestMethod -Uri http://localhost:3000/api/auth/register -Method POST -ContentType 'application/json' -Body $payload
$token = $auth.token
```

Đăng ký sự kiện (thay `1` bằng ID một sự kiện có chỗ trống):

```powershell
Invoke-RestMethod -Uri http://localhost:3000/api/events/1/register -Method POST -Headers @{Authorization="Bearer $token"}
```

## Giao diện JSON chính

`GET /api/events` trả về `{ "events": [...] }`, trong mỗi sự kiện có `registered`, `remaining`, `capacity`, `status`.

`POST /api/auth/login` trả về `{ "token": "...", "user": { "id": 1, "full_name": "...", "role": "member" } }`.

Lỗi trả về `{ "error": "Nội dung lỗi" }` kèm HTTP status phù hợp (400, 401, 403, 404, 409, 500).


## API bổ sung trong phiên bản v2

| Method | Đường dẫn | Quyền | Công dụng |
|---|---|---|---|
| GET | `/api/meta` | Công khai | Tình trạng dịch vụ, tổng số sự kiện và số sự kiện DEMO |
| GET | `/api/resources` | Công khai | Danh sách liên kết nguồn luật thể thao chính thức |
| POST | `/api/admin/registrations/:id/checkin` | Admin | Check-in một lượt đăng ký active chưa check-in |
| GET | `/api/admin/registrations.csv` | Admin | Xuất dữ liệu đăng ký dưới dạng CSV |

Trường dữ liệu mới của sự kiện: `organizer`, `contact_email`, `is_demo`. Trường mới của lượt đăng ký: `checked_in_at`. Cơ sở dữ liệu được migrate trong bootstrap của API.

**Lưu ý:** `is_demo=true` biểu thị bản ghi giả lập, không phải sự kiện có thật. Các tài liệu IFAB/FIBA/BWF/World Athletics/World Aquatics/WHO không xác minh hay bảo trợ cho dữ liệu DEMO của SportHub.
