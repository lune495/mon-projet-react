import axios from 'axios';

const BASE = 'https://www.chifaa.sn/pharma_back_test';
const TOKEN_KEY = 'auth_token';

export async function login({ role_id = 3, email, password }) {
  const payload = { role_id, email, password };
  const response = await axios.post(`${BASE}/api/login`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
  // Expecting token in response.data.token or response.data.access_token
  const token = response?.data?.token || response?.data?.access_token || null;
  return { response, token };
}

export function saveToken(token) {
  if (!token) return;
  localStorage.setItem(TOKEN_KEY, token);
}

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function authHeader() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export default { login, saveToken, getToken, clearToken, authHeader };
