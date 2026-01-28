export function Alert({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "destructive";
}) {
  const baseStyles = "border rounded-lg px-4 py-3";
  const variantStyles =
    variant === "destructive"
      ? "border-red-200 bg-red-50"
      : "border-gray-200 bg-gray-50";

  return (
    <div className={`${baseStyles} ${variantStyles} ${className}`}>
      {children}
    </div>
  );
}

export function AlertDescription({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <p className={`text-sm text-gray-700 ${className}`}>{children}</p>;
}
