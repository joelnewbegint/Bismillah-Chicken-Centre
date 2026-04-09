const variantClass = {
  primary: "btn-primary",
  secondary: "btn-secondary",
  success: "btn-success",
  danger: "btn-danger",
  info: "btn-info",
  violet: "btn-violet",
  muted: "btn-muted",
};

function Button({
  children,
  type = "button",
  variant = "secondary",
  className = "",
  disabled = false,
  onClick,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`btn ${variantClass[variant] || variantClass.secondary} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;
