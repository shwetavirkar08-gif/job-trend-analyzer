export async function apiFetch(path, options = {}) {
  const res = await fetch(path, {
    credentials: 'include',
    ...options,
  });
  const contentType = res.headers.get('content-type') || '';
  let data;
  try {
    if (contentType.includes('application/json')) {
      data = await res.json();
    } else {
      data = await res.text();
    }
  } catch (e) {
    // Last attempt to read text body
    try { data = await res.text(); } catch {}
  }
  if (!res.ok) {
    const message = typeof data === 'string' ? data : (data && data.error) || 'Request failed';
    const err = new Error(message);
    err.status = res.status;
    throw err;
  }
  return data;
}


