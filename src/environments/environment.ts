const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

export const environment = {
  production: false,
  apiUrl: isLocalhost ? 'http://localhost:8000/api' : 'https://myfi-app-backend.onrender.com/api',
  apiBaseUrl: isLocalhost ? 'http://localhost:8000' : 'https://myfi-app-backend.onrender.com'
};
