"use client";

interface Opcao<T extends string> {
  value: T;
  label: string;
}

interface SegmentedFilterProps<T extends string> {
  options: ReadonlyArray<Opcao<T>>;
  value: T;
  onChange: (value: T) => void;
  label: string;
}

export function SegmentedFilter<T extends string>({
  options,
  value,
  onChange,
  label,
}: SegmentedFilterProps<T>) {
  return (
    <fieldset className="pill-bar">
      <legend className="sr-only">{label}</legend>
      {options.map((opcao) => (
        <button
          key={opcao.value}
          type="button"
          className="pill"
          aria-pressed={value === opcao.value}
          onClick={() => onChange(opcao.value)}
        >
          {opcao.label}
        </button>
      ))}
    </fieldset>
  );
}
