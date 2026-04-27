export function AboutPage({ t = (key, fallback) => fallback }) {
  return (
    <section className="panel">
      <h2>{t("pages.about.title", "Par mums")}</h2>
      <p className="muted">{t("pages.about.subtitle", "Seit vari ielikt savu tekstu par projektu, komandu un platformas merkjiem.")}</p>
    </section>
  );
}
