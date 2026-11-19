"use client";

import { useLayoutEffect } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

type AnimatedElement = HTMLElement | SVGPathElement | SVGRectElement;

function childrenAfter(selector: string): HTMLElement[] {
  const heading = document.querySelector<HTMLElement>(selector);
  const container = heading?.nextElementSibling;
  return container ? Array.from(container.children).filter((node): node is HTMLElement => node instanceof HTMLElement) : [];
}

function setTechnologyCardActive(cards: HTMLElement[], activeIndex: number | null) {
  const activeCardClasses = [
    "border-[rgba(53,88,218,0.2)]",
    "bg-white",
    "shadow-[0_44px_44px_rgba(55,90,217,0.09)]",
  ];
  const inactiveCardClasses = [
    "border-white",
    "bg-[linear-gradient(90deg,rgba(255,255,255,0.1)_0%,rgba(153,153,153,0.1)_100%)]",
    "shadow-[0_11px_24px_rgba(55,90,217,0.1)]",
  ];

  cards.forEach((card, index) => {
    const active = index === activeIndex;
    activeCardClasses.forEach((className) => card.classList.toggle(className, active));
    inactiveCardClasses.forEach((className) => card.classList.toggle(className, !active));

    const heading = card.querySelector<HTMLElement>("h3");
    const description = card.querySelector<HTMLElement>("p");
    heading?.classList.toggle("text-black", active);
    heading?.classList.toggle("text-white", !active);
    description?.classList.toggle("text-black", active);
    description?.classList.toggle("text-white", !active);
    description?.classList.toggle("opacity-60", active);

    const toolRow = card.querySelector<HTMLElement>("div.flex.items-center.gap-4");
    Array.from(toolRow?.children ?? []).forEach((tool) => {
      if (!(tool instanceof HTMLElement)) return;
      tool.classList.toggle("opacity-100", active);
      tool.classList.toggle("opacity-60", !active);
      const image = tool.querySelector<HTMLElement>("img");
      image?.classList.toggle("filter-none", active);
      image?.classList.toggle("brightness-0", !active);
      image?.classList.toggle("invert", !active);
      image?.classList.toggle("filter", !active);
    });
  });
}

