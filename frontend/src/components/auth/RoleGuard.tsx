"use client";

import { useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { useRouter, usePathname } from "next/navigation";
import { getUser } from "@/lib/api";

export function RoleGuard() {
  const { token, isLoaded, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoaded || !isAuthenticated || !token) return;

    // We fetch the user profile to check their role
    getUser(token)
      .then((user) => {
        // If they are a technician and trying to access the normal dashboard, redirect to mobile view
        if (user.role === "technician" && !pathname.startsWith("/mobile")) {
          router.replace("/mobile/jobs");
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user role for redirection", err);
      });
  }, [token, isLoaded, isAuthenticated, pathname, router]);

  return null;
}
