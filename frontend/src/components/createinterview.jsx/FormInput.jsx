

function FormInput({
  id,
  name,
  type = "text",
  label,
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  disabled = false,
  required = false,
  autoComplete,
}) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label
          htmlFor={id}
          className="block text-[13px] font-medium text-slate-800"
        >
          {label}
          {required && <span className="ml-0.5 text-blue-600">*</span>}
        </label>
      </div>

      <div className="group relative">
        {Icon && (
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400 transition-colors group-focus-within:text-blue-600">
            <Icon className="h-4 w-4" aria-hidden="true" />
          </div>
        )}
        <input
          id={id}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`h-11 w-full rounded-lg border bg-white text-sm text-slate-900 placeholder-slate-400 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-150 focus:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-500 ${
            Icon ? "pl-10 pr-3.5" : "px-3.5"
          } ${
            error
              ? "border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-500/10"
              : "border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
          }`}
        />
      </div>

      {error && (
        <p
          id={`${id}-error`}
          role="alert"
          className="text-xs font-medium text-red-600"
        >
          {error}
        </p>
      )}
    </div>
  );
}

export default FormInput;