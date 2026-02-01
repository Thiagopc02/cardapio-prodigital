const ADMIN_EMAIL = "proprietario2026@gmail.com";
const ADMIN_PASSWORD = "12345678";

export function loginAdmin(email: string, senha: string) {
  if (email !== ADMIN_EMAIL || senha !== ADMIN_PASSWORD) {
    return false;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(
      "admin_auth",
      JSON.stringify({
        email,
        logged: true,
      })
    );
  }

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
  if (typeof window !== "undefined") {
    localStorage.removeItem("admin_auth");
  }
}
