export default {
  app: {
    name: 'SisLab',
    tagline: 'Clinical Laboratory Management System',
  },
  nav: {
    dashboard: 'Dashboard',
    patients: 'Patients',
    doctors: 'Doctors',
    schedule: 'Schedule',
    catalog: 'Test catalog',
    orders: 'Orders',
    results: 'Results',
    reports: 'Reports',
    billing: 'Billing',
  },
  roles: {
    ADMIN: 'Administrator',
    TECHNICIAN: 'Lab technician',
    DOCTOR: 'Doctor',
    RECEPTIONIST: 'Receptionist',
  },
  login: {
    title: 'Sign in',
    email: 'Email',
    emailPlaceholder: 'user{at}laboratory.com',
    password: 'Password',
    submit: 'Sign in',
    submitting: 'Signing in…',
    laboratory: 'Laboratory: {slug}',
    sessionExpired: 'Your session has expired. Please sign in again.',
    validation: {
      emailRequired: 'Email is required',
      emailInvalid: 'Invalid email',
      passwordRequired: 'Password is required',
      passwordMin: 'At least {min} characters',
    },
    errors: {
      invalidCredentials: 'Invalid email or password',
      network: 'Could not reach the server',
      tenant: 'This laboratory is not available',
      generic: 'Something went wrong. Please try again.',
    },
  },
  layout: {
    logout: 'Sign out',
    mainMenu: 'Main menu',
  },
  dashboard: {
    greeting: 'Hello, {name}',
    kpisPending: 'KPIs arrive in Sprint 10.',
    kpis: {
      ordersToday: 'Orders today',
      patientsServed: 'Patients served',
      appointmentsToday: 'Appointments today',
      pending: 'Pending',
    },
  },
  comingSoon: {
    description: 'This module is built in Sprint {sprint}.',
  },
  preferences: {
    language: 'Language',
    theme: {
      label: 'Theme',
      light: 'Light',
      dark: 'Dark',
      system: 'System',
    },
  },
}
