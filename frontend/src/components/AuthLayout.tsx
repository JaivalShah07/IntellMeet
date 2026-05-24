import { Link } from "react-router-dom";
import { Sparkles, TrendingUp, Heart, Video } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { type ReactNode } from "react";

const highlights = [
  { icon: TrendingUp, text: "Teams report 40% faster follow-ups" },
  { icon: Sparkles, text: "AI summaries ready the moment you hang up" },
  { icon: Heart, text: "Built for clarity, energy, and great collaboration" },
];

interface AuthLayoutProps {
  children: ReactNode;
  title: string;
  subtitle: string;
}

export default function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen mesh-bg flex">
      <div className="hidden lg:flex lg:w-[48%] relative overflow-hidden bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-500 p-12 flex-col justify-between text-white">
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white/20 rounded-full blur-3xl animate-float" />
          <div
            className="absolute bottom-20 right-10 w-96 h-96 bg-amber-300/20 rounded-full blur-3xl animate-float"
            style={{ animationDelay: "1.5s" }}
          />
        </div>

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-2 text-xl font-extrabold">
            <Video className="w-7 h-7" />
            IntellMeet
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <p className="text-sky-100 text-sm font-semibold uppercase tracking-wider mb-3">
              Your best meetings start here
            </p>
            <h2 className="text-4xl font-extrabold leading-tight">
              Every call is a chance to move forward — together.
            </h2>
          </div>
          <ul className="space-y-4">
            {highlights.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-white/95">
                <span className="p-2 rounded-lg bg-white/15 backdrop-blur-sm">
                  <Icon className="w-5 h-5" />
                </span>
                <span className="font-medium">{text}</span>
              </li>
            ))}
          </ul>
        </div>

        <p className="relative z-10 text-sm text-white/70">
          Trusted by product, design, and remote teams worldwide.
        </p>
      </div>

      <div className="flex-1 flex flex-col min-h-screen">
        <div className="flex justify-end p-6">
          <ThemeToggle />
        </div>
        <div className="flex-1 flex items-center justify-center px-6 pb-12">
          <div className="w-full max-w-md animate-fade-in">
            <div className="lg:hidden text-center mb-8">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-lg font-extrabold gradient-text"
              >
                <Video className="w-6 h-6 text-sky-500" />
                IntellMeet
              </Link>
            </div>
            <div className="glass-card rounded-3xl p-8 md:p-10">
              <div className="text-center mb-8">
                <h1 className="text-3xl font-extrabold gradient-text">{title}</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{subtitle}</p>
              </div>
              {children}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
