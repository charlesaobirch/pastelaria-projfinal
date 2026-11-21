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
      <span className="range-pill">{range}</span>
    </header>
  );
}
