import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
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
   * Obtener perfil del usuario actual
   * GET /api/users/me
   */
  getCurrentProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/me`);
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
   */
  updateProfilePicture(profilePictureUrl: string): Observable<UserProfile> {
    return this.http.put<UserProfile>(
      `${this.apiUrl}/me/profile-picture`,
      null,
      { params: { profile_picture_url: profilePictureUrl } }
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
