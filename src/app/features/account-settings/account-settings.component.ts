import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService, UserProfile, UpdateUserProfile, ChangePasswordRequest } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  userProfile = signal<UserProfile | null>(null);
  loading = signal<boolean>(false);
  successMessage = signal<string | null>(null);
  errorMessage = signal<string | null>(null);
  selectedFile = signal<File | null>(null);
  previewUrl = signal<string | null>(null);
  
  profileForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private userProfileService: UserProfileService,
    private authService: AuthService,
    private fb: FormBuilder
  ) {
    // Formulario de perfil
    this.profileForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      username: ['', [Validators.minLength(3), Validators.maxLength(50)]],
      full_name: ['', [Validators.maxLength(100)]]
    });

    // Formulario de contraseña
    this.passwordForm = this.fb.group({
      current_password: ['', [Validators.required]],
      new_password: ['', [Validators.required, Validators.minLength(8)]],
      confirm_password: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.loading.set(true);
    this.userProfileService.getCurrentProfile().subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        // Rellenar formulario con datos actuales
        this.profileForm.patchValue({
          email: profile.email,
          username: profile.username || '',
          full_name: profile.full_name || ''
        });
        this.loading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar perfil:', err);
        this.errorMessage.set('Error al cargar los datos del perfil');
        this.loading.set(false);
      }
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      
      // Validar tipo de archivo
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        this.errorMessage.set('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)');
        return;
      }

      // Validar tamaño (máximo 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        this.errorMessage.set('La imagen no debe superar los 5MB');
        return;
      }

      this.selectedFile.set(file);

      // Generar preview
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        this.previewUrl.set(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  uploadProfilePicture() {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Por favor selecciona una imagen');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    // Convertir a base64
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const base64 = e.target?.result as string;

      this.userProfileService.updateProfilePicture(base64).subscribe({
        next: (profile) => {
          this.userProfile.set(profile);
          // Actualizar el usuario en el AuthService para que se refleje en el navbar
          this.authService.updateUserProfile(profile);
          this.successMessage.set('Foto de perfil actualizada correctamente');
          this.selectedFile.set(null);
          this.previewUrl.set(null);
          this.loading.set(false);
          this.autoHideMessage();
        },
        error: (err) => {
          console.error('Error al actualizar foto:', err);
          this.errorMessage.set(err.error?.detail || 'Error al actualizar la foto de perfil');
          this.loading.set(false);
        }
      });
    };
    reader.readAsDataURL(file);
  }

  removeProfilePicture() {
    this.loading.set(true);
    this.clearMessages();

    this.userProfileService.updateProfilePicture('').subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        this.authService.updateUserProfile(profile);
        this.successMessage.set('Foto de perfil eliminada correctamente');
        this.selectedFile.set(null);
        this.previewUrl.set(null);
        this.loading.set(false);
        this.autoHideMessage();
      },
      error: (err) => {
        console.error('Error al eliminar foto:', err);
        this.errorMessage.set(err.error?.detail || 'Error al eliminar la foto de perfil');
        this.loading.set(false);
      }
    });
  }

  updateProfile() {
    if (this.profileForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    const profileData: UpdateUserProfile = this.profileForm.value;

    this.userProfileService.updateProfile(profileData).subscribe({
      next: (profile) => {
        this.userProfile.set(profile);
        // Actualizar el usuario en el AuthService para que se refleje en el navbar
        this.authService.updateUserProfile(profile);
        this.successMessage.set('Perfil actualizado correctamente');
        this.loading.set(false);
        this.autoHideMessage();
      },
      error: (err) => {
        console.error('Error al actualizar perfil:', err);
        this.errorMessage.set(err.error?.detail || 'Error al actualizar el perfil');
        this.loading.set(false);
      }
    });
  }

  changePassword() {
    if (this.passwordForm.invalid) {
      return;
    }

    const { current_password, new_password, confirm_password } = this.passwordForm.value;

    // Validar que las contraseñas coincidan
    if (new_password !== confirm_password) {
      this.errorMessage.set('Las contraseñas no coinciden');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    const passwordData: ChangePasswordRequest = {
      current_password,
      new_password
    };

    this.userProfileService.changePassword(passwordData).subscribe({
      next: (response) => {
        this.successMessage.set(response.message);
        this.passwordForm.reset();
        this.loading.set(false);
        this.autoHideMessage();
      },
      error: (err) => {
        console.error('Error al cambiar contraseña:', err);
        this.errorMessage.set(err.error?.detail || 'Error al cambiar la contraseña');
        this.loading.set(false);
      }
    });
  }

  private clearMessages() {
    this.successMessage.set(null);
    this.errorMessage.set(null);
  }

  private autoHideMessage() {
    setTimeout(() => {
      this.clearMessages();
    }, 5000);
  }
}
