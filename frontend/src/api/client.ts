export interface Device {
  device_id: string;
  readable_name: string;
  serial_id: string | null;
  registered_at: string | null;
  last_seen: string | null;
  calibration_status: string;
  calibration_date: string | null;
  status: string;
  firmware_version: string | null;
  notes: string | null;
  calibration: any | null;
}

export interface DeviceList {
  total: number;
  devices: Device[];
}

export interface GeneratedDevicePair {
  device_id: string;
  readable_name: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  username: string;
  display_name: string | null;
  must_change_password: boolean;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || `${window.location.origin}/api`;

function getToken(): string | null {
  return localStorage.getItem('access_token');
}

async function fetchApi<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('access_token');
    localStorage.removeItem('username');
    localStorage.removeItem('display_name');
    window.location.href = '/login';
    throw new Error('Session expired. Please login again.');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `API error: ${response.status}`);
  }

  return response.json();
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const data = await fetchApi<LoginResponse>(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });
  localStorage.setItem('access_token', data.access_token);
  localStorage.setItem('username', data.username);
  localStorage.setItem('must_change_password', String(data.must_change_password));
  if (data.display_name) {
    localStorage.setItem('display_name', data.display_name);
  }
  return data;
}

export function logout(): void {
  localStorage.removeItem('access_token');
  localStorage.removeItem('username');
  localStorage.removeItem('display_name');
  localStorage.removeItem('must_change_password');
  window.location.href = '/login';
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export async function validateToken(): Promise<boolean> {
  const token = getToken();
  if (!token) return false;
  try {
    const response = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) {
      return false;
    }
    const data = await response.json();
    localStorage.setItem('must_change_password', String(data.must_change_password ?? false));
    return true;
  } catch {
    return false;
  }
}

export function mustChangePassword(): boolean {
  return localStorage.getItem('must_change_password') === 'true';
}

export function clearMustChangePassword(): void {
  localStorage.setItem('must_change_password', 'false');
}

export function getCurrentUsername(): string | null {
  return localStorage.getItem('username');
}

export function getCurrentDisplayName(): string | null {
  return localStorage.getItem('display_name');
}

export async function generateDevicePair(): Promise<GeneratedDevicePair> {
  return fetchApi<GeneratedDevicePair>(`${API_BASE_URL}/devices/generate`, {
    method: 'POST',
  });
}

export async function registerDevice(params: {
  serial_id?: string;
}): Promise<Device> {
  return fetchApi<Device>(`${API_BASE_URL}/devices/register`, {
    method: 'POST',
    body: JSON.stringify({ serial_id: params.serial_id }),
  });
}

export async function listDevices(params?: {
  offset?: number;
  limit?: number;
  status?: string;
  calibration_status?: string;
}): Promise<DeviceList> {
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  
  let queryParams = new URLSearchParams({
    offset: offset.toString(),
    limit: limit.toString(),
  });
  
  if (params?.status) {
    queryParams.append('status', params.status);
  }
  if (params?.calibration_status) {
    queryParams.append('calibration_status', params.calibration_status);
  }

  return fetchApi<DeviceList>(`${API_BASE_URL}/devices?${queryParams.toString()}`);
}

export async function getDevice(deviceId: string): Promise<Device> {
  return fetchApi<Device>(`${API_BASE_URL}/devices/${deviceId}`);
}

export async function updateDevice(
  deviceId: string,
  body: Partial<
    Pick<
      Device,
      | "calibration_status"
      | "calibration_date"
      | "status"
      | "firmware_version"
      | "notes"
      | "calibration"
    >
  >
): Promise<Device> {
  return fetchApi<Device>(`${API_BASE_URL}/devices/${deviceId}`, {
    method: 'PUT',
    body: JSON.stringify(body),
  });
}

export async function deleteDevice(deviceId: string): Promise<Device> {
  return fetchApi<Device>(`${API_BASE_URL}/devices/${deviceId}`, {
    method: 'DELETE',
  });
}

export async function searchDevices(
  q: string,
  params?: { offset?: number; limit?: number }
): Promise<DeviceList> {
  const offset = params?.offset ?? 0;
  const limit = params?.limit ?? 50;
  
  const queryParams = new URLSearchParams({
    q,
    offset: offset.toString(),
    limit: limit.toString(),
  });

  return fetchApi<DeviceList>(`${API_BASE_URL}/devices/search?${queryParams.toString()}`);
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
  await fetchApi(`${API_BASE_URL}/auth/change-password`, {
    method: 'PUT',
    body: JSON.stringify({ current_password: currentPassword, new_password: newPassword }),
  });
  clearMustChangePassword();
}
