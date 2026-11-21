import Link from "next/link";

export function AuthBrand() {
  return (
    <Link href="/" className="brand" aria-label="Balcão da Praça">
      <span className="brand-mark" aria-hidden="true">
        <span className="brand-glyph" />
      </span>
      <span className="brand-word">Balcão da Praça</span>
    </Link>
  );
}
