import { Link } from "react-router-dom";
import Logo from "./Logo";
import { Heart } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-gray-200/80 dark:border-gray-800/80 bg-white/60 dark:bg-gray-950/60 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <Logo to="/" />
            <p className="mt-4 text-gray-600 dark:text-gray-400 max-w-sm text-sm leading-relaxed">
              We believe every meeting can leave your team more connected, clear,
              and excited about what&apos;s next. That&apos;s the IntellMeet promise.
            </p>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Get started</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>
                <Link
                  to="/signup"
                  className="hover:text-sky-600 dark:hover:text-sky-400 font-medium transition-colors"
                >
                  Create free account
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-sky-600 dark:hover:text-sky-400 transition-colors"
                >
                  Sign in
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-bold text-gray-900 dark:text-white mb-3">Features</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>AI-powered summaries</li>
              <li>Uplifting analytics</li>
              <li>Live collaboration</li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
          <p>&copy; {new Date().getFullYear()} IntellMeet. All rights reserved.</p>
          <p className="flex items-center gap-1.5">
            Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> for teams who care
          </p>
        </div>
      </div>
    </footer>
  );
}
