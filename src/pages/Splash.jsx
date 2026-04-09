function Splash() {
  return (
    <div className="splash-screen flex min-h-screen items-center justify-center px-4">
      <div className="text-center">
        <div className="mx-auto w-fit rounded-full bg-white/90 p-4 shadow-lg">
          <img
            src="/bc-logo.png"
            alt="Bismillah Chicken Centre logo"
            className="splash-logo h-36 w-36 rounded-full object-cover sm:h-44 sm:w-44"
          />
        </div>
        <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-[#1c1917] sm:text-4xl">
          Bismillah Chicken Centre
        </h1>
        <p className="mt-2 text-sm font-medium text-[#57534e]">Smart Poultry Desk</p>
      </div>
    </div>
  );
}

export default Splash;
