"use client";

import { useState, FormEvent } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    setError("");
    
    if (!username || !password) {
      setError("Username dan password harus diisi!");
      return;
    }
    
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        username: username.trim(),
        password: password.trim(),
        redirect: false,
      });

      if (result?.error) {
        setError("Username atau password salah!");
        setIsLoading(false);
      } else if (result?.ok) {
        router.push("/dashboard");
        router.refresh();
      } else {
        setError("Terjadi kesalahan. Silakan coba lagi.");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 p-4">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm">Kembali ke Beranda</span>
        </Link>

        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-indigo-600 rounded-xl mb-4">
            <span className="text-2xl font-bold text-white">SI</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">SIPENA</h1>
          <p className="text-slate-400">Sistem Pengelola Kegiatan & Absensi</p>
        </div>

        <div className="bg-white rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Login Admin</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600 font-medium">{error}</p>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Masukkan username"
                autoComplete="username"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Masukkan password"
                autoComplete="current-password"
                disabled={isLoading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl disabled:bg-indigo-400 disabled:cursor-not-allowed"
            >
              {isLoading ? "Memproses..." : "Masuk"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
