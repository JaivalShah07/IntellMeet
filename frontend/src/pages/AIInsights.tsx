import { useEffect, useState } from "react";
import { Brain, FileText, ListChecks, Sparkles, Loader2, Wand2 } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import api from "../lib/api";

const SAMPLE_TRANSCRIPT = `Alex: Let's review the Q3 roadmap — I'm excited about what we can ship.
Sarah: I'll share design mockups by Friday.
Alex: Rahul will finish the frontend API integration by Friday.
Sarah: Schedule a client demo for next Tuesday with the Acme team.`;

export default function AIInsights() {
  const [transcript, setTranscript] = useState(SAMPLE_TRANSCRIPT);
  const [summary, setSummary] = useState("");
  const [sentiment, setSentiment] = useState<number | null>(null);
  const [actionItems, setActionItems] = useState<{ title: string }[]>([]);
  const [pastInsights, setPastInsights] = useState<
    { title: string; summary: string; sentimentScore?: number }[]
  >([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get("/ai/insights")
      .then((res) => setPastInsights(res.data.insights))
      .finally(() => setLoading(false));
  }, []);

  const runAnalysis = async () => {
    setAnalyzing(true);
    try {
      const { data } = await api.post("/ai/analyze", {
        transcript,
        meetingTitle: "Product Sync",
      });
      setSummary(data.summary);
      setSentiment(data.sentimentScore);
      setActionItems(data.actionItems);
      const refreshed = await api.get("/ai/insights");
      setPastInsights(refreshed.data.insights);
    } catch {
      alert("AI analysis failed. Is the backend running?");
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="min-h-full mesh-bg p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        <PageHeader
          title="AI Insights"
          subtitle="F-03: Transcription → summary → action items (OpenAI-ready pipeline)."
          icon={Brain}
          action={
            <button
              onClick={runAnalysis}
              disabled={analyzing}
              className="btn-primary inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold disabled:opacity-70"
            >
              {analyzing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Wand2 className="w-4 h-4" />
              )}
              Run AI analysis
            </button>
          }
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-elevated rounded-2xl p-6">
            <h2 className="font-bold mb-3">Meeting transcript</h2>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
            />
          </div>

          <div className="card-elevated rounded-2xl p-6">
            <h2 className="font-bold flex items-center gap-2 mb-3">
              <FileText className="w-5 h-5 text-indigo-500" />
              AI summary
            </h2>
            <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
              {summary || "Click Run AI analysis to generate an enterprise summary."}
            </p>
            {sentiment !== null && (
              <p className="mt-4 text-sm font-bold text-emerald-600">
                Team sentiment: {sentiment}% positive
              </p>
            )}
          </div>
        </div>

        <div className="card-elevated rounded-2xl p-6">
          <h2 className="font-bold flex items-center gap-2 mb-4">
            <ListChecks className="w-5 h-5 text-emerald-500" />
            Extracted action items
          </h2>
          {actionItems.length === 0 ? (
            <p className="text-gray-500 text-sm">Action items appear after AI analysis.</p>
          ) : (
            <ul className="space-y-2">
              {actionItems.map((item, i) => (
                <li
                  key={i}
                  className="p-3 rounded-xl bg-sky-50 dark:bg-sky-500/10 border border-sky-100 dark:border-sky-500/20 text-sm font-medium"
                >
                  {item.title}
                </li>
              ))}
            </ul>
          )}
        </div>

        {!loading && pastInsights.length > 0 && (
          <div className="card-elevated rounded-2xl p-6">
            <h2 className="font-bold flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5" />
              Past meeting intelligence
            </h2>
            <div className="space-y-4">
              {pastInsights.map((m, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-800"
                >
                  <h4 className="font-semibold">{m.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{m.summary}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
