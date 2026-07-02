export function isLocalDevHost(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

export function isLocalDev() {
  if (typeof window === "undefined") return false;
  return isLocalDevHost(window.location.hostname);
}
