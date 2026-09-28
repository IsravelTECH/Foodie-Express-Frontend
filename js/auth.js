/**
 * Foodie Express - Shared Authentication & Role Router
 */

const SharedAuth = (() => {
  const getToken = () => localStorage.getItem('token');

  const getUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const getRole = () => {
    const user = getUser();
    if (!user) return null;
    const role = user.role || 'ROLE_CUSTOMER';
    return role.replace('ROLE_', '').toUpperCase();
  };

  const isAuthenticated = () => {
    return !!getToken() && !!getUser();
  };

  const resolvePath = (roleFolder, file) => {
    const path = window.location.pathname.replace(/\\/g, '/');
    if (path.includes('/admin/') || path.includes('/supervisor/') || path.includes('/customer/')) {
      return `../${roleFolder}/${file}`;
    }
    return `${roleFolder}/${file}`;
  };

  /**
   * Route user based on their actual role
   */
  const routeByRole = (user = null) => {
    const activeUser = user || getUser();
    if (!activeUser) {
      window.location.href = resolvePath('customer', 'login.html');
      return;
    }

    const role = (activeUser.role || '').replace('ROLE_', '').toUpperCase();

    if (role === 'ADMIN') {
      window.location.href = resolvePath('admin', 'dashboard.html');
    } else if (role === 'SUPERVISOR') {
      window.location.href = resolvePath('supervisor', 'dashboard.html');
    } else {
      window.location.href = resolvePath('customer', 'index.html');
    }
  };

  /**
   * Page Auth Guard
   * @param {Array<string>} allowedRoles e.g. ['ADMIN'] or ['SUPERVISOR', 'ADMIN']
   * @param {string} loginRedirect fallback login page
   */
  const guard = (allowedRoles = [], loginRedirect = null) => {
    if (!isAuthenticated()) {
      window.location.href = loginRedirect || resolvePath('customer', 'login.html');
      return false;
    }

    if (allowedRoles.length > 0) {
      const role = getRole();
      if (!allowedRoles.includes(role)) {
        console.warn(`Access denied. Role "${role}" is not in allowed roles:`, allowedRoles);
        routeByRole();
        return false;
      }
    }

    return true;
  };

  const logout = (redirectUrl = null) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = redirectUrl || resolvePath('customer', 'index.html');
  };

  return {
    getToken,
    getUser,
    getRole,
    isAuthenticated,
    routeByRole,
    guard,
    logout,
    resolvePath
  };
})();

window.SharedAuth = SharedAuth;
