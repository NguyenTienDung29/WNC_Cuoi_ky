-- Init on brand-new database. API also applies schema.sql on every startup.
-- Khởi tạo CSDL SportHub (chạy lần đầu khi Docker volume còn rỗng).
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name VARCHAR(100) NOT NULL,
  email VARCHAR(180) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(12) NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS events (
  id SERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  sport VARCHAR(40) NOT NULL CHECK (sport IN ('Bóng đá', 'Bóng rổ', 'Cầu lông', 'Chạy bộ', 'Bơi lội', 'Khác')),
  venue VARCHAR(180) NOT NULL,
  city VARCHAR(100) NOT NULL DEFAULT 'TP. Hồ Chí Minh',
  start_time TIMESTAMPTZ NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity BETWEEN 1 AND 100000),
  price INTEGER NOT NULL DEFAULT 0 CHECK (price >= 0),
  description TEXT NOT NULL DEFAULT '',
  theme VARCHAR(30) NOT NULL DEFAULT 'emerald',
  status VARCHAR(12) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS registrations (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  event_id INTEGER NOT NULL REFERENCES events(id) ON DELETE CASCADE,
  status VARCHAR(12) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, event_id)
);
CREATE INDEX IF NOT EXISTS idx_events_start ON events(start_time);
CREATE INDEX IF NOT EXISTS idx_events_sport ON events(sport);
CREATE INDEX IF NOT EXISTS idx_reg_event_active ON registrations(event_id, status);


-- Migrations for installations that already have a PostgreSQL named volume.
ALTER TABLE events ADD COLUMN IF NOT EXISTS is_demo BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE events ADD COLUMN IF NOT EXISTS organizer VARCHAR(120) NOT NULL DEFAULT 'SportHub';
ALTER TABLE events ADD COLUMN IF NOT EXISTS contact_email VARCHAR(180) NOT NULL DEFAULT '';
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS checked_in_at TIMESTAMPTZ;
CREATE INDEX IF NOT EXISTS idx_reg_checked_in ON registrations(checked_in_at);
-- Mark rows shipped with the earlier student demo as sample data; do not imply real events.
UPDATE events SET is_demo=TRUE WHERE title IN (
 'Giải bóng đá phong trào Sài Gòn Open','3x3 Streetball Championship',
 'Sunrise Run – Chạy cùng bình minh','Cầu lông đôi nam nữ giao hữu',
 'Bơi tiếp sức Aqua Challenge','Campus League – Bóng đá sinh viên',
 'Night Hoops – Đêm bóng rổ','City Marathon Prep Run',
 'Badminton Open Weekend','Swimming Skills Day');
