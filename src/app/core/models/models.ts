export type RolUsuario = 'admin' | 'encargado_convivencia' | 'estudiante';
export type TipoCaso = 'conflicto_entre_estudiantes' | 'conducta' | 'convivencia' | 'acoso' | 'otro';
export type EstadoCaso = 'abierto' | 'en_seguimiento' | 'cerrado';
export type PrioridadCaso = 'baja' | 'media' | 'alta' | 'urgente';
export type InvolucradoTipo = 'afectado' | 'involucrado' | 'funcionario' | 'apoderado';

export interface Colegio {
  id: number;
  nombre: string;
  direccion?: string;
  estado: string;
  created_at: string;
}

export interface Usuario {
  id: number;
  auth_uid?: string;
  nombre: string;
  correo: string;
  rol_id?: number;
  id_colegio: number;
  estado: string;
  created_at: string;
  rol?: string;
}

export interface Curso {
  id: number;
  nivel: string;
  letra: string;
  anio: number;
  id_colegio: number;
  estado: string;
  created_at: string;
  estudiante_count?: number;
}

export interface Estudiante {
  id: number;
  nombre: string;
  rut?: string;
  fecha_nacimiento?: string;
  estado: string;
  id_colegio: number;
  created_at: string;
  curso_actual?: string;
}

export interface Matricula {
  id: number;
  id_estudiante: number;
  id_curso: number;
  anio_escolar: number;
  estado: string;
  created_at: string;
  cursos?: Curso;
  estudiantes?: Estudiante;
}

export interface Apoderado {
  id: number;
  nombre: string;
  email?: string;
  telefono?: string;
  id_colegio: number;
  created_at: string;
}

export interface EstudianteApoderado {
  id: number;
  id_estudiante: number;
  id_apoderado: number;
  parentesco: string;
  created_at: string;
}

export interface CasoConvivencia {
  id: number;
  id_estudiante: number;
  tipo_caso: TipoCaso;
  descripcion: string;
  fecha_registro: string;
  prioridad: PrioridadCaso;
  estado: EstadoCaso;
  id_colegio: number;
  creado_por?: number;
  created_at: string;
  estudiante_nombre?: string;
  estudiante_rut?: string;
  curso_nombre?: string;
}

export interface Involucrado {
  id: number;
  id_caso: number;
  tipo: InvolucradoTipo;
  id_estudiante?: number;
  id_apoderado?: number;
  nombre_externo?: string;
  created_at: string;
}

export interface Seguimiento {
  id: number;
  id_caso: number;
  fecha: string;
  accion_realizada: string;
  observacion?: string;
  responsable?: number;
  created_at: string;
  responsable_nombre?: string;
}

export interface ReunionApoderado {
  id: number;
  id_caso?: number;
  id_apoderado?: number;
  fecha: string;
  motivo: string;
  acuerdos?: string;
  observaciones?: string;
  responsable?: number;
  acta_url?: string;
  id_colegio: number;
  created_at: string;
  apoderado_nombre?: string;
}

export interface SolicitudApoyo {
  id: number;
  id_estudiante: number;
  descripcion: string;
  fecha_solicitud: string;
  estado: string;
  respuesta?: string;
  id_colegio: number;
  created_at: string;
}

export interface RecursoApoyo {
  id: number;
  titulo: string;
  descripcion?: string;
  tipo: string;
  url?: string;
  id_colegio: number;
  created_at: string;
}

export interface DashboardStats {
  totalCasos: number;
  abiertos: number;
  enSeguimiento: number;
  cerrados: number;
  reunionesRealizadas: number;
  casosPorCurso: { curso: string; total: number }[];
  alertas: string[];
}

export interface AuthResponse {
  user: Usuario | null;
  error: string | null;
}

export interface SupabaseApiResponse<T> {
  data: T | null;
  error: string | null;
}
