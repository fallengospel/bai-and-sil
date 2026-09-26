"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function ProfileMePage() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => router.replace("/login"), 8000);
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        clearTimeout(timer);
        if (data.user?.id) {
          router.replace(`/profile/${data.user.id}`);
        } else {
          router.replace("/login");
        }
      })
      .catch(() => {
        clearTimeout(timer);
        router.replace("/login");
      });
    return () => clearTimeout(timer);
  }, [router]);

  return <LoadingSpinner text="Loading your profile..." className="py-16" />;
}
