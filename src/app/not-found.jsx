import Link from "next/link";

export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-6 text-center font-sans text-slate-900">
        <div className="max-w-md w-full bg-white border border-slate-200 shadow-xl rounded-2xl p-8 space-y-6">
          <h1 className="text-5xl font-extrabold text-teal-600">404</h1>
          <h2 className="text-xl font-bold">Page Not Found</h2>
          <p className="text-sm text-slate-500">The requested address does not exist on Lumina Dental System.</p>
          <div>
            <Link
              href="/en/login"
              className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-semibold transition-colors"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}
