import { formatCurrency } from "../lib/metrics";

function Card({ title, value, variant = "default" }) {
  const styles = {
    default: "panel-dark text-[#1c1917] border-[#d6d3d1]/40",
    danger: "panel-dark text-[#7f1d1d] border-[#fecaca]",
    success: "panel-dark text-[#14532d] border-[#bbf7d0]",
  };

  return (
    <article className={`pro-elevate rounded-xl border p-5 shadow-sm transition hover:-translate-y-0.5 ${styles[variant]}`}>
      <p className="text-sm text-[#57534e]">{title}</p>
      <h3 className="mt-2 text-2xl font-semibold">{formatCurrency(value)}</h3>
    </article>
  );
}

export default Card;
