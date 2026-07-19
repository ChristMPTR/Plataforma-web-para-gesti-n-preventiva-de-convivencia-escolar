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

  private rolMap: Record<number, string> = { 1: 'admin', 2: 'encargado_convivencia', 3: 'estudiante' };

  private sessionReady: Promise<void>;

  constructor() {
    this.sessionReady = this.restoreSession();
  }

  /** Called by APP_INITIALIZER to block routing until session is resolved */
  waitForSession(): Promise<void> {
    return this.sessionReady;
  }

  private mapRol(usuario: any): Usuario {
    return {
      ...usuario,
      rol: usuario.rol || this.rolMap[usuario.rol_id] || 'encargado_convivencia',
    };
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
      const mapped = this.mapRol(usuario);
      this.currentUserSubject.next(mapped);
      this.currentUserSignal.set(mapped);
      this.isAuthenticatedSignal.set(true);
    } else {
      // Fallback: crear usuario temporal si existe sesión pero no hay registro en BD
      const email = session.user.email || '';
      const isAdmin = email.toLowerCase().includes('admin');
      const fallbackUser: Usuario = {
        id: 1,
        nombre: isAdmin ? 'Administrador Nexora' : 'Encargado de Convivencia',
        correo: email,
        id_colegio: 1, estado: 'activo', created_at: new Date().toISOString(),
        rol: isAdmin ? 'admin' : 'encargado_convivencia',
      };
      this.currentUserSubject.next(fallbackUser);
      this.currentUserSignal.set(fallbackUser);
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

    // Si no existe en la tabla usuarios, crear usuario temporal basado en el email
    if (!usuario) {
      const isAdmin = email.toLowerCase().includes('admin');
      const fallbackUser: Usuario = {
        id: 1,
        nombre: isAdmin ? 'Administrador Nexora' : 'Encargado de Convivencia',
        correo: email,
        id_colegio: 1, estado: 'activo', created_at: new Date().toISOString(),
        rol: isAdmin ? 'admin' : 'encargado_convivencia',
      };
      this.currentUserSubject.next(fallbackUser);
      this.currentUserSignal.set(fallbackUser);
      this.isAuthenticatedSignal.set(true);
      return { user: fallbackUser, error: null };
    }

    if (usuario.estado !== 'activo') {
      await this.supabase.signOut();
      return { user: null, error: 'Tu cuenta está desactivada. Contacta al administrador.' };
    }

    const mapped = this.mapRol(usuario);
    this.currentUserSubject.next(mapped);
    this.currentUserSignal.set(mapped);
    this.isAuthenticatedSignal.set(true);

    return { user: mapped, error: null };
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
