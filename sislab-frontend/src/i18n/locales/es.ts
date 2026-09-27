import type { MessageSchema } from '../index'

export default {
  app: {
    name: 'SisLab',
    tagline: 'Sistema de Control de Laboratorios Clínicos',
  },
  nav: {
    dashboard: 'Panel',
    patients: 'Pacientes',
    doctors: 'Médicos',
    schedule: 'Agenda',
    catalog: 'Catálogo',
    orders: 'Órdenes',
    results: 'Resultados',
    reports: 'Informes',
    billing: 'Facturación',
  },
  roles: {
    ADMIN: 'Administrador',
    TECHNICIAN: 'Técnico de laboratorio',
    DOCTOR: 'Médico',
    RECEPTIONIST: 'Recepcionista',
  },
  login: {
    title: 'Iniciar sesión',
    email: 'Correo electrónico',
    emailPlaceholder: 'usuario{at}laboratorio.com',
    password: 'Contraseña',
    submit: 'Ingresar al sistema',
    submitting: 'Ingresando…',
    laboratory: 'Laboratorio: {slug}',
    sessionExpired: 'Tu sesión expiró. Volvé a iniciar sesión.',
    validation: {
      emailRequired: 'El correo es requerido',
      emailInvalid: 'Correo inválido',
      passwordRequired: 'La contraseña es requerida',
      passwordMin: 'Mínimo {min} caracteres',
    },
    errors: {
      invalidCredentials: 'Correo o contraseña incorrectos',
      network: 'No se pudo conectar con el servidor',
      tenant: 'Este laboratorio no está disponible',
      generic: 'Ocurrió un error. Intentá de nuevo.',
    },
  },
  layout: {
    logout: 'Cerrar sesión',
    mainMenu: 'Menú principal',
  },
  dashboard: {
    greeting: 'Hola, {name}',
    kpisPending: 'Los indicadores llegan en el Sprint 10.',
    kpis: {
      ordersToday: 'Órdenes hoy',
      patientsServed: 'Pacientes atendidos',
      appointmentsToday: 'Citas hoy',
      pending: 'Pendientes',
    },
  },
  comingSoon: {
    description: 'Este módulo se construye en el Sprint {sprint}.',
  },
  preferences: {
    language: 'Idioma',
    theme: {
      label: 'Tema',
      light: 'Claro',
      dark: 'Oscuro',
      system: 'Sistema',
    },
  },
} satisfies MessageSchema
