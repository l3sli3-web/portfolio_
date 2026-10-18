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

// project-nav.js
// Fügt auf jeder Projektseite zwei Pfeile über dem Header-Bild ein,
// mit denen man zum vorherigen und nächsten Projekt kommt.
// Die Reihenfolge pflegst du nur hier, in der Liste PROJECTS.

(function () {
  // Pfade relativ zum Hauptordner der Website, in der gewünschten Reihenfolge
  const PROJECTS = [
    { title: "Bümpliz",       path: "projects/bümpliz/projects_bümpliz.html" },
    { title: "Gerüchteküche", path: "projects/gerüchteküche/gerüchteküche.html" },
    { title: "Sonos",         path: "projects/sonos/projects_sonos.html" },
    { title: "Yolo Sep",      path: "projects/yolo/projects_yolo.html" }
  ];

  // Hauptordner der Website = Ordner über /js/, in dem dieses Script liegt
  const root = new URL("..", document.currentScript.src);

  // Aktuelle Seite in der Liste finden (Umlaute in der URL vorher dekodieren)
  const current = decodeURIComponent(location.pathname);
  const index = PROJECTS.findIndex((p) => current.endsWith(p.path));
  if (index === -1) return; // keine Projektseite: nichts tun

  // Vorheriges / nächstes Projekt, am Ende geht es wieder von vorne los
  const prev = PROJECTS[(index - 1 + PROJECTS.length) % PROJECTS.length];
  const next = PROJECTS[(index + 1) % PROJECTS.length];

  function makeLink(project, arrow, cls, label) {
    const a = document.createElement("a");
    a.className = "project-pager-link " + cls;
    a.href = new URL(project.path, root).href;
    a.textContent = arrow;
    a.title = label + ": " + project.title;
    a.setAttribute("aria-label", label + ": " + project.title);
    return a;
  }

  const nav = document.createElement("nav");
  nav.className = "project-pager";
  nav.setAttribute("aria-label", "Projekte durchblättern");
  nav.append(
    makeLink(prev, "←", "project-pager-prev", "Vorheriges Projekt"),
    makeLink(next, "→", "project-pager-next", "Nächstes Projekt")
  );

  // Direkt über dem Header-Bild einfügen
  const header = document.querySelector("main .header");
  if (header) {
    header.before(nav);
  } else {
    document.querySelector("main")?.prepend(nav);
  }
})();