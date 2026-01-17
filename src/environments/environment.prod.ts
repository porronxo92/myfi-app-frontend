// Función helper para determinar la URL del backend dinámicamente
function getBackendUrl(): string {
  const hostname = window.location.hostname;
  const protocol = window.location.protocol; // 'http:' o 'https:'
  
  // Siempre usar puerto 8000 para el backend
  const backendPort = 8000;
  
  return `${protocol}//${hostname}:${backendPort}`;
}

export const environment = {
  production: true,
  apiUrl: `${getBackendUrl()}/api`,
  apiBaseUrl: getBackendUrl()
};
