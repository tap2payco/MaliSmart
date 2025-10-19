export type JwtTokens = { access: string; refresh: string };

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const ACCESS_TOKEN_KEY = "auth_access_token";
const REFRESH_TOKEN_KEY = "auth_refresh_token";
const USER_KEY = "auth_user";

export type AuthUser = { id: number; phone: string; role: string } | null;

export function getAccessToken(): string | null {
	return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
	return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredUser(): AuthUser {
	const raw = localStorage.getItem(USER_KEY);
	return raw ? (JSON.parse(raw) as AuthUser) : null;
}

export function storeSession(user: AuthUser, tokens: JwtTokens): void {
	localStorage.setItem(USER_KEY, JSON.stringify(user));
	localStorage.setItem(ACCESS_TOKEN_KEY, tokens.access);
	localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refresh);
}

export function clearSession(): void {
	localStorage.removeItem(USER_KEY);
	localStorage.removeItem(ACCESS_TOKEN_KEY);
	localStorage.removeItem(REFRESH_TOKEN_KEY);
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
	const headers: Record<string, string> = {
		"Content-Type": "application/json",
		...(init.headers as Record<string, string> | undefined),
	};
	const token = getAccessToken();
	if (token) headers.Authorization = `Bearer ${token}`;

	const resp = await fetch(String(input).startsWith("http") ? String(input) : `${API_BASE_URL}${input}`, {
		...init,
		headers,
	});

	if (resp.status !== 401) return resp;

	// try refresh once on 401
	const refreshed = await tryRefreshToken();
	if (!refreshed) return resp;

	const retryHeaders = { ...headers, Authorization: `Bearer ${getAccessToken()}` };
	return fetch(String(input).startsWith("http") ? String(input) : `${API_BASE_URL}${input}`, {
		...init,
		headers: retryHeaders,
	});
}

async function tryRefreshToken(): Promise<boolean> {
	const refresh = getRefreshToken();
	if (!refresh) return false;
	try {
		const r = await fetch(`${API_BASE_URL}/api/auth/token/refresh/`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ refresh }),
		});
		if (!r.ok) return false;
		const data = (await r.json()) as { access: string };
		localStorage.setItem(ACCESS_TOKEN_KEY, data.access);
		return true;
	} catch (_) {
		return false;
	}
}

// Auth API
export async function requestOtp(phone: string): Promise<{ phone: string; expires_in: number }> {
	const r = await fetch(`${API_BASE_URL}/api/auth/otp_request/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ phone }),
	});
	if (!r.ok) throw new Error((await r.text()) || "OTP request failed");
	return r.json();
}

export async function verifyOtp(phone: string, otp: string): Promise<{ user: AuthUser; tokens: JwtTokens }> {
	const r = await fetch(`${API_BASE_URL}/api/auth/otp_verify/`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ phone, otp }),
	});
	if (!r.ok) throw new Error((await r.text()) || "OTP verify failed");
	return r.json();
}

// Resources
export const PropertiesApi = {
	list: async () => (await apiFetch("/api/properties/")).json(),
	create: async (payload: any) => (await apiFetch("/api/properties/", { method: "POST", body: JSON.stringify(payload) })).json(),
	update: async (id: number | string, payload: any) => (await apiFetch(`/api/properties/${id}/`, { method: "PUT", body: JSON.stringify(payload) })).json(),
	remove: async (id: number | string) => apiFetch(`/api/properties/${id}/`, { method: "DELETE" }),
};

export const UnitsApi = {
	list: async () => (await apiFetch("/api/units/")).json(),
	create: async (payload: any) => (await apiFetch("/api/units/", { method: "POST", body: JSON.stringify(payload) })).json(),
	update: async (id: number | string, payload: any) => (await apiFetch(`/api/units/${id}/`, { method: "PUT", body: JSON.stringify(payload) })).json(),
	remove: async (id: number | string) => apiFetch(`/api/units/${id}/`, { method: "DELETE" }),
};


