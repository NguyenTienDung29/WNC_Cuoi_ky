'use strict';
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const fs = require('node:fs');
const path = require('node:path');

const PORT = Number(process.env.PORT || 4000);
const DATABASE_URL = process.env.DATABASE_URL;
const JWT_SECRET = process.env.JWT_SECRET;
if (!DATABASE_URL || !JWT_SECRET) {
  console.error('Thiếu DATABASE_URL hoặc JWT_SECRET. Hãy cấu hình biến môi trường.');
  process.exit(1);
}

const pool = new Pool({ connectionString: DATABASE_URL, max: 10 });
const app = express();
app.disable('x-powered-by');
app.set('trust proxy', 1); // Chỉ nhận lưu lượng từ reverse proxy Nginx trong Compose.
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : true }));
app.use(express.json({ limit: '100kb' }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 70, standardHeaders: 'draft-7', legacyHeaders: false }));

const {parseEvent, sports} = require('./validation');
const SEED_DEMO_EVENTS = process.env.SEED_DEMO_EVENTS === 'true';
const sportsResources = [
 {sport:'Bóng đá',title:'Luật bóng đá 2026/27',org:'IFAB',summary:'Tra cứu luật thi đấu, số lượng cầu thủ và yêu cầu sân bãi trước khi tổ chức giải.',url:'https://www.theifab.com/'},
 {sport:'Bóng rổ',title:'Luật bóng rổ và 3x3',org:'FIBA',summary:'Nguồn luật bóng rổ và thể thức 3x3 chính thức cho người tổ chức.',url:'https://about.fiba.basketball/en/our-sport/3x3-basketball'},
 {sport:'Cầu lông',title:'Quy tắc cầu lông – bản tóm tắt tham khảo',org:'BWF',summary:'Tài liệu giản lược của BWF (2015); tham khảo kiến thức cơ bản và kiểm tra luật hiện hành nếu tổ chức giải.',url:'https://system.bwfbadminton.com/documents/folder_1_81/Regulations/Simplified-Rules/Simplified%20Rules%20of%20Badminton%20-%20Dec%202015.pdf'},
 {sport:'Chạy bộ',title:'Quy định thi đấu điền kinh',org:'World Athletics',summary:'Tài liệu luật thi đấu và các hướng dẫn kỹ thuật tổ chức hoạt động chạy.',url:'https://worldathletics.org/about-iaaf/documents/book-of-rules'},
 {sport:'Bơi lội',title:'Swimming Rules',org:'World Aquatics',summary:'Thông tin về thể lệ thi đấu bơi và tài liệu chuyên môn.',url:'https://www.worldaquatics.com/swimming/rules'},
 {sport:'Khác',title:'Hướng dẫn hoạt động thể chất',org:'WHO',summary:'Khuyến nghị mức độ hoạt động thể lực và cách duy trì thói quen lành mạnh.',url:'https://www.who.int/initiatives/behealthy/physical-activity'}
];
const eventSelect = `SELECT e.*, COALESCE(x.registered, 0)::integer AS registered,
  GREATEST(e.capacity - COALESCE(x.registered, 0), 0)::integer AS remaining
  FROM events e LEFT JOIN (
    SELECT event_id, COUNT(*)::integer AS registered FROM registrations
    WHERE status = 'active' GROUP BY event_id
  ) x ON x.event_id = e.id`;

function sendError(res, status, message) { return res.status(status).json({ error: message }); }
function validId(value) { const n = Number(value); return Number.isSafeInteger(n) && n > 0 ? n : null; }
function cleanEmail(value) { return String(value || '').trim().toLowerCase(); }
function handleAsync(fn) { return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next); }

function auth(required = true) {
  return handleAsync(async (req, res, next) => {
    const header = req.get('authorization') || '';
    const token = header.startsWith('Bearer ') ? header.slice(7) : null;
    if (!token) return required ? sendError(res, 401, 'Bạn cần đăng nhập.') : next();
    try {
      const payload = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] });
      const result = await pool.query('SELECT id, full_name, email, role FROM users WHERE id=$1', [payload.sub]);
      if (!result.rows[0]) return sendError(res, 401, 'Tài khoản không còn tồn tại.');
      req.user = result.rows[0];
      next();
    } catch (_) {
      return sendError(res, 401, 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn.');
    }
  });
}
function adminOnly(req, res, next) { return req.user?.role === 'admin' ? next() : sendError(res, 403, 'Chức năng dành cho quản trị viên.'); }
function signUser(user) { return jwt.sign({}, JWT_SECRET, { subject: String(user.id), expiresIn: '7d', algorithm: 'HS256' }); }

