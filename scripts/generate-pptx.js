const pptxgen = require('pptxgenjs');

const pptx = new pptxgen();
pptx.layout = 'LAYOUT_16x9';
pptx.author = 'Christian Cortes Marin';
pptx.title = 'NEXORA - Plataforma Web para Gestion Preventiva de Convivencia Escolar';
pptx.subject = 'Examen de Titulacion - IPLACEX';

// ═══════════════════════════════════════════════
// COLOR SCHEME
// ═══════════════════════════════════════════════
const COLORS = {
  primary: '1B4F72',    // dark blue
  accent: '2E86C1',     // bright blue
  success: '27AE60',    // green
  warning: 'F39C12',    // orange
  danger: 'E74C3C',     // red
  dark: '2C3E50',       // dark gray
  light: 'ECF0F1',      // light gray
  white: 'FFFFFF',
  bg: 'F8F9FA',         // background
};

// ═══════════════════════════════════════════════
// HELPER: Add consistent footer
// ═══════════════════════════════════════════════
function addFooter(slide) {
  slide.addText('NEXORA — Examen de Titulación | Christian Cortes Marín | IPLACEX', {
    x: 0, y: '92%', w: '100%', h: 0.35,
    fontSize: 8, color: '999999', align: 'center',
    fontFace: 'Segoe UI',
  });
}

// ═══════════════════════════════════════════════
// SLIDE 1: PORTADA
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.primary };

  slide.addText('NEXORA', {
    x: 0, y: 1.5, w: '100%', h: 1.2,
    fontSize: 54, bold: true, color: COLORS.white,
    align: 'center', fontFace: 'Segoe UI',
  });

  slide.addText('Plataforma Web para la Gestión\nPreventiva de Convivencia Escolar', {
    x: 1, y: 2.8, w: 8, h: 1.2,
    fontSize: 22, color: COLORS.light,
    align: 'center', fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 3.5, y: 4.1, w: 3, h: 0.04,
    fill: { color: COLORS.accent },
  });

  slide.addText([
    { text: 'Christian Cortes Marín\n', options: { fontSize: 16, bold: true, color: COLORS.white } },
    { text: 'Ingeniería en Informática\n', options: { fontSize: 13, color: COLORS.light } },
    { text: 'Instituto Profesional IPLACEX', options: { fontSize: 12, color: COLORS.light } },
  ], {
    x: 0, y: 4.4, w: '100%', h: 1.5,
    align: 'center', fontFace: 'Segoe UI',
  });

  slide.addText('Examen de Titulación — 2026', {
    x: 0, y: 6.2, w: '100%', h: 0.5,
    fontSize: 11, color: COLORS.accent,
    align: 'center', fontFace: 'Segoe UI',
  });
}

