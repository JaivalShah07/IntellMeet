import { useEffect, useState, useRef } from "react";
import { Brain, FileText, ListChecks, Sparkles, Loader2, Wand2, Download, Upload } from "lucide-react";
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    api
      .get("/ai/insights")
      .then((res) => setPastInsights(res.data.insights))
      .finally(() => setLoading(false));
  }, []);

  const runAnalysisForText = async (textToAnalyze: string) => {
    setAnalyzing(true);
    try {
      const { data } = await api.post("/ai/analyze", {
        transcript: textToAnalyze,
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

  const runAnalysis = () => runAnalysisForText(transcript);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      if (text) {
        setTranscript(text);
        await runAnalysisForText(text);
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const exportTxtFile = (filename: string, content: string) => {
    const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold">Meeting transcript</h2>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-xs text-sky-600 hover:text-sky-700 flex items-center gap-1 font-semibold transition-colors"
                title="Import Transcript"
              >
                <Upload className="w-3.5 h-3.5" /> Import TXT
              </button>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileImport}
                accept=".txt"
                className="hidden"
              />
            </div>
            <textarea
              value={transcript}
              onChange={(e) => setTranscript(e.target.value)}
              rows={8}
              className="w-full p-4 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-sm font-mono"
            />
          </div>

          <div className="card-elevated rounded-2xl p-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="font-bold flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-500" />
                AI summary
              </h2>
              {summary && (
                <button
                  onClick={() => {
                    const content = `MEETING SUMMARY\n====================\n\n${summary}\n\nSentiment: ${sentiment}%\n\nACTION ITEMS:\n${actionItems.map((item, idx) => `- [ ] ${item.title}`).join("\n")}`;
                    exportTxtFile("Meeting_Summary_Report.txt", content);
                  }}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold transition-colors"
                  title="Export Summary & Action Items"
                >
                  <Download className="w-3.5 h-3.5" /> Export Report
                </button>
              )}
            </div>
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
                  className="p-4 rounded-xl border border-gray-100 dark:border-gray-800 flex justify-between items-start gap-4 hover:border-sky-500/30 transition-all"
                >
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white">{m.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">{m.summary}</p>
                    {m.sentimentScore !== undefined && (
                      <span className="text-xs text-emerald-600 dark:text-emerald-400 font-bold mt-2 block">
                        Sentiment: {m.sentimentScore}% positive
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => {
                      const content = `PAST MEETING ANALYSIS\n====================\nMeeting: ${m.title}\nSummary: ${m.summary}\nSentiment: ${m.sentimentScore || "N/A"}%`;
                      exportTxtFile(`${m.title.replace(/\s+/g, "_")}_Summary.txt`, content);
                    }}
                    className="p-2.5 rounded-xl bg-gray-50 hover:bg-gray-100 dark:bg-gray-850 dark:hover:bg-gray-800 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors border border-gray-200/50 dark:border-gray-800 shrink-0 shadow-sm"
                    title="Download Report"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
