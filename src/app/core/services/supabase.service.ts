import { Injectable, inject } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { from, Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Estudiante, Curso, Matricula, CasoConvivencia, Involucrado,
  Seguimiento, ReunionApoderado, Apoderado, DashboardStats,
  Usuario, SupabaseApiResponse,
} from '../models/models';

@Injectable({ providedIn: 'root' })
export class SupabaseService {
  private supabase: SupabaseClient;
  private readonly isDemo: boolean;

  constructor() {
    this.isDemo = environment.supabaseUrl === 'https://tu-proyecto.supabase.co';
    this.supabase = createClient(environment.supabaseUrl, environment.supabaseKey);
  }

  get client(): SupabaseClient {
    return this.supabase;
  }

  private handleError(error: unknown): string {
    if (error instanceof Error) return error.message;
    return String(error);
  }

  // ─── RxJS Observable wrappers (for new feature components) ───

  getDashboardStats(): Observable<any> {
    if (this.isDemo) {
      return from(Promise.resolve({
        totalCasos: 24, abiertos: 8, enSeguimiento: 6, cerrados: 10,
        reunionesRealizadas: 12,
        casosPorCurso: [
          { curso: '8A', total: 6 }, { curso: '7B', total: 4 },
          { curso: '5A', total: 3 }, { curso: '3A', total: 2 },
          { curso: '1M', total: 5 }, { curso: '4M', total: 4 },
        ],
        alertas: [
          { tipo: 'warning', titulo: 'Curso 8A', mensaje: 'Presenta aumento de situaciones este mes' },
          { tipo: 'info', titulo: 'Seguimientos', mensaje: '6 casos en seguimiento activo' },
          { tipo: 'danger', titulo: 'Prioridad Alta', mensaje: '2 casos requieren atención urgente' },
        ],
      }));
    }
    return from(this.getStats().then(r => r.data));
  }

