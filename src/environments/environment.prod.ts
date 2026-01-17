// Production environment configuration for Render deployment
const backendUrl = 'https://myfi-app-backend.onrender.com';
const apiUrl = `${backendUrl}/api`;

console.log('🔧 [ENVIRONMENT PROD] Loaded with:');
console.log('  - backendUrl:', backendUrl);
console.log('  - apiUrl:', apiUrl);
console.log('  - window.location.hostname:', typeof window !== 'undefined' ? window.location.hostname : 'N/A');
console.log('  - window.location.href:', typeof window !== 'undefined' ? window.location.href : 'N/A');

export const environment = {
  production: true,
  apiUrl: apiUrl,
  apiBaseUrl: backendUrl
};