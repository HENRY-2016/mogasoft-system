


// Define permissions
export const PERMISSIONS = {
    VIEW: 'view',
    ADD: 'add',
    EDIT: 'edit',
    DELETE: 'delete',
    ALL: 'all'
};

// Define role permissions
export const ROLE_PERMISSIONS = {
    Admin: [PERMISSIONS.VIEW, PERMISSIONS.ADD, PERMISSIONS.EDIT, PERMISSIONS.DELETE,PERMISSIONS.ALL],
    Staff: [PERMISSIONS.VIEW],
    guest: [PERMISSIONS.VIEW]
};

// Helper function
// const hasPermission = (permission) => {
// return ROLE_PERMISSIONS[userRole]?.includes(permission) || false;
// };

// Usage in JSX:
// {hasPermission(PERMISSIONS.EDIT) && (
// Edit button
// )}