import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { SupabaseService } from './supabase.service';
import { Usuario } from '../models/models';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private supabase = inject(SupabaseService);
  private router = inject(Router);

  private currentUserSubject = new BehaviorSubject<Usuario | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private currentUserSignal = signal<Usuario | null>(null);
  readonly user = this.currentUserSignal.asReadonly();

  private isAuthenticatedSignal = signal(false);
  readonly isAuth = this.isAuthenticatedSignal.asReadonly();

  constructor() {
    this.restoreSession();
  }

  private async restoreSession(): Promise<void> {
    const { session, error } = await this.supabase.getSession();
    if (error || !session?.user) {
      this.currentUserSubject.next(null);
      this.currentUserSignal.set(null);
      this.isAuthenticatedSignal.set(false);
      return;
    }

    const { data: usuario } = await this.supabase.getUsuarioByAuthId(session.user.id);
    if (usuario) {
      this.currentUserSubject.next(usuario);
      this.currentUserSignal.set(usuario);
      this.isAuthenticatedSignal.set(true);
    }
  }

  async login(email: string, password: string): Promise<{ user: Usuario | null; error: string | null }> {
    // Demo mode: allow login without Supabase
    if (environment.supabaseUrl === 'https://tu-proyecto.supabase.co') {
      const isAdmin = email.toLowerCase().includes('admin');
      const demoUser: Usuario = {
        id: isAdmin ? 1 : 2,
        nombre: isAdmin ? 'Administrador Nexora' : 'Encargado de Convivencia',
        correo: email,
        id_colegio: 1, estado: 'activo', created_at: new Date().toISOString(),
        rol: isAdmin ? 'admin' : 'encargado_convivencia',
      };
      this.currentUserSubject.next(demoUser);
      this.currentUserSignal.set(demoUser);
      this.isAuthenticatedSignal.set(true);
      return { user: demoUser, error: null };
    }

    const authResult = await this.supabase.signIn(email, password);
    if (authResult.error || !authResult.user) {
      return { user: null, error: authResult.error };
    }

    const { data: usuario, error: userError } = await this.supabase.getUsuarioByAuthId(authResult.user.id);
    if (userError || !usuario) {
      await this.supabase.signOut();
      return { user: null, error: userError || 'Usuario no encontrado en la base de datos' };
    }

    if (usuario.estado !== 'activo') {
      await this.supabase.signOut();
      return { user: null, error: 'Tu cuenta está desactivada. Contacta al administrador.' };
    }

    this.currentUserSubject.next(usuario);
    this.currentUserSignal.set(usuario);
    this.isAuthenticatedSignal.set(true);

    return { user: usuario, error: null };
  }

  async logout(): Promise<void> {
    try { await this.supabase.signOut(); } catch {}
    this.currentUserSubject.next(null);
    this.currentUserSignal.set(null);
    this.isAuthenticatedSignal.set(false);
    this.router.navigate(['/login']);
  }

  isLoggedIn(): Observable<boolean> {
    return this.currentUser$.pipe(
      map(user => user !== null)
    );
  }

  getCurrentUser(): Observable<Usuario | null> {
    return this.currentUser$;
  }

  getCurrentUserSync(): Usuario | null {
    return this.currentUserSignal();
  }

  isAdmin(): boolean {
    return this.currentUserSignal()?.rol === 'admin';
  }

  hasRole(role: string | string[]): boolean {
    const user = this.currentUserSignal();
    if (!user || !user.rol) return false;
    if (Array.isArray(role)) return role.includes(user.rol);
    return user.rol === role;
  }

  hasPermission(permission: string): boolean {
    const user = this.currentUserSignal();
    if (!user || !user.rol) return false;

    const permissionsMap: Record<string, string[]> = {
      admin: ['*'],
      encargado_convivencia: ['casos:full', 'seguimientos:full', 'reuniones:full',
        'estudiantes:read', 'dashboard:full', 'reportes:full'],
      estudiante: ['solicitudes:own', 'recursos:read']
    };

    const userPermissions = permissionsMap[user.rol] ?? [];
    return userPermissions.includes('*') || userPermissions.includes(permission);
  }
}
