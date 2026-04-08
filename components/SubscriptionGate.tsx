"use client";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useRouter, usePathname } from "next/navigation";
import { DEMO_KEY, exitDemo } from "@/lib/demoStore";

const MAYA_NUMBER = "09154268766";
const FB_PAGE = "https://web.facebook.com/profile.php?id=61573480382338";

export default function SubscriptionGate({ children }: { children: React.ReactNode }) {
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  // All hooks must be called before any early return
  const [isDemo] = useState(() =>
    typeof window !== "undefined" && localStorage.getItem(DEMO_KEY) === "true"
  );
  const [status, setStatus] = useState<"loading" | "active" | "inactive">("loading");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (pathname === "/login" || isDemo) return;
    async function check() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.push("/login"); return; }
      setEmail(user.email ?? "");
      const { data } = await supabase
        .from("profiles")
        .select("is_active")
        .eq("id", user.id)
        .single();
      setStatus(data?.is_active ? "active" : "inactive");
    }
    check();
  }, [pathname, isDemo]);

  // Skip gate on login page
  if (pathname === "/login") return <>{children}</>;

  // Demo mode — bypass auth, show demo banner
  if (isDemo) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-400 text-amber-900 flex items-center justify-center gap-3 py-1.5 px-4 text-xs font-bold shadow-sm">
          <span>🎮 DEMO MODE</span>
          <span className="text-amber-600">·</span>
          <span className="font-medium">Data saved locally only · Try all features freely</span>
          <button
            onClick={() => { exitDemo(); router.push("/login"); }}
            className="ml-3 bg-amber-700 text-white px-3 py-1 rounded-full text-xs font-bold hover:bg-amber-800 active:scale-95 transition-all"
          >
            Exit Demo
          </button>
        </div>
        <div className="pt-9">{children}</div>
      </>
    );
  }

  if (status === "loading") {
    return (
      <div className="h-dvh flex items-center justify-center bg-gray-100">
        <div className="text-center space-y-3">
          <span className="text-5xl">⏳</span>
          <p className="text-gray-500 font-semibold">Loading...</p>
        </div>
      </div>
    );
  }

  if (status === "inactive") {
    return (
      <div className="h-dvh bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4 overflow-y-auto">
        <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
          <div className="bg-emerald-500 px-8 py-7 text-center">
            <span className="text-5xl">🏪</span>
            <h1 className="text-white font-bold text-2xl mt-3">GroceryPH</h1>
            <p className="text-emerald-100 text-sm mt-1">POS System</p>
          </div>

          <div className="p-8 space-y-5">
            <div className="text-center">
              <span className="text-4xl">🔒</span>
              <h2 className="text-xl font-bold text-gray-800 mt-2">Account Not Yet Active</h2>
              <p className="text-gray-500 text-sm mt-1">
                Mag-subscribe muna para magamit ang GroceryPH POS.
              </p>
            </div>

            <div className="bg-emerald-50 rounded-2xl p-5 text-center border border-emerald-100">
              <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wide">Monthly Subscription</p>
              <p className="text-4xl font-bold text-emerald-600 mt-1">₱199</p>
              <p className="text-xs text-gray-400 mt-1">per month · cancel anytime</p>
              <div className="mt-3 space-y-1 text-sm text-gray-600 text-left">
                {["✅ Full POS System", "✅ Inventory Management", "✅ Sales Transactions", "✅ Stock Alerts", "✅ Tablet-optimized"].map((f) => (
                  <p key={f}>{f}</p>
                ))}
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 border border-gray-100">
              <p className="font-bold text-gray-800 text-sm">📱 How to Subscribe:</p>
              <ol className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>I-send ng <span className="font-bold text-gray-800">₱199</span> via <span className="font-bold">Maya / GCash</span> sa:</li>
              </ol>
              <div className="bg-white rounded-xl p-3 border border-gray-200 flex justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/qr-maya.jpg" alt="Maya QR Code" className="w-48 h-48 object-contain" />
              </div>
              <ol start={2} className="space-y-2 text-sm text-gray-600 list-decimal list-inside">
                <li>I-screenshot ang payment confirmation</li>
                <li>I-send sa aming Facebook page kasama ang iyong email:</li>
              </ol>
              <div className="bg-white rounded-xl px-4 py-3 border border-gray-200 text-center">
                <p className="text-xs text-gray-400 mb-1">Iyong email</p>
                <p className="text-sm font-bold text-emerald-600 break-all">{email}</p>
              </div>
              <a
                href={FB_PAGE}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 active:scale-95 transition-all"
              >
                📘 Message us on Facebook
              </a>
              <p className="text-xs text-gray-400 text-center">
                Activation within 24 hours after payment confirmation
              </p>
            </div>

            <button
              onClick={async () => { await supabase.auth.signOut(); router.push("/login"); }}
              className="w-full py-3 rounded-2xl bg-gray-100 text-gray-500 font-semibold text-sm hover:bg-gray-200 active:scale-95 transition-all"
            >
              🚪 Sign out
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
