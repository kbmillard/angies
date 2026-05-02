import { useEffect } from "react";

/**
 * Prevents the page behind modals from scrolling (including iOS Safari overscroll).
 * Restores scroll position on unlock.
 */
export function useScrollLock(locked: boolean): void {
  useEffect(() => {
    if (!locked || typeof document === "undefined") return undefined;

    const html = document.documentElement;
    const body = document.body;
    const scrollY = window.scrollY;

    const prevHtmlOverflow = html.style.overflow;
    const prevBodyOverflow = body.style.overflow;
    const prevBodyPosition = body.style.position;
    const prevBodyTop = body.style.top;
    const prevBodyWidth = body.style.width;
    const prevBodyLeft = body.style.left;
    const prevBodyRight = body.style.right;
    const prevBodyTouchAction = body.style.touchAction;

    html.style.overflow = "hidden";
    body.style.overflow = "hidden";
    body.style.touchAction = "none";
    body.style.position = "fixed";
    body.style.top = `-${scrollY}px`;
    body.style.left = "0";
    body.style.right = "0";
    body.style.width = "100%";

    return () => {
      html.style.overflow = prevHtmlOverflow;
      body.style.overflow = prevBodyOverflow;
      body.style.touchAction = prevBodyTouchAction;
      body.style.position = prevBodyPosition;
      body.style.top = prevBodyTop;
      body.style.width = prevBodyWidth;
      body.style.left = prevBodyLeft;
      body.style.right = prevBodyRight;
      window.scrollTo(0, scrollY);
    };
  }, [locked]);
}
