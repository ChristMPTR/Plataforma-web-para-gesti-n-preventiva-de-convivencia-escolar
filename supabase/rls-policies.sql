-- NEXORA - RLS Policies
-- Ejecutar después de crear las tablas con schema.sql

-- =============================================
-- COLEGIOS
-- =============================================
CREATE POLICY "Usuarios pueden ver su colegio" ON colegios
  FOR SELECT USING (
    id IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

-- =============================================
-- USUARIOS
-- =============================================
CREATE POLICY "Usuarios ven mismos colegio" ON usuarios
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Admin puede insertar usuarios" ON usuarios
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id = 1
    )
  );

-- =============================================
-- ESTUDIANTES
-- =============================================
CREATE POLICY "Estudiantes mismo colegio" ON estudiantes
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Encargados pueden insertar estudiantes" ON estudiantes
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

CREATE POLICY "Encargados pueden actualizar estudiantes" ON estudiantes
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- CURSOS
-- =============================================
CREATE POLICY "Cursos mismo colegio" ON cursos
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Encargados pueden gestionar cursos" ON cursos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

CREATE POLICY "Encargados pueden actualizar cursos" ON cursos
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- CASOS_CONVIVENCIA
-- =============================================
CREATE POLICY "Casos mismo colegio" ON casos_convivencia
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Encargados pueden crear casos" ON casos_convivencia
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

CREATE POLICY "Encargados pueden actualizar casos" ON casos_convivencia
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- SEGUIMIENTOS
-- =============================================
CREATE POLICY "Seguimientos caso visible" ON seguimientos
  FOR SELECT USING (
    id_caso IN (
      SELECT id FROM casos_convivencia WHERE id_colegio IN (
        SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY "Encargados pueden crear seguimientos" ON seguimientos
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- REUNIONES_APODERADOS
-- =============================================
CREATE POLICY "Reuniones mismo colegio" ON reuniones_apoderados
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Encargados pueden crear reuniones" ON reuniones_apoderados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- APODERADOS
-- =============================================
CREATE POLICY "Apoderados mismo colegio" ON apoderados
  FOR SELECT USING (
    id_colegio IN (
      SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
    )
  );

CREATE POLICY "Encargados pueden gestionar apoderados" ON apoderados
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id IN (1, 2)
    )
  );

-- =============================================
-- SOLICITUDES_APOYO
-- =============================================
CREATE POLICY "Estudiantes ven sus solicitudes" ON solicitudes_apoyo
  FOR SELECT USING (
    id_estudiante IN (
      SELECT id FROM estudiantes WHERE id_colegio IN (
        SELECT id_colegio FROM usuarios WHERE auth_uid = auth.uid()
      )
    )
  );

CREATE POLICY "Estudiantes pueden crear solicitudes" ON solicitudes_apoyo
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM usuarios WHERE auth_uid = auth.uid() AND rol_id = 3
    )
  );
