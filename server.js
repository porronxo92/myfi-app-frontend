const express = require('express');
const helmet = require('helmet');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// SECURITY HEADERS (helmet)
// ============================================
app.use(helmet({
  // Content Security Policy - controla qué recursos puede cargar la app
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Angular requiere unsafe-eval en dev
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "https://myfi-app-backend.onrender.com", "http://localhost:8000"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: []
    }
  },
  // X-Frame-Options - previene clickjacking
  frameguard: { action: 'deny' },
  // X-Content-Type-Options - previene MIME sniffing
  noSniff: true,
  // X-XSS-Protection - filtro XSS del navegador
  xssFilter: true,
  // Referrer-Policy - controla información enviada en Referer header
  referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  // HSTS - forzar HTTPS (solo en producción)
  hsts: process.env.NODE_ENV === 'production' ? {
    maxAge: 31536000, // 1 año
    includeSubDomains: true,
    preload: true
  } : false
}));

// ============================================
// STATIC FILES
// ============================================
// Servir archivos estáticos desde dist/finanzas-app/browser
app.use(express.static(path.join(__dirname, 'dist/finanzas-app/browser'), {
  // Cache headers para assets estáticos
  maxAge: process.env.NODE_ENV === 'production' ? '1y' : '0',
  etag: true
}));

// ============================================
// SPA ROUTING
// ============================================
// Manejar todas las rutas de Angular (SPA routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist/finanzas-app/browser/index.html'));
});

// ============================================
// SERVER START
// ============================================
app.listen(PORT, '0.0.0.0', () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🔒 Security headers enabled (helmet)`);
});
