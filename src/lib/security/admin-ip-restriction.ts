function getAllowedIps(): string[] | null {
  const envValue = process.env.ADMIN_ALLOWED_IPS;
  if (!envValue) return null;
  return envValue.split(",").map((ip) => ip.trim()).filter(Boolean);
}

function ipToNumber(ip: string): number {
  const parts = ip.split(".").map(Number);
  return ((parts[0] << 24) | (parts[1] << 16) | (parts[2] << 8) | parts[3]) >>> 0;
}

function isIpInCidr(ip: string, cidr: string): boolean {
  const [network, prefixStr] = cidr.split("/");
  const prefix = parseInt(prefixStr, 10);
  if (isNaN(prefix) || prefix < 0 || prefix > 32) return false;

  const mask = prefix === 0 ? 0 : (~0 << (32 - prefix)) >>> 0;
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);

  return (ipNum & mask) === (networkNum & mask);
}

export function isAdminIpAllowed(clientIp: string | null): boolean {
  const allowedIps = getAllowedIps();
  if (!allowedIps) return true;
  if (!clientIp) return false;

  const normalizedIp = clientIp === "::1" ? "127.0.0.1" : clientIp;

  return allowedIps.some((allowed) => {
    if (allowed.includes("/")) {
      return isIpInCidr(normalizedIp, allowed);
    }
    return normalizedIp === allowed;
  });
}
