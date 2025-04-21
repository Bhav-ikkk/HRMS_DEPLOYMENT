"use client";
import { useEffect } from "react";
import { useSession, signOut } from "next-auth/react";

export default function LogoutPage() {
  const { data: session, status } = useSession();

  useEffect(() => {
    const logoutUser = async () => {
      if (status === "authenticated" && session?.user?.id) {
        console.log("Calling /api/logout for user:", session.user.id);
        try {
          const res = await fetch("/api/logout", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId: session.user.id }),
          });

          const result = await res.json();
          console.log("Logout API response:", result);

          if (!res.ok) {
            console.error("Logout API failed with status:", res.status);
          }
        } catch (err) {
          console.error("Logout API error:", err);
        }
      } else {
        console.warn("Session or user ID not available");
      }

      // Sign out after API call completes
      await signOut({ callbackUrl: "/login" });
    };

    logoutUser();
  }, [session, status]);

  return <p>Logging you out...</p>;
}