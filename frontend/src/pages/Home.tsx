import { useNavigate } from "react-router-dom";
import {
  Sparkles,
  BarChart3,
  Zap,
  ArrowRight,
  CheckCircle2,
  Users,
  Star,
  Rocket,
  MessageCircle,
} from "lucide-react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  {
    icon: Sparkles,
    title: "AI Summaries",
    description:
      "Walk out of every meeting with clarity — key points and next steps, generated instantly.",
    gradient: "from-sky-500 to-blue-600",
  },
  {
    icon: BarChart3,
    title: "Bright Analytics",
    description:
      "See momentum at a glance. Celebrate wins and spot opportunities to improve together.",
    gradient: "from-indigo-500 to-violet-600",
  },
  {
    icon: Zap,
    title: "Live Collaboration",
    description:
      "Notes, chat, and updates in real time — so your team stays aligned and energized.",
    gradient: "from-emerald-500 to-teal-600",
  },
];

const stats = [
  { value: "10k+", label: "Happy teams", accent: "text-sky-600 dark:text-sky-400" },
  { value: "2M+", label: "Meetings powered", accent: "text-indigo-600 dark:text-indigo-400" },
  { value: "98%", label: "Uptime you can trust", accent: "text-emerald-600 dark:text-emerald-400" },
];

const testimonials = [
  {
    quote: "IntellMeet turned our weekly syncs from draining to genuinely productive.",
    author: "Priya S.",
    role: "Product Lead",
  },
  {
    quote: "The AI summaries save us hours — and the team actually follows up now.",
    author: "Marcus T.",
    role: "Engineering Manager",
  },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen mesh-bg text-gray-900 dark:text-gray-100">
      <Navbar />

      <section className="relative max-w-7xl mx-auto px-6 py-16 md:py-24">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="animate-slide-up">
            <p className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-sm font-semibold mb-6 border border-emerald-500/20">
              <Rocket className="w-4 h-4" />
              The future of meetings is here — and it feels great
            </p>

            <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight leading-[1.1] mb-6">
              Turn every meeting into
              <span className="block gradient-text">momentum you can feel</span>
            </h1>

            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-lg">
              IntellMeet brings AI insights, live collaboration, and uplifting analytics
              together — so your team leaves every call inspired and ready to act.
            </p>

            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => navigate("/signup")}
                className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl text-lg"
              >
                Start free — it&apos;s exciting
                <ArrowRight className="w-5 h-5" />
              </button>
              <button
                onClick={() => navigate("/login")}
                className="px-8 py-4 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white/80 dark:bg-gray-900/80 font-semibold hover:border-sky-400 dark:hover:border-sky-500 transition-all"
              >
                Sign in
              </button>
            </div>

            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600 dark:text-gray-400">
              {["Free to start", "No credit card", "Setup in 2 minutes"].map((item) => (
                <li key={item} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="relative animate-slide-up lg:pl-4" style={{ animationDelay: "0.15s" }}>
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-400/20 via-indigo-400/20 to-emerald-400/20 rounded-3xl blur-2xl animate-glow" />
            <div className="relative card-elevated rounded-3xl p-6 md:p-8 overflow-hidden">
              <div className="flex items-center justify-between mb-6">
                <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                  Today&apos;s pulse
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                  +24% productivity
                </span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "Team energy", value: 89, color: "bg-gradient-to-r from-sky-500 to-indigo-500" },
                  { label: "Action items done", value: 76, color: "bg-gradient-to-r from-indigo-500 to-violet-500" },
                  { label: "Meeting clarity", value: 94, color: "bg-gradient-to-r from-emerald-500 to-teal-500" },
                ].map((bar) => (
                  <div key={bar.label}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium">{bar.label}</span>
                      <span className="text-sky-600 dark:text-sky-400 font-bold">{bar.value}%</span>
                    </div>
                    <div className="h-2.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${bar.color}`}
                        style={{ width: `${bar.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-500/10 dark:to-indigo-500/10 border border-sky-100 dark:border-sky-500/20">
                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
                  &ldquo;Great energy in today&apos;s standup — 3 action items captured automatically.&rdquo;
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto mt-20 py-10 border-y border-gray-200/80 dark:border-gray-800/80">
          {stats.map((stat) => (
            <div key={stat.label} className="text-center">
              <p className={`text-3xl md:text-4xl font-extrabold ${stat.accent}`}>
                {stat.value}
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 font-medium">
                {stat.label}
              </p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {features.map(({ icon: Icon, title, description, gradient }) => (
            <div key={title} className="card-elevated rounded-2xl p-8 group">
              <div
                className={`inline-flex p-3.5 rounded-2xl bg-gradient-to-br ${gradient} text-white mb-5 shadow-lg group-hover:scale-105 transition-transform`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <h2 className="text-xl font-bold mb-3">{title}</h2>
              <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-16">
          {testimonials.map((t) => (
            <div
              key={t.author}
              className="card-elevated rounded-2xl p-6 flex gap-4"
            >
              <MessageCircle className="w-8 h-8 text-sky-500 shrink-0 opacity-80" />
              <div>
                <div className="flex gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 font-medium leading-relaxed">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                  <span className="font-semibold text-gray-800 dark:text-gray-200">
                    {t.author}
                  </span>
                  {" · "}
                  {t.role}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 rounded-3xl relative overflow-hidden p-10 md:p-16 text-center text-white">
          <div className="absolute inset-0 bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-500" />
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.06\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-50" />
          <div className="relative z-10">
            <Users className="w-14 h-14 mx-auto mb-5 opacity-95" />
            <h2 className="text-3xl md:text-4xl font-extrabold mb-4">
              Your next great meeting starts now
            </h2>
            <p className="text-sky-100 max-w-xl mx-auto mb-8 text-lg">
              Join thousands of teams who feel more connected, clear, and confident
              after every call.
            </p>
            <button
              onClick={() => navigate("/signup")}
              className="inline-flex items-center gap-2 px-10 py-4 rounded-xl bg-white text-indigo-700 font-bold hover:bg-sky-50 transition-colors shadow-xl text-lg"
            >
              <Rocket className="w-5 h-5" />
              Create your free account
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
