/**
 * Builds public/full-page.html — static mirror of angieskc.com homepage.
 * Run: node scripts/generate-full-page-html.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(root, "..");

const menuJson = JSON.parse(
  fs.readFileSync(path.join(projectRoot, "public/menu/menu.json"), "utf8"),
).menu;

const CATEGORY_META = [
  {
    slug: "tacos",
    label: "Tacos",
    number: "01",
    panelKickerEn: "Street & birria",
    subtitle:
      "Street tacos, tacos de canasta, and tacos de birria — built at the window.",
    borderClass: "border-accent-red",
    image: "/menu/menu_final/tacos.png",
  },
  {
    slug: "burritos",
    label: "Burritos",
    number: "02",
    panelKickerEn: "12″ builds",
    subtitle:
      "Classic, breakfast, and California — choose your meat when it applies.",
    borderClass: "border-accent-yellow",
    image: "/menu/menu_final/Burrito.png",
  },
  {
    slug: "quesadillas",
    label: "Quesadillas",
    number: "03",
    panelKickerEn: "Melted cheese",
    subtitle: "Quesadilla and quesabirria with consommé for dipping.",
    borderClass: "border-accent-orange",
    image: "/menu/menu_final/Quesadilla.png",
  },
  {
    slug: "classics",
    label: "Classics",
    number: "04",
    panelKickerEn: "Torta & more",
    subtitle:
      "Cemita, tostada, and chilaquiles — bold plates from the classics line.",
    borderClass: "border-accent-pink",
    image: "/menu/menu_final/Cemita.png",
  },
];

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const price = (n) => `$${Number(n).toFixed(2)}`;

function itemsForSlug(slug) {
  return menuJson.categories.find((c) => c.slug === slug)?.items ?? [];
}

function menuPanelsHtml() {
  return CATEGORY_META.map((meta) => {
    const items = itemsForSlug(meta.slug);
    const itemRows = items
      .map(
        (item) => `          <article class="menu-card">
            <div class="price-row">
              <p class="item-name">${esc(item.name)}</p>
              <p class="item-price">${price(item.basePrice)}</p>
            </div>
            ${item.description ? `<p class="item-desc">${esc(item.description)}</p>` : ""}
            <div class="menu-card-actions">
              <button type="button" class="btn-add">Add</button>
              <button type="button" class="btn-checkout">Checkout</button>
            </div>
          </article>`,
      )
      .join("\n");

    return `      <div class="menu-panel ${meta.borderClass}" id="menu-${meta.slug}">
        <div class="menu-panel-grid">
          <div class="menu-panel-copy">
            <p class="nav-link">${meta.number} / ${esc(meta.panelKickerEn)}</p>
            <h3 class="menu-panel-title">${esc(meta.label)}</h3>
            <p class="menu-panel-sub">${esc(meta.subtitle)}</p>
            <div class="menu-hero-img">
              <img src="${meta.image}" alt="${esc(meta.label)}" width="640" height="480" loading="lazy" />
            </div>
          </div>
          <div class="menu-panel-items">
${itemRows}
          </div>
        </div>
      </div>`;
  }).join("\n\n");
}

const CSS = fs.readFileSync(path.join(root, "full-page-styles.css"), "utf8");

const BODY = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Angie's Food Truck | Kansas City Mexican Food Truck</title>
  <meta name="description" content="Find Angie's Food Truck in Kansas City for Mexican food, tacos, birria, burritos, aguas frescas, catering, and daily truck updates." />
  <link rel="icon" href="/icons/logo-512x512.png" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600;9..40,700&family=Playfair+Display:wght@600;700&display=swap" rel="stylesheet" />
  <style>
${CSS}
  </style>
</head>
<body>
  <div class="backdrop-fixed" aria-hidden="true"></div>

  <header class="site-header">
    <div class="nav-row">
      <nav aria-label="Primary">
        <ul class="nav-links">
          <li><a href="#menu">Menu</a></li>
          <li><a href="#locations">Location</a></li>
          <li><a href="#story">Story</a></li>
        </ul>
      </nav>
      <a href="#hero" class="nav-logo" aria-label="Angie's Food Truck">
        <img src="/icons/logo-512x512.png" alt="" width="44" height="44" />
      </a>
      <nav aria-label="Secondary">
        <ul class="nav-links">
          <li><a href="#catering">Catering</a></li>
          <li><a href="#contact">Contact</a></li>
          <li><a href="#menu" class="btn-nav-menu">Menu</a></li>
        </ul>
      </nav>
    </div>
  </header>

  <main>
    <section id="hero">
      <div class="hero-slide" aria-hidden="true"></div>
      <div class="hero-wash" aria-hidden="true"></div>
      <div class="hero-orange-glow" aria-hidden="true"></div>
      <div class="hero-inner container-wide">
        <div>
          <p class="kicker">Angie's Food Truck · Mexican food truck · Kansas City</p>
          <h1>Bold Tex-Mex flavor,<br />served fresh across Kansas City.</h1>
          <p class="hero-body">Find Angie's Food Truck near Linwood and all around Kansas City. Follow today's location and order fresh Tex-Mex favorites from the truck.</p>
        </div>
        <div class="hero-ctas">
          <a href="#menu" class="cta-primary">Menu</a>
          <a href="#locations" class="cta-glass">Find the truck</a>
          <a href="#catering" class="cta-glass span-2">Book catering / event</a>
        </div>
      </div>
    </section>

    <section id="prologue" class="section-pad">
      <div class="container">
        <div class="prologue-card">
          <h2>Welcome to Angie's Food Truck.</h2>
          <p class="text-muted">Fresh Mexican plates from the window — tacos, birria, burritos, aguas frescas, and daily specials. Follow the pin for today's stop, or book us for your next event.</p>
        </div>
      </div>
    </section>

    <section id="story" class="section-pad glass-band">
      <div class="container">
        <p class="kicker kicker-gold">Our story</p>
        <h2 class="section-h2">Mexican flavor, rolling through Kansas City.</h2>
        <blockquote class="story-quote">“You will experience bold Tex-Mex flavor without leaving Kansas City.”</blockquote>
        <blockquote class="story-quote text-muted">“We had the opportunity to have Angie's Food Truck present for one of our events. Over 100 guests raved about the food…”</blockquote>
      </div>
    </section>

    <section id="menu" class="glass-band menu-section">
      <div class="container-wide">
        <p class="kicker kicker-gold">Menu</p>
        <h2 class="section-h2">Fresh Tex-Mex plates, drinks, and daily specials.</h2>
        <p class="text-muted menu-heading-sub">Everything is built at the window — see each item for price when set in admin.</p>
        <div class="menu-panels">
${menuPanelsHtml()}
        </div>
      </div>
    </section>

    <section id="locations" class="section-pad glass-band">
      <div class="container">
        <p class="kicker kicker-gold">Current truck location</p>
        <div class="location-card">
          <h2 class="section-h2 location-title">Angie's food truck</h2>
          <p class="status-open">Open · Service until 8:00 PM</p>
          <p class="location-address">400 E Linwood Blvd<br />Kansas City, MO 64109</p>
          <p class="location-actions">
            <a class="cta-glass cta-inline" href="https://www.google.com/maps/search/?api=1&amp;query=400+E+Linwood+Blvd+Kansas+City+MO">Google Maps</a>
            <a class="cta-primary cta-inline" href="tel:+19139548745">Call / Text</a>
          </p>
        </div>
      </div>
    </section>

    <section id="social" class="section-pad glass-band">
      <div class="container container-narrow">
        <p class="kicker kicker-gold text-center">Social</p>
        <h2 class="section-h2 text-center">Follow the truck — same-day updates.</h2>
        <p class="text-muted text-center social-lead">Facebook and Instagram carry the live pin, specials, and catering highlights.</p>
        <div class="social-card">
          <p>Tag us when you order — we love resharing KC neighborhoods enjoying Angie's.</p>
          <div class="social-links">
            <a class="social-pill" href="https://www.instagram.com/angiesfoodtruck/" target="_blank" rel="noopener">Instagram (@angiesfoodtruck)</a>
            <a class="social-pill" href="https://www.facebook.com/p/Angies-food-truck-100066851974098/" target="_blank" rel="noopener">Facebook</a>
          </div>
        </div>
      </div>
    </section>

    <section id="catering" class="section-pad glass-band">
      <div class="container">
        <p class="kicker kicker-gold">Catering &amp; private events</p>
        <h2 class="section-h2">Bring the truck — bring the party.</h2>
        <p class="text-muted catering-lead">Festivals, office lunches, birthdays, and private parties — Angie's rolls up with a bright truck, Mexican favorites, aguas frescas, and a crew that keeps the line moving.</p>
      </div>
    </section>

    <section id="ready" class="glass-band section-pad final-cta">
      <div class="container container-ready">
        <p class="kicker">Ready</p>
        <h2 class="section-h2 ready-title">READY TO EAT?</h2>
        <div class="cta-row">
          <a href="#menu" class="glass-cta glass-cta-accent">Menu</a>
          <a href="/" class="glass-cta">Checkout</a>
          <a href="#catering" class="glass-cta">Truck &amp; catering request</a>
        </div>
      </div>
    </section>
  </main>

  <footer id="contact">
    <div class="container footer-grid">
      <div>
        <img src="/icons/logo-512x512.png" alt="Angie's Food Truck" width="56" height="56" class="footer-logo" />
      </div>
      <div class="footer-cols">
        <div>
          <p class="kicker">Visit</p>
          <p class="footer-line">400 E Linwood Blvd</p>
          <p class="footer-line">Linwood location</p>
          <p class="footer-line">Kansas City, MO 64109</p>
        </div>
        <div>
          <p class="kicker">Hours</p>
          <ul class="footer-hours">
            <li>Monday &amp; Tuesday</li>
            <li>10:00 AM to 2:00 PM</li>
            <li>Wednesday – Friday</li>
            <li>10:00 AM to 8:00 PM</li>
            <li>Saturday</li>
            <li>10:00 AM to 4:00 PM</li>
          </ul>
        </div>
      </div>
    </div>
  </footer>
</body>
</html>`;

let html = BODY.replace(/<\/?motion\.div/g, (m) => m.replace("motion.", ""));

const outPath = path.join(projectRoot, "public/full-page.html");
fs.writeFileSync(outPath, html);
console.log(`Wrote ${outPath} (${html.length} bytes)`);
