import { useEffect, useRef } from "react";

/**
 * KEEP THE KEYBOARD INSIDE AN OPEN PANEL, AND PUT IT BACK WHERE IT CAME FROM.
 *
 * ⚠️ WHAT THIS FIXES, MEASURED ON THE LIVE SITE. With the Everything directory
 * open — a panel covering the whole screen with thirty links in it — the next
 * Tab after the button that opened it landed on "SYSTEM", a breadcrumb link on
 * the page UNDERNEATH the panel. A keyboard visitor opened the site's main
 * directory and then tabbed, invisibly, through the page behind it. The thirty
 * links they had just asked for could only be reached by tabbing backwards.
 *
 * Nothing on screen showed this. The panel looked completely normal; the focus
 * ring was simply somewhere nobody could see, because it was behind an opaque
 * sheet. This is the same shape of fault as the invisible focus ring: the
 * keyboard was working perfectly and pointing at nothing.
 *
 * ⚠️ `document.activeElement` IS NOT ENOUGH TO TEST THIS, AND `el.focus()` IS
 * NOT A TAB PRESS. Checking that a panel focuses itself on open proves only
 * the first step; the escape happens at the END of the cycle. Chrome also does
 * not match `:focus-visible` for a programmatic focus. scripts/trapcheck.mjs
 * therefore presses real Tab keys the whole way round, and plants an untrapped
 * overlay first to prove it can still see one.
 *
 * WHAT IT DOES
 *   · moves focus into the panel when it opens (the given element, else the
 *     first thing in it that can take focus)
 *   · cycles Tab and Shift+Tab inside the panel rather than letting either
 *     fall through to the page behind
 *   · returns focus to whatever was focused before, when it closes — so the
 *     visitor is put back on the button they pressed, not at the top of the
 *     document
 *
 * It deliberately does NOT handle Escape: the panels here already close on
 * Escape with their own listener, and two listeners for one key is how a
 * keypress ends up closing two things at once.
 */
const FOCUSABLE = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
].join(',');

export function useFocusTrap<T extends HTMLElement>(active: boolean) {
  const ref = useRef<T>(null);
  /* Captured on the way IN, not read on the way out: by the time the panel
     closes, the element may be gone from the document and document.activeElement
     is already <body>. */
  const returnTo = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!active) return;
    returnTo.current = document.activeElement as HTMLElement | null;

    const visible = () => {
      const root = ref.current;
      if (!root) return [] as HTMLElement[];
      return (Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE)))
        /* offsetParent is null for display:none and for anything inside it —
           a list that includes a hidden control sends the keyboard nowhere. */
        .filter((el) => el.offsetParent !== null || getComputedStyle(el).position === 'fixed');
    };

    /* The panel animates in, so the first frame may hold nothing focusable
       yet. One frame later it does. */
    const id = requestAnimationFrame(() => {
      const stops = visible();
      /* ⚠️ THE FIRST TAB STOP IS NOT ALWAYS THE RIGHT ONE. In the search panel
         it is the close button, and the thing a visitor came for is the search
         box — landing them on "close" would be worse than no trap at all. A
         panel says where it wants the keyboard with data-autofocus; otherwise
         the first stop is the sensible default. */
      const wanted = ref.current?.querySelector<HTMLElement>('[data-autofocus]');
      (wanted ?? stops[0] ?? ref.current)?.focus();
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;
      const stops = visible();
      if (!stops.length) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const here = document.activeElement as HTMLElement | null;

      /* Focus can be outside the panel entirely — the page behind may have
         been clicked. Pull it back rather than doing nothing. */
      if (!here || !ref.current?.contains(here)) {
        e.preventDefault();
        (e.shiftKey ? last : first).focus();
        return;
      }
      if (e.shiftKey && here === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && here === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => {
      cancelAnimationFrame(id);
      document.removeEventListener('keydown', onKeyDown);
      /* Only if it is still on the page — a panel that navigated somewhere
         must not drag focus back to a button that no longer exists. */
      const back = returnTo.current;
      if (back && document.contains(back)) back.focus();
    };
  }, [active]);

  return ref;
}
