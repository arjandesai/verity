import { useEffect, useState } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

/** True on small screens or actual mobile devices - used to switch to the mobile-optimized layout. */
export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === "undefined") return false;
    const uaMobile = /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
    return uaMobile || window.matchMedia(MOBILE_QUERY).matches;
  });

  useEffect(() => {
    const mql = window.matchMedia(MOBILE_QUERY);
    const update = () => setIsMobile(mql.matches || /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent));
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, []);

  return isMobile;
}
