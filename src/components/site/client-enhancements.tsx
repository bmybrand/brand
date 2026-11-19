"use client";

import { useEffect } from "react";
import gsap from "gsap";

export function ClientEnhancements() {
  useEffect(() => {
    const button = document.querySelector<HTMLButtonElement>("nav button[type='button']");
    const menu = document.querySelector<HTMLElement>(".mobile-menu");
    const bars = button ? Array.from(button.querySelectorAll<HTMLElement>("span")) : [];
    const items = menu ? Array.from(menu.querySelectorAll<HTMLElement>(".mobile-item")) : [];
    let open = false;

    const menuTimeline = menu
      ? gsap
          .timeline({
            paused: true,
            onStart: () => gsap.set(menu, { autoAlpha: 1, pointerEvents: "auto" }),
            onReverseComplete: () => gsap.set(menu, { autoAlpha: 0, pointerEvents: "none" }),
          })
          .fromTo(menu, { y: -10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.28, ease: "power3.out" })
          .fromTo(items, { y: -6, opacity: 0 }, { y: 0, opacity: 1, duration: 0.22, stagger: 0.04 }, "-=0.15")
      : null;

    const toggleMenu = () => {
      if (!menu) return;
      open = !open;
      button?.setAttribute("aria-expanded", String(open));
      open ? menuTimeline?.play() : menuTimeline?.reverse();
      if (bars.length === 3) {
        gsap.to(bars[0], { y: open ? 8 : 0, rotate: open ? 45 : 0, duration: 0.22 });
        gsap.to(bars[1], { opacity: open ? 0 : 1, duration: 0.15 });
        gsap.to(bars[2], { y: open ? -8 : 0, rotate: open ? -45 : 0, duration: 0.22 });
      }
    };

    const closeMenu = () => {
      if (open) toggleMenu();
    };

    button?.setAttribute("aria-expanded", "false");
    button?.setAttribute("aria-label", "Toggle navigation");
    button?.addEventListener("click", toggleMenu);
    items.forEach((item) => item.addEventListener("click", closeMenu));

    return () => {
      button?.removeEventListener("click", toggleMenu);
      items.forEach((item) => item.removeEventListener("click", closeMenu));
      menuTimeline?.kill();
    };
  }, []);

  return null;
}
