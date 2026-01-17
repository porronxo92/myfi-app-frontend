import { HttpInterceptorFn } from '@angular/common/http';

/**
 * CORS Credentials Interceptor
 * 
 * Asegura que todas las peticiones HTTP incluyan credenciales (cookies)
 * para permitir que funcione correctamente CORS con credenciales habilitadas
 */
export const corsInterceptor: HttpInterceptorFn = (req, next) => {
  // Clonar request con withCredentials=true para enviar/recibir cookies
  const corsReq = req.clone({
    withCredentials: true
  });
  
  return next(corsReq);
};
