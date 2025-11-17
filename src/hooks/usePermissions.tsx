import { useAuth } from './useAuth';

interface Permissions {
  canViewOverview: boolean;
  canManageBooks: boolean;
  canManageStudents: boolean;
  canManageDepartments: boolean;
  canManageCheckInOut: boolean;
  canManageIssueCopies: boolean;
  canManageStaff: boolean;
  canViewOverdue: boolean;
  canViewAnalytics: boolean;
  canBulkImport: boolean;
}

export function usePermissions(): Permissions {
  const { profile } = useAuth();
  const role = profile?.role;

  // Super admin has access to everything
  if (role === 'super_admin') {
    return {
      canViewOverview: true,
      canManageBooks: true,
      canManageStudents: true,
      canManageDepartments: true,
      canManageCheckInOut: true,
      canManageIssueCopies: true,
      canManageStaff: true,
      canViewOverdue: true,
      canViewAnalytics: true,
      canBulkImport: true,
    };
  }

  // Admin has access to most features except department management
  if (role === 'admin') {
    return {
      canViewOverview: true,
      canManageBooks: true,
      canManageStudents: true,
      canManageDepartments: false,
      canManageCheckInOut: true,
      canManageIssueCopies: true,
      canManageStaff: true,
      canViewOverdue: true,
      canViewAnalytics: true,
      canBulkImport: true,
    };
  }

  // Department admin has limited access to their department
  if (role === 'department_admin') {
    return {
      canViewOverview: true,
      canManageBooks: true,
      canManageStudents: true,
      canManageDepartments: false,
      canManageCheckInOut: true,
      canManageIssueCopies: true,
      canManageStaff: false,
      canViewOverdue: true,
      canViewAnalytics: true,
      canBulkImport: true,
    };
  }

  // Librarian has basic operational access
  if (role === 'librarian') {
    return {
      canViewOverview: true,
      canManageBooks: true,
      canManageStudents: false,
      canManageDepartments: false,
      canManageCheckInOut: true,
      canManageIssueCopies: true,
      canManageStaff: false,
      canViewOverdue: true,
      canViewAnalytics: false,
      canBulkImport: false,
    };
  }

  // Default: no access
  return {
    canViewOverview: false,
    canManageBooks: false,
    canManageStudents: false,
    canManageDepartments: false,
    canManageCheckInOut: false,
    canManageIssueCopies: false,
    canManageStaff: false,
    canViewOverdue: false,
    canViewAnalytics: false,
    canBulkImport: false,
  };
}
