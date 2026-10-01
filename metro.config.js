// Learn more https://docs.expo.dev/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');
const https = require('https');

const config = getDefaultConfig(__dirname);

/**
 * Yalnız web önizləmə üçün dev-proxy: prod API CORS-da yalnız https://aqrobazar.com-a icazə verir,
 * ona görə brauzer `/api/v1/*` sorğularını Metro-ya göndərir, Metro isə server tərəfdən ötürür.
 * Native (Expo Go / build) buna toxunmur — birbaşa API-yə gedir.
 */
const API_ORIGIN = new URL(process.env.EXPO_PUBLIC_API_URL || 'https://aqrobazar.com');

config.server = {
  ...config.server,
  enhanceMiddleware: (metroMiddleware) => (req, res, next) => {
    if (!req.url.startsWith('/api/v1/')) return metroMiddleware(req, res, next);
    const headers = { ...req.headers, host: API_ORIGIN.host };
    delete headers.origin;
    delete headers.referer;
    const upstream = https.request(
      { hostname: API_ORIGIN.hostname, port: API_ORIGIN.port || 443, path: req.url, method: req.method, headers },
      (apiRes) => {
        res.writeHead(apiRes.statusCode || 502, apiRes.headers);
        apiRes.pipe(res);
      },
    );
    upstream.on('error', (err) => {
      res.writeHead(502, { 'content-type': 'application/json' });
      res.end(JSON.stringify({ detail: `Dev proxy: ${err.message}` }));
    });
    req.pipe(upstream);
  },
};

module.exports = config;
