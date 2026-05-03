export const ROLES = {
  STUDENT: 'STUDENT',
  INSTRUCTOR: 'INSTRUCTOR',
  ADMIN: 'ADMIN',
};

export const ROLE_OPTIONS = [
  { value: ROLES.STUDENT, label: 'Student' },
  { value: ROLES.INSTRUCTOR, label: 'Instructor' },
  { value: ROLES.ADMIN, label: 'Admin' },
];

export const SELF_SERVICE_ROLE_OPTIONS = ROLE_OPTIONS.filter((role) => role.value !== ROLES.ADMIN);

export const getRoleHomePath = (role) => {
  if (role === ROLES.ADMIN) return '/admin/dashboard';
  return '/dashboard';
};

export const hasAnyRole = (user, roles = []) => Boolean(user?.role && roles.includes(user.role));

export const canManageInstructorTools = (role) => role === ROLES.INSTRUCTOR || role === ROLES.ADMIN;

export const getRoleLabel = (role) => ROLE_OPTIONS.find((option) => option.value === role)?.label || 'User';
