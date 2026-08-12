import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Admin form primitives.
 *
 * Plain server-rendered inputs inside a `<form action={serverAction}>`. No
 * client state, no controlled components — the admin works with JavaScript
 * disabled, and there is no client bundle to ship for a panel only a handful
 * of people ever load.
 */

const inputClass =
  "mt-1.5 w-full rounded-md border border-rule-strong bg-page px-3 py-2.5 text-base text-ink transition-colors duration-150 ease-soft hover:border-muted";

export function Field({
  label,
  name,
  children,
  help,
  className,
}: {
  label: string;
  name: string;
  children: ReactNode;
  help?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={name} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {help ? (
        <p id={`${name}-help`} className="mt-1.5 text-sm text-muted">
          {help}
        </p>
      ) : null}
    </div>
  );
}

export function TextField({
  label,
  name,
  defaultValue,
  help,
  required,
  placeholder,
  readOnly,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  help?: string;
  required?: boolean;
  placeholder?: string;
  readOnly?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} name={name} help={help} className={className}>
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        readOnly={readOnly}
        aria-describedby={help ? `${name}-help` : undefined}
        className={cn(inputClass, readOnly && "bg-surface text-muted")}
      />
    </Field>
  );
}

/**
 * Textarea with a character counter in the help text.
 *
 * SEO fields have real display limits, and showing the limit next to the field
 * is the difference between an editor writing to it and discovering it in an
 * audit six months later.
 */
export function TextAreaField({
  label,
  name,
  defaultValue,
  help,
  rows = 4,
  required,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  help?: string;
  rows?: number;
  required?: boolean;
  className?: string;
}) {
  return (
    <Field label={label} name={name} help={help} className={className}>
      <textarea
        id={name}
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        required={required}
        aria-describedby={help ? `${name}-help` : undefined}
        className={cn(inputClass, "font-mono text-sm leading-relaxed")}
      />
    </Field>
  );
}

export function SelectField({
  label,
  name,
  defaultValue,
  options,
  help,
  className,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  options: ReadonlyArray<{ value: string; label: string }>;
  help?: string;
  className?: string;
}) {
  return (
    <Field label={label} name={name} help={help} className={className}>
      <select
        id={name}
        name={name}
        defaultValue={defaultValue}
        aria-describedby={help ? `${name}-help` : undefined}
        className={inputClass}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </Field>
  );
}

/**
 * Checkbox with a hidden companion input.
 *
 * An unchecked checkbox submits nothing at all, so a "publish" toggle turned
 * off would look identical to a field that was never rendered. The hidden
 * "false" before it means the form always sends a value.
 */
export function CheckboxField({
  label,
  name,
  defaultChecked,
  help,
}: {
  label: string;
  name: string;
  defaultChecked?: boolean;
  help?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <input type="hidden" name={name} value="false" />
      <input
        id={name}
        name={name}
        type="checkbox"
        value="true"
        defaultChecked={defaultChecked}
        aria-describedby={help ? `${name}-help` : undefined}
        className="mt-1 size-4 rounded-sm border-rule-strong accent-brand"
      />
      <div>
        <label htmlFor={name} className="text-sm font-medium text-ink">
          {label}
        </label>
        {help ? (
          <p id={`${name}-help`} className="text-sm text-muted">
            {help}
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-rule p-5 sm:p-6">
      <h2 className="text-h3">{title}</h2>
      {description ? <p className="mt-1 text-sm text-muted">{description}</p> : null}
      <div className="mt-5 flex flex-col gap-5">{children}</div>
    </section>
  );
}