app.get('/health', handleAsync(async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', service: 'sporthub-api', database: 'connected' });
  } catch (_) { res.status(503).json({ status: 'error', service: 'sporthub-api', database: 'disconnected' }); }
}));

app.get('/api/sports', (req, res) => res.json({ sports }));
app.get('/api/resources', (req, res) => res.json({ resources: sportsResources, note: 'Liên kết tới tài liệu công khai của tổ chức thể thao; dữ liệu sự kiện mẫu KHÔNG lấy từ các tổ chức này.' }));
app.get('/api/meta', handleAsync(async (req,res) => {
 const {rows:[counts]}=await pool.query('SELECT COUNT(*)::integer AS events, COUNT(*) FILTER(WHERE is_demo)::integer AS demo_events FROM events');
 res.json({service:'SportHub',version:'2.0',status:'ok',demo_mode:SEED_DEMO_EVENTS,...counts});
}));

app.get('/api/stats', handleAsync(async (req, res) => {
  const { rows: [row] } = await pool.query(`SELECT
    (SELECT COUNT(*)::integer FROM events) AS events,
    (SELECT COUNT(*)::integer FROM events WHERE status='open' AND start_time > NOW()) AS upcoming,
    (SELECT COUNT(*)::integer FROM registrations WHERE status='active') AS registrations,
    (SELECT COUNT(*)::integer FROM users WHERE role='member') AS members`);
  res.json(row);
}));

app.get('/api/events', handleAsync(async (req, res) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const sport = String(req.query.sport || 'all');
  const sort = String(req.query.sort || 'soon');
  const params = [];
  const conditions = [];
  if (q) { params.push(`%${q}%`); conditions.push(`(e.title ILIKE $${params.length} OR e.venue ILIKE $${params.length} OR e.city ILIKE $${params.length})`); }
  if (sport !== 'all' && sports.includes(sport)) { params.push(sport); conditions.push(`e.sport = $${params.length}`); }
  const order = sort === 'popular' ? 'registered DESC, e.start_time ASC' : sort === 'newest' ? 'e.created_at DESC, e.id DESC' : 'e.start_time ASC';
  const where = conditions.length ? ' WHERE ' + conditions.join(' AND ') : '';
  const result = await pool.query(`${eventSelect}${where} ORDER BY ${order} LIMIT 150`, params);
  res.json({ events: result.rows });
}));

app.get('/api/events/:id', handleAsync(async (req, res) => {
  const id = validId(req.params.id); if (!id) return sendError(res, 400, 'Mã sự kiện không hợp lệ.');
  const { rows } = await pool.query(`${eventSelect} WHERE e.id=$1`, [id]);
  if (!rows[0]) return sendError(res, 404, 'Không tìm thấy sự kiện.');
  res.json({ event: rows[0] });
}));

app.post('/api/auth/register', handleAsync(async (req, res) => {
  const fullName = String(req.body.full_name || '').trim();
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  if (fullName.length < 2 || fullName.length > 100) return sendError(res, 400, 'Họ tên phải từ 2 đến 100 ký tự.');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 180) return sendError(res, 400, 'Email không hợp lệ.');
  if (password.length < 8 || password.length > 128) return sendError(res, 400, 'Mật khẩu phải từ 8 đến 128 ký tự.');
  const hash = await bcrypt.hash(password, 11);
  try {
    const { rows: [user] } = await pool.query('INSERT INTO users (full_name,email,password_hash) VALUES($1,$2,$3) RETURNING id,full_name,email,role', [fullName, email, hash]);
    res.status(201).json({ token: signUser(user), user });
  } catch (e) { if (e.code === '23505') return sendError(res, 409, 'Email đã được đăng ký.'); throw e; }
}));

app.post('/api/auth/login', handleAsync(async (req, res) => {
  const email = cleanEmail(req.body.email);
  const password = String(req.body.password || '');
  const { rows: [account] } = await pool.query('SELECT * FROM users WHERE email=$1', [email]);
  if (!account || !(await bcrypt.compare(password, account.password_hash))) return sendError(res, 401, 'Email hoặc mật khẩu không đúng.');
  const user = { id: account.id, full_name: account.full_name, email: account.email, role: account.role };
  res.json({ token: signUser(user), user });
}));

app.get('/api/auth/me', auth(), (req, res) => res.json({ user: req.user }));

app.get('/api/me/registrations', auth(), handleAsync(async (req, res) => {
  const { rows } = await pool.query(`SELECT r.id, r.status AS registration_status, r.created_at AS registered_at,
  e.id AS event_id, e.title, e.sport, e.venue, e.city, e.start_time, e.price, e.theme, e.status, e.is_demo, r.checked_in_at
  FROM registrations r JOIN events e ON e.id=r.event_id WHERE r.user_id=$1 ORDER BY e.start_time ASC`, [req.user.id]);
  res.json({ registrations: rows });
}));

