import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 text-black dark:text-white transition-all duration-300">
      
      <Navbar />

      <section className="max-w-7xl mx-auto px-6 py-24">

        <div className="text-center">

          <h1 className="text-6xl md:text-7xl font-extrabold leading-tight mb-6">
            AI Powered
            <span className="text-blue-600"> Meetings</span>
          </h1>

          <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto mb-10">
            IntellMeet helps teams collaborate smarter with
            AI-generated meeting insights, analytics, notes,
            and real-time productivity tools.
          </p>

          <div className="flex justify-center gap-6 flex-wrap">

            <button
              onClick={() => navigate("/login")}
              className="px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold shadow-lg transition-all duration-300"
            >
              Get Started
            </button>

            <button
              onClick={() => navigate("/signup")}
              className="px-8 py-4 rounded-2xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:scale-105 transition-all duration-300"
            >
              Create Account
            </button>

          </div>

        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-24">

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:scale-105 transition-all duration-300">

            <div className="text-5xl mb-4">🤖</div>

            <h2 className="text-2xl font-bold mb-3">
              AI Summaries
            </h2>

            <p className="text-gray-600 dark:text-gray-300">
              Automatically generate smart meeting summaries,
              key points, and action items.
            </p>

          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:scale-105 transition-all duration-300">

            <div className="text-5xl mb-4">📊</div>

            <h2 className="text-2xl font-bold mb-3">
              Analytics
            </h2>

            <p className="text-gray-600 dark:text-gray-300">
              Visualize productivity, engagement, and meeting
              performance with beautiful analytics.
            </p>

          </div>

          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-3xl p-8 shadow-lg hover:scale-105 transition-all duration-300">

            <div className="text-5xl mb-4">⚡</div>

            <h2 className="text-2xl font-bold mb-3">
              Real-Time Collaboration
            </h2>

            <p className="text-gray-600 dark:text-gray-300">
              Collaborate instantly with your team using live
              notes, updates, and shared meeting spaces.
            </p>

          </div>

        </div>

      </section>

    </div>
  );
}