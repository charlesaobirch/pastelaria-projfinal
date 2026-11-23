import { Croissant } from "lucide-react";
import Link from "next/link";

export function AuthBrand() {
  return (
    <Link href="/" className="brand" aria-label="Balcão da Praça">
      <span className="brand-mark" aria-hidden="true">
        <Croissant size={17} />
      </span>
      <span className="brand-word">Balcão da Praça</span>
    </Link>
  );
}
