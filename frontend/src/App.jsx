import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowUpRight, CalendarDays, Check, CheckCircle2, ChevronDown, Clock3, Compass, Filter, HeartHandshake, LayoutDashboard, LogIn, LogOut, MapPin, Menu, Plus, Search, ShieldCheck, Sparkles, Ticket, Trash2, Trophy, Users, X, Pencil, CircleCheck, AlertCircle, CalendarCheck2, Zap } from 'lucide-react';
import { request } from './api';

const SPORTS = ['Tất cả', 'Bóng đá', 'Bóng rổ', 'Cầu lông', 'Chạy bộ', 'Bơi lội', 'Khác'];
const EMOJI = { 'Bóng đá': '⚽', 'Bóng rổ': '🏀', 'Cầu lông': '🏸', 'Chạy bộ': '🏃', 'Bơi lội': '🏊', 'Khác': '🏆' };
const THEMES = { 'Bóng đá': 'emerald', 'Bóng rổ': 'orange', 'Cầu lông': 'blue', 'Chạy bộ': 'violet', 'Bơi lội': 'cyan', 'Khác': 'rose' };
const currency = amount => Number(amount) === 0 ? 'Miễn phí' : `${Number(amount).toLocaleString('vi-VN')}đ`;
// Giữ dữ liệu mẫu ở backend để minh bạch, nhưng dùng tên hiển thị gọn hơn trong UI.
const displayTitle = title => String(title || '').replace(/^\[DEMO\]\s*/i, '').trim();
const displayOrganizer = organizer => String(organizer || 'SportHub').replace(/\s*\(demo\)$/i, '').trim();
const dateLabel = value => new Date(value).toLocaleDateString('vi-VN', { day: '2-digit', month: 'short', year: 'numeric' });
const timeLabel = value => new Date(value).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
function inputDate(value) { if (!value) return ''; const d = new Date(value); return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0,16); }
function Brand({ compact=false }) { return <div className="brand"><span className="brand-symbol"><span className="brand-stripe" /></span>{!compact && <span>sport<span>hub</span><i>.</i></span>}</div>; }
function Button({ children, variant='primary', className='', ...props }) { return <button className={`btn btn-${variant} ${className}`} {...props}>{children}</button>; }
function SportBackdrop({ sport, className='' }) {
  return <div className={`sport-art sport-${THEMES[sport] || 'rose'} ${className}`}>
    <div className="sport-art-ring ring-one"/><div className="sport-art-ring ring-two"/>
    <div className="sport-art-mark">{EMOJI[sport] || '🏆'}</div>
    <div className="sport-art-grid"/>
  </div>;
}
function ArenaGraphic() {
  return <div className="stadium-scene" aria-hidden="true">
    <div className="stadium-topline"><span>SPORT / CULTURE / PEOPLE</span><span>SEASON 2026</span></div>
    <div className="stadium-motion"><div className="stadium-lane lane-a"/><div className="stadium-lane lane-b"/><div className="stadium-lane lane-c"/>
      <div className="stadium-orb"><span>⚽</span></div><div className="stadium-speed speed-a"/><div className="stadium-speed speed-b"/>
    </div>
    <div className="stadium-type">THE GAME<br/><span>IS ON.</span></div>
    <div className="stadium-bottomline"><span>MOVE TOGETHER</span><span>↗ SPORTHUB</span></div>
  </div>;
}
function Toast({ item, clear }) { return item ? <div className={`toast ${item.kind === 'error' ? 'toast-error' : ''}`}><span>{item.kind === 'error' ? <AlertCircle size={18}/> : <CheckCircle2 size={18}/>}</span>{item.message}<button onClick={clear} aria-label="Đóng"><X size={15}/></button></div> : null; }
function Dialog({ children, onClose, large=false }) {
  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') onClose(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);
  return <div className="overlay" role="presentation" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className={`dialog ${large ? 'dialog-large' : ''}`} role="dialog" aria-modal="true">
      <button className="dialog-x" onClick={onClose} aria-label="Đóng cửa sổ"><X size={20}/></button>{children}
    </div>
  </div>;
}
function EventCard({ event, onOpen }) {
  const remaining = Number(event.remaining ?? event.capacity);
  return <button className="event-card" onClick={()=>onOpen(event)}>
    <SportBackdrop sport={event.sport} className="event-cover"/>
    <span className="event-sport">{EMOJI[event.sport]} {event.sport}</span>
    <span className="event-arrow"><ArrowUpRight size={19}/></span>
    <div className="event-info">
      <div className="event-meta"><span><CalendarDays size={14}/>{dateLabel(event.start_time)}</span><span><Clock3 size={14}/>{timeLabel(event.start_time)}</span></div>
      <h3>{displayTitle(event.title)}</h3>
      <p className="muted place"><MapPin size={15}/>{event.venue}, {event.city}</p>
      <div className="event-progress"><span style={{width:`${Math.min(100,Math.round(Number(event.registered)/Number(event.capacity)*100))}%`}} /></div>
      <div className="event-bottom"><strong>{currency(event.price)}</strong><span className="muted">{remaining > 0 ? `${remaining} chỗ còn lại` : 'Đã hết chỗ'}</span></div><div className="event-card-link">Xem thông tin sự kiện <ArrowUpRight size={16}/></div>
    </div>
  </button>;
}
function AuthPanel({ mode, setMode, onClose, onSubmit, loading }) {
  const [form,setForm] = useState({ full_name:'', email:'', password:'' });
  const signup = mode === 'register';
  return <Dialog onClose={onClose}><div className="auth-top"><Brand/><h2>{signup?'Bắt đầu hành trình thể thao.':'Chào mừng trở lại!'}</h2><p>{signup?'Tham gia cộng đồng, đăng ký sự kiện và ghi dấu trải nghiệm của bạn.':'Đăng nhập để quản lý các sự kiện bạn yêu thích.'}</p></div>
    <form className="form-stack" onSubmit={e=>{e.preventDefault();onSubmit(form,mode);}}>
      {signup && <label>Họ và tên<input required minLength={2} maxLength={100} value={form.full_name} onChange={e=>setForm({...form,full_name:e.target.value})} placeholder="Nguyễn Văn A"/></label>}
      <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="ban@example.com"/></label>
      <label>Mật khẩu<input required type="password" minLength={signup?8:1} value={form.password} onChange={e=>setForm({...form,password:e.target.value})} placeholder="Ít nhất 8 ký tự"/></label>
      <Button type="submit" disabled={loading}>{loading?'Đang xử lý...':signup?'Tạo tài khoản':'Đăng nhập'}<ArrowRight size={17}/></Button>
    </form><div className="auth-switch">{signup?'Đã có tài khoản?':'Chưa có tài khoản?'} <button onClick={()=>setMode(signup?'login':'register')}>{signup?'Đăng nhập':'Đăng ký ngay'}</button></div>
  </Dialog>;
}
function EventDetail({ event, isRegistered, onRegister, onCancel, onClose, user, loading }) {
  const remaining=Number(event.remaining);
  const canJoin=event.status==='open'&&new Date(event.start_time)>new Date()&&remaining>0;
  return <Dialog large onClose={onClose}><div className="detail-shell"><SportBackdrop sport={event.sport} className="detail-cover"/><div className="detail-content">
    <span className="eyebrow"><Sparkles size={15}/> SPORT EVENT / {event.sport}</span><h2>{displayTitle(event.title)}</h2><p className="detail-description">{event.description||'Sự kiện thể thao cộng đồng dành cho tất cả mọi người.'}</p>
    <div className="detail-facts"><div><CalendarDays size={18}/><span><small>Ngày tổ chức</small><b>{dateLabel(event.start_time)}</b></span></div><div><Clock3 size={18}/><span><small>Giờ bắt đầu</small><b>{timeLabel(event.start_time)}</b></span></div><div><MapPin size={18}/><span><small>Địa điểm</small><b>{event.venue}</b><small>{event.city}</small></span></div><div><Users size={18}/><span><small>Chỗ còn lại</small><b>{remaining}/{event.capacity}</b></span></div></div>
    <div className="detail-organizer"><b>Đơn vị tổ chức:</b> {displayOrganizer(event.organizer)}{event.contact_email&&<> · <a href={`mailto:${event.contact_email}`}>{event.contact_email}</a></>}</div><div className="detail-cta"><div><small>Phí tham gia</small><strong>{currency(event.price)}</strong></div>
    {isRegistered ? <Button variant="outline" disabled={loading} onClick={()=>onCancel(event)}><CheckCircle2 size={17}/> Đã đăng ký – Hủy</Button> : <Button disabled={!canJoin||loading} onClick={()=>onRegister(event)}>{canJoin?(user?'Đăng ký tham gia':'Đăng nhập để đăng ký'):'Đã đóng / hết chỗ'}<ArrowRight size={17}/></Button>}
    </div>
  </div></div></Dialog>;
}
const defaultForm = { title:'',sport:'Bóng đá',venue:'',city:'TP. Hồ Chí Minh',start_time:'',capacity:50,price:0,description:'',theme:'emerald',status:'open',organizer:'SportHub',contact_email:'' };
function EventForm({ event, close, save, busy }) {
  const [form,setForm]=useState(event?{...event,title:displayTitle(event.title),organizer:displayOrganizer(event.organizer),start_time:inputDate(event.start_time)}:defaultForm);
  const put=(key,value)=>setForm(p=>({...p,[key]:value,...(key==='sport'?{theme:THEMES[value]||'rose'}:{})}));
  return <Dialog large onClose={close}><div className="form-dialog"><div className="eyebrow">QUẢN LÝ SỰ KIỆN</div><h2>{event?'Chỉnh sửa sự kiện':'Tạo sự kiện mới'}</h2><p className="muted">Thông tin được lưu trong PostgreSQL và hiển thị ngay trên trang sự kiện.</p>
    <form className="editor-grid" onSubmit={e=>{e.preventDefault();save(form,event?.id);}}>
      <label className="wide">Tên sự kiện<input required minLength={5} maxLength={160} value={form.title} onChange={e=>put('title',e.target.value)} placeholder="Ví dụ: Giải bóng đá Sinh viên 2026"/></label>
      <label>Môn thể thao<select value={form.sport} onChange={e=>put('sport',e.target.value)}>{SPORTS.slice(1).map(s=><option key={s}>{s}</option>)}</select></label>
      <label>Thời gian bắt đầu<input required type="datetime-local" value={form.start_time} onChange={e=>put('start_time',e.target.value)}/></label>
      <label>Địa điểm<input required value={form.venue} onChange={e=>put('venue',e.target.value)} placeholder="Tên sân / nhà thi đấu"/></label>
      <label>Thành phố<input required value={form.city} onChange={e=>put('city',e.target.value)}/></label>
      <label>Sức chứa<input required type="number" min="1" max="100000" value={form.capacity} onChange={e=>put('capacity',e.target.value)}/></label>
      <label>Phí (VND)<input required type="number" min="0" max="100000000" value={form.price} onChange={e=>put('price',e.target.value)}/></label>
      <label>Đơn vị tổ chức<input required minLength={2} maxLength={120} value={form.organizer||""} onChange={e=>put('organizer',e.target.value)} placeholder="Tên câu lạc bộ/đơn vị"/></label>
      <label>Email liên hệ<input type="email" value={form.contact_email||""} onChange={e=>put('contact_email',e.target.value)} placeholder="lienhe@example.com"/></label>
      <label className="wide">Mô tả<textarea rows="4" value={form.description} onChange={e=>put('description',e.target.value)} placeholder="Giới thiệu nội dung, đối tượng và lưu ý tham gia"/></label>
      <label>Trạng thái<select value={form.status} onChange={e=>put('status',e.target.value)}><option value="open">Mở đăng ký</option><option value="closed">Đóng đăng ký</option></select></label>
      <div className="editor-actions"><Button variant="outline" type="button" onClick={close}>Hủy</Button><Button type="submit" disabled={busy}>{busy?'Đang lưu...':event?'Lưu thay đổi':'Tạo sự kiện'}<Check size={17}/></Button></div>
    </form>
  </div></Dialog>;
}

