-- Sự kiện hoàn toàn GIẢ LẬP phục vụ kiểm thử học phần; KHÔNG phải lịch ngoài đời.
INSERT INTO events(title,sport,venue,city,start_time,capacity,price,description,theme,status,is_demo,organizer,contact_email)
SELECT title,sport,venue,city,start_time,capacity,price,description,theme,'open',TRUE,'Ban tổ chức SportHub (demo)',''
FROM (VALUES
('[DEMO] Giải bóng đá phong trào', 'Bóng đá','Sân thể thao minh họa A','TP. Hồ Chí Minh', NOW() + INTERVAL '12 days',80,0,'Giải đấu mô phỏng đăng ký bóng đá cộng đồng; không phải sự kiện có thật.','emerald'),
('[DEMO] Bóng rổ đường phố 3x3','Bóng rổ','Nhà thi đấu minh họa B','TP. Hồ Chí Minh',NOW()+INTERVAL '16 days',60,0,'Sự kiện mẫu để trải nghiệm đăng ký và quản lý lượt tham gia bóng rổ 3x3.','orange'),
('[DEMO] Chạy bộ bình minh 5km','Chạy bộ','Công viên mô phỏng C','TP. Thủ Đức',NOW()+INTERVAL '7 days',250,0,'Buổi chạy minh họa việc đặt suất tham gia và theo dõi lịch cá nhân.','violet'),
('[DEMO] Giao hữu cầu lông đôi','Cầu lông','Sân cầu lông mô phỏng D','TP. Hồ Chí Minh',NOW()+INTERVAL '9 days',48,0,'Sự kiện mẫu dành cho thử nghiệm lọc môn thể thao và giới hạn số chỗ.','blue'),
('[DEMO] Bơi tiếp sức cộng đồng','Bơi lội','Hồ bơi mô phỏng E','TP. Hồ Chí Minh',NOW()+INTERVAL '22 days',90,0,'Sự kiện mẫu, KHÔNG phải lời mời đăng ký buổi bơi thực tế.','cyan'),
('[DEMO] Chạy bộ cuối tuần 10km','Chạy bộ','Đường chạy mô phỏng F','TP. Hồ Chí Minh',NOW()+INTERVAL '32 days',150,0,'Sự kiện mô phỏng phục vụ đồ án Docker Containers và kiểm thử API.','violet'),
('[DEMO] Giải bóng đá sinh viên','Bóng đá','Sân sinh viên mô phỏng G','TP. Hồ Chí Minh',NOW()+INTERVAL '19 days',120,0,'Giải bóng đá GIẢ LẬP để sinh viên thực hành điều phối container.','emerald'),
('[DEMO] Bóng rổ giao lưu cuối tuần','Bóng rổ','Sân bóng rổ mô phỏng H','TP. Hồ Chí Minh',NOW()+INTERVAL '27 days',70,0,'Mô phỏng quy trình đăng ký, hủy và check-in sự kiện.','orange')
) AS t(title,sport,venue,city,start_time,capacity,price,description,theme)
WHERE NOT EXISTS (SELECT 1 FROM events);
