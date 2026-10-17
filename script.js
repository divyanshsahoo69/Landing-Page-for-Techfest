"use strict";

/* =========================================
   TECHFEST — EDITORIAL BRUTALISM
   Interactive experience controller
========================================= */

const $ = (selector, root = document) =>
  root.querySelector(selector);

const $$ = (selector, root = document) =>
  [...root.querySelectorAll(selector)];

/* =========================================
   1. MOBILE NAVIGATION
========================================= */

const menuToggle = $("#menuToggle");
const nav = $("#nav");

function closeMenu() {
  if (!menuToggle || !nav) return;

  menuToggle.setAttribute("aria-expanded", "false");
  menuToggle.setAttribute("aria-label", "Open navigation");
  nav.classList.remove("open");
  document.body.classList.remove("menu-open");
}

menuToggle?.addEventListener("click", () => {
  const opening =
    menuToggle.getAttribute("aria-expanded") !== "true";

  menuToggle.setAttribute("aria-expanded", String(opening));
  menuToggle.setAttribute(
    "aria-label",
    opening ? "Close navigation" : "Open navigation"
  );

  nav?.classList.toggle("open", opening);
  document.body.classList.toggle("menu-open", opening);
});

$$("a", nav || document).forEach((link) => {
  link.addEventListener("click", closeMenu);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeMenu();
});

document.addEventListener("click", (event) => {
  if (
    nav?.classList.contains("open") &&
    !nav.contains(event.target) &&
    !menuToggle?.contains(event.target)
  ) {
    closeMenu();
  }
});

/* =========================================
   2. PLAYGROUND FILTERS
========================================= */

const filterButtons = $$(".filter");
const playCards = $$(".play-card");
const filterStatus = $("#filterStatus");

const filterMessages = {
  all: "06 rabbit holes. Zero wrong answers.",
  build: "BUILD STUFF: Make it. Test it. Break it. Improve it.",
  think: "THINK STUFF: Follow the question wherever it leads.",
  future: "FUTURE STUFF: Imagine what comes next."
};

function filterPlayground(category) {
  let visibleCount = 0;

  playCards.forEach((card) => {
    const matches =
      category === "all" ||
      card.dataset.category === category;

    card.hidden = !matches;

    if (matches) {
      visibleCount++;

      // Re-run the entrance animation when switching categories.
      card.classList.remove("is-visible");

      if (!window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches) {
        void card.offsetWidth;
      }

      card.classList.add("is-visible");
    }
  });

  filterButtons.forEach((button) => {
    const active = button.dataset.filter === category;

    button.classList.toggle("active", active);
    button.setAttribute("aria-pressed", String(active));
  });

  if (filterStatus) {
    filterStatus.textContent =
      category === "all"
        ? filterMessages.all
        : `${visibleCount} rabbit hole${
            visibleCount === 1 ? "" : "s"
          }. ${filterMessages[category]}`;
  }
}

filterButtons.forEach((button) => {
  button.setAttribute(
    "aria-pressed",
    String(button.classList.contains("active"))
  );

  button.addEventListener("click", () => {
    filterPlayground(button.dataset.filter);
  });
});

/* =========================================
   3. SCROLL REVEALS
========================================= */

const revealElements = $$(".reveal");
const animatedCards = $$(".play-card");

const reducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if ("IntersectionObserver" in window && !reducedMotion) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,
      rootMargin: "0px 0px -30px 0px"
    }
  );

  revealElements.forEach((element) => {
    revealObserver.observe(element);
  });

  animatedCards.forEach((card, index) => {
    card.style.animationDelay = `${(index % 3) * 0.07}s`;
    revealObserver.observe(card);
  });
} else {
  [...revealElements, ...animatedCards].forEach((element) => {
    element.classList.add("is-visible");
  });
}

/* =========================================
   4. CUSTOM CURSOR GLOW
   Desktop pointers only; no external library.
========================================= */

