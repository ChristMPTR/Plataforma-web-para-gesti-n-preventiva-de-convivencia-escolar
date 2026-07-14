import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../core/services/supabase.service';
import { AuthService } from '../../core/services/auth.service';
import { Usuario } from '../../core/models/models';

@Component({
  selector: 'app-configuracion',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './configuracion.component.html',
  styleUrl: './configuracion.component.scss',
})
export class ConfiguracionComponent implements OnInit {
  private supabase = inject(SupabaseService);
  private auth = inject(AuthService);
  private fb = inject(FormBuilder);

  activeTab: 'perfil' | 'colegio' | 'usuarios' | 'preferencias' = 'perfil';

  currentUser: Usuario | null = null;
  isAdmin = false;

  // Profile form
  profileForm: FormGroup;
  profileSaving = false;
  profileSuccess = '';
  profileError = '';

  // Password form
  passwordForm: FormGroup;
  passwordSaving = false;
  passwordSuccess = '';
  passwordError = '';

  // Users
  usuarios: Usuario[] = [];
  usuariosLoading = true;
  showUserModal = false;
  isEditUser = false;
  selectedUser?: Usuario;
  userSaving = false;
  userSuccess = '';
  userError = '';
  userForm: FormGroup;

  roles = ['admin', 'encargado_convivencia', 'estudiante'];

  constructor() {
    this.profileForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: [{ value: '', disabled: true }],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
    });

    this.userForm = this.fb.group({
      nombre: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      rol: ['encargado_convivencia', Validators.required],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  ngOnInit(): void {
    this.auth.getCurrentUser().subscribe((user) => {
      this.currentUser = user;
      if (user) {
        this.profileForm.patchValue({
          nombre: user.nombre,
          correo: user.correo,
        });
      }
    });
    this.isAdmin = this.auth.isAdmin();

    this.loadUsuarios();
  }

  setTab(tab: 'perfil' | 'colegio' | 'usuarios' | 'preferencias'): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  private clearMessages(): void {
    this.profileSuccess = '';
    this.profileError = '';
    this.passwordSuccess = '';
    this.passwordError = '';
    this.userSuccess = '';
    this.userError = '';
  }

  // ─── PROFILE ───

  updateProfile(): void {
    if (this.profileForm.invalid) return;
    this.profileSaving = true;
    this.profileSuccess = '';
    this.profileError = '';

    this.supabase.updateUsuarioRx(this.currentUser!.id, { nombre: this.profileForm.value.nombre }).subscribe({
      next: () => {
        this.profileSaving = false;
        this.profileSuccess = 'Perfil actualizado exitosamente';
      },
      error: (err: any) => {
        this.profileSaving = false;
        this.profileError = err.message || 'Error al actualizar perfil';
      },
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.passwordError = 'Las contraseñas no coinciden';
      return;
    }

    this.passwordSaving = true;
    this.passwordSuccess = '';
    this.passwordError = '';

    this.supabase.updatePassword(newPassword).subscribe({
      next: () => {
        this.passwordSaving = false;
        this.passwordSuccess = 'Contraseña actualizada exitosamente';
        this.passwordForm.reset();
      },
      error: (err: any) => {
        this.passwordSaving = false;
        this.passwordError = err.message || 'Error al cambiar contraseña';
      },
    });
  }

  // ─── USERS ───

  loadUsuarios(): void {
    this.usuariosLoading = true;
    this.supabase.getUsuarios(1, 100).subscribe((res) => {
      this.usuarios = res.data;
      this.usuariosLoading = false;
    });
  }

  openCreateUser(): void {
    this.isEditUser = false;
    this.selectedUser = undefined;
    this.userForm.reset({ rol: 'docente' });
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
    this.userSuccess = '';
    this.userError = '';
  }

  openEditUser(user: Usuario): void {
    this.isEditUser = true;
    this.selectedUser = user;
    this.userForm.patchValue({
      nombre: user.nombre,
      correo: user.correo,
      rol: user.rol ?? '',
    });
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();
    this.showUserModal = true;
    this.userSuccess = '';
    this.userError = '';
  }

  closeUserModal(): void {
    this.showUserModal = false;
  }

  saveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    this.userSaving = true;
    this.userSuccess = '';
    this.userError = '';
    const data = this.userForm.value;

    if (this.isEditUser && this.selectedUser?.id) {
      const updateData: any = { nombre: data.nombre, correo: data.correo, rol: data.rol };
      this.supabase.updateUsuarioRx(this.selectedUser.id, updateData).subscribe({
        next: () => {
          this.userSaving = false;
          this.userSuccess = 'Usuario actualizado exitosamente';
          this.loadUsuarios();
          setTimeout(() => this.closeUserModal(), 1200);
        },
        error: (err: any) => {
          this.userSaving = false;
          this.userError = err.message || 'Error al actualizar';
        },
      });
    } else {
      this.supabase.createUsuarioRx({ correo: data.correo, nombre: data.nombre, rol: data.rol, password: data.password }).subscribe({
        next: () => {
          this.userSaving = false;
          this.userSuccess = 'Usuario creado exitosamente';
          this.loadUsuarios();
          setTimeout(() => this.closeUserModal(), 1200);
        },
        error: (err: any) => {
          this.userSaving = false;
          this.userError = err.message || 'Error al crear usuario';
        },
      });
    }
  }

  deleteUser(user: Usuario): void {
    if (!confirm(`¿Eliminar al usuario ${user.nombre}?`)) return;
    this.supabase.deleteUsuarioRx(user.id!).subscribe(() => {
      this.loadUsuarios();
    });
  }

  getRolClass(rol: string | undefined): string {
    const map: Record<string, string> = { admin: 'badge-dark', encargado_convivencia: 'badge-primary', estudiante: 'badge-success' };
    return map[rol ?? ''] ?? '';
  }
}
