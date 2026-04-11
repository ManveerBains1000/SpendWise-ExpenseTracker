const trimTrailingSlash = (value) => String(value || "").replace(/\/+$/, "");

export const API_BASE_URL = trimTrailingSlash(
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000"
);

export const SOCKET_URL = trimTrailingSlash(
  import.meta.env.VITE_SOCKET_URL || API_BASE_URL
);
