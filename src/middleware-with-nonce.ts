import { NextRequest, NextResponse } from 'next/server';

export function addCspHeader(req: NextRequest, res: NextResponse) {
  // Generate a random nonce for each request
  const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
  
  // Set the nonce in request headers so components can access it
  req.headers.set('x-nonce', nonce);
  
  // Update the CSP header to use the nonce instead of 'unsafe-inline'
  const cspHeader = `
    default-src 'self';
    script-src 'self' 'nonce-${nonce}' 'unsafe-eval' https://cdn.jsdelivr.net https://www.googletagmanager.com https://www.google-analytics.com https://pagead2.googlesyndication.com https://googleads.g.doubleclick.net https://*.ezojs.com https://*.gatekeeperconsent.com https://the.gatekeeperconsent.com;
    style-src 'self' 'nonce-${nonce}' https://cdn.jsdelivr.net https://fonts.googleapis.com;
    img-src 'self' data: https: http:;
    font-src 'self' https://fonts.gstatic.com;
    connect-src 'self' https: https://*.google-analytics.com https://*.googlesyndication.com https://*.ezoic.com;
    frame-src 'self' https://*.googlesyndication.com https://*.google.com https://*.ezoic.com;
    frame-ancestors 'self';
    base-uri 'self';
    form-action 'self';
    object-src 'none';
    upgrade-insecure-requests;
  `.replace(/\s{2,}/g, ' ');

  res.headers.set('Content-Security-Policy', cspHeader);
  
  return { res, nonce };
}