app.post('/api/events/:id/register', auth(), handleAsync(async (req, res) => {
  const id = validId(req.params.id); if (!id) return sendError(res, 400, 'Mã sự kiện không hợp lệ.');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const { rows: [event] } = await client.query('SELECT id, capacity, status, start_time FROM events WHERE id=$1 FOR UPDATE', [id]);
    if (!event) { await client.query('ROLLBACK'); return sendError(res, 404, 'Sự kiện không tồn tại.'); }
    if (event.status !== 'open' || new Date(event.start_time) < new Date()) { await client.query('ROLLBACK'); return sendError(res, 400, 'Sự kiện đã đóng đăng ký.'); }
    const { rows: [existing] } = await client.query('SELECT status FROM registrations WHERE user_id=$1 AND event_id=$2', [req.user.id, id]);
    if (existing?.status === 'active') { await client.query('ROLLBACK'); return sendError(res, 409, 'Bạn đã đăng ký sự kiện này.'); }
    const { rows: [counter] } = await client.query("SELECT COUNT(*)::integer AS total FROM registrations WHERE event_id=$1 AND status='active'", [id]);
    if (counter.total >= event.capacity) { await client.query('ROLLBACK'); return sendError(res, 409, 'Sự kiện đã hết chỗ.'); }
    await client.query(`INSERT INTO registrations(user_id,event_id,status) VALUES($1,$2,'active')
      ON CONFLICT(user_id,event_id) DO UPDATE SET status='active', created_at=NOW()`, [req.user.id,id]);
    await client.query('COMMIT');
    res.status(201).json({ message: 'Đăng ký sự kiện thành công.' });
  } catch (e) { await client.query('ROLLBACK').catch(() => {}); throw e; }
  finally { client.release(); }
}));

app.delete('/api/events/:id/register', auth(), handleAsync(async (req, res) => {
  const id = validId(req.params.id); if (!id) return sendError(res, 400, 'Mã sự kiện không hợp lệ.');
  const { rowCount } = await pool.query("UPDATE registrations SET status='cancelled' WHERE user_id=$1 AND event_id=$2 AND status='active' AND checked_in_at IS NULL", [req.user.id,id]);
  if (!rowCount) return sendError(res, 404, 'Không có lượt đăng ký đang hoạt động.');
  res.json({ message: 'Đã hủy đăng ký.' });
}));

app.get('/api/admin/stats', auth(), adminOnly, handleAsync(async (req, res) => {
  const { rows: [stats] } = await pool.query(`SELECT
    (SELECT COUNT(*)::integer FROM users WHERE role='member') AS members,
    (SELECT COUNT(*)::integer FROM events) AS events,
    (SELECT COUNT(*)::integer FROM events WHERE status='open') AS open_events,
    (SELECT COUNT(*)::integer FROM registrations WHERE status='active') AS registrations`);
  res.json({ stats });
}));

app.get('/api/admin/registrations', auth(), adminOnly, handleAsync(async (req, res) => {
  const { rows } = await pool.query(`SELECT r.id, r.status, r.created_at, r.checked_in_at, u.full_name, u.email,
    e.title AS event_title, e.sport, e.start_time, e.is_demo
    FROM registrations r JOIN users u ON r.user_id=u.id JOIN events e ON r.event_id=e.id
    ORDER BY r.created_at DESC LIMIT 300`);
  res.json({ registrations: rows });
}));

app.post('/api/admin/events', auth(), adminOnly, handleAsync(async (req, res) => {
  const values = parseEvent(req.body);
  const { rows: [event] } = await pool.query(`INSERT INTO events(title,sport,venue,city,start_time,capacity,price,description,theme,status,organizer,contact_email,is_demo)
    VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,FALSE) RETURNING *`, values);
  res.status(201).json({ event });
}));

app.put('/api/admin/events/:id', auth(), adminOnly, handleAsync(async (req, res) => {
  const id = validId(req.params.id); if (!id) return sendError(res, 400, 'Mã sự kiện không hợp lệ.');
  const values = parseEvent(req.body);
  const { rows: [event] } = await pool.query(`UPDATE events SET title=$1,sport=$2,venue=$3,city=$4,start_time=$5,
    capacity=$6,price=$7,description=$8,theme=$9,status=$10,organizer=$11,contact_email=$12 WHERE id=$13 RETURNING *`, [...values, id]);
  if (!event) return sendError(res, 404, 'Không tìm thấy sự kiện.');
  res.json({ event });
}));

