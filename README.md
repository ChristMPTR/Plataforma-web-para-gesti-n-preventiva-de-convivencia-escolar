# NEXORA - Plataforma Web para Gestion Preventiva de Convivencia Escolar

## Descripcion

NEXORA es una plataforma web disenada para la gestion preventiva de convivencia escolar y bienestar estudiantil. Centraliza el registro, seguimiento y resolucion de casos de convivencia en establecimientos educacionales, reemplazando procesos manuales y hojas de calculo por una solucion digital segura y escalable.

**Desarrollado como proyecto de titulo para la carrera de Ingenieria en Informatica.**

**Autor:** Christian Cortes Marin
**Docente:** Herman Heyer Molina
**Fecha:** Julio 2026

---

## Acceso al Desarrollo

**URL:** https://nexora-app.vercel.app

### Perfiles de Acceso Diferenciados

| Perfil | Correo | Contrasena | Permisos |
|--------|--------|------------|----------|
| Administrador | admin@nexora.cl | admin123 | Gestion completa: usuarios, configuracion, todos los casos |
| Encargado de Convivencia | encargado@nexora.cl | encargado123 | Registro de casos, seguimientos, reuniones, reportes |

---

## Funcionalidades Principales

### 1. Autenticacion y Gestion de Perfiles
- Login seguro con email y contrasena
- Tres roles diferenciados: Administrador, Encargado de Convivencia, Usuario Consulta
- Control de acceso basado en roles (RBAC)

### 2. Dashboard Principal
- Estadisticas generales: total de casos, abiertos, en seguimiento, cerrados
- Graficos interactivos: casos por curso (barras) y tendencias mensuales (lineas)
- Accesos rapidos a modulos principales

### 3. Gestion de Casos de Convivencia
- Registro completo: estudiante, tipo de caso, descripcion, prioridad, estado
- Tipos: conflicto entre estudiantes, conducta, convivencia, acoso, otro
- Estados: abierto, en seguimiento, cerrado
- Prioridades: baja, media, alta, urgente

### 4. Seguimientos
- Historial cronologico de acciones tomadas sobre cada caso
- Registro de: fecha, accion realizada, observacion, responsable
- Vinculo directo con el caso asociado

### 5. Reuniones con Apoderados
- Registro de reuniones vinculadas a casos
- Generacion automatica de acta en PDF
- Campos: fecha, motivo, acuerdos, observaciones

### 6. Reportes y Exportacion
- Filtros por periodo, curso y tipo de caso
- Resumen estadistico con barras por tipo y estado
- Exportacion a PDF y Excel

### 7. Gestion de Estudiantes y Cursos
- CRUD completo de estudiantes con busqueda y paginacion
- Organizacion de cursos por nivel y anio academico
- Vista de estudiantes matriculados por curso

### 8. Configuracion
- Edicion de perfil personal
- Cambio de contrasena
- Administracion de usuarios (solo administradores)

---

## Arquitectura del Sistema

```
┌─────────────────────────────────────────┐
│            FRONTEND (Cliente)           │
│  Angular 21 + TypeScript + SCSS        │
│  Chart.js (graficos) + jsPDF (PDFs)    │
│  SheetJS (Excel)                       │
└──────────────┬──────────────────────────┘
               │ API REST (automatica)
┌──────────────▼──────────────────────────┐
│         BACKEND (BaaS)                  │
│  Supabase                              │
│  ├── Auth (autenticacion)              │
│  ├── Database (PostgreSQL)             │
│  ├── Storage (archivos)                │
│  └── RLS (seguridad por fila)          │
└──────────────┬──────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         BASE DE DATOS                   │
│  PostgreSQL (SQL relacional)            │
│  14 tablas, 3FN, relaciones PK/FK      │
└─────────────────────────────────────────┘
               │
┌──────────────▼──────────────────────────┐
│         DEPLOY                          │
│  Vercel (hosting + HTTPS + CI/CD)       │
│  GitHub (control de versiones)          │
└─────────────────────────────────────────┘
```

---

## Modelo de Base de Datos

### Entidades Principales (14 tablas)

| Tabla | Descripcion | Relaciones |
|-------|-------------|------------|
| `colegios` | Establecimientos educacionales | 1:N a usuarios, cursos |
| `roles` | Permisos del sistema | 1:N a usuarios |
| `usuarios` | Personas del sistema | N:1 a colegios, roles |
| `cursos` | Cursos por nivel y anio | N:1 a colegios |
| `estudiantes` | Alumnos del establecimiento | 1:N a matriculas, casos |
| `matriculas` | Asignacion estudiante-curso | N:1 a estudiantes, cursos |
| `apoderados` | Padres o tutores | 1:N a estudiante_apoderado |
| `estudiante_apoderado` | Relacion many-to-many | N:1 a estudiantes, apoderados |
| `casos_convivencia` | Casos de convivencia | N:1 a estudiantes |
| `involucrados` | Personas afectadas en un caso | N:1 a casos |
| `seguimientos` | Acciones sobre un caso | N:1 a casos |
| `reuniones_apoderados` | Reuniones con padres | N:1 a casos |
| `solicitudes_apoyo` | Solicitudes de ayuda | N:1 a estudiantes |
| `recursos_apoyo` | Recursos disponibles | N:1 a colegios |

### Normalizacion (3FN)

- **1FN:** Cada columna contiene un solo valor, no hay grupos repetitivos
- **2FN:** Todos los atributos dependen completamente de la clave primaria
- **3FN:** No hay dependencias transitivas

---

## Tecnologias Utilizadas

| Capa | Tecnologia | Justificacion |
|------|-----------|---------------|
| Frontend | Angular 21 | Framework completo, TypeScript, componentes standalone |
| Lenguaje | TypeScript | Tipado estatico, deteccion de errores en compilacion |
| Estilos | SCSS | Variables, mixins, nesting para diseno consistente |
| Backend | Supabase (BaaS) | Auth + DB + Storage + API automatica |
| Base de datos | PostgreSQL | SGBD relacional, integridad referencial, RLS |
| Graficos | Chart.js | Ligero, responsive, Canvas |
| PDFs | jsPDF + autoTable | Generacion client-side |
| Excel | SheetJS | Exportacion a multiples formatos |
| Deploy | Vercel | HTTPS automatico, CI/CD desde GitHub |
| Control versiones | Git/GitHub | Repositorio publico |

---

## Seguridad

- **Autenticacion:** Supabase Auth con email/password, sesiones JWT
- **Autorizacion:** RBAC con 3 roles diferenciados
- **Row Level Security:** Politicas PostgreSQL por fila
- **HTTPS:** Certificado SSL automatico via Vercel
- **Headers:** X-Content-Type-Options, X-Frame-Options DENY, CSP
- **Normativa:** Ley 19.628 (vida privada) y Ley 21.430 (ninez/adolescencia)

---

## Instalacion Local

```bash
git clone https://github.com/ChristMPTR/Plataforma-web-para-gesti-n-preventiva-de-convivencia-escolar.git
cd nexora
npm install
ng serve
```

Abrir en navegador: `http://localhost:4200`

> **Modo Demo:** Cualquier correo con contrasena minima de 6 caracteres permite acceso.

---

**Desarrollado por:** Christian Cortes Marin
**Carrera:** Ingenieria en Informatica
**Ano:** 2026
