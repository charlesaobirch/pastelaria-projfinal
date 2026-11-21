"use client";

import { useRouter } from "next/navigation";
import type { FormEvent } from "react";
import { AuthBrand } from "@/components/ui/AuthBrand";

export default function LoginPage() {
  const router = useRouter();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push("/");
  }

  return (
    <main className="auth-shell">
      <div className="auth-content">
        <AuthBrand />

        <form className="auth-panel" onSubmit={handleSubmit}>
          <h1 className="auth-title">Entrar no Balcão da Praça</h1>

          <label className="field">
            <span className="field-label">Email</span>
            <input
              className="field-input"
              type="email"
              name="email"
              autoComplete="email"
              placeholder="nome@pastelaria.pt"
              required
            />
          </label>

          <label className="field">
            <span className="field-label">Palavra-passe</span>
            <input
              className="field-input"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••••"
              required
            />
          </label>

          <a className="recovery-link" href="#recuperar">
            Esqueceste-te da palavra-passe?
          </a>

          <button className="auth-button" type="submit">
            Entrar
          </button>
        </form>

        <p className="auth-footer">© Balcão da Praça</p>
      </div>
    </main>
  );
}
