"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

type Mode = "login" | "signup";

export default function LoginPage() {
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [storeName, setStoreName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setError("");
    setMessage("");
    if (!email || !password) { setError("Email at password ay required."); return; }
    if (mode === "signup" && password.length < 6) { setError("Password dapat ay 6 characters man lang."); return; }

    setLoading(true);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError("Mali ang email o password."); setLoading(false); return; }
      router.push("/");
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { store_name: storeName || "My Grocery" } },
      });
      if (error) { setError(error.message); setLoading(false); return; }
      setMessage("Account created! Check your email to confirm, then log in.");
      setMode("login");
    }

    setLoading(false);
  };

  return (
    <div className="h-dvh bg-gradient-to-br from-emerald-50 to-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 px-8 py-8 text-center">
          <span className="text-5xl">🏪</span>
          <h1 className="text-white font-bold text-2xl mt-3">GroceryPH</h1>
          <p className="text-emerald-100 text-sm mt-1">Point of Sale System</p>
        </div>

        <div className="p-8 space-y-4">
          {/* Mode Toggle */}
          <div className="grid grid-cols-2 bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => { setMode("login"); setError(""); setMessage(""); }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "login" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
            >
              Log In
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
              className={`py-2.5 rounded-xl text-sm font-bold transition-all ${mode === "signup" ? "bg-white shadow text-gray-800" : "text-gray-500"}`}
            >
              Sign Up
            </button>
          </div>

          {/* Store Name (signup only) */}
          {mode === "signup" && (
            <div>
              <label className="text-sm font-semibold text-gray-900 block mb-1">Store Name</label>
              <input
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="e.g. Aling Nena's Store"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Password */}
          <div>
            <label className="text-sm font-semibold text-gray-900 block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-emerald-400"
            />
          </div>

          {/* Error / Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-semibold px-4 py-3 rounded-xl">
              ⚠️ {error}
            </div>
          )}
          {message && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-semibold px-4 py-3 rounded-xl">
              ✅ {message}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4 rounded-2xl bg-emerald-500 text-white font-bold text-base hover:bg-emerald-600 active:scale-95 transition-all disabled:opacity-60 shadow-lg shadow-emerald-200"
          >
            {loading ? "Please wait..." : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>
      </div>
    </div>
  );
}
