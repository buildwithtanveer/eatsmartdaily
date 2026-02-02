import dns from "dns/promises";
import net from "net";

type UrlSafetyResult =
  | { ok: true; url: URL }
  | { ok: false; reason: string };

function ipv4ToInt(ip: string): number {
  const parts = ip.split(".").map((p) => Number(p));
  return (
    ((parts[0] << 24) >>> 0) +
    ((parts[1] << 16) >>> 0) +
    ((parts[2] << 8) >>> 0) +
    (parts[3] >>> 0)
  );
}

function isPrivateIPv4(ip: string): boolean {
  const val = ipv4ToInt(ip);
  const inRange = (start: string, end: string) => {
    const a = ipv4ToInt(start);
    const b = ipv4ToInt(end);
    return val >= a && val <= b;
  };

  return (
    inRange("0.0.0.0", "0.255.255.255") ||
    inRange("10.0.0.0", "10.255.255.255") ||
    inRange("100.64.0.0", "100.127.255.255") ||
    inRange("127.0.0.0", "127.255.255.255") ||
    inRange("169.254.0.0", "169.254.255.255") ||
    inRange("172.16.0.0", "172.31.255.255") ||
    inRange("192.0.0.0", "192.0.0.255") ||
    inRange("192.0.2.0", "192.0.2.255") ||
    inRange("192.168.0.0", "192.168.255.255") ||
    inRange("198.18.0.0", "198.19.255.255") ||
    inRange("198.51.100.0", "198.51.100.255") ||
    inRange("203.0.113.0", "203.0.113.255") ||
    inRange("224.0.0.0", "255.255.255.255") ||
    ip === "169.254.169.254"
  );
}

function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();
  if (normalized === "::" || normalized === "::1") return true;
  if (normalized.startsWith("fc") || normalized.startsWith("fd")) return true;
  if (normalized.startsWith("fe8") || normalized.startsWith("fe9") || normalized.startsWith("fea") || normalized.startsWith("feb")) return true;
  return false;
}

function isDisallowedHostname(hostname: string): boolean {
  const h = hostname.toLowerCase();
  if (h === "localhost" || h.endsWith(".localhost")) return true;
  if (h === "metadata.google.internal") return true;
  return false;
}

function isAllowedPort(port: string): boolean {
  if (!port) return true;
  return port === "80" || port === "443";
}

export async function validatePublicHttpUrl(rawUrl: string): Promise<UrlSafetyResult> {
  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return { ok: false, reason: "invalid_url" };
  }

  if (url.username || url.password) return { ok: false, reason: "userinfo_not_allowed" };
  if (!["http:", "https:"].includes(url.protocol)) return { ok: false, reason: "protocol_not_allowed" };
  if (!isAllowedPort(url.port)) return { ok: false, reason: "port_not_allowed" };

  const hostname = url.hostname;
  if (!hostname) return { ok: false, reason: "missing_hostname" };
  if (isDisallowedHostname(hostname)) return { ok: false, reason: "hostname_blocked" };

  const ipVersion = net.isIP(hostname);
  if (ipVersion === 4 && isPrivateIPv4(hostname)) return { ok: false, reason: "private_ip" };
  if (ipVersion === 6 && isPrivateIPv6(hostname)) return { ok: false, reason: "private_ip" };

  if (ipVersion === 0) {
    let records: { address: string; family: number }[];
    try {
      records = await dns.lookup(hostname, { all: true });
    } catch {
      return { ok: false, reason: "dns_lookup_failed" };
    }

    for (const record of records) {
      if (record.family === 4 && isPrivateIPv4(record.address)) return { ok: false, reason: "private_dns" };
      if (record.family === 6 && isPrivateIPv6(record.address)) return { ok: false, reason: "private_dns" };
    }
  }

  return { ok: true, url };
}

