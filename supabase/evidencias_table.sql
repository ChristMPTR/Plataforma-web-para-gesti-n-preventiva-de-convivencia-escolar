-- Tabla de Evidencias Digitales
CREATE TABLE IF NOT EXISTS evidencias (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  id_caso BIGINT NOT NULL REFERENCES casos_convivencia(id) ON DELETE CASCADE,
  nombre_archivo VARCHAR(500) NOT NULL,
  tipo_archivo VARCHAR(100),
  url_archivo TEXT NOT NULL,
  descripcion TEXT,
  subido_por BIGINT REFERENCES usuarios(id),
  fecha_subida TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE evidencias ENABLE ROW LEVEL SECURITY;

CREATE INDEX idx_evidencias_caso ON evidencias(id_caso);

-- Storage bucket para evidencias (ejecutar en Supabase Dashboard > Storage > New Bucket)
-- Nombre: evidencias
-- Public: true
-- File size limit: 10MB
-- Allowed MIME types: image/*, application/pdf, application/msword, application/vnd.openxmlformats-officedocument.*
