export function OnboardingPage() {
  return (
    <section className="panel">
      <h2>Onboarding</h2>
      <p className="muted">Atrā starta ceļš jaunam lietotājam.</p>
      <div className="kpi-grid">
        <article className="card">
          <h3>1</h3>
          <p>Izveido kontu un izvēlies lomu</p>
        </article>
        <article className="card">
          <h3>2</h3>
          <p>Augšupielādē relīzi vai izvērtē citu relīzes</p>
        </article>
        <article className="card">
          <h3>3</h3>
          <p>Skaties statistiku, komentārus un leaderboard</p>
        </article>
      </div>
    </section>
  );
}
