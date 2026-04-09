const variantClass = {
  primary: "bg-[#f97316]/12 text-[#c2410c]",
  success: "bg-[#dcfce7] text-[#166534]",
  danger: "bg-[#fee2e2] text-[#b91c1c]",
  neutral: "bg-[#f5f5f4] text-[#57534e]",
};

function Badge({ children, variant = "neutral", className = "" }) {
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-sm font-medium ${variantClass[variant]} ${className}`}>
      {children}
    </span>
  );
}

export default Badge;
