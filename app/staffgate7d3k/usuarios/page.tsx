"use client";

import { useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/lib/adminFetch";

interface AdminUser {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  createdAt: string;
  lastSignInAt: string | null;
  emailConfirmed: boolean;
}

export default function AdminUsuariosPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    adminFetch("/api/admin/usuarios")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
          return;
        }
        setUsers(data.users ?? []);
      })
      .catch(() => setError("No se pudo cargar la lista de usuarios."));
  }, []);

  const filtered = useMemo(() => {
    if (!users) return [];
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        u.phone.replace(/[^0-9]/g, "").includes(q.replace(/[^0-9]/g, ""))
    );
  }, [users, search]);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-extrabold mb-1">Usuarios</h1>
          <p className="text-brand-textMuted text-sm">
            Cuentas registradas con inicio de sesión (no incluye compras como invitado).
          </p>
        </div>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar por correo, nombre o teléfono..."
          className="w-full sm:w-80 bg-brand-surfaceLight border border-brand-border rounded-lg px-4 py-2.5 text-sm placeholder:text-brand-textMuted focus:outline-none focus:border-brand-primary"
        />
      </div>

      {error && <p className="text-red-400 text-sm mb-4">{error}</p>}

      {!users && !error && <p className="text-brand-textMuted text-sm">Cargando usuarios...</p>}

      {users && (
        <>
          <p className="text-xs text-brand-textMuted mb-3">
            {filtered.length} de {users.length} usuario{users.length === 1 ? "" : "s"}
          </p>

          <div className="bg-brand-surface border border-brand-border rounded-2xl overflow-hidden overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-textMuted text-xs">
                  <th className="px-4 py-3 font-semibold">Nombre</th>
                  <th className="px-4 py-3 font-semibold">Correo</th>
                  <th className="px-4 py-3 font-semibold">Teléfono</th>
                  <th className="px-4 py-3 font-semibold">Registrado</th>
                  <th className="px-4 py-3 font-semibold">Último acceso</th>
                  <th className="px-4 py-3 font-semibold">Correo verificado</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-brand-border last:border-0">
                    <td className="px-4 py-3 font-semibold whitespace-nowrap">
                      {u.fullName || <span className="text-brand-textMuted font-normal">Sin nombre</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-textMuted whitespace-nowrap">{u.email}</td>
                    <td className="px-4 py-3 text-brand-textMuted whitespace-nowrap">
                      {u.phone || <span className="opacity-50">—</span>}
                    </td>
                    <td className="px-4 py-3 text-brand-textMuted whitespace-nowrap">
                      {new Date(u.createdAt).toLocaleDateString("es-VE", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-brand-textMuted whitespace-nowrap">
                      {u.lastSignInAt
                        ? new Date(u.lastSignInAt).toLocaleDateString("es-VE", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : "—"}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          u.emailConfirmed
                            ? "bg-brand-green/15 text-brand-green"
                            : "bg-yellow-500/15 text-yellow-400"
                        }`}
                      >
                        {u.emailConfirmed ? "Verificado" : "Pendiente"}
                      </span>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-brand-textMuted">
                      No hay usuarios que coincidan con la búsqueda.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
