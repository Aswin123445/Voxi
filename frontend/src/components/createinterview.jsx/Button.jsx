import { Loader2 } from "lucide-react";
function Button({
  type = "button",
  variant = "primary",
  children,
  isLoading = false,
  disabled = false,
  className = "",
  ...props
}) {
  const isDisabled = disabled || isLoading;

  if (variant === "secondary") {
    return (
      <button
        type={type}
        disabled={isDisabled}
        className={`inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-[0_1px_2px_rgba(15,23,42,0.03)] transition-all duration-150 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-4 focus:ring-slate-900/5 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`group inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.18),0_1px_2px_rgba(37,99,235,0.28)] transition-all duration-150 hover:bg-blue-700 active:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-600/20 disabled:cursor-not-allowed disabled:bg-blue-300 disabled:shadow-none ${className}`}
      {...props}
    >
      {isLoading && (
        <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
      )}
      {children}
    </button>
  );
}
export default Button;
