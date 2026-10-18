// about-overlay.js
// Öffnet die About-Seite als Overlay über der aktuellen Seite,
// statt zu ihr zu navigieren. Der Inhalt wird direkt aus about.html geladen,
// du pflegst ihn also weiterhin nur an einer Stelle.

(function () {
  const link = document.querySelector(".nav-about");
  if (!link) return;

  const aboutUrl = new URL(link.getAttribute("href"), location.href);

  // Auf der About-Seite selbst: normales Verhalten, kein Overlay
  if (aboutUrl.pathname === location.pathname) return;

  let overlay = null;

  async function buildOverlay() {
    const res = await fetch(aboutUrl);
    if (!res.ok) throw new Error("About-Seite nicht gefunden");

    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, "text/html");
    const main = doc.querySelector("main");
    if (!main) throw new Error("Kein <main> in about.html");

    // Relative Pfade (Bilder, Links) auf den Ordner der About-Seite beziehen,
    // sonst findet z. B. eine Projektseite "media/bild.jpg" nicht.
    main.querySelectorAll("[src]").forEach((el) => {
      el.src = new URL(el.getAttribute("src"), aboutUrl).href;
    });
    main.querySelectorAll("a[href]").forEach((el) => {
      el.href = new URL(el.getAttribute("href"), aboutUrl).href;
    });

    overlay = document.createElement("div");
    overlay.className = "about-overlay";
    overlay.setAttribute("role", "dialog");
    overlay.setAttribute("aria-modal", "true");
    overlay.setAttribute("aria-label", "About");

    const closeBtn = document.createElement("button");
    closeBtn.className = "about-close";
    closeBtn.setAttribute("aria-label", "Schliessen");
    closeBtn.textContent = "close";

    const content = document.createElement("div");
    content.className = "about-overlay-content";
    content.append(...main.childNodes);

    overlay.append(closeBtn, content);
    document.body.append(overlay);

    closeBtn.addEventListener("click", close);

    // Klick auf den leeren Hintergrund schliesst das Overlay
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay || e.target === content) close();
    });
  }

  async function open(e) {
    e.preventDefault();

    try {
      if (!overlay) await buildOverlay();
    } catch (err) {
      // Falls etwas schiefgeht: ganz normal zur About-Seite wechseln
      location.href = aboutUrl.href;
      return;
    }

    // kurz warten, damit die Einblend-Animation auch beim ersten Öffnen läuft
    requestAnimationFrame(() => {
      overlay.classList.add("is-open");
      document.body.classList.add("about-open");
    });
  }

  function close() {
    overlay.classList.remove("is-open");
    document.body.classList.remove("about-open");
  }

  link.addEventListener("click", open);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && overlay && overlay.classList.contains("is-open")) {
      close();
    }
  });
})();