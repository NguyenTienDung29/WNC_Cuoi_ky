# Hướng phát triển CI/CD với GitHub Actions

File `.github/workflows/ci.yml` được chuẩn bị như một **mẫu tự động kiểm tra và build**, chưa có bằng chứng đã chạy trên GitHub cho repo cụ thể của sinh viên.

Workflow dự kiến khi push vào `main` hoặc tạo PR:
1. Checkout source.
2. Cài Node 22.
3. Kiểm tra cú pháp Express (`npm run check`).
4. Build frontend React (`npm run build`).
5. Build Docker image backend và frontend.

Để sử dụng thực tế: tạo repository GitHub riêng, đưa code lên, theo dõi tab **Actions**, xử lý các cảnh báo phát sinh và chụp ảnh kết quả workflow nếu muốn bổ sung phần CI/CD trong báo cáo. Workflow hiện không tự deploy và không tự push image lên registry vì chưa có credentials; đây là lựa chọn an toàn cho đồ án cá nhân.
