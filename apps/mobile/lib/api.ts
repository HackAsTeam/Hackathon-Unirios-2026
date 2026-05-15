const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:5000";

type RequestOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  token?: string;
};

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { body, token, headers, ...rest } = options;

  const response = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const text = await response.text().catch(() => response.statusText);
    throw new Error(`API ${response.status}: ${text}`);
  }

  return response.json() as Promise<T>;
}