export function SiteAnimations() {
  useLayoutEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-site-root]");
    if (!root) return;

    gsap.registerPlugin(ScrollTrigger);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      gsap.set(root.querySelectorAll(".gsap-init"), { opacity: 1, y: 0, clearProps: "transform" });
      return;
    }

    const cleanups: Array<() => void> = [];
    const replayWhenFocused = (section: Element, timeline: gsap.core.Timeline, rootMargin = "0px 0px -20% 0px") => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) timeline.restart();
          else timeline.pause(0);
        },
        { threshold: 0.01, rootMargin },
      );
      observer.observe(section);
      cleanups.push(() => observer.disconnect());
    };
    const context = gsap.context(() => {
      const nav = root.querySelector<HTMLElement>("nav.gsap-init");
      if (nav) {
        const navTimeline = gsap.timeline({ defaults: { ease: "power3.out" } });
        navTimeline
          .fromTo(nav, { y: -80, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
          .from(nav.querySelectorAll(".nav-logo"), { y: 12, opacity: 0, duration: 0.8 }, "-=0.2")
          .from(nav.querySelectorAll(".nav-link"), { y: 12, opacity: 0, duration: 0.8, stagger: 0.08 }, "-=0.25")
          .from(nav.querySelectorAll(".nav-button"), { y: 12, opacity: 0, duration: 0.8 }, "-=0.25");
      }

      if (root.querySelector(".hero-heading")) {
        gsap
          .timeline({ defaults: { ease: "power3.out" } })
          .fromTo(".hero-heading", { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
          .fromTo(".hero-text", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.55 }, "-=0.4")
          .fromTo(".hero-button", { scale: 0.7, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.45 }, "-=0.35");
      }

      const companies = childrenAfter(".companies-heading");
      const companiesSection = root.querySelector(".companies-heading")?.closest("section");
      if (companiesSection && companies.length) {
        gsap
          .timeline({
            defaults: { ease: "power3.out" },
            scrollTrigger: { trigger: companiesSection, start: "top 90%", end: "bottom 30%", toggleActions: "play none none reverse" },
          })
          .fromTo(".companies-heading", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8 })
          .fromTo(companies, { opacity: 0, scale: 0.7, y: 40 }, { y: 0, scale: 1, opacity: 1, duration: 0.5, stagger: { each: 0.06, from: "center" } }, "-=0.3");
      }

      const features = childrenAfter(".feature-heading");
      const featureHeading = root.querySelector<HTMLElement>(".feature-heading");
      const featureSection = featureHeading?.closest("section");
      if (featureSection && featureHeading && features.length) {
        const featureTargets = [featureHeading, ...features];
        const hideFeatures = () => {
          gsap.killTweensOf(featureTargets);
          gsap.set(featureHeading, { y: 30, opacity: 0 });
          gsap.set(features, { y: 35, opacity: 0 });
        };
        const playFeatures = () => {
          gsap.killTweensOf(featureTargets);
          gsap.fromTo(featureHeading, { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" });
          gsap.fromTo(
            features,
            { y: 35, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, delay: 0.2, stagger: 0.15, ease: "power3.out" },
          );
        };
        hideFeatures();
        let featuresInFocus = false;
        const featureObserver = new IntersectionObserver(
          ([entry]) => {
            if (entry.isIntersecting) {
              if (!featuresInFocus) {
                featuresInFocus = true;
                playFeatures();
              }
              return;
            }

            if (featuresInFocus) {
              featuresInFocus = false;
              hideFeatures();
            }
          },
          { threshold: 0.01, rootMargin: "-20% 0px -20% 0px" },
        );
        featureObserver.observe(featureSection);
        cleanups.push(() => featureObserver.disconnect());

        features.forEach((card) => {
          const enter = () => gsap.to(card, { scale: 1.05, rotate: 2, duration: 0.3, ease: "power3.out" });
          const leave = () => gsap.to(card, { scale: 1, rotate: 0, duration: 0.3, ease: "power3.out" });
          card.addEventListener("mouseenter", enter);
          card.addEventListener("mouseleave", leave);
          cleanups.push(() => {
            card.removeEventListener("mouseenter", enter);
            card.removeEventListener("mouseleave", leave);
          });
        });
      }

      const journeySection = root.querySelector(".journey-heading")?.closest("section");
      const journeyCards = Array.from(root.querySelectorAll<HTMLElement>(".journey-card"));
      const journeyPath = root.querySelector<SVGPathElement>("#journey-path");
      if (journeySection && journeyCards.length && journeyPath) {
        const length = journeyPath.getTotalLength();
        gsap.set(journeyPath, { strokeDasharray: length, strokeDashoffset: length });
        gsap.fromTo(journeyCards, { scale: 0.8, opacity: 0 }, {
          scale: 1,
          opacity: 1,
          stagger: 0.15,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: { trigger: journeySection, start: "top 80%", end: "bottom 50%", scrub: true },
        });

        ScrollTrigger.matchMedia({
          "(min-width: 1024px)": () => {
            journeyCards[0]?.classList.add("is-active");
            gsap.to(journeyPath, {
              strokeDashoffset: 0,
              ease: "none",
              scrollTrigger: {
                trigger: journeySection,
                start: "center center",
                end: `+=${300 * journeyCards.length}`,
                pin: true,
                scrub: 0.6,
                onUpdate: ({ progress }) => {
                  const active = Math.min(journeyCards.length - 1, Math.floor(progress * journeyCards.length));
                  journeyCards.forEach((card, index) => card.classList.toggle("is-active", index === active));
                },
              },
            });
          },
        });
      }

      const overSection = root.querySelector(".over-heading")?.closest("section");
      if (overSection) {
        const overTimeline = gsap
          .timeline({ paused: true, defaults: { ease: "power3.out" } })
          .fromTo(".over-heading", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 })
          .fromTo(".over-container", { scale: 0.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.55 }, "-=0.35")
          .fromTo(".over-icon", { opacity: 0, scale: 0.8 }, { opacity: 1, scale: 1, duration: 0.45, stagger: 0.1 }, "-=0.4")
          .fromTo(".over-inner-text", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7 });
        replayWhenFocused(overSection, overTimeline);
      }

      const techSection = root.querySelector<HTMLElement>("#services");
      const techPath = root.querySelector<SVGPathElement>("#tech-line");
      const techClip = root.querySelector<SVGRectElement>("#clip0_10_7 rect");
      if (techSection) {
        gsap
          .timeline({ scrollTrigger: { trigger: techSection, start: "top 90%", end: "top 20%", scrub: true } })
          .fromTo(".tech-container", { opacity: 0, scale: 0.96 }, { opacity: 1, scale: 1, ease: "power3.out" })
          .fromTo(".tech-heading", { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power3.out" }, 0.1)
          .fromTo(".tech-text", { opacity: 0, y: 40 }, { opacity: 1, y: 0, ease: "power3.out" }, 0.2);

        if (techPath && techClip) {
          const length = techPath.getTotalLength();
          const cardStack = techPath.closest("svg")?.parentElement;
          const techCards = Array.from(cardStack?.children ?? []).filter(
            (element): element is HTMLElement => element instanceof HTMLElement,
          );
          let activeIndex = -1;
          gsap.set(techClip, { attr: { height: 0, y: 44.001 } });
          gsap.set(techPath, { strokeDasharray: length, strokeDashoffset: length });
          setTechnologyCardActive(techCards, null);
          ScrollTrigger.create({
            trigger: techSection,
            start: "center center",
            end: `+=${350 * techCards.length}`,
            pin: true,
            scrub: true,
            anticipatePin: 1,
            onUpdate: ({ progress }) => {
              const nextIndex = Math.min(techCards.length - 1, Math.floor(progress * techCards.length));
              if (nextIndex !== activeIndex) {
                setTechnologyCardActive(techCards, nextIndex);
                activeIndex = nextIndex;
              }
              gsap.to(techClip, { attr: { height: 375 * progress }, ease: "none", overwrite: true });
              gsap.to(techPath, { strokeDashoffset: length * (1 - progress), ease: "none", overwrite: true });
            },
          });
          cleanups.push(() => setTechnologyCardActive(techCards, null));
        }
      }

      const testimonialSection = root.querySelector(".testimonial-heading")?.closest("section");
      if (testimonialSection) {
        gsap
          .timeline({ scrollTrigger: { trigger: testimonialSection, start: "top 85%", toggleActions: "play none none reverse" } })
          .fromTo(".testimonial-heading", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" })
          .fromTo(".testimonial-slide-content", { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.7, ease: "power3.out", stagger: 0.15 }, "-=0.4");
      }

      root.querySelectorAll<HTMLElement>(".founder-card").forEach((card) => {
        const enter = () => gsap.to(card, { y: -5, scale: 1.02, boxShadow: "0 20px 40px rgba(0,0,0,0.1)", duration: 0.3, ease: "power3.out" });
        const leave = () => gsap.to(card, { y: 0, scale: 1, boxShadow: "0 0 0 rgba(0,0,0,0)", duration: 0.3, ease: "power3.out" });
        card.addEventListener("mouseenter", enter);
        card.addEventListener("mouseleave", leave);
        cleanups.push(() => {
          card.removeEventListener("mouseenter", enter);
          card.removeEventListener("mouseleave", leave);
        });
      });

      const workSection = root.querySelector(".work-heading")?.closest("section");
      const workCards = Array.from(root.querySelectorAll<HTMLElement>(".work-card"));
      const workPath = root.querySelector<SVGPathElement>("#work-path");
      if (workSection && workCards.length && workPath) {
        const length = workPath.getTotalLength();
        // The SVG source runs from the bottom-right back to the top-left.
        // A negative offset reveals it from its visual top, matching page scroll direction.
        gsap.set(workPath, { strokeDasharray: length, strokeDashoffset: -length });
        gsap.fromTo(".work-heading", { y: 30, opacity: 0 }, {
          y: 0,
          opacity: 1,
          duration: 0.8,
          scrollTrigger: { trigger: workSection, start: "top 80%", end: "bottom 60%", toggleActions: "play none none reverse" },
        });
        gsap.to(workPath, {
          strokeDashoffset: 0,
          ease: "none",
          scrollTrigger: { trigger: workSection, start: "top center", end: "bottom center", scrub: true },
        });
        workCards.forEach((card, index) => {
          ScrollTrigger.create({
            trigger: card,
            start: "top center",
            end: "bottom center",
            onToggle: ({ isActive }) => isActive && workCards.forEach((item, itemIndex) => item.classList.toggle("is-active", itemIndex === index)),
          });
        });
        workCards[0]?.classList.add("is-active");
      }

      const footer = root.querySelector("footer");
      const footerCta = footer?.querySelector<HTMLElement>("section:first-child");
      const footerDetails = footer?.querySelectorAll<HTMLElement>(":scope > section")[1];
      if (footerCta) {
        gsap
          .timeline({
            scrollTrigger: {
              trigger: footerCta,
              start: "top 85%",
              scrub: true,
            },
          })
          .from(footerCta, { y: 60, opacity: 0, duration: 1, ease: "power3.out" });
      }
      if (footerDetails) {
        const footerItems = footerDetails.querySelectorAll<AnimatedElement>("div.flex-col > h2, div.flex-col > p, .footer-item");
        gsap.set(footerDetails, { y: 30, opacity: 0 });
        gsap.set(footerItems, { y: 20, opacity: 0 });
        const footerTimeline = gsap
          .timeline({ paused: true, defaults: { ease: "power3.out" } })
          .to(footerDetails, { y: 0, opacity: 1, duration: 0.45 })
          .to(footerItems, { y: 0, opacity: 1, duration: 0.55, stagger: 0.08 }, "-=0.2");
        replayWhenFocused(footerDetails, footerTimeline, "-30% 0px -30% 0px");
      }
    }, root);

    const refreshFrame = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(refreshFrame);
      cleanups.forEach((cleanup) => cleanup());
      context.revert();
    };
  }, []);

  return null;
}