app.delete('/api/admin/events/:id', auth(), adminOnly, handleAsync(async (req, res) => {
  const id = validId(req.params.id); if (!id) return sendError(res, 400, 'Mã sự kiện không hợp lệ.');
  const { rowCount } = await pool.query('DELETE FROM events WHERE id=$1', [id]);
  if (!rowCount) return sendError(res, 404, 'Không tìm thấy sự kiện.');
  res.json({ message: 'Đã xóa sự kiện và các lượt đăng ký liên quan.' });
}));

app.post('/api/admin/registrations/:id/checkin', auth(), adminOnly, handleAsync(async (req,res) => {
 const id=validId(req.params.id); if (!id) return sendError(res,400,'Mã đăng ký không hợp lệ.');
 const {rows:[registration]}=await pool.query(`UPDATE registrations r SET checked_in_at=NOW() WHERE r.id=$1 AND r.status='active' AND r.checked_in_at IS NULL
  RETURNING r.id,r.checked_in_at`,[id]);
 if (!registration) return sendError(res,409,'Lượt đăng ký không tồn tại, đã hủy hoặc đã check-in.');
 res.json({registration,message:'Check-in thành công.'});
}));

app.get('/api/admin/registrations.csv', auth(), adminOnly, handleAsync(async(req,res)=>{
 const {rows}=await pool.query(`SELECT r.id, u.full_name,u.email,e.title AS event_title,r.status,r.created_at,r.checked_in_at
 FROM registrations r JOIN users u ON u.id=r.user_id JOIN events e ON e.id=r.event_id ORDER BY r.created_at DESC LIMIT 10000`);
 const fields=['id','full_name','email','event_title','status','created_at','checked_in_at'];
 const escapeCsv=v => '"'+String(v??'').replace(/^[=+@-]/, match => '\'' + match).replace(/"/g,'""')+'"';
 const csv='\uFEFF'+fields.join(',')+'\r\n'+rows.map(row=>fields.map(f=>escapeCsv(row[f])).join(',')).join('\r\n');
 res.type('text/csv; charset=utf-8').set('Content-Disposition','attachment; filename="sporthub-registrations.csv"').send(csv);
}));

app.use('/api', (req, res) => sendError(res, 404, 'API không tồn tại.'));
app.use((err, req, res, next) => {
  console.error('[API ERROR]', err);
  if (err instanceof SyntaxError && err.status === 400) return sendError(res, 400, 'JSON không hợp lệ.');
  return sendError(res, err.status || 500, err.status ? err.message : 'Lỗi máy chủ. Vui lòng thử lại.');
});

async function bootstrap() {
  let ready = false;
  let lastError;
  for (let i = 1; i <= 40; i++) {
    try { await pool.query('SELECT 1'); ready = true; break; }
    catch (e) { lastError=e; console.log(`Đang kết nối PostgreSQL (${i}/40): ${e.code || e.message}`); await new Promise(r => setTimeout(r, 1000)); }
  }
  if (!ready) throw new Error('Không kết nối được PostgreSQL: '+(lastError?.message||'kiểm tra docker compose logs db'));
  // Chạy schema idempotent mỗi lần khởi động; sửa tình huống named volume tồn tại nhưng thiếu bảng.
  await pool.query(fs.readFileSync(path.join(__dirname,'../sql/schema.sql'),'utf8'));
  if (SEED_DEMO_EVENTS) {
    await pool.query(fs.readFileSync(path.join(__dirname,'../sql/seed.sql'),'utf8'));
  }
  const {rows:[count]}=await pool.query('SELECT COUNT(*)::integer AS total FROM events');
  console.log(`Database ready: ${count.total} events. Demo seed=${SEED_DEMO_EVENTS}.`);
  const adminEmail = cleanEmail(process.env.ADMIN_EMAIL || 'admin@sporthub.local');
  const adminPassword = String(process.env.ADMIN_PASSWORD || '');
  if (!adminPassword || adminPassword.length < 8) throw new Error('ADMIN_PASSWORD phải có ít nhất 8 ký tự.');
  const { rows: [admin] } = await pool.query('SELECT id FROM users WHERE email=$1', [adminEmail]);
  if (!admin) {
    const hash = await bcrypt.hash(adminPassword, 11);
    await pool.query("INSERT INTO users(full_name,email,password_hash,role) VALUES('Quản trị SportHub',$1,$2,'admin')", [adminEmail,hash]);
    console.log(`Tạo quản trị viên: ${adminEmail}`);
  }
  app.listen(PORT, '0.0.0.0', () => console.log(`SportHub API ready: :${PORT}`));
}

if (require.main === module) bootstrap().catch(e => { console.error(e.message); process.exit(1); });
module.exports = { app, parseEvent, sports };
