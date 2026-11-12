# SportHub — Làm mới giao diện (PLAYGROUND Edition)

## Thay đổi

- Thiết kế lại nhận diện SportHub theo bảng màu **ink / warm white / electric lime / coral**.
- Header có điều hướng rõ trạng thái, hỗ trợ menu di động.
- Hero thể thao dạng minh họa CSS tự vẽ, tiêu đề nổi bật, CTA đến trang sự kiện.
- Thẻ sự kiện: môn, thời điểm, địa điểm, số chỗ, trạng thái và hành động xem chi tiết rõ ràng.
- Bố cục lọc/tìm kiếm, vé của tôi, trang quản trị, form tài khoản và modal chi tiết đều được thiết kế lại.
- Nâng tương phản, `:focus-visible`, hỗ trợ `prefers-reduced-motion`, responsive ở tablet/mobile.
- Tên `[DEMO]` trong title được làm sạch **chỉ khi hiển thị**, giữ dữ liệu gốc ở backend để đối chiếu; footer thông báo dữ liệu mang tính minh họa.

## File thay đổi

| File | Mục đích |
|---|---|
| `frontend/src/App.jsx` | Điều chỉnh hero, event cards, tiêu đề và microcopy; giữ nghiệp vụ/API |
| `frontend/src/redesign.css` | Toàn bộ thiết kế mới, tách lớp override dễ bảo trì |
| `frontend/src/main.jsx` | Import `redesign.css` sau `styles.css` |
| `frontend/index.html` | Theme-color, metadata đồng nhất |
| `frontend/public/favicon.svg` | Favicon màu mới |

## Cách chạy bằng Docker Containers

1. Backup dự án đang chạy và **giữ nguyên file `.env`** tại thư mục gốc. Không xóa PostgreSQL named volume.
2. Áp dụng file từ bản patch vào đúng đường dẫn cùng tên.
3. Mở Docker Desktop, kiểm tra `Engine running`.
4. Tại thư mục `SportHub_Docker_Fullstack`, chạy:

```powershell
docker compose up -d --build web
docker compose ps
```

5. Mở `http://localhost:3000`, nhấn `Ctrl+F5` nếu còn cache.
6. Kiểm tra `http://localhost:3000/health` và `http://localhost:3000/api/events`.
7. Kiểm thử giao diện: Trang chủ → Sự kiện → Chi tiết → Đăng nhập → Vé của tôi → Quản trị.

**Ghi chú:** Nếu đang chạy Vite bằng `npm run dev`, thay file và lưu sẽ tự hot reload, nhưng cổng 5173 phải có backend hoạt động trên 4000. Khi thuyết trình đồ án Docker, nên chạy qua Compose trên `localhost:3000`.

## Trạng thái xác minh

- Đã xác minh **cú pháp JSX** bằng TypeScript compiler và **cú pháp CSS** bằng CSS parser.
- 7/7 unit test backend (`backend/tests/validation.test.js`) đạt.
- Chưa chạy build frontend bằng `npm run build` hoặc tích hợp trên Docker Engine trong môi trường tạo file này. Máy người dùng cần thực hiện bước Docker build và kiểm tra hình ảnh giao diện thực tế.

## Lưu ý khi nộp

- Gói mã nguồn **không chứa `.env`** và không chứa thư mục `node_modules`.
- Có thể tạo `.env` dựa trên `.env.example` hoặc dùng script `scripts/Start-SportHub.ps1` trên bản cài mới.
- Thay giao diện **không đổi** cơ sở dữ liệu, API, cấu trúc container hay chức năng quản trị.
- Đây là dự án học thuật. Không đại diện cho các đơn vị tổ chức giải đấu; không xem các sự kiện seed là lịch tổ chức thật.
