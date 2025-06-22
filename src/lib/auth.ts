export function checkAdminCredentials(email: string, password: string): boolean {
  return email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD;
}

export function isAdminLoggedIn(): boolean {
  if (typeof window === 'undefined') return false;
  return localStorage.getItem('admin_logged_in') === 'true';
}

export function setAdminLoggedIn(status: boolean): void {
  if (typeof window === 'undefined') return;
  if (status) {
    localStorage.setItem('admin_logged_in', 'true');
    document.cookie = 'admin_logged_in=true; path=/; max-age=86400';
  } else {
    localStorage.removeItem('admin_logged_in');
    document.cookie = 'admin_logged_in=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
  }
}