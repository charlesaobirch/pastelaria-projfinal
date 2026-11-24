"use client";

import { WifiOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { AuthBrand } from "@/components/ui/AuthBrand";

export default function ErroPage() {
  const router = useRouter();

  return (
    <main className="auth-shell">
      <div className="auth-content error-content">
        <AuthBrand />

        <div className="error-message">
          <span className="error-icon" aria-hidden="true">
            <WifiOff size={22} />
          </span>
          <h1 className="error-title">Sem ligação</h1>
          <p className="error-copy">
            Não foi possível carregar os dados. Verifique a sua ligação à
            internet e tente novamente.
          </p>
        </div>
        <button
          className="auth-button"
          type="button"
          onClick={() => router.refresh()}
        >
          Tentar novamente
        </button>

        <p className="auth-footer">© Balcão da Praça</p>
      </div>
    </main>
  );
}
