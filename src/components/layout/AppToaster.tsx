"use client";

import { useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";

export default function AppToaster() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");
    const update = () => setIsMobile(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return (
    <Toaster
      position={isMobile ? "top-center" : "top-right"}
      containerStyle={isMobile ? { top: 72 } : undefined}
      toastOptions={{ duration: 4000 }}
    />
  );
}
