import { SCROLL, SCROLL_KEYFRAMES } from './config.js';

/**
 * Initialize all GSAP ScrollTrigger animations
 * @param {object} scrollState - The scroll animation state object from scene.js
 */
export function init(scrollState) {
  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // ——— Animate text sections ———
  document.querySelectorAll('.section').forEach(sec => {
    const h = sec.querySelector('h2');
    const p = sec.querySelector('p');
    const rot = sec.querySelector('.rotating-subtitle');

    if (h) {
      gsap.to(h, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 70%',
          end: 'top 30%',
          scrub: false,
        },
      });
    }

    if (p) {
      gsap.to(p, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.15,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 65%',
          end: 'top 25%',
          scrub: false,
        },
      });
    }

    if (rot) {
      gsap.to(rot, {
        opacity: 1,
        y: 0,
        duration: 0.8,
        delay: 0.25,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sec,
          start: 'top 70%',
          end: 'top 30%',
          scrub: false,
        },
      });
    }
  });

  // ——— Animate about-text ———
  gsap.to('.about-text', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    delay: 0.2,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#sec-features',
      start: 'top 65%',
      scrub: false,
    },
  });

  // ——— Animate works section title ———
  gsap.to('#sec-works .section-title', {
    opacity: 1,
    y: 0,
    duration: 0.8,
    ease: 'power2.out',
    scrollTrigger: {
      trigger: '#sec-works',
      start: 'top 70%',
      scrub: false,
    },
  });

  // ——— Animate work cards staggered ———
  gsap.utils.toArray('.work-card').forEach((card, i) => {
    gsap.to(card, {
      opacity: 1,
      y: 0,
      duration: 0.7,
      ease: 'power2.out',
      scrollTrigger: {
        trigger: card,
        start: 'top 80%',
        scrub: false,
      },
      delay: i * 0.1,
    });
  });

  // ——— Hide hero content when scrolling away ———
  // This prevents text/torus overlap during the Hero→About transition
  gsap.to('#sec-hero h2, #sec-hero .cta-portal, #sec-hero .rotating-subtitle', {
    opacity: 0,
    y: -60,
    scrollTrigger: {
      trigger: '#sec-hero',
      start: 'top top',
      end: '20% top',
      scrub: true,
    },
  });

  // ——— Hide scroll hint on scroll ———
  gsap.to('#scrollHint', {
    opacity: 0,
    scrollTrigger: {
      trigger: '#sec-features',
      start: 'top bottom',
      end: 'top 80%',
      scrub: true,
    },
  });

  // ——— Main scroll timeline with keyframe transitions ———
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '.scroll-container',
      start: 'top top',
      end: 'bottom bottom',
      scrub: SCROLL.scrub,
    },
  });

  // Add all 5 keyframe transitions from config.
  // Per-segment easing (power2.inOut) сглаживает стыки между секциями —
  // линейный 'none' давал резкие смены скорости на каждом keyframe-границе.
  SCROLL_KEYFRAMES.forEach((keyframe) => {
    const { duration, ...animationProps } = keyframe;
    tl.to(scrollState, {
      ...animationProps,
      ease: 'power2.inOut',
      duration,
    });
  });
}