const cursorGlow = $(".cursor-glow");

const finePointer = window.matchMedia(
  "(hover: hover) and (pointer: fine)"
).matches;

if (cursorGlow && finePointer && !reducedMotion) {
  document.body.classList.add("pointer-active");

  let pointerX = 0;
  let pointerY = 0;
  let currentX = 0;
  let currentY = 0;
  let pointerFrame = null;

  window.addEventListener(
    "pointermove",
    (event) => {
      pointerX = event.clientX;
      pointerY = event.clientY;

      if (pointerFrame !== null) return;

      pointerFrame = requestAnimationFrame(function moveGlow() {
        currentX += (pointerX - currentX) * 0.22;
        currentY += (pointerY - currentY) * 0.22;

        cursorGlow.style.left = `${currentX}px`;
        cursorGlow.style.top = `${currentY}px`;

        if (
          Math.abs(pointerX - currentX) > 0.5 ||
          Math.abs(pointerY - currentY) > 0.5
        ) {
          pointerFrame = requestAnimationFrame(moveGlow);
        } else {
          pointerFrame = null;
        }
      });
    },
    { passive: true }
  );
}

/* =========================================
   5. MAGNETIC BUTTONS
   Gentle pointer attraction on desktop.
========================================= */

const magneticButtons = $$(".magnetic");

if (finePointer && !reducedMotion) {
  magneticButtons.forEach((button) => {
    button.addEventListener("pointermove", (event) => {
      const rect = button.getBoundingClientRect();

      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;

      button.style.transform =
        `translate(${x * 0.07}px, ${y * 0.12}px)`;
    });

    button.addEventListener("pointerleave", () => {
      button.style.transform = "";
    });
  });
}

/* =========================================
   6. BACK-TO-TOP BUTTON
========================================= */

const backToTop = $("#backToTop");

function updateScrollControls() {
  const show = window.scrollY > 500;

  backToTop?.classList.toggle("visible", show);
}

window.addEventListener("scroll", updateScrollControls, {
  passive: true
});

updateScrollControls();

backToTop?.addEventListener("click", () => {
  window.scrollTo({
    top: 0,
    behavior: reducedMotion ? "auto" : "smooth"
  });
});

/* =========================================
   7. HERO TITLE ENTRANCE
========================================= */

const heroTitle = $(".hero-title");

if (heroTitle && !reducedMotion) {
  heroTitle.animate(
    [
      {
        opacity: 0,
        transform: "translateY(18px)"
      },
      {
        opacity: 1,
        transform: "translateY(0)"
      }
    ],
    {
      duration: 850,
      easing: "cubic-bezier(0.2, 0.8, 0.2, 1)",
      fill: "both"
    }
  );
}

/* =========================================
   8. INTERACTIVE PLAY CARD TILT
   Small 2D movement, not 3D.
========================================= */

const tiltCards = $$(".play-card");

if (finePointer && !reducedMotion) {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      if (card.hidden) return;

      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width;
      const y = (event.clientY - rect.top) / rect.height;

      const moveX = (x - 0.5) * 3;
      const moveY = (y - 0.5) * -3;

      card.style.translate = `${moveX}px ${moveY}px`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.translate = "";
    });
  });
}

/* =========================================
   9. FOOTER YEAR
========================================= */

const footerYear = $(".footer-bottom");

if (footerYear) {
  const yearLabel = footerYear.lastElementChild;

  if (yearLabel) {
    yearLabel.textContent =
      `© ${new Date().getFullYear()} · MADE FOR THE CURIOUS.`;
  }
}

/* =========================================
   10. EXTERNAL LINK SAFETY
========================================= */

$$('a[target="_blank"]').forEach((link) => {
  link.setAttribute("rel", "noopener noreferrer");
});

/* =========================================
   READY
========================================= */

document.documentElement.classList.add("js-ready");

console.info(
  "TECHFEST® concept loaded. Think loud. Build different."
);