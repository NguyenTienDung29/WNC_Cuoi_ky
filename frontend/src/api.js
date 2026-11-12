export async function request(path, { method = 'GET', token, data } = {}) {
  let response;
  try { response = await fetch(path, {
    method,
    headers: {
      ...(data !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    },
    ...(data !== undefined ? { body: JSON.stringify(data) } : {})
  }); } catch (_) { throw new Error('Không thể kết nối API. Hãy kiểm tra Docker Compose, cổng 4000 (nếu chạy Vite) và /health.'); }
  let body = {};
  try { body = await response.json(); } catch (_) { body = {}; }
  if (!response.ok) throw new Error(body.error || (response.status >= 500 ? 'Backend chưa sẵn sàng hoặc proxy không kết nối được. Xem docker compose logs api.' : `Yêu cầu thất bại (${response.status}).`));
  return body;
}
