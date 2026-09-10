import Link from "next/link";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-cream-50 flex items-center justify-center p-4">
      <div className="card max-w-md w-full p-8 text-center bg-white border border-forest-100 rounded-2xl shadow-xl space-y-4">
        <div className="w-14 h-14 mx-auto rounded-full bg-amber-100 text-amber-800 flex items-center justify-center">
          <AlertCircle size={28} />
        </div>
        <h1 className="text-2xl font-bold font-display text-forest-900">
          Page Not Found / பக்கம் கிடைக்கவில்லை
        </h1>
        <p className="text-xs text-ink-light">
          The requested page could not be located. You can safely return to your farm dashboard.
        </p>
        <p className="text-xs text-forest-700 font-medium">
          தேடிய பக்கம் கிடைக்கவில்லை. முகப்புப் பக்கத்திற்குத் திரும்பவும்.
        </p>
        <div className="pt-2 flex flex-col sm:flex-row gap-2 justify-center">
          <Link
            href="/dashboard"
            className="btn btn-primary text-xs flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl"
          >
            <Home size={14} /> Go to Dashboard / முகப்பு
          </Link>
          <Link
            href="/today"
            className="btn btn-secondary text-xs flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl"
          >
            <ArrowLeft size={14} /> Today / இன்று
          </Link>
        </div>
      </div>
    </div>
  );
}
