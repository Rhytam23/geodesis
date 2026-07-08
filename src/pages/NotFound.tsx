import { Link, useLocation } from 'react-router-dom';
import { MapPin, ArrowLeft } from 'lucide-react';

/**
 * NotFound — 404 page
 *
 * Displayed for any unrecognised route. Provides clear navigation back to
 * meaningful parts of the application.
 */
export default function NotFound() {
  const location = useLocation();

  return (
    <div
      className="min-h-screen bg-slate-50 flex items-center justify-center px-6"
      role="main"
      aria-labelledby="not-found-title"
    >
      <div className="text-center max-w-md">
        <div
          className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-6"
          aria-hidden="true"
        >
          <MapPin className="w-8 h-8" />
        </div>

        <h1
          id="not-found-title"
          className="text-6xl font-semibold tracking-tighter text-slate-900 mb-3"
        >
          404
        </h1>

        <h2 className="text-xl font-medium text-slate-700 mb-3">Page not found</h2>

        <p className="text-slate-500 text-sm mb-2">
          The path{' '}
          <code className="bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 text-xs font-mono">
            {location.pathname}
          </code>{' '}
          does not exist in Geodesis.
        </p>
        <p className="text-slate-500 text-sm mb-8">
          Perhaps you were looking for the interactive map or mission control?
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 bg-primary hover:bg-emerald-800 text-white font-medium rounded-2xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2"
          >
            <ArrowLeft className="w-4 h-4" aria-hidden="true" />
            Go to Home
          </Link>
          <Link
            to="/workspace"
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 border border-slate-300 hover:bg-slate-100 font-medium rounded-2xl text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-slate-400 focus:ring-offset-2"
          >
            Open Workspace
          </Link>
        </div>
      </div>
    </div>
  );
}
