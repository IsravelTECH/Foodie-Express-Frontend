/**
 * Foodie Express - Authentication & User Session Module
 * Unified Role-Based Auth Flow (ROLE_ADMIN, ROLE_SUPERVISOR & ROLE_CUSTOMER)
 */

const AuthService = (() => {
  const getApiBase = () => (typeof FoodieAPI !== 'undefined' && FoodieAPI.BASE_URL) 
    ? FoodieAPI.BASE_URL 
    : ((typeof FoodieApp !== 'undefined' && FoodieApp.API_BASE) ? FoodieApp.API_BASE : 'http://localhost:8080');

  /**
   * Geolocation resolver
   */
  const getCoordinatesLocation = async () => {
    return new Promise((resolve) => {
      if (!navigator.geolocation) {
        return resolve('Chennai, Tamil Nadu');
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
            const data = await res.json();
            resolve(data.address.city || data.address.town || data.address.state || 'Chennai, India');
          } catch {
            resolve('Chennai, India');
          }
        },
        () => resolve('Chennai, India'),
        { timeout: 5000 }
      );
    });
  };

  /**
   * Calculate password strength
   */
  const checkPasswordStrength = (password) => {
    let score = 0;
    if (!password) return { score: 0, text: '', color: '#E5E7EB' };

    if (password.length >= 6) score += 25;
    if (password.length >= 10) score += 25;
    if (/[A-Z]/.test(password)) score += 20;
    if (/[0-9]/.test(password)) score += 15;
    if (/[^A-Za-z0-9]/.test(password)) score += 15;

    let text = 'Weak';
    let color = '#dc2626';

    if (score >= 75) {
      text = 'Strong';
      color = '#16a34a';
    } else if (score >= 45) {
      text = 'Medium';
      color = '#f59e0b';
    }

    return { score, text, color };
  };

  /**
   * Toggle password input visibility
   */
  const togglePasswordVisibility = (inputId, iconEl) => {
    const input = document.getElementById(inputId);
    if (!input) return;

    if (input.type === 'password') {
      input.type = 'text';
      if (iconEl) iconEl.innerHTML = '<i class="fa-regular fa-eye-slash"></i>';
    } else {
      input.type = 'password';
      if (iconEl) iconEl.innerHTML = '<i class="fa-regular fa-eye"></i>';
    }
  };

  /**
   * Handle Unified Login Submit
   */
  const handleLogin = async (e) => {
    e.preventDefault();
    const form = e.target;
    const email = form.querySelector('#login-email')?.value.trim();
    const password = form.querySelector('#login-password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');
    const errorEl = document.getElementById('login-inline-error');

    if (errorEl) {
      errorEl.style.display = 'none';
      errorEl.textContent = '';
    }

    if (!email || !password) {
      if (errorEl) {
        errorEl.textContent = 'Please enter both email and password.';
        errorEl.style.display = 'block';
      } else {
        FoodieApp.showToast('Please enter your email and password.', 'warning');
      }
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Signing in... <i class="fa-solid fa-spinner fa-spin"></i>';
    }

    const apiBase = getApiBase();

    try {
      const response = await fetch(`${apiBase}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Save JWT Token
        if (data.token) {
          localStorage.setItem('token', data.token);
        }

        // Determine User Role
        const userRole = data.role || (data.user && data.user.role) || 'ROLE_CUSTOMER';

        // Save User info
        const userData = data.user || {
          id: data.id || 1,
          name: data.name || email.split('@')[0],
          email: data.email || email,
          role: userRole
        };
        userData.role = userRole;
        localStorage.setItem('user', JSON.stringify(userData));

        FoodieApp.showToast(`👋 Welcome back, ${userData.name}!`, 'success');

        // Automatic Unified Role Redirection
        setTimeout(() => {
          if (userRole === 'ROLE_ADMIN' || userRole === 'ADMIN') {
            window.location.href = '../admin/dashboard.html';
          } else if (userRole === 'ROLE_SUPERVISOR' || userRole === 'SUPERVISOR') {
            window.location.href = '../supervisor/dashboard.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
      } else {
        const errorMsg = data.error || data.message || 'Email or password is incorrect.';
        if (errorEl) {
          errorEl.textContent = errorMsg;
          errorEl.style.display = 'block';
        } else {
          FoodieApp.showToast(errorMsg, 'error');
        }
      }
    } catch (err) {
      console.error('Login error:', err);
      const connError = 'Unable to reach authentication server. Please verify the backend is running.';
      if (errorEl) {
        errorEl.textContent = connError;
        errorEl.style.display = 'block';
      } else {
        FoodieApp.showToast(connError, 'error');
      }
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Sign In <i class="fa-solid fa-arrow-right"></i>';
      }
    }
  };

  /**
   * Handle Signup Submit
   */
  const handleSignup = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form.querySelector('#signup-name')?.value.trim();
    const email = form.querySelector('#signup-email')?.value.trim();
    const password = form.querySelector('#signup-password')?.value;
    const submitBtn = form.querySelector('button[type="submit"]');

    if (!name || !email || !password) {
      FoodieApp.showToast('Please fill in all required fields.', 'warning');
      return;
    }

    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(email)) {
      FoodieApp.showToast('Please enter a valid email address.', 'error');
      return;
    }

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Creating Account... <i class="fa-solid fa-spinner fa-spin"></i>';
    }

    const apiBase = getApiBase();

    try {
      const location = await getCoordinatesLocation();

      const response = await fetch(`${apiBase}/api/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, location })
      });

      const data = await response.json();

      if (response.ok) {
        if (data.token) {
          localStorage.setItem('token', data.token);
        }
        localStorage.setItem('user', JSON.stringify({
          id: data.id || 1,
          name: data.name || name,
          email: data.email || email,
          location: data.location || location,
          role: 'ROLE_CUSTOMER'
        }));

        FoodieApp.showToast('🎉 Account created successfully! Welcome to Foodie Express.', 'success');
        setTimeout(() => window.location.href = 'index.html', 1000);
      } else {
        FoodieApp.showToast(`Signup failed: ${data.error || data.message || 'Error occurred'}`, 'error');
      }
    } catch (err) {
      console.error('Signup error:', err);
      FoodieApp.showToast('Unable to reach server. Please ensure backend is running.', 'error');
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.innerHTML = 'Create Account';
      }
    }
  };

  /**
   * Helper Accessors
   */
  const getCurrentUser = () => {
    try {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    } catch {
      return null;
    }
  };

  const getToken = () => localStorage.getItem('token');

  const getRole = () => {
    const user = getCurrentUser();
    return user ? user.role : null;
  };

  const isAuthenticated = () => {
    return !!(getToken() && getCurrentUser());
  };

  /**
   * Universal Route Guard
   */
  const requireAuth = (expectedRole = null) => {
    if (!isAuthenticated()) {
      FoodieApp.showToast('Please sign in to access this page.', 'warning', 'Authentication Required');
      setTimeout(() => {
        window.location.href = 'login.html';
      }, 500);
      return false;
    }

    if (expectedRole) {
      const role = (getRole() || '').replace('ROLE_', '').toUpperCase();
      const expected = expectedRole.replace('ROLE_', '').toUpperCase();
      if (role !== expected && role !== 'ADMIN') {
        FoodieApp.showToast('You are not authorized to access this page.', 'error', 'Access Denied');
        setTimeout(() => {
          if (role === 'SUPERVISOR') {
            window.location.href = '../supervisor/dashboard.html';
          } else if (role === 'ADMIN') {
            window.location.href = '../admin/dashboard.html';
          } else {
            window.location.href = 'index.html';
          }
        }, 800);
        return false;
      }
    }

    return true;
  };

  /**
   * Handle Logout
   */
  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    window.location.href = 'logout.html';
  };

  return {
    getCurrentUser,
    getToken,
    getRole,
    isAuthenticated,
    requireAuth,
    checkPasswordStrength,
    togglePasswordVisibility,
    handleSignup,
    handleLogin,
    logout
  };
})();

// Global alias for AuthService
window.FoodieAuth = AuthService;
