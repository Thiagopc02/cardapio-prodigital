const ADMIN_EMAIL = "proprietario2026@gmail.com";

export function loginAdmin(email: string) {
  if (email !== ADMIN_EMAIL) {
    return false;
  }

  localStorage.setItem(
    "admin_auth",
    JSON.stringify({
      email,
      logged: true,
    })
  );

  return true;
}

export function isAdminLogged(): boolean {
  if (typeof window === "undefined") return false;

  const data = localStorage.getItem("admin_auth");
  if (!data) return false;

  try {
    const parsed = JSON.parse(data);
    return parsed.logged === true && parsed.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}

export function logoutAdmin() {
  localStorage.removeItem("admin_auth");
}
