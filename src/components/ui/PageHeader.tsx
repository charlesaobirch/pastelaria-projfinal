export function PageHeader({
  title,
  description,
  range,
}: {
  title: string;
  description: string;
  range: string;
}) {
  return (
    <header className="page-head">
      <div className="heading-group">
        <h1 className="page-title">{title}</h1>
        <p className="page-sub">{description}</p>
      </div>
      <span className="range-pill">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          aria-hidden="true"
        >
          <rect x="3" y="5" width="18" height="16" rx="3" />
          <path d="M8 3v4M16 3v4M3 10h18" />
        </svg>
        {range}
      </span>
    </header>
  );
}
