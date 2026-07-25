import Link from "next/link";
import "./globals.css";

export default function NotFound() {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 flex items-center justify-center p-4 antialiased">
        <div className="max-w-md w-full text-center space-y-4 bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto text-2xl font-bold">
            404
          </div>
          <h1 className="text-xl font-bold text-slate-900">Page Not Found</h1>
          <p className="text-sm text-slate-500">
            The page you are looking for does not exist or has been moved.
          </p>
          <Link
            href="/en/dashboard"
            className="inline-block px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-semibold rounded-xl text-sm transition-colors shadow-xs"
          >
            Go to Dashboard
          </Link>
        </div>
      </body>
    </html>
  );
}
