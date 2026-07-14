-- NEXORA - Esquema de Base de Datos
-- Plataforma de Gestión de Convivencia Escolar

-- =============================================
-- COLEGIOS
-- =============================================
CREATE TABLE colegios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  direccion VARCHAR(500),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE colegios ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ROLES
-- =============================================
CREATE TABLE roles (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(50) NOT NULL UNIQUE,
  permisos JSONB DEFAULT '[]'
);

ALTER TABLE roles ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USUARIOS (vinculado con auth.users de Supabase)
-- =============================================
CREATE TABLE usuarios (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  auth_uid UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) NOT NULL UNIQUE,
  rol_id BIGINT REFERENCES roles(id),
  id_colegio BIGINT REFERENCES colegios(id),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE usuarios ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CURSOS
-- =============================================
CREATE TABLE cursos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nivel VARCHAR(50) NOT NULL,
  letra VARCHAR(5) NOT NULL,
  anio INTEGER NOT NULL,
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cursos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ESTUDIANTES
-- =============================================
CREATE TABLE estudiantes (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  rut VARCHAR(20),
  fecha_nacimiento DATE,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE estudiantes ENABLE ROW LEVEL SECURITY;

-- =============================================
-- MATRICULAS (historial por año)
-- =============================================
CREATE TABLE matriculas (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_estudiante BIGINT NOT NULL REFERENCES estudiantes(id),
  id_curso BIGINT NOT NULL REFERENCES cursos(id),
  anio_escolar INTEGER NOT NULL,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'inactivo')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

-- =============================================
-- APODERADOS
-- =============================================
CREATE TABLE apoderados (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  telefono VARCHAR(50),
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE apoderados ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ESTUDIANTE_APODERADO (relación N:M)
-- =============================================
CREATE TABLE estudiante_apoderado (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_estudiante BIGINT NOT NULL REFERENCES estudiantes(id),
  id_apoderado BIGINT NOT NULL REFERENCES apoderados(id),
  parentesco VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(id_estudiante, id_apoderado)
);

ALTER TABLE estudiante_apoderado ENABLE ROW LEVEL SECURITY;

-- =============================================
-- CASOS_CONVIVENCIA
-- =============================================
CREATE TABLE casos_convivencia (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_estudiante BIGINT NOT NULL REFERENCES estudiantes(id),
  tipo_caso VARCHAR(50) NOT NULL CHECK (tipo_caso IN ('conflicto_entre_estudiantes', 'conducta', 'convivencia', 'acoso', 'otro')),
  descripcion TEXT NOT NULL,
  fecha_registro TIMESTAMPTZ DEFAULT NOW(),
  prioridad VARCHAR(20) DEFAULT 'media' CHECK (prioridad IN ('baja', 'media', 'alta', 'urgente')),
  estado VARCHAR(30) DEFAULT 'abierto' CHECK (estado IN ('abierto', 'en_seguimiento', 'cerrado')),
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  creado_por BIGINT REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE casos_convivencia ENABLE ROW LEVEL SECURITY;

-- =============================================
-- INVOLUCRADOS
-- =============================================
CREATE TABLE involucrados (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_caso BIGINT NOT NULL REFERENCES casos_convivencia(id) ON DELETE CASCADE,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('afectado', 'involucrado', 'funcionario', 'apoderado')),
  id_estudiante BIGINT REFERENCES estudiantes(id),
  id_apoderado BIGINT REFERENCES apoderados(id),
  nombre_externo VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE involucrados ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SEGUIMIENTOS
-- =============================================
CREATE TABLE seguimientos (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_caso BIGINT NOT NULL REFERENCES casos_convivencia(id) ON DELETE CASCADE,
  fecha TIMESTAMPTZ DEFAULT NOW(),
  accion_realizada TEXT NOT NULL,
  observacion TEXT,
  responsable BIGINT REFERENCES usuarios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE seguimientos ENABLE ROW LEVEL SECURITY;

-- =============================================
-- REUNIONES_APODERADOS
-- =============================================
CREATE TABLE reuniones_apoderados (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_caso BIGINT REFERENCES casos_convivencia(id),
  id_apoderado BIGINT REFERENCES apoderados(id),
  fecha TIMESTAMPTZ NOT NULL,
  motivo TEXT NOT NULL,
  acuerdos TEXT,
  observaciones TEXT,
  responsable BIGINT REFERENCES usuarios(id),
  acta_url TEXT,
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE reuniones_apoderados ENABLE ROW LEVEL SECURITY;

-- =============================================
-- SOLICITUDES_APOYO (para estudiantes)
-- =============================================
CREATE TABLE solicitudes_apoyo (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_estudiante BIGINT NOT NULL REFERENCES estudiantes(id),
  descripcion TEXT NOT NULL,
  fecha_solicitud TIMESTAMPTZ DEFAULT NOW(),
  estado VARCHAR(30) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'revisada', 'en_atencion', 'cerrada')),
  respuesta TEXT,
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE solicitudes_apoyo ENABLE ROW LEVEL SECURITY;

-- =============================================
-- RECURSOS_APOYO (biblioteca de recursos)
-- =============================================
CREATE TABLE recursos_apoyo (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  tipo VARCHAR(50) NOT NULL,
  url TEXT,
  id_colegio BIGINT NOT NULL REFERENCES colegios(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE recursos_apoyo ENABLE ROW LEVEL SECURITY;

-- =============================================
-- ÍNDICES
-- =============================================
CREATE INDEX idx_usuarios_colegio ON usuarios(id_colegio);
CREATE INDEX idx_usuarios_auth ON usuarios(auth_uid);
CREATE INDEX idx_estudiantes_colegio ON estudiantes(id_colegio);
CREATE INDEX idx_matriculas_estudiante ON matriculas(id_estudiante);
CREATE INDEX idx_matriculas_curso ON matriculas(id_curso);
CREATE INDEX idx_casos_colegio ON casos_convivencia(id_colegio);
CREATE INDEX idx_casos_estudiante ON casos_convivencia(id_estudiante);
CREATE INDEX idx_casos_estado ON casos_convivencia(estado);
CREATE INDEX idx_seguimientos_caso ON seguimientos(id_caso);
CREATE INDEX idx_reuniones_colegio ON reuniones_apoderados(id_colegio);

-- =============================================
-- DATOS INICIALES
-- =============================================
INSERT INTO roles (nombre, permisos) VALUES
  ('admin', '["all"]'),
  ('encargado_convivencia', '["casos:full", "seguimientos:full", "reuniones:full", "estudiantes:read", "dashboard:full", "reportes:full"]'),
  ('estudiante', '["solicitudes:own", "recursos:read"]');