// ═══════════════════════════════════════════════
// SLIDE 2: PROBLEMA
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('El Problema', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  // Stat callout
  slide.addText('30%+', {
    x: 0.5, y: 1.3, w: 2, h: 0.8,
    fontSize: 36, bold: true, color: COLORS.danger,
    fontFace: 'Segoe UI',
  });
  slide.addText('de establecimientos\nreportan conflictos', {
    x: 0.5, y: 2.0, w: 2, h: 0.6,
    fontSize: 11, color: COLORS.dark,
    fontFace: 'Segoe UI',
  });

  // 4 problems
  const problems = [
    { icon: '⏱️', title: 'Detección tardía', desc: 'Sin alertas ni notificaciones, los casos escalan antes de ser detectados' },
    { icon: '📋', title: 'Pérdida de información', desc: 'Datos dispersos en cuadernos y hojas de cálculo — sin trazabilidad' },
    { icon: '📊', title: 'Sin análisis estadístico', desc: 'Los directivos toman decisiones sin datos que las respalden' },
    { icon: '⚖️', title: 'Incumplimiento legal', desc: 'La Ley de Convivencia Escolar exige registros que los métodos manuales no proveen' },
  ];

  problems.forEach((p, i) => {
    const y = 1.3 + (i * 1.25);
    slide.addText(p.icon, {
      x: 3, y: y, w: 0.6, h: 0.5,
      fontSize: 20, fontFace: 'Segoe UI',
    });
    slide.addText(p.title, {
      x: 3.6, y: y, w: 6, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.dark,
      fontFace: 'Segoe UI',
    });
    slide.addText(p.desc, {
      x: 3.6, y: y + 0.35, w: 6, h: 0.5,
      fontSize: 11, color: '666666',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 3: SOLUCIÓN — 8 MÓDULOS
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('La Solución: NEXORA', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  const modules = [
    { icon: '📊', name: 'Dashboard', desc: 'Estadísticas, gráficos\ny alertas en tiempo real' },
    { icon: '📁', name: 'Casos', desc: 'Registro y gestión de\ncasos de convivencia' },
    { icon: '📋', name: 'Seguimientos', desc: 'Historial cronológico\nde acciones por caso' },
    { icon: '🤝', name: 'Reuniones', desc: 'Gestión con apoderados\ny actas en PDF' },
    { icon: '👨‍🎓', name: 'Estudiantes', desc: 'Base de datos centralizada\ncon búsqueda' },
    { icon: '🏫', name: 'Cursos', desc: 'Organización por nivel\ny sección' },
    { icon: '📈', name: 'Reportes', desc: 'Análisis estadístico\nPDF y Excel' },
    { icon: '⚙️', name: 'Configuración', desc: 'Perfil, contraseña\ny usuarios' },
  ];

  modules.forEach((m, i) => {
    const col = i % 4;
    const row = Math.floor(i / 4);
    const x = 0.5 + col * 2.3;
    const y = 1.3 + row * 2.5;

    // Card background
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 2.1, h: 2.2,
      fill: { color: COLORS.bg },
      rectRadius: 0.1,
      line: { color: 'DEE2E6', width: 0.5 },
    });

    slide.addText(m.icon, {
      x: x, y: y + 0.15, w: 2.1, h: 0.5,
      fontSize: 24, align: 'center', fontFace: 'Segoe UI',
    });

    slide.addText(m.name, {
      x: x, y: y + 0.65, w: 2.1, h: 0.4,
      fontSize: 13, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Segoe UI',
    });

    slide.addText(m.desc, {
      x: x + 0.1, y: y + 1.05, w: 1.9, h: 0.9,
      fontSize: 10, color: '666666',
      align: 'center', fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 4: ALTERNATIVA TECNOLÓGICA
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Alternativa Tecnológica', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  // Tech stack cards
  const techs = [
    { icon: '🅰️', name: 'Angular 21', desc: 'Framework frontend\nComponent-based architecture\nTypeScript + Signals' },
    { icon: '⚡', name: 'Supabase', desc: 'Backend-as-a-Service\nPostgreSQL + Auth + API REST\nRow Level Security' },
    { icon: '🗄️', name: 'PostgreSQL', desc: 'Base de datos relacional\n14 tablas — 3NF\nÍndices optimizados' },
    { icon: '▲', name: 'Vercel', desc: 'Hosting frontend\nCDN global + HTTPS\nDeploy automático' },
  ];

  techs.forEach((t, i) => {
    const x = 0.3 + i * 2.45;
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: 1.3, w: 2.3, h: 2.8,
      fill: { color: COLORS.bg },
      rectRadius: 0.1,
      line: { color: 'DEE2E6', width: 0.5 },
    });

    slide.addText(t.icon, {
      x: x, y: 1.4, w: 2.3, h: 0.6,
      fontSize: 28, align: 'center', fontFace: 'Segoe UI',
    });

    slide.addText(t.name, {
      x: x, y: 2.0, w: 2.3, h: 0.4,
      fontSize: 15, bold: true, color: COLORS.primary,
      align: 'center', fontFace: 'Segoe UI',
    });

    slide.addText(t.desc, {
      x: x + 0.15, y: 2.5, w: 2, h: 1.4,
      fontSize: 11, color: '555555',
      align: 'center', fontFace: 'Segoe UI',
    });
  });

  // Cost callout
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 4.4, w: 9, h: 0.9,
    fill: { color: 'E8F8F5' },
    rectRadius: 0.1,
    line: { color: COLORS.success, width: 1 },
  });

  slide.addText([
    { text: '💰 Costo de infraestructura: $0  ', options: { fontSize: 14, bold: true, color: COLORS.success } },
    { text: '| Supabase Plan Gratis: 500MB DB + 1GB storage  |  Vercel: deploy ilimitado', options: { fontSize: 11, color: COLORS.dark } },
  ], {
    x: 0.7, y: 4.5, w: 8.5, h: 0.7,
    align: 'center', fontFace: 'Segoe UI',
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 5: DESCRIPCIÓN DEL SISTEMA
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Descripción del Sistema', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  slide.addText('NEXORA es una plataforma web para la gestión preventiva de la convivencia escolar y bienestar estudiantil.', {
    x: 0.5, y: 1.2, w: 9, h: 0.6,
    fontSize: 13, color: COLORS.dark, italic: true,
    fontFace: 'Segoe UI',
  });

  // Left: capabilities
  slide.addText('Capacidades del Sistema', {
    x: 0.5, y: 2.0, w: 4.5, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  const capabilities = [
    'Registrar casos de convivencia con información completa',
    'Dar seguimiento cronológico a cada caso',
    'Gestionar reuniones con apoderados',
    'Generar reportes estadísticos exportables',
    'Acceso desde cualquier dispositivo con internet',
  ];

  capabilities.forEach((c, i) => {
    slide.addText(`✓  ${c}`, {
      x: 0.7, y: 2.5 + (i * 0.5), w: 4.3, h: 0.4,
      fontSize: 11, color: COLORS.dark,
      fontFace: 'Segoe UI',
    });
  });

  // Right: users
  slide.addText('Usuarios', {
    x: 5.5, y: 2.0, w: 4, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  const users = [
    { role: 'Encargado de Convivencia', desc: 'Registra y da seguimiento a casos' },
    { role: 'Administrador', desc: 'Gestiona el sistema y accede a reportes consolidados' },
  ];

  users.forEach((u, i) => {
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 5.5, y: 2.5 + (i * 1.0), w: 4, h: 0.8,
      fill: { color: COLORS.bg },
      rectRadius: 0.08,
      line: { color: 'DEE2E6', width: 0.5 },
    });
    slide.addText(u.role, {
      x: 5.7, y: 2.55 + (i * 1.0), w: 3.6, h: 0.35,
      fontSize: 12, bold: true, color: COLORS.primary,
      fontFace: 'Segoe UI',
    });
    slide.addText(u.desc, {
      x: 5.7, y: 2.9 + (i * 1.0), w: 3.6, h: 0.3,
      fontSize: 10, color: '666666',
      fontFace: 'Segoe UI',
    });
  });

  // Browser compat
  slide.addText('Navegadores: Chrome | Firefox | Edge  •  Diseño responsivo (desktop, tablet, móvil)', {
    x: 0.5, y: 5.2, w: 9, h: 0.4,
    fontSize: 11, color: '888888',
    fontFace: 'Segoe UI',
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 6: MODELO ENTIDAD-RELACIÓN
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Modelo Entidad-Relación', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  slide.addText('14 entidades principales', {
    x: 0.5, y: 1.2, w: 9, h: 0.4,
    fontSize: 13, color: COLORS.dark, italic: true,
    fontFace: 'Segoe UI',
  });

  // Key entities
  const entities = [
    { name: 'Colegios', desc: 'Establecimientos educativos', color: COLORS.primary },
    { name: 'Estudiantes', desc: 'Alumnos del establecimiento', color: COLORS.accent },
    { name: 'Casos Convivencia', desc: 'Entidad central del sistema', color: COLORS.danger },
    { name: 'Involucrados', desc: 'Personas en cada situación', color: COLORS.warning },
    { name: 'Seguimientos', desc: 'Acciones tomadas por caso', color: COLORS.success },
    { name: 'Reuniones', desc: 'Reuniones con apoderados', color: '8E44AD' },
    { name: 'Usuarios', desc: 'Encargados y administradores', color: '2C3E50' },
    { name: 'Cursos', desc: 'Organización por nivel y año', color: '16A085' },
    { name: 'Apoderados', desc: 'Representantes legales', color: 'D35400' },
  ];

  entities.forEach((e, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.2;
    const y = 1.8 + row * 1.4;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 3.0, h: 1.1,
      fill: { color: e.color },
      rectRadius: 0.08,
    });

    slide.addText(e.name, {
      x: x + 0.15, y: y + 0.1, w: 2.7, h: 0.4,
      fontSize: 13, bold: true, color: COLORS.white,
      fontFace: 'Segoe UI',
    });

    slide.addText(e.desc, {
      x: x + 0.15, y: y + 0.5, w: 2.7, h: 0.4,
      fontSize: 10, color: 'E0E0E0',
      fontFace: 'Segoe UI',
    });
  });

  // Key relationship note
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 5.7, w: 9, h: 0.7,
    fill: { color: 'FFF3CD' },
    rectRadius: 0.08,
    line: { color: COLORS.warning, width: 0.5 },
  });

  slide.addText('Relación clave: Casos → Involucrados (1:N) | Casos → Seguimientos (1:N) | Estudiantes ↔ Apoderados (N:M via tabla intermedia)', {
    x: 0.7, y: 5.8, w: 8.5, h: 0.5,
    fontSize: 10, color: COLORS.dark,
    fontFace: 'Segoe UI',
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 7: REQUERIMIENTOS FUNCIONALES
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Requerimientos Funcionales', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  const rfs = [
    { code: 'RF-01', module: 'Autenticación', desc: 'Login, registro, recuperación de contraseña, control por roles' },
    { code: 'RF-02', module: 'Dashboard', desc: 'Estadísticas, gráficos interactivos y alertas automáticas' },
    { code: 'RF-03', module: 'Casos', desc: 'CRUD completo con filtros por tipo, estado y prioridad' },
    { code: 'RF-04', module: 'Seguimientos', desc: 'Registro y consulta de acciones vinculadas a cada caso' },
    { code: 'RF-05', module: 'Reuniones', desc: 'Agendamiento con apoderados + generación de actas PDF' },
    { code: 'RF-06', module: 'Estudiantes', desc: 'Búsqueda, registro y edición con paginación' },
    { code: 'RF-07', module: 'Reportes', desc: 'Análisis estadístico con exportación a PDF y Excel' },
    { code: 'RF-08', module: 'Configuración', desc: 'Perfil, cambio de contraseña y gestión de usuarios' },
  ];

  rfs.forEach((rf, i) => {
    const y = 1.2 + (i * 0.65);
    const bgColor = i % 2 === 0 ? COLORS.bg : COLORS.white;

    slide.addShape(pptx.shapes.RECTANGLE, {
      x: 0.5, y: y, w: 9, h: 0.55,
      fill: { color: bgColor },
    });

    slide.addText(rf.code, {
      x: 0.6, y: y + 0.05, w: 0.9, h: 0.4,
      fontSize: 10, bold: true, color: COLORS.accent,
      fontFace: 'Segoe UI',
    });

    slide.addText(rf.module, {
      x: 1.6, y: y + 0.05, w: 2.2, h: 0.4,
      fontSize: 11, bold: true, color: COLORS.dark,
      fontFace: 'Segoe UI',
    });

    slide.addText(rf.desc, {
      x: 3.8, y: y + 0.05, w: 5.5, h: 0.4,
      fontSize: 10, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 8: REQUERIMIENTOS NO FUNCIONALES
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Requerimientos No Funcionales', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  const rnfs = [
    { icon: '🔒', name: 'Seguridad', desc: 'JWT + bcrypt + RLS + HTTPS\nControl de acceso por roles', color: COLORS.danger },
    { icon: '⏱️', name: 'Disponibilidad', desc: 'Fallback demo + timeout 5s/6s\nAPP_INITIALIZER', color: COLORS.warning },
    { icon: '🚀', name: 'Rendimiento', desc: 'Lazy loading + índices DB\n<200ms consultas', color: COLORS.success },
    { icon: '🎯', name: 'Usabilidad', desc: 'Interfaz intuitiva + responsivo\nMensajes amigables', color: COLORS.accent },
    { icon: '🔧', name: 'Mantenibilidad', desc: 'Arquitectura modular\nServicios centralizados', color: '8E44AD' },
    { icon: '📈', name: 'Escalabilidad', desc: 'Supabase escala automático\nMódulos independientes', color: '16A085' },
  ];

  rnfs.forEach((rnf, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.5 + col * 3.2;
    const y = 1.3 + row * 2.4;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 3.0, h: 2.0,
      fill: { color: COLORS.bg },
      rectRadius: 0.1,
      line: { color: rnf.color, width: 1.5 },
    });

    slide.addText(rnf.icon + '  ' + rnf.name, {
      x: x + 0.15, y: y + 0.15, w: 2.7, h: 0.4,
      fontSize: 14, bold: true, color: rnf.color,
      fontFace: 'Segoe UI',
    });

    slide.addText(rnf.desc, {
      x: x + 0.15, y: y + 0.65, w: 2.7, h: 1.2,
      fontSize: 11, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 9: MODELO RELACIONAL
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Modelo Relacional', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  slide.addText('Implementación en PostgreSQL — Tercera Forma Normal (3NF)', {
    x: 0.5, y: 1.2, w: 9, h: 0.4,
    fontSize: 12, color: COLORS.dark, italic: true,
    fontFace: 'Segoe UI',
  });

  // Left column: design decisions
  const decisions = [
    { label: 'Claves primarias', value: 'BIGSERIAL — autoincremento y unicidad' },
    { label: 'UUID auth_uid', value: 'Vincula tabla usuarios ↔ Supabase Auth' },
    { label: 'JSONB en roles', value: 'Permisos flexibles en formato array JSON' },
    { label: 'CHECK constraints', value: 'Estado, prioridad y tipo con valores predefinidos' },
    { label: 'Índices', value: 'Columnas más consultadas para óptimo rendimiento' },
  ];

  decisions.forEach((d, i) => {
    const y = 1.8 + (i * 0.85);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: y, w: 4.5, h: 0.7,
      fill: { color: i % 2 === 0 ? 'EBF5FB' : COLORS.bg },
      rectRadius: 0.06,
    });
    slide.addText(d.label, {
      x: 0.7, y: y + 0.05, w: 4, h: 0.3,
      fontSize: 11, bold: true, color: COLORS.primary,
      fontFace: 'Segoe UI',
    });
    slide.addText(d.value, {
      x: 0.7, y: y + 0.35, w: 4, h: 0.3,
      fontSize: 10, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  // Right column: tables summary
  slide.addText('14 Tablas Principales', {
    x: 5.5, y: 1.7, w: 4, h: 0.4,
    fontSize: 14, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  const tables = [
    'colegios', 'estudiantes', 'cursos', 'matriculas',
    'casos_convivencia', 'involucrados', 'seguimientos',
    'reuniones_apoderados', 'apoderados', 'usuarios',
    'roles', 'solicitudes_apoyo', 'recursos_apoyo',
    'estudiante_apoderado',
  ];

  tables.forEach((t, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    slide.addText(`•  ${t}`, {
      x: 5.5 + col * 2.1, y: 2.2 + row * 0.38, w: 2.0, h: 0.35,
      fontSize: 10, color: '444444',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 10: ASPECTOS DE IMPLEMENTACIÓN
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Aspectos de Implementación', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 28, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  const aspects = [
    { cat: 'Arquitectura', items: 'Clean Architecture + Component-Based\nSeparación: Presentación → Lógica → Datos' },
    { cat: 'Tecnologías', items: 'TypeScript + Angular 21 + Supabase SDK\njsPDF + html2canvas + SheetJS' },
    { cat: 'Seguridad', items: 'JWT + bcrypt + HTTPS + RLS\nControl de acceso por roles' },
    { cat: 'Errores', items: 'Try-catch + timeout 5s + fallback demo\nMensajes amigables al usuario' },
    { cat: 'Plataforma', items: 'Dev: Windows + VS Code + Node.js 24\nProd: Vercel + Supabase Cloud' },
    { cat: 'Rendimiento', items: 'Consultas <200ms + CDN global\nCarga inicial <3s + Lazy loading' },
  ];

  aspects.forEach((a, i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    const x = 0.3 + col * 3.2;
    const y = 1.3 + row * 2.4;

    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: x, y: y, w: 3.0, h: 2.1,
      fill: { color: COLORS.bg },
      rectRadius: 0.1,
      line: { color: 'DEE2E6', width: 0.5 },
    });

    slide.addText(a.cat, {
      x: x + 0.15, y: y + 0.15, w: 2.7, h: 0.4,
      fontSize: 14, bold: true, color: COLORS.primary,
      fontFace: 'Segoe UI',
    });

    slide.addText(a.items, {
      x: x + 0.15, y: y + 0.6, w: 2.7, h: 1.3,
      fontSize: 11, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 11: DESAFÍOS TÉCNICOS
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Desafíos Técnicos', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  // Main challenge - the race condition
  slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
    x: 0.5, y: 1.3, w: 9, h: 2.5,
    fill: { color: 'FEF9E7' },
    rectRadius: 0.1,
    line: { color: COLORS.warning, width: 1.5 },
  });

  slide.addText('Desafío Principal: Condición de Carrera (Race Condition)', {
    x: 0.7, y: 1.4, w: 8.5, h: 0.4,
    fontSize: 15, bold: true, color: COLORS.danger,
    fontFace: 'Segoe UI',
  });

  slide.addText('PROBLEMA:', {
    x: 0.7, y: 1.9, w: 4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.dark,
    fontFace: 'Segoe UI',
  });

  slide.addText('El authGuard se ejecutaba antes de que Supabase restaurara la sesión.\nEl usuario siempre era redirigido al login, aunque tuviera sesión válida.', {
    x: 0.7, y: 2.2, w: 8.5, h: 0.6,
    fontSize: 11, color: '555555',
    fontFace: 'Segoe UI',
  });

  slide.addText('SOLUCIÓN:', {
    x: 0.7, y: 2.8, w: 4, h: 0.3,
    fontSize: 11, bold: true, color: COLORS.dark,
    fontFace: 'Segoe UI',
  });

  slide.addText('APP_INITIALIZER + Promise.race → sesión (5s timeout) vs timeout global (6s)\nLa app SIEMPRE arranca, incluso si Supabase no responde.', {
    x: 0.7, y: 3.1, w: 8.5, h: 0.6,
    fontSize: 11, color: '555555',
    fontFace: 'Segoe UI',
  });

  // Other challenges
  slide.addText('Otros desafíos superados:', {
    x: 0.5, y: 4.0, w: 9, h: 0.4,
    fontSize: 13, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  const otherChallenges = [
    '+12 bugs corregidos durante integración con BD real',
    'Nombres de campos que no coincidían entre frontend y backend',
    'Consultas con JOINs faltantes y INSERTs incompletos',
    'Gráficos sin datos formateados y reportes con consultas incompletas',
  ];

  otherChallenges.forEach((c, i) => {
    slide.addText(`•  ${c}`, {
      x: 0.7, y: 4.4 + (i * 0.35), w: 8.5, h: 0.3,
      fontSize: 11, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SLIDE 12: CONCLUSIONES
// ═══════════════════════════════════════════════
{
  const slide = pptx.addSlide();
  slide.background = { color: COLORS.white };

  slide.addText('Conclusiones', {
    x: 0.5, y: 0.3, w: 9, h: 0.7,
    fontSize: 30, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addShape(pptx.shapes.RECTANGLE, {
    x: 0.5, y: 1.0, w: 2.5, h: 0.04,
    fill: { color: COLORS.accent },
  });

  const conclusions = [
    { icon: '🎯', title: 'Objetivos cumplidos', desc: '8 módulos funcionales, 14 tablas, sistema desplegado en Vercel' },
    { icon: '💻', title: 'Aprendizaje técnico', desc: 'Arquitectura modular, asincronía, seguridad, BD relacional, cloud' },
    { icon: '📈', title: 'Desarrollo profesional', desc: 'Diagnóstico antes de código, planificar antes de implementar' },
    { icon: '💡', title: 'Aprendizaje clave', desc: 'La tecnología es una herramienta para resolver problemas humanos' },
  ];

  conclusions.forEach((c, i) => {
    const y = 1.3 + (i * 1.05);
    slide.addShape(pptx.shapes.ROUNDED_RECTANGLE, {
      x: 0.5, y: y, w: 9, h: 0.85,
      fill: { color: i % 2 === 0 ? 'EBF5FB' : COLORS.bg },
      rectRadius: 0.08,
    });
    slide.addText(c.icon, {
      x: 0.7, y: y + 0.1, w: 0.5, h: 0.5,
      fontSize: 20, fontFace: 'Segoe UI',
    });
    slide.addText(c.title, {
      x: 1.3, y: y + 0.1, w: 3.5, h: 0.35,
      fontSize: 13, bold: true, color: COLORS.primary,
      fontFace: 'Segoe UI',
    });
    slide.addText(c.desc, {
      x: 1.3, y: y + 0.45, w: 8, h: 0.35,
      fontSize: 11, color: '555555',
      fontFace: 'Segoe UI',
    });
  });

  // Future improvements
  slide.addText('Mejoras Futuras', {
    x: 0.5, y: 5.1, w: 9, h: 0.35,
    fontSize: 13, bold: true, color: COLORS.primary,
    fontFace: 'Segoe UI',
  });

  slide.addText('Notificaciones push  •  App móvil con Ionic  •  Integración SAG + Google Classroom  •  IA para predicción  •  Escalabilidad regional', {
    x: 0.5, y: 5.45, w: 9, h: 0.4,
    fontSize: 10, color: '888888',
    fontFace: 'Segoe UI',
  });

  // Thank you
  slide.addText('¡Muchas gracias! — Estoy a disposición para sus preguntas.', {
    x: 0, y: 6.0, w: '100%', h: 0.6,
    fontSize: 18, bold: true, color: COLORS.primary,
    align: 'center', fontFace: 'Segoe UI',
  });

  addFooter(slide);
}

// ═══════════════════════════════════════════════
// SAVE
// ═══════════════════════════════════════════════
const outputPath = 'C:\\Users\\Usuario\\Desktop\\entrega examen final\\NEXORA_Presentacion_Titulacion.pptx';

pptx.writeFile({ fileName: outputPath })
  .then(() => {
    console.log(`✅ PPTX generado exitosamente: ${outputPath}`);
  })
  .catch((err) => {
    console.error('❌ Error generando PPTX:', err);
  });
