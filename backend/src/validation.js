'use strict';
// Pure, dependency-free event validation used by API and unit tests.
const sports = ['Bóng đá', 'Bóng rổ', 'Cầu lông', 'Chạy bộ', 'Bơi lội', 'Khác'];
const themes = ['emerald', 'orange', 'violet', 'blue', 'cyan', 'rose'];
const cleanEmail = value => String(value || '').trim().toLowerCase();

function parseEvent(body) {
  const title = String(body.title || '').trim();
  const sport = String(body.sport || '').trim();
  const venue = String(body.venue || '').trim();
  const city = String(body.city || 'TP. Hồ Chí Minh').trim();
  const description = String(body.description || '').trim();
  const capacity = Number(body.capacity);
  const price = Number(body.price);
  const startTime = new Date(body.start_time);
  const status = String(body.status || 'open');
  const organizer = String(body.organizer || 'SportHub').trim();
  const contactEmail = cleanEmail(body.contact_email || '');
  const theme = String(body.theme || 'emerald');
  if (title.length < 5 || title.length > 160) throw Object.assign(new Error('Tên sự kiện phải từ 5 đến 160 ký tự.'), { status: 400 });
  if (!sports.includes(sport)) throw Object.assign(new Error('Môn thể thao không hợp lệ.'), { status: 400 });
  if (!venue || venue.length > 180 || !city || city.length > 100) throw Object.assign(new Error('Địa điểm không hợp lệ.'), { status: 400 });
  if (!Number.isFinite(startTime.getTime())) throw Object.assign(new Error('Thời gian sự kiện không hợp lệ.'), { status: 400 });
  if (!Number.isSafeInteger(capacity) || capacity < 1 || capacity > 100000) throw Object.assign(new Error('Sức chứa phải từ 1 đến 100.000.'), { status: 400 });
  if (!Number.isSafeInteger(price) || price < 0 || price > 100000000) throw Object.assign(new Error('Giá tham gia không hợp lệ.'), { status: 400 });
  if (description.length > 4000 || !themes.includes(theme) || !['open', 'closed'].includes(status)) throw Object.assign(new Error('Mô tả hoặc trạng thái không hợp lệ.'), { status: 400 });
  if (organizer.length < 2 || organizer.length > 120 || (contactEmail && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) || contactEmail.length > 180))) throw Object.assign(new Error('Tên đơn vị tổ chức hoặc email liên hệ không hợp lệ.'), { status: 400 });
  return [title, sport, venue, city, startTime.toISOString(), capacity, price, description, theme, status, organizer, contactEmail];
}


module.exports = {parseEvent, sports, themes};