  getCasos(filters?: any): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      const demo = [
        { id: 1, id_estudiante: 1, tipo_caso: 'conflicto_entre_estudiantes', descripcion: 'Discusión en el patio entre dos estudiantes del mismo curso', prioridad: 'alta', estado: 'abierto', estudiante_nombre: 'Mateo González', fecha_registro: '2026-06-25' },
        { id: 2, id_estudiante: 2, tipo_caso: 'conducta', descripcion: 'Incumplimiento reiterado de normas de aula', prioridad: 'media', estado: 'en_seguimiento', estudiante_nombre: 'Valentina Muñoz', fecha_registro: '2026-06-23' },
        { id: 3, id_estudiante: 3, tipo_caso: 'convivencia', descripcion: 'Dificultades de integración en el grupo curso', prioridad: 'baja', estado: 'cerrado', estudiante_nombre: 'Benjamín Soto', fecha_registro: '2026-06-20' },
        { id: 4, id_estudiante: 4, tipo_caso: 'acoso', descripcion: 'Situación de hostigamiento en redes sociales', prioridad: 'urgente', estado: 'abierto', estudiante_nombre: 'Isidora Pavez', fecha_registro: '2026-06-18' },
        { id: 5, id_estudiante: 5, tipo_caso: 'otro', descripcion: 'Derivación por situación familiar compleja', prioridad: 'media', estado: 'en_seguimiento', estudiante_nombre: 'Cristóbal Díaz', fecha_registro: '2026-06-15' },
        { id: 6, id_estudiante: 6, tipo_caso: 'conflicto_entre_estudiantes', descripcion: 'Malentendido durante trabajo en grupo', prioridad: 'baja', estado: 'cerrado', estudiante_nombre: 'Emilia Torres', fecha_registro: '2026-06-12' },
      ];
      const filtered = demo.filter(c => {
        if (filters?.tipo && c.tipo_caso !== filters.tipo) return false;
        if (filters?.estado && c.estado !== filters.estado) return false;
        return true;
      });
      return from(Promise.resolve({ data: filtered, count: filtered.length }));
    }
    return from(
      (async () => {
        let query = this.supabase.from('casos_convivencia').select('*, estudiantes(nombre, rut)', { count: 'exact' });
        if (filters?.tipo) query = query.eq('tipo_caso', filters.tipo);
        if (filters?.estado) query = query.eq('estado', filters.estado);
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 10;
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await query.range(fromP, toP).order('fecha_registro', { ascending: false });
        // Transform nested estudiantes into flat estudiante_nombre for template compatibility
        const transformed = (data ?? []).map((c: any) => ({
          ...c,
          estudiante_nombre: c.estudiantes?.nombre ?? 'Sin estudiante',
          estudiante_rut: c.estudiantes?.rut ?? '',
        }));
        return { data: transformed, count: count ?? 0 };
      })()
    );
  }

  getCaso(id: number): Observable<any> {
    return from(
      (async () => {
        const { data } = await this.supabase.from('casos_convivencia').select('*, estudiantes(nombre, rut)').eq('id', id).single();
        if (!data) return null;
        return {
          ...data,
          estudiante_nombre: data.estudiantes?.nombre ?? 'Sin estudiante',
          estudiante_rut: data.estudiantes?.rut ?? '',
        };
      })()
    );
  }

  createCaso(caso: any): Observable<any> {
    return from(this.supabase.from('casos_convivencia').insert(caso).select().single().then(r => r.data));
  }

  updateCaso(id: number, caso: any): Observable<any> {
    return from(this.supabase.from('casos_convivencia').update(caso).eq('id', id).select().single().then(r => r.data));
  }

  addInvolucrado(inv: any): Observable<any> {
    return from(this.supabase.from('involucrados').insert(inv).select().single().then(r => r.data));
  }

  getSeguimientosByCaso(casoId: number): Observable<any[]> {
    return from(
      this.supabase.from('seguimientos').select('*, usuarios(nombre)').eq('id_caso', casoId).order('fecha', { ascending: false }).then(r =>
        (r.data ?? []).map((s: any) => ({
          ...s,
          responsable_nombre: s.usuarios?.nombre ?? '—',
        }))
      )
    );
  }

  createSeguimiento(seg: any): Observable<any> {
    return from(this.supabase.from('seguimientos').insert(seg).select().single().then(r => r.data));
  }

  getSeguimientos(filters?: any): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      const demo = [
        { id: 1, id_caso: 1, accion_realizada: 'Entrevista con ambos estudiantes por separado', observacion: 'Ambos reconocen el conflicto', responsable: 1, responsable_nombre: 'Carlos Mendoza', fecha: '2026-06-26' },
        { id: 2, id_caso: 1, accion_realizada: 'Reunión con apoderados', observacion: 'Se comprometen a apoyar el proceso', responsable: 1, responsable_nombre: 'Carlos Mendoza', fecha: '2026-06-27' },
        { id: 3, id_caso: 2, accion_realizada: 'Derivación a orientación', observacion: '', responsable: 1, responsable_nombre: 'Carlos Mendoza', fecha: '2026-06-24' },
      ];
      return from(Promise.resolve({ data: demo, count: demo.length }));
    }
    return from(
      (async () => {
        let query = this.supabase.from('seguimientos').select('*, usuarios(nombre)', { count: 'exact' });
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 10;
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await query.range(fromP, toP).order('fecha', { ascending: false });
        const transformed = (data ?? []).map((s: any) => ({
          ...s,
          responsable_nombre: s.usuarios?.nombre ?? '—',
        }));
        return { data: transformed, count: count ?? 0 };
      })()
    );
  }

  getEstudiantes(search?: string, page = 1, limit = 10): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      const demo = [
        { id: 1, nombre: 'Mateo González', rut: '12.345.678-9', estado: 'activo', curso_actual: '8A' },
        { id: 2, nombre: 'Valentina Muñoz', rut: '23.456.789-0', estado: 'activo', curso_actual: '7B' },
        { id: 3, nombre: 'Benjamín Soto', rut: '34.567.890-1', estado: 'activo', curso_actual: '5A' },
        { id: 4, nombre: 'Isidora Pavez', rut: '45.678.901-2', estado: 'activo', curso_actual: '8A' },
        { id: 5, nombre: 'Cristóbal Díaz', rut: '56.789.012-3', estado: 'activo', curso_actual: '3A' },
        { id: 6, nombre: 'Emilia Torres', rut: '67.890.123-4', estado: 'activo', curso_actual: '1M' },
        { id: 7, nombre: 'Santiago Castro', rut: '78.901.234-5', estado: 'activo', curso_actual: '4M' },
        { id: 8, nombre: 'Florencia Vega', rut: '89.012.345-6', estado: 'inactivo', curso_actual: '8A' },
      ];
      const filtered = search ? demo.filter(e => e.nombre.toLowerCase().includes(search.toLowerCase()) || (e.rut && e.rut.includes(search))) : demo;
      return from(Promise.resolve({ data: filtered, count: filtered.length }));
    }
    return from(
      (async () => {
        let query = this.supabase.from('estudiantes').select('*, matriculas(id, id_curso, anio_escolar, estado, cursos(id, nivel, letra, anio))', { count: 'exact' });
        if (search) query = query.or(`nombre.ilike.%${search}%,rut.ilike.%${search}%`);
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await query.range(fromP, toP).order('nombre');
        // Flatten: derive curso_actual from matriculas for template compatibility
        const transformed = (data ?? []).map((e: any) => {
          const matriculaActiva = (e.matriculas ?? []).find((m: any) => m.estado === 'activo') ?? e.matriculas?.[0];
          const curso = matriculaActiva?.cursos;
          return {
            ...e,
            curso_actual: curso ? `${curso.nivel} ${curso.letra}` : 'Sin curso',
            matricula_id: matriculaActiva?.id ?? null,
          };
        });
        return { data: transformed, count: count ?? 0 };
      })()
    );
  }

  getEstudiante(id: number): Observable<any> {
    return from(
      (async () => {
        const { data } = await this.supabase.from('estudiantes').select('*, matriculas(id, id_curso, anio_escolar, estado, cursos(id, nivel, letra, anio))').eq('id', id).single();
        if (!data) return null;
        const matriculaActiva = (data.matriculas ?? []).find((m: any) => m.estado === 'activo') ?? data.matriculas?.[0];
        const curso = matriculaActiva?.cursos;
        return {
          ...data,
          curso_actual: curso ? `${curso.nivel} ${curso.letra}` : 'Sin curso',
          matricula_id: matriculaActiva?.id ?? null,
        };
      })()
    );
  }

  createEstudianteRx(est: any): Observable<any> {
    return from(this.supabase.from('estudiantes').insert(est).select().single().then(r => r.data));
  }

  updateEstudianteRx(id: string | number, est: any): Observable<any> {
    return from(this.supabase.from('estudiantes').update(est).eq('id', id).select().single().then(r => r.data));
  }

  getEstudiantesByCurso(cursoId: number): Observable<any[]> {
    if (this.isDemo) {
      const estudiantes = [
        { id: 1, estudiantes: { id: 1, nombre: 'Mateo González', rut: '12.345.678-9', estado: 'activo' } },
        { id: 4, estudiantes: { id: 4, nombre: 'Isidora Pavez', rut: '45.678.901-2', estado: 'activo' } },
        { id: 8, estudiantes: { id: 8, nombre: 'Florencia Vega', rut: '89.012.345-6', estado: 'inactivo' } },
      ];
      return from(Promise.resolve(estudiantes));
    }
    return from(
      this.supabase.from('matriculas').select('*, estudiantes(*)').eq('id_curso', cursoId).then(r => r.data ?? [])
    );
  }

  getCursos(filters?: any): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      const demo = [
        { id: 1, nivel: '8 Básico', letra: 'A', anio: 2026, estado: 'activo' },
        { id: 2, nivel: '7 Básico', letra: 'B', anio: 2026, estado: 'activo' },
        { id: 3, nivel: '5 Básico', letra: 'A', anio: 2026, estado: 'activo' },
        { id: 4, nivel: '3 Básico', letra: 'A', anio: 2026, estado: 'activo' },
        { id: 5, nivel: '1 Medio', letra: 'M', anio: 2026, estado: 'activo' },
        { id: 6, nivel: '4 Medio', letra: 'M', anio: 2026, estado: 'activo' },
      ];
      const filtered = filters?.nivel ? demo.filter(c => c.nivel === filters.nivel) : demo;
      return from(Promise.resolve({ data: filtered, count: filtered.length }));
    }
    return from(
      (async () => {
        let query = this.supabase.from('cursos').select('*', { count: 'exact' });
        if (filters?.nivel) query = query.eq('nivel', filters.nivel);
        if (filters?.anio) query = query.eq('anio', filters.anio);
        const page = filters?.page ?? 1;
        const limit = filters?.limit ?? 10;
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await query.range(fromP, toP).order('nivel');
        return { data: data ?? [], count: count ?? 0 };
      })()
    );
  }

  getCurso(id: number): Observable<any> {
    return from(this.supabase.from('cursos').select('*').eq('id', id).single().then(r => r.data));
  }

  createCursoRx(curso: any): Observable<any> {
    return from(this.supabase.from('cursos').insert(curso).select().single().then(r => r.data));
  }

  updateCursoRx(id: number, curso: any): Observable<any> {
    return from(this.supabase.from('cursos').update(curso).eq('id', id).select().single().then(r => r.data));
  }

  getReuniones(page = 1, limit = 10): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      const demo = [
        { id: 1, id_caso: 1, apoderado_nombre: 'Sra. González', fecha: '2026-06-27', motivo: 'Seguimiento de caso de conflicto entre estudiantes', acuerdos: 'Los apoderados se comprometen a reforzar valores de respeto en casa', observaciones: 'Buena disposición de ambas partes', responsable: 1 },
        { id: 2, id_caso: 2, apoderado_nombre: 'Sr. Muñoz', fecha: '2026-06-24', motivo: 'Reunión por situación de conducta reiterada', acuerdos: 'Se establece plan de acompañamiento semanal', observaciones: '', responsable: 1 },
        { id: 3, id_caso: 3, apoderado_nombre: 'Sra. Soto', fecha: '2026-06-20', motivo: 'Cierre de caso y evaluación del proceso', acuerdos: 'Se da por cerrado el caso, se mantendrá observación preventiva', observaciones: 'El estudiante ha mostrado mejoría significativa', responsable: 1 },
      ];
      return from(Promise.resolve({ data: demo, count: demo.length }));
    }
    return from(
      (async () => {
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await this.supabase.from('reuniones_apoderados').select('*, casos_convivencia(id_estudiante, estudiantes(nombre))', { count: 'exact' }).range(fromP, toP).order('fecha', { ascending: false });
        const transformed = (data ?? []).map((r: any) => ({
          ...r,
          caso_id: r.id_caso,
          estudiante_nombre: r.casos_convivencia?.estudiantes?.nombre ?? '',
          apoderado: r.apoderado_texto ?? r.motivo?.substring(0, 30) ?? '—',
        }));
        return { data: transformed, count: count ?? 0 };
      })()
    );
  }

  createReunionRx(rep: any): Observable<any> {
    return from(this.supabase.from('reuniones_apoderados').insert(rep).select().single().then(r => r.data));
  }

  updateReunionRx(id: number, rep: any): Observable<any> {
    return from(this.supabase.from('reuniones_apoderados').update(rep).eq('id', id).select().single().then(r => r.data));
  }

  getReunion(id: number): Observable<any> {
    return from(this.supabase.from('reuniones_apoderados').select('*').eq('id', id).single().then(r => r.data));
  }

  getReunionesByCaso(casoId: number): Observable<any[]> {
    return from(
      this.supabase.from('reuniones_apoderados')
        .select('*')
        .eq('id_caso', casoId)
        .order('fecha', { ascending: false })
        .then(r => r.data ?? [])
    );
  }

  getCasosPorCurso(): Observable<any[]> {
    return from(
      (async () => {
        const { data: casos } = await this.supabase.from('casos_convivencia').select('id_estudiante');
        const { data: matriculas } = await this.supabase.from('matriculas').select('id_estudiante, id_curso');
        const { data: cursosData } = await this.supabase.from('cursos').select('id, nivel, letra');
        if (!casos || !matriculas || !cursosData) return [];
        
        // Map estudiante -> curso name
        const estToCurso: Record<number, string> = {};
        for (const m of matriculas) {
          const curso = cursosData.find((c: any) => c.id === m.id_curso);
          if (curso) estToCurso[m.id_estudiante] = `${curso.nivel} ${curso.letra}`;
        }
        // Count cases per curso
        const cursoCount: Record<string, number> = {};
        for (const c of casos) {
          const nombre = estToCurso[c.id_estudiante] ?? 'Sin curso';
          cursoCount[nombre] = (cursoCount[nombre] || 0) + 1;
        }
        return Object.entries(cursoCount).map(([curso, total]) => ({ curso, total }));
      })()
    );
  }

  getTendenciasMensuales(): Observable<any[]> {
    return from(
      (async () => {
        const { data: casos } = await this.supabase.from('casos_convivencia')
          .select('fecha_registro')
          .order('fecha_registro', { ascending: true });
        if (!casos) return [];
        // Group by month
        const monthCount: Record<string, number> = {};
        for (const c of casos) {
          const d = new Date(c.fecha_registro);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          monthCount[key] = (monthCount[key] || 0) + 1;
        }
        return Object.entries(monthCount).map(([mes, total]) => ({ mes, total }));
      })()
    );
  }

  getAlertas(): Observable<any[]> {
    return from(
      (async () => {
        const alertas: any[] = [];
        // Count urgent cases
        const { count: urgentes } = await this.supabase.from('casos_convivencia')
          .select('*', { count: 'exact', head: true })
          .eq('prioridad', 'urgente')
          .eq('estado', 'abierto');
        if (urgentes && urgentes > 0) {
          alertas.push({ tipo: 'danger', titulo: 'Casos Urgentes', mensaje: `${urgentes} casos urgentes abiertos requieren atención inmediata` });
        }
        // Count open cases
        const { count: abiertos } = await this.supabase.from('casos_convivencia')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'abierto');
        if (abiertos && abiertos > 5) {
          alertas.push({ tipo: 'warning', titulo: 'Casos Abiertos', mensaje: `${abiertos} casos abiertos pendientes de revisión` });
        }
        // Count seguimiento
        const { count: seguimiento } = await this.supabase.from('casos_convivencia')
          .select('*', { count: 'exact', head: true })
          .eq('estado', 'en_seguimiento');
        if (seguimiento) {
          alertas.push({ tipo: 'info', titulo: 'En Seguimiento', mensaje: `${seguimiento} casos en seguimiento activo` });
        }
        return alertas;
      })()
    );
  }

  getUsuarios(page = 1, limit = 20): Observable<{ data: any[]; count: number }> {
    if (this.isDemo) {
      return from(Promise.resolve({
        data: [
          { id: 1, nombre: 'Carlos Mendoza', correo: 'carlos@colegio.cl', rol: 'encargado_convivencia', estado: 'activo' },
          { id: 2, nombre: 'María Paz Silva', correo: 'maria@colegio.cl', rol: 'admin', estado: 'activo' },
        ],
        count: 2,
      }));
    }
    return from(
      (async () => {
        const fromP = (page - 1) * limit;
        const toP = fromP + limit - 1;
        const { data, count } = await this.supabase.from('usuarios').select('*', { count: 'exact' }).range(fromP, toP).order('nombre');
        return { data: data ?? [], count: count ?? 0 };
      })()
    );
  }

  createUsuarioRx(usr: any): Observable<any> {
    return from(this.supabase.from('usuarios').insert(usr).select().single().then(r => r.data));
  }

  updateUsuarioRx(id: string | number, usr: any): Observable<any> {
    return from(this.supabase.from('usuarios').update(usr).eq('id', id).select().single().then(r => r.data));
  }

  deleteUsuarioRx(id: string | number): Observable<any> {
    return from(this.supabase.from('usuarios').delete().eq('id', id).then(() => undefined));
  }

  updatePassword(newPassword: string): Observable<any> {
    return from(this.supabase.auth.updateUser({ password: newPassword }).then(r => r.data));
  }

  // ─── Legacy async methods (for pre-existing code) ───

  async signIn(email: string, password: string) {
    try {
      // Intentar login normal
      const { data, error } = await this.supabase.auth.signInWithPassword({ email, password });
      if (!error && data.user) return { user: data.user, error: null };

      // Si falla porque el usuario no existe, crearlo automaticamente
      if (error && error.message.includes('Invalid login')) {
        const { data: signUpData, error: signUpError } = await this.supabase.auth.signUp({ email, password });
        if (signUpError) return { user: null, error: signUpError.message };

        // Ahora si login con la cuenta recien creada
        const { data: loginData, error: loginError } = await this.supabase.auth.signInWithPassword({ email, password });
        if (loginError) return { user: null, error: loginError.message };
        return { user: loginData.user, error: null };
      }

      return { user: null, error: error?.message || 'Error de autenticacion' };
    } catch (err) {
      return { user: null, error: this.handleError(err) };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.auth.signOut();
      if (error) return { error: error.message };
      return { error: null };
    } catch (err) {
      return { error: this.handleError(err) };
    }
  }

  async getCurrentUser() {
    try {
      const { data, error } = await this.supabase.auth.getUser();
      if (error) return { user: null, error: error.message };
      return { user: data.user, error: null };
    } catch (err) {
      return { user: null, error: this.handleError(err) };
    }
  }

  async getSession() {
    try {
      const { data, error } = await this.supabase.auth.getSession();
      if (error) return { session: null, error: error.message };
      return { session: data.session, error: null };
    } catch (err) {
      return { session: null, error: this.handleError(err) };
    }
  }

  async getUsuarioByAuthId(authId: string): Promise<SupabaseApiResponse<Usuario>> {
    try {
      const { data, error } = await this.supabase.from('usuarios').select('*').eq('auth_uid', authId).single();
      if (error) return { data: null, error: error.message };
      return { data: data as Usuario, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Estudiantes (legacy)
  async getEstudiantesLegacy(idColegio: string): Promise<SupabaseApiResponse<Estudiante[]>> {
    try {
      const { data, error } = await this.supabase.from('estudiantes').select('*').eq('id_colegio', idColegio).order('apellidos', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as Estudiante[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async getEstudianteById(id: string): Promise<SupabaseApiResponse<Estudiante>> {
    try {
      const { data, error } = await this.supabase.from('estudiantes').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      return { data: data as Estudiante, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createEstudianteLegacy(estudiante: Omit<Estudiante, 'id' | 'created_at'>): Promise<SupabaseApiResponse<Estudiante>> {
    try {
      const { data, error } = await this.supabase.from('estudiantes').insert(estudiante).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Estudiante, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async updateEstudianteLegacy(id: string, data: Partial<Estudiante>): Promise<SupabaseApiResponse<Estudiante>> {
    try {
      const { data: result, error } = await this.supabase.from('estudiantes').update(data).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: result as Estudiante, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteEstudianteLegacy(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('estudiantes').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Cursos (legacy)
  async getCursosLegacy(idColegio: string): Promise<SupabaseApiResponse<Curso[]>> {
    try {
      const { data, error } = await this.supabase.from('cursos').select('*').eq('id_colegio', idColegio).order('nombre', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as Curso[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async getCursoById(id: string): Promise<SupabaseApiResponse<Curso>> {
    try {
      const { data, error } = await this.supabase.from('cursos').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      return { data: data as Curso, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createCursoLegacy(curso: Omit<Curso, 'id' | 'created_at'>): Promise<SupabaseApiResponse<Curso>> {
    try {
      const { data, error } = await this.supabase.from('cursos').insert(curso).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Curso, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async updateCursoLegacy(id: string, data: Partial<Curso>): Promise<SupabaseApiResponse<Curso>> {
    try {
      const { data: result, error } = await this.supabase.from('cursos').update(data).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: result as Curso, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteCurso(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('cursos').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Matriculas (legacy)
  async getMatriculasByEstudiante(idEstudiante: string): Promise<SupabaseApiResponse<Matricula[]>> {
    try {
      const { data, error } = await this.supabase.from('matriculas').select('*, cursos(*)').eq('id_estudiante', idEstudiante);
      if (error) return { data: null, error: error.message };
      return { data: data as Matricula[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async getMatriculasByCurso(idCurso: string): Promise<SupabaseApiResponse<Matricula[]>> {
    try {
      const { data, error } = await this.supabase.from('matriculas').select('*, estudiantes(*)').eq('id_curso', idCurso);
      if (error) return { data: null, error: error.message };
      return { data: data as Matricula[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createMatricula(matricula: Omit<Matricula, 'id' | 'created_at'>): Promise<SupabaseApiResponse<Matricula>> {
    try {
      const { data, error } = await this.supabase.from('matriculas').insert(matricula).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Matricula, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteMatricula(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('matriculas').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Casos (legacy)
  async getCasosLegacy(idColegio: string): Promise<SupabaseApiResponse<CasoConvivencia[]>> {
    try {
      const { data, error } = await this.supabase.from('casos_convivencia').select('*').eq('id_colegio', idColegio).order('fecha_registro', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: data as CasoConvivencia[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async getCasoById(id: string): Promise<SupabaseApiResponse<CasoConvivencia>> {
    try {
      const { data, error } = await this.supabase.from('casos_convivencia').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      return { data: data as CasoConvivencia, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createCasoLegacy(caso: Omit<CasoConvivencia, 'id' | 'created_at'>): Promise<SupabaseApiResponse<CasoConvivencia>> {
    try {
      const { data, error } = await this.supabase.from('casos_convivencia').insert(caso).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as CasoConvivencia, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async updateCasoLegacy(id: string, data: Partial<CasoConvivencia>): Promise<SupabaseApiResponse<CasoConvivencia>> {
    try {
      const { data: result, error } = await this.supabase.from('casos_convivencia').update(data).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: result as CasoConvivencia, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteCaso(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('casos_convivencia').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Involucrados (legacy)
  async getInvolucradosByCaso(idCaso: string): Promise<SupabaseApiResponse<Involucrado[]>> {
    try {
      const { data, error } = await this.supabase.from('involucrados').select('*').eq('id_caso', idCaso);
      if (error) return { data: null, error: error.message };
      return { data: data as Involucrado[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createInvolucradoLegacy(involucrado: any): Promise<SupabaseApiResponse<Involucrado>> {
    try {
      const { data, error } = await this.supabase.from('involucrados').insert(involucrado).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Involucrado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteInvolucrado(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('involucrados').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Seguimientos (legacy)
  async getSeguimientosByCasoLegacy(idCaso: string): Promise<SupabaseApiResponse<Seguimiento[]>> {
    try {
      const { data, error } = await this.supabase.from('seguimientos').select('*').eq('id_caso', idCaso).order('fecha', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: data as Seguimiento[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createSeguimientoLegacy(seguimiento: Omit<Seguimiento, 'id' | 'created_at'>): Promise<SupabaseApiResponse<Seguimiento>> {
    try {
      const { data, error } = await this.supabase.from('seguimientos').insert(seguimiento).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Seguimiento, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Reuniones (legacy)
  async getReunionesLegacy(idColegio: string): Promise<SupabaseApiResponse<ReunionApoderado[]>> {
    try {
      const { data, error } = await this.supabase.from('reuniones_apoderados').select('*').order('fecha', { ascending: false });
      if (error) return { data: null, error: error.message };
      return { data: data as ReunionApoderado[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async getReunionById(id: string): Promise<SupabaseApiResponse<ReunionApoderado>> {
    try {
      const { data, error } = await this.supabase.from('reuniones_apoderados').select('*').eq('id', id).single();
      if (error) return { data: null, error: error.message };
      return { data: data as ReunionApoderado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createReunionLegacy(reunion: Omit<ReunionApoderado, 'id' | 'created_at'>): Promise<SupabaseApiResponse<ReunionApoderado>> {
    try {
      const { data, error } = await this.supabase.from('reuniones_apoderados').insert(reunion).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as ReunionApoderado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async updateReunionLegacy(id: string, data: Partial<ReunionApoderado>): Promise<SupabaseApiResponse<ReunionApoderado>> {
    try {
      const { data: result, error } = await this.supabase.from('reuniones_apoderados').update(data).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: result as ReunionApoderado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async deleteReunion(id: string): Promise<SupabaseApiResponse<null>> {
    try {
      const { error } = await this.supabase.from('reuniones_apoderados').delete().eq('id', id);
      if (error) return { data: null, error: error.message };
      return { data: null, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Apoderados (legacy)
  async getApoderados(idColegio: string): Promise<SupabaseApiResponse<Apoderado[]>> {
    try {
      const { data, error } = await this.supabase.from('apoderados').select('*').eq('id_colegio', idColegio).order('nombre', { ascending: true });
      if (error) return { data: null, error: error.message };
      return { data: data as Apoderado[], error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async createApoderado(apoderado: Omit<Apoderado, 'id' | 'created_at'>): Promise<SupabaseApiResponse<Apoderado>> {
    try {
      const { data, error } = await this.supabase.from('apoderados').insert(apoderado).select().single();
      if (error) return { data: null, error: error.message };
      return { data: data as Apoderado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  async updateApoderado(id: string, data: Partial<Apoderado>): Promise<SupabaseApiResponse<Apoderado>> {
    try {
      const { data: result, error } = await this.supabase.from('apoderados').update(data).eq('id', id).select().single();
      if (error) return { data: null, error: error.message };
      return { data: result as Apoderado, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Dashboard (legacy)
  async getStats(idColegio?: string): Promise<SupabaseApiResponse<DashboardStats>> {
    try {
      let baseQuery = this.supabase.from('casos_convivencia').select('*', { count: 'exact', head: true });
      if (idColegio) baseQuery = baseQuery.eq('id_colegio', idColegio);
      const { count: totalCasos } = await baseQuery;

      let abiertosQuery = this.supabase.from('casos_convivencia').select('*', { count: 'exact', head: true }).eq('estado', 'abierto');
      if (idColegio) abiertosQuery = abiertosQuery.eq('id_colegio', idColegio);
      const { count: abiertos } = await abiertosQuery;

      let enSegQuery = this.supabase.from('casos_convivencia').select('*', { count: 'exact', head: true }).eq('estado', 'en_seguimiento');
      if (idColegio) enSegQuery = enSegQuery.eq('id_colegio', idColegio);
      const { count: enSeguimiento } = await enSegQuery;

      let cerradosQuery = this.supabase.from('casos_convivencia').select('*', { count: 'exact', head: true }).eq('estado', 'cerrado');
      if (idColegio) cerradosQuery = cerradosQuery.eq('id_colegio', idColegio);
      const { count: cerrados } = await cerradosQuery;

      // Count reuniones
      let reunionesQuery = this.supabase.from('reuniones_apoderados').select('*', { count: 'exact', head: true });
      if (idColegio) reunionesQuery = reunionesQuery.eq('id_colegio', idColegio);
      const { count: reunionesRealizadas } = await reunionesQuery;

      const alertas: string[] = [];
      if (abiertos && abiertos > 5) alertas.push(`Hay ${abiertos} casos abiertos que requieren atención.`);
      return {
        data: {
          totalCasos: totalCasos ?? 0, abiertos: abiertos ?? 0,
          enSeguimiento: enSeguimiento ?? 0, cerrados: cerrados ?? 0,
          reunionesRealizadas: reunionesRealizadas ?? 0, casosPorCurso: [], alertas,
        }, error: null,
      };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  // Storage (legacy)
  async uploadActa(file: File, path: string) {
    try {
      const { data, error } = await this.supabase.storage.from('actas').upload(path, file);
      if (error) return { data: null, error: error.message };
      return { data, error: null };
    } catch (err) {
      return { data: null, error: this.handleError(err) };
    }
  }

  getActaUrl(path: string): string {
    const { data } = this.supabase.storage.from('actas').getPublicUrl(path);
    return data.publicUrl;
  }
}
