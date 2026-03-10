import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserProfileService, UserProfile, UpdateUserProfile, ChangePasswordRequest } from '../../core/services/user-profile.service';
import { AuthService } from '../../core/services/auth.service';
import { SafeImagePipe } from '../../shared/pipes/safe-image.pipe';

@Component({
  selector: 'app-account-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, SafeImagePipe],
  templateUrl: './account-settings.component.html',
  styleUrls: ['./account-settings.component.scss']
})
export class AccountSettingsComponent implements OnInit {
  router = inject(Router);
  
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
        // El servicio ya formateó la imagen con el prefijo correcto
        this.userProfile.set(profile);
        // Rellenar formulario con datos actuales
        this.profileForm.patchValue({
          email: profile.email,
          username: profile.username || '',
          full_name: profile.full_name || ''
        });
        this.loading.set(false);
      },
      error: () => {
        console.error('Error al cargar perfil');
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

  /**
   * Sube y actualiza la foto de perfil
   * 
   * Proceso:
   * 1. Comprime la imagen a 800x800px con calidad 80% (reduce ~95% del tamaño)
   * 2. Convierte a base64 (formato: "data:image/jpeg;base64,...")
   * 3. Envía al backend en el body JSON (evita error 431)
   * 4. Actualiza el estado local y el AuthService para reflejar cambios inmediatos
   */
  uploadProfilePicture() {
    const file = this.selectedFile();
    if (!file) {
      this.errorMessage.set('Por favor selecciona una imagen');
      return;
    }

    this.loading.set(true);
    this.clearMessages();

    // Comprimir y convertir imagen a base64
    this.compressImage(file).then(base64 => {
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
        error: () => {
          console.error('Error al actualizar foto');
          this.errorMessage.set('Error al actualizar la foto de perfil');
          this.loading.set(false);
        }
      });
    }).catch(() => {
      console.error('Error al comprimir imagen');
      this.errorMessage.set('Error al procesar la imagen');
      this.loading.set(false);
    });
  }

  /**
   * Comprime una imagen a un tamaño máximo manteniendo la proporción
   * 
   * Objetivo: Reducir el tamaño de la imagen para evitar error 431 (Request Header Fields Too Large)
   * 
   * @param file - Archivo de imagen a comprimir
   * @param maxWidth - Ancho máximo en píxeles (default: 800)
   * @param maxHeight - Alto máximo en píxeles (default: 800)
   * @param quality - Calidad de compresión JPEG 0-1 (default: 0.8)
   * @returns Promise<string> - String base64 con formato "data:image/jpeg;base64,..."
   * 
   * Reducción típica: 3-5MB → 100-300KB (~95% más pequeño)
   */
  private compressImage(file: File, maxWidth: number = 800, maxHeight: number = 800, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const img = new Image();
        
        img.onload = () => {
          // Calcular dimensiones manteniendo proporción
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height = height * (maxWidth / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = width * (maxHeight / height);
              height = maxHeight;
            }
          }
          
          // Crear canvas y comprimir
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            reject(new Error('No se pudo crear el contexto del canvas'));
            return;
          }
          
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convertir a base64 con compresión
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
        };
        
        img.onerror = () => reject(new Error('Error al cargar la imagen'));
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => reject(new Error('Error al leer el archivo'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * Elimina la foto de perfil actual
   * Envía un string vacío al backend para borrar la imagen
   */
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
      error: () => {
        console.error('Error al eliminar foto');
        this.errorMessage.set('Error al eliminar la foto de perfil');
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
      error: () => {
        console.error('Error al actualizar perfil');
        this.errorMessage.set('Error al actualizar el perfil');
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
      error: () => {
        console.error('Error al cambiar contraseña');
        this.errorMessage.set('Error al cambiar la contraseña');
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
