import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface UpdateUserProfile {
  email?: string;
  username?: string;
  full_name?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  username?: string;
  full_name?: string;
  profile_picture?: string;
  is_active: boolean;
  is_admin: boolean;
  last_login?: string;
  created_at: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserProfileService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(private http: HttpClient) {}

  /**
   * Formatea una imagen de perfil para asegurar que tenga el prefijo correcto
   * Previene el Error 431 que ocurre cuando el navegador intenta cargar
   * una cadena base64 pura como URL relativa
   */
  private formatProfilePicture(picture: string | undefined): string | undefined {
    if (!picture) {
      return picture;
    }

    // Si ya tiene el prefijo correcto de data URL, devolverlo tal cual
    if (picture.startsWith('data:')) {
      return picture;
    }

    // Si es una URL HTTP, devolverla tal cual
    if (picture.startsWith('http://') || picture.startsWith('https://')) {
      return picture;
    }

    // Detectar base64 JPEG (empieza con /9j/) o PNG (empieza con iVBOR)
    // IMPORTANTE: esto debe ir ANTES del check de '/' para rutas relativas
    if (picture.startsWith('/9j/') || picture.startsWith('iVBOR')) {
      return `data:image/jpeg;base64,${picture}`;
    }

    // Si es una ruta relativa del servidor (ej: /assets/...)
    if (picture.startsWith('/')) {
      return picture;
    }

    // Si parece base64 puro (solo caracteres válidos), agregar el prefijo
    if (/^[A-Za-z0-9+/=]+$/.test(picture.substring(0, 100)) && picture.length > 100) {
      return `data:image/jpeg;base64,${picture}`;
    }

    return picture;
  }

  /**
   * Obtener perfil del usuario actual
   * GET /api/users/me
   */
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`).pipe(
      tap(profile => {
        // Formatear la imagen ANTES de que Angular intente renderizarla
        if (profile.profile_picture) {
          profile.profile_picture = this.formatProfilePicture(profile.profile_picture);
        }
      })
    );
  }

  /**
   * Actualizar perfil del usuario actual
   * PUT /api/users/me
   */
  updateProfile(profileData: UpdateUserProfile): Observable<UserProfile> {
    return this.http.put<UserProfile>(`${this.apiUrl}/me`, profileData);
  }

  /**
   * Actualizar foto de perfil
   * PUT /api/users/me/profile-picture
   * 
   * ✅ IMPORTANTE: La imagen se envía en el BODY JSON, NO como query parameter
   * 
   * Formato del request:
   * Headers: { "Authorization": "Bearer <token>", "Content-Type": "application/json" }
   * Body: { "profile_picture": "data:image/jpeg;base64,..." }
   * 
   * ❌ NO USAR: /profile-picture?profile_picture_url=... (causa error 431)
   * 
   * @param imageBase64 - String base64 de la imagen (puede incluir prefijo data:image)
   * @returns Observable<UserProfile> con los datos actualizados del usuario
   */
  updateProfilePicture(imageBase64: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.apiUrl}/me/profile-picture`,
      { profile_picture: imageBase64 }  // ✅ Imagen en el body JSON
    ).pipe(
      tap(profile => {
        // Formatear la imagen ANTES de que Angular intente renderizarla
        if (profile.profile_picture) {
          profile.profile_picture = this.formatProfilePicture(profile.profile_picture);
        }
      })
    );
  }

  /**
   * Cambiar contraseña del usuario actual
   * POST /api/users/change-password
   */
  changePassword(passwordData: ChangePasswordRequest): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/change-password`,
      passwordData
    );
  }
}
