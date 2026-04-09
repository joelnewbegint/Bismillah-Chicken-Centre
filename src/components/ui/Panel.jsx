function Panel({ children, className = "" }) {
  return (
    <section
      className={`panel-dark rounded-[2.5rem] border border-[#d6d3d1]/45 p-5 shadow-[0_20px_40px_rgba(140,113,100,0.12)] ${className}`}
    >
      {children}
    </section>
  );
}

export default Panel;