export default function App() {
  const [page,setPage]=useState('home');
  const [events,setEvents]=useState([]);
  const [stats,setStats]=useState({events:0,registrations:0,members:0,upcoming:0});
  const [query,setQuery]=useState('');
  const [sport,setSport]=useState('Tất cả');
  const [sort,setSort]=useState('soon');
  const [loading,setLoading]=useState(true);
  const [loadError,setLoadError]=useState('');
  const [resources,setResources]=useState([]);
  const [token,setToken]=useState(()=>localStorage.getItem('sporthub_token')||'');
  const [user,setUser]=useState(null);
  const [authOpen,setAuthOpen]=useState(false);
  const [authMode,setAuthMode]=useState('login');
  const [selected,setSelected]=useState(null);
  const [registrations,setRegistrations]=useState([]);
  const [adminStats,setAdminStats]=useState(null);
  const [adminRegs,setAdminRegs]=useState([]);
  const [edit,setEdit]=useState(undefined);
  const [busy,setBusy]=useState(false);
  const [toast,setToast]=useState(null);
  const [mobile,setMobile]=useState(false);
  function show(message,kind='success') { setToast({message,kind}); }
  function go(next) { setPage(next); setMobile(false); setSelected(null); window.scrollTo({top:0,behavior:'smooth'}); }
  async function refresh() {
    setLoading(true); setLoadError('');
    try { const [list,nums]=await Promise.all([request('/api/events'),request('/api/stats')]);setEvents(Array.isArray(list.events)?list.events:[]);setStats(nums); }
    catch(e){setLoadError(e.message);show(e.message,'error');} finally {setLoading(false);}
  }
  async function refreshPersonal(t=token) {
    if(!t)return;
    try {const data=await request('/api/me/registrations',{token:t});setRegistrations(data.registrations);}catch(e){show(e.message,'error');}
  }
  async function refreshAdmin(t=token) {
    if(!t)return;
    try {const [a,b]=await Promise.all([request('/api/admin/stats',{token:t}),request('/api/admin/registrations',{token:t})]);setAdminStats(a.stats);setAdminRegs(b.registrations);}catch(e){show(e.message,'error');}
  }
  useEffect(()=>{refresh();request('/api/resources').then(x=>setResources(x.resources||[])).catch(()=>{});},[]);
  useEffect(()=>{if(!token){setUser(null);setRegistrations([]);return;}
    request('/api/auth/me',{token}).then(data=>{setUser(data.user);refreshPersonal(token);if(data.user.role==='admin')refreshAdmin(token);})
    .catch(()=>{localStorage.removeItem('sporthub_token');setToken('');setUser(null);});
  },[token]);
  const visible=useMemo(()=>{
    const q=query.trim().toLowerCase(); let rows=events.filter(e=>(sport==='Tất cả'||e.sport===sport)&&(!q||`${e.title} ${e.venue} ${e.city}`.toLowerCase().includes(q)));
    return [...rows].sort((a,b)=>sort==='popular'?Number(b.registered)-Number(a.registered):sort==='newest'?Number(b.id)-Number(a.id):new Date(a.start_time)-new Date(b.start_time));
  },[events,query,sport,sort]);
  const registeredIds=new Set(registrations.filter(r=>r.registration_status==='active').map(r=>r.event_id));
  const eventSelected=selected?events.find(e=>e.id===selected.id)||selected:null;
  async function submitAuth(data,mode) {
    setBusy(true);try {
      const result=await request(`/api/auth/${mode==='register'?'register':'login'}`,{method:'POST',data});
      localStorage.setItem('sporthub_token',result.token);setToken(result.token);setUser(result.user);setAuthOpen(false);show(mode==='register'?'Tài khoản đã được tạo!':'Đăng nhập thành công!');
    } catch(e){show(e.message,'error');} finally {setBusy(false);}
  }
  function logout(){localStorage.removeItem('sporthub_token');setToken('');setUser(null);setRegistrations([]);setAdminStats(null);setAdminRegs([]);go('home');show('Đã đăng xuất.');}
  function requireLogin(){setAuthMode('login');setAuthOpen(true);}
  async function register(event) {
    if(!token)return requireLogin();setBusy(true);
    try{const data=await request(`/api/events/${event.id}/register`,{method:'POST',token});show(data.message);await Promise.all([refresh(),refreshPersonal()]);}
    catch(e){show(e.message,'error');}finally{setBusy(false);}
  }
  async function cancel(event) {
    if(!window.confirm('Bạn muốn hủy đăng ký sự kiện này?'))return;setBusy(true);
    try{const data=await request(`/api/events/${event.id}/register`,{method:'DELETE',token});show(data.message);await Promise.all([refresh(),refreshPersonal()]);}
    catch(e){show(e.message,'error');}finally{setBusy(false);}
  }
  async function saveEvent(form,id) {
    setBusy(true);
    try {await request(id?`/api/admin/events/${id}`:'/api/admin/events',{method:id?'PUT':'POST',token,data:{...form,start_time:new Date(form.start_time).toISOString()}});setEdit(undefined);show(id?'Đã cập nhật sự kiện.':'Đã tạo sự kiện mới.');await Promise.all([refresh(),refreshAdmin()]);}
    catch(e){show(e.message,'error');}finally{setBusy(false);}
  }
  async function checkIn(reg) {
    if (!window.confirm(`Xác nhận check-in cho ${reg.full_name}?`)) return;
    setBusy(true);
    try {const data=await request(`/api/admin/registrations/${reg.id}/checkin`,{method:'POST',token});show(data.message);await refreshAdmin();}
    catch(e){show(e.message,'error');}finally{setBusy(false);}
  }
  async function exportCsv() {
    try {
      const response=await fetch('/api/admin/registrations.csv',{headers:{Authorization:`Bearer ${token}`}});
      if(!response.ok) throw Error('Không thể tải CSV. Hãy kiểm tra quyền quản trị.');
      const url=URL.createObjectURL(await response.blob());
      const a=document.createElement('a');a.href=url;a.download='sporthub-registrations.csv';a.click();
      URL.revokeObjectURL(url);
    }catch(e){show(e.message,'error');}
  }
  async function deleteEvent(event){if(!window.confirm(`Xóa sự kiện “${displayTitle(event.title)}”? Các lượt đăng ký liên quan cũng sẽ bị xóa.`))return;setBusy(true);try{await request(`/api/admin/events/${event.id}`,{method:'DELETE',token});show('Đã xóa sự kiện.');await Promise.all([refresh(),refreshAdmin()]);}catch(e){show(e.message,'error');}finally{setBusy(false);}}
  function navButton(key,label,Icon){return <button className={`nav-link ${page===key?'active':''}`} onClick={()=>go(key)}><Icon size={17}/>{label}</button>}
  return <div className="site">
    <div className="announcement"><span className="announce-dot"/><span>SPORT IS BETTER TOGETHER</span><span className="announcement-sep">/</span><strong>Tìm cộng đồng thể thao dành cho bạn</strong><ArrowUpRight size={13}/></div>
    <header className="header"><div className="header-inner container"><button className="brand-button" onClick={()=>go('home')} aria-label="SportHub - về trang chủ"><Brand/></button>
      <nav className={`navigation ${mobile?'navigation-open':''}`}>{navButton('home','Trang chủ',Compass)}{navButton('events','Sự kiện',CalendarDays)}{navButton('guide','Kiến thức',Trophy)}{user&&navButton('mine','Vé của tôi',Ticket)}{user?.role==='admin'&&navButton('admin','Quản trị',LayoutDashboard)}{navButton('about','Về SportHub',HeartHandshake)}</nav>
      <div className="header-actions">{user ? <><span className="welcome">Xin chào, <b>{user.full_name.split(' ').slice(-1)[0]}</b></span><Button variant="outline" onClick={logout} className="nav-logout"><LogOut size={16}/> Đăng xuất</Button></> : <Button onClick={requireLogin}><LogIn size={17}/> Đăng nhập</Button>}
      <button className="mobile-toggle" onClick={()=>setMobile(p=>!p)} aria-label={mobile?'Đóng menu':'Mở menu'} aria-expanded={mobile}>{mobile?<X size={22}/>:<Menu size={22}/>}</button></div>
    </div></header>

    {page==='home'&&<>
      <section className="hero"><div className="container hero-inner"><div className="hero-copy"><span className="hero-eyebrow"><span className="pulse"/> NỀN TẢNG KẾT NỐI THỂ THAO</span><h1>Ra sân cùng nhau.<br/><em>Tỏa sáng mỗi ngày.</em></h1><p>Không chỉ tìm một trận đấu. Hãy tìm đồng đội, thử một môn mới và lưu giữ những khoảnh khắc thể thao của chính bạn.</p><div className="hero-buttons"><Button onClick={()=>go('events')}>Khám phá sự kiện <ArrowUpRight size={19}/></Button><Button variant="ghost-light" onClick={()=>go('about')}>SportHub là gì? <ArrowRight size={17}/></Button></div><div className="hero-trust"><div className="avatar-stack"><span>🏃</span><span>🏀</span><span>⚽</span><span>🏸</span></div><div><b>Chơi cùng cộng đồng</b><small>Chọn môn bạn thích • Tham gia dễ dàng</small></div></div></div>
      <div className="hero-art"><ArenaGraphic/><div className="float-card float-top"><span>⚡</span><div><b>LET'S MOVE</b><small>Đến giờ vận động!</small></div></div><div className="float-card float-bottom"><div className="float-icon">🏆</div><div><b>{stats.events} sự kiện</b><small>Đang chờ bạn khám phá</small></div></div></div></div><div className="hero-decoration one"/><div className="hero-decoration two"/></section>
      <section className="metrics"><div className="container metric-grid"><div><Trophy size={22}/><strong>{stats.events}</strong><span>Sự kiện thể thao</span></div><div><CalendarCheck2 size={22}/><strong>{stats.upcoming}</strong><span>Sự kiện sắp tới</span></div><div><Users size={22}/><strong>{stats.members}</strong><span>Thành viên</span></div><div><Ticket size={22}/><strong>{stats.registrations}</strong><span>Lượt đăng ký</span></div></div></section>
      <section className="section container featured-section"><div className="section-title"><div><div className="eyebrow"><Sparkles size={16}/> WHAT'S ON</div><h2>Chọn sự kiện. <em>Chọn cuộc vui.</em></h2><p>Những hoạt động nổi bật dành cho cộng đồng yêu vận động.</p></div><button className="text-link" onClick={()=>go('events')}>Tất cả sự kiện <ArrowUpRight size={19}/></button></div>{loadError ? <div className="error-panel"><AlertCircle size={23}/><div><b>Không kết nối được API</b><p>{loadError}</p><small>Kiểm tra http://localhost:3000/health hoặc docker compose ps.</small></div><Button onClick={refresh}>Thử lại</Button></div> : loading ? <div className="cards-grid">{[0,1,2].map(n=><div className="card-skeleton" key={n}/>)}</div> : events.length ? <div className="cards-grid">{events.slice(0,6).map(e=><EventCard key={e.id} event={e} onOpen={setSelected}/>)}</div> : <div className="empty"><CalendarDays size={32}/><h3>Chưa có sự kiện</h3><p>Hãy thử lại sau hoặc liên hệ quản trị viên.</p></div>}</section>
      <section className="feature-section"><div className="container feature-inner"><div className="feature-art"><div className="feature-emblem">SPORT<br/>IS FOR<br/><i>EVERYONE.</i><span>↗</span></div></div><div className="feature-copy"><div className="eyebrow"><Zap size={16}/> SPORT CONNECTS US</div><h2>Chơi hết mình.<br/><em>Kết nối thật gần.</em></h2><p>Dù bạn chạy bộ mỗi sáng, thích bóng đá hay mới bắt đầu cầm vợt, SportHub giúp bạn tìm một sân chơi phù hợp để gặp những người chung đam mê.</p><div className="check-lines"><span><CircleCheck size={18}/> Khám phá hoạt động theo môn thể thao</span><span><CircleCheck size={18}/> Đăng ký và theo dõi lịch tham gia</span><span><CircleCheck size={18}/> Thông tin rõ ràng, cập nhật liên tục</span></div><Button onClick={()=>go('events')}>Tìm hoạt động phù hợp <ArrowRight size={18}/></Button></div></div></section>
    </>}

    {page==='events'&&<section className="container listing-section"><div className="page-top"><span className="eyebrow"><Compass size={16}/> DISCOVER YOUR NEXT GAME</span><h1>Tìm sân chơi <em>của bạn.</em></h1><p>Lọc theo môn, tìm theo địa điểm và chọn hoạt động phù hợp với lịch của bạn.</p><div className="page-stat-line"><span><CalendarDays size={15}/> {stats.upcoming} sự kiện sắp diễn ra</span><span><Users size={15}/> {stats.members} thành viên</span></div></div>
      <div className="filters"><div className="search"><Search size={20}/><input aria-label="Tìm kiếm sự kiện" value={query} onChange={e=>setQuery(e.target.value)} placeholder="Tìm sự kiện, địa điểm, thành phố..."/></div><label className="sort-select"><Filter size={17}/><select value={sort} onChange={e=>setSort(e.target.value)}><option value="soon">Sắp diễn ra</option><option value="popular">Đăng ký nhiều</option><option value="newest">Mới tạo</option></select><ChevronDown size={17}/></label></div>
      <div className="sport-filters">{SPORTS.map(s=><button key={s} className={sport===s?'active':''} onClick={()=>setSport(s)}>{s==='Tất cả'?'✦':EMOJI[s]} {s}</button>)}</div>
      <div className="result-heading"><h3>{loadError?"Không tải được dữ liệu":`${visible.length} sự kiện`}</h3></div>
      {loadError ? <div className="error-panel"><AlertCircle size={24}/><div><b>Không kết nối được API</b><p>{loadError}</p><small>Chạy docker compose ps, docker compose logs api hoặc thử http://localhost:3000/health.</small></div><Button onClick={refresh}>Thử lại</Button></div> : loading ? <div className="empty">Đang tải danh sách sự kiện...</div> : visible.length? <div className="cards-grid">{visible.map(e=><EventCard key={e.id} event={e} onOpen={setSelected}/>)}</div>:<div className="empty"><Search size={34}/><h3>Không tìm thấy sự kiện</h3><p>Hãy thử từ khóa hoặc bộ lọc khác.</p></div>}
    </section>}

    {page==='mine'&&<section className="container workspace-section"><div className="page-top"><span className="eyebrow"><Ticket size={16}/> MEMBER SPACE</span><h1>Hành trình <em>của tôi.</em></h1><p>Quản lý những hoạt động bạn đã đăng ký.</p></div>
      {!user?<div className="empty"><h3>Bạn chưa đăng nhập</h3><Button onClick={requireLogin}>Đăng nhập</Button></div> : registrations.filter(r=>r.registration_status==='active').length? <div className="ticket-list">{registrations.filter(r=>r.registration_status==='active').map(r=><div className="ticket-row" key={r.id}><div className={`ticket-emoji sport-${r.theme}`}>{EMOJI[r.sport]}</div><div className="ticket-name"><span className="tiny-badge"><CheckCircle2 size={13}/> {r.checked_in_at?"Đã check-in":"Đã đăng ký"}</span><small className="ticket-code">Mã vé: SH-{String(r.id).padStart(6,"0")}</small><h3>{displayTitle(r.title)}</h3><p><CalendarDays size={14}/>{dateLabel(r.start_time)} · {timeLabel(r.start_time)} <MapPin size={14}/>{r.venue}</p></div><div className="ticket-actions"><strong>{currency(r.price)}</strong><button disabled={Boolean(r.checked_in_at)||busy} onClick={()=>cancel({id:r.event_id})}>{r.checked_in_at?"Đã check-in":"Hủy đăng ký"}</button></div></div>)}</div> : <div className="empty"><Ticket size={37}/><h3>Chưa có sự kiện nào</h3><p>Hãy đăng ký sự kiện đầu tiên của bạn nhé.</p><Button onClick={()=>go('events')}>Khám phá sự kiện <ArrowRight size={17}/></Button></div>}
    </section>}

    {page==='admin'&&<section className="container workspace-section"><div className="page-top admin-top"><div><span className="eyebrow"><ShieldCheck size={16}/> ADMIN WORKSPACE</span><h1>Trung tâm <em>quản trị.</em></h1><p>Quản lý sự kiện, theo dõi thành viên và lượt đăng ký.</p></div><Button onClick={()=>setEdit(null)}><Plus size={18}/> Tạo sự kiện</Button></div>
      {user?.role!=='admin'?<div className="empty"><ShieldCheck size={36}/><h3>Chỉ dành cho quản trị viên</h3><p>Vui lòng đăng nhập với tài khoản quản trị.</p></div> : <>
        <div className="admin-stat-grid"><div><span>THÀNH VIÊN</span><b>{adminStats?.members ?? '—'}</b><Users size={26}/></div><div><span>TỔNG SỰ KIỆN</span><b>{adminStats?.events ?? '—'}</b><CalendarDays size={26}/></div><div><span>MỞ ĐĂNG KÝ</span><b>{adminStats?.open_events ?? '—'}</b><CheckCircle2 size={26}/></div><div><span>LƯỢT ĐĂNG KÝ</span><b>{adminStats?.registrations ?? '—'}</b><Ticket size={26}/></div></div>
        <div className="admin-panel"><div className="panel-heading"><div><h2>Quản lý sự kiện</h2><p>Tạo mới, cập nhật và quản lý trạng thái đăng ký</p></div><span>{events.length} sự kiện</span></div><div className="table-scroll"><table><thead><tr><th>SỰ KIỆN</th><th>MÔN</th><th>NGÀY</th><th>ĐĂNG KÝ</th><th>TRẠNG THÁI</th><th>THAO TÁC</th></tr></thead><tbody>{events.map(e=><tr key={e.id}><td><b>{displayTitle(e.title)}</b><small>{e.venue}</small></td><td>{EMOJI[e.sport]} {e.sport}</td><td>{dateLabel(e.start_time)}</td><td>{e.registered}/{e.capacity}</td><td><span className={`status-chip ${e.status==='open'?'opened':'closed'}`}>{e.status==='open'?'Đang mở':'Đã đóng'}</span></td><td><div className="table-actions"><button aria-label="Sửa" onClick={()=>setEdit(e)}><Pencil size={16}/></button><button aria-label="Xóa" className="danger" onClick={()=>deleteEvent(e)} disabled={busy}><Trash2 size={16}/></button></div></td></tr>)}</tbody></table></div></div>
        <div className="admin-panel"><div className="panel-heading"><div><h2>Danh sách người đăng ký</h2><p>Check-in và tải báo cáo CSV</p></div><div className="admin-tools"><span>{adminRegs.length} bản ghi</span><Button variant="outline" onClick={exportCsv}>Xuất CSV</Button></div></div><div className="table-scroll"><table><thead><tr><th>THÀNH VIÊN</th><th>SỰ KIỆN</th><th>THỜI ĐIỂM</th><th>TRẠNG THÁI</th><th>CHECK-IN</th></tr></thead><tbody>{adminRegs.map(r=><tr key={r.id}><td><b>{r.full_name}</b><small>{r.email}</small></td><td>{displayTitle(r.event_title)}</td><td>{dateLabel(r.created_at)}</td><td><span className={`status-chip ${r.status==='active'?'opened':'closed'}`}>{r.status==='active'?'Đã đăng ký':'Đã hủy'}</span></td><td>{r.checked_in_at?<span className="tiny-badge">Đã check-in</span>:r.status==='active'?<button disabled={busy} className="checkin-button" onClick={()=>checkIn(r)}>Xác nhận</button>:"—"}</td></tr>)}</tbody></table>{!adminRegs.length&&<p className="no-results">Chưa có lượt đăng ký nào.</p>}</div></div>
      </>}
    </section>}

    {page==='guide'&&<section className="container listing-section"><div className="page-top"><span className="eyebrow"><Trophy size={16}/> SPORTS KNOWLEDGE HUB</span><h1>Kiến thức <em>thể thao.</em></h1><p>Tài liệu từ tổ chức chính thức để tham khảo luật thi đấu và tổ chức sự kiện. SportHub không đại diện các tổ chức này.</p></div>
      <div className="resources-grid">{resources.map(r=><article className="resource-card" key={r.org}><span className="resource-org">{r.org}</span><div className="resource-emoji">{EMOJI[r.sport]||'🏆'}</div><h3>{displayTitle(r.title)}</h3><p>{r.summary}</p><a href={r.url} target="_blank" rel="noopener noreferrer">Đọc tài liệu chính thức <ArrowUpRight size={17}/></a></article>)}</div>
      <div className="faq-block"><h2>Câu hỏi thường gặp</h2><details><summary>SportHub có phải website của một liên đoàn thể thao không?</summary><p>Không. SportHub là đồ án học thuật, độc lập với IFAB, FIBA, BWF, World Athletics, World Aquatics và WHO. Chỉ dẫn nguồn để người dùng tự tham khảo.</p></details><details><summary>Website có thu tiền khi đăng ký không?</summary><p>Hiện không có cổng thanh toán. Với sự kiện có phí, giá hiển thị chỉ để tham khảo; người dùng cần liên hệ ban tổ chức và không chuyển tiền qua website này.</p></details><details><summary>Dữ liệu đăng ký được lưu ở đâu?</summary><p>Thông tin được lưu trong PostgreSQL trên Docker named volume. Chỉ tài khoản của bạn và quản trị viên được cấp quyền mới có thể xem bản ghi liên quan.</p></details></div>
    </section>}

    {page==='policy'&&<section className="container listing-section"><div className="page-top"><span className="eyebrow"><ShieldCheck size={16}/> MINH BẠCH VÀ QUYỀN RIÊNG TƯ</span><h1>Thông tin <em>sử dụng.</em></h1><p>Những điều người dùng cần biết khi trải nghiệm SportHub phiên bản đồ án.</p></div><div className="faq-block"><h2>Phạm vi sử dụng</h2><p>SportHub là website thực hành học thuật môn Các nền tảng phát triển phần mềm. Các sự kiện trong hệ thống không có thu tiền, vận chuyển hoặc giao dịch tài chính.</p><h2>Dữ liệu cá nhân</h2><p>Họ tên, email và lịch sử đăng ký được lưu trong PostgreSQL để xác thực và quản lý tham gia. Mật khẩu được băm trước khi lưu. Thành viên xem dữ liệu của mình, quản trị viên có thể xem danh sách đăng ký để điều phối sự kiện. Không nhập thông tin thanh toán hay dữ liệu nhạy cảm khi thử nghiệm.</p><h2>Liên hệ đơn vị tổ chức</h2><p>Nếu sự kiện thực được tạo sau này, hãy sử dụng email liên hệ được quản trị viên cung cấp trên trang chi tiết sự kiện. SportHub chưa cung cấp kênh hỗ trợ chính thức và không đại diện cho các liên đoàn thể thao.</p><h2>Nguồn tham khảo</h2><p>Tài liệu thuộc về các tổ chức IFAB, FIBA, BWF, World Athletics, World Aquatics và WHO. Các đường dẫn nằm trong mục Kiến thức; SportHub không nhận tài trợ hoặc hợp tác chính thức với họ.</p></div></section>}

    {page==='about'&&<section className="container about-section"><div className="page-top"><span className="eyebrow"><HeartHandshake size={16}/> THE STORY OF SPORTHUB</span><h1>Kết nối con người.<br/><em>Lan tỏa tinh thần thể thao.</em></h1><p>SportHub kết nối người yêu vận động qua các hoạt động thể thao. Đây là hệ thống học thuật full-stack triển khai bằng Docker Containers, dùng dữ liệu sự kiện minh họa.</p></div><div className="about-grid"><div><span className="about-number">01</span><h2>Frontend</h2><p>React + Vite tạo trải nghiệm nhanh, giao diện responsive, lọc và quản lý sự kiện.</p></div><div><span className="about-number">02</span><h2>Backend</h2><p>Node.js + Express cung cấp REST API, xác thực tài khoản và quản lý lượt đăng ký.</p></div><div><span className="about-number">03</span><h2>Database</h2><p>PostgreSQL lưu trữ sự kiện, tài khoản, lượt đăng ký với các ràng buộc dữ liệu.</p></div><div><span className="about-number">04</span><h2>Docker</h2><p>Docker Compose điều phối web, API và cơ sở dữ liệu; network riêng, named volume và healthcheck.</p></div></div></section>}

    <section className="closing-cta"><div className="container closing-inner"><div><span className="eyebrow">THE NEXT GAME IS YOURS</span><h2>Sẵn sàng tạo nên <em>khoảnh khắc mới?</em></h2><p>Không cần là vận động viên chuyên nghiệp để bắt đầu. Bạn chỉ cần sẵn sàng.</p></div><Button onClick={()=>go('events')}>Tham gia sự kiện <ArrowUpRight size={19}/></Button></div></section>
    <footer className="footer"><div className="container footer-inner"><div><Brand/><p>Chơi hết mình, kết nối mỗi ngày.<br/>Nền tảng thể thao cộng đồng.</p></div><div><b>KHÁM PHÁ</b><button onClick={()=>go('events')}>Danh sách sự kiện</button><button onClick={()=>go('guide')}>Kiến thức thể thao</button><button onClick={()=>go('about')}>Về dự án</button><button onClick={()=>go('policy')}>Điều khoản & riêng tư</button></div><div><b>CÔNG NGHỆ</b><span>React / Node.js / PostgreSQL</span><span>Docker Compose · Full-stack</span></div><div className="footer-stamp">LET'S<br/>PLAY<br/><span>TOGETHER.</span></div></div><div className="container footer-bottom"><span>© 2026 SportHub · Dự án học thuật Docker Containers · Dữ liệu sự kiện minh họa.</span><span>Made for the game, built with containers.</span></div></footer>
    {authOpen&&<AuthPanel mode={authMode} setMode={setAuthMode} onClose={()=>setAuthOpen(false)} onSubmit={submitAuth} loading={busy}/>}
    {eventSelected&&<EventDetail event={eventSelected} user={user} isRegistered={registeredIds.has(eventSelected.id)} onRegister={register} onCancel={cancel} onClose={()=>setSelected(null)} loading={busy}/>}
    {edit!==undefined&&<EventForm event={edit} close={()=>setEdit(undefined)} save={saveEvent} busy={busy}/>}
    <Toast item={toast} clear={()=>setToast(null)}/>
  </div>;
}
