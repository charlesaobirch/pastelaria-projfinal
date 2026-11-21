"use client";

import { RefreshIcon } from "@solar-icons/react/linear/refresh";
import { useRouter } from "next/navigation";
import { AuthBrand } from "@/components/ui/AuthBrand";

export default function ErroPage() {
  const router = useRouter();

  return (
    <main className="auth-shell">
      <div className="auth-content error-content">
        <AuthBrand />

        <div className="auth-panel error-message">
          <span className="error-icon" aria-hidden="true">
            <RefreshIcon size={22} />
          </span>
          <h1 className="error-title">Sem ligação</h1>
          <p className="error-copy">
            Não foi possível carregar os dados. Verifique a sua ligação à
            internet e tente novamente.
          </p>
          <button
            className="auth-button"
            type="button"
            onClick={() => router.refresh()}
          >
            Tentar novamente
          </button>
        </div>

        <p className="auth-footer">© Balcão da Praça</p>
      </div>
    </main>
  );
}
