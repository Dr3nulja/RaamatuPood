import { getPathname } from '@/lib/security/ip';

const SUSPICIOUS_UA = [
  /sqlmap/i,
  /nmap/i,
  /nikto/i,
  /curl\//i,
  /wget\//i,
  /python-requests/i,
  /headless/i,
  /phantomjs/i,
  /scrapy/i,
  /semrush/i,
  /ahrefs/i,
  /mj12bot/i,
  /masscan/i,
];

const SUSPICIOUS_PATH = [
  /\/wp-admin/i,
  /\/wp-login/i,
  /\.env/i,
  /\/phpmyadmin/i,
  /\/\.git/i,
  /\/xmlrpc\.php/i,
  /\/adminer/i,
];

export function getBotScore(request: Request): number {
  const userAgent = request.headers.get('user-agent') || '';
  const pathname = getPathname(request);
  const accept = request.headers.get('accept') || '';

  let score = 0;

  if (!userAgent || userAgent.length < 8) {
    score += 35;
  }

  for (const pattern of SUSPICIOUS_UA) {
    if (pattern.test(userAgent)) {
      score += 60;
      break;
    }
  }

  for (const pattern of SUSPICIOUS_PATH) {
    if (pattern.test(pathname)) {
      score += 80;
      break;
    }
  }

  if (!accept && request.method !== 'OPTIONS') {
    score += 10;
  }

  if (pathname.includes('/api/') && !accept.includes('application/json') && request.method !== 'GET') {
    score += 10;
  }

  return Math.min(score, 100);
}

export function isHardBlockedBot(request: Request): boolean {
  return getBotScore(request) >= 80;
}
