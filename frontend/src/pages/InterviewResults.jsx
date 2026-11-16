import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  Award,
  Brain,
  CheckCircle2,
  ClipboardCheck,
  Lightbulb,
  Loader2,
  RefreshCw,
  Target,
  TrendingUp,
  AlertCircle,
} from "lucide-react";

import { getInterviewResults } from "../api/evaluation";

const RECOMMENDATION_STYLES = {
  STRONG_HIRE: "border-emerald-400/20 bg-emerald-500/10 text-emerald-300",
  HIRE: "border-green-400/20 bg-green-500/10 text-green-300",
  BORDERLINE: "border-amber-400/20 bg-amber-500/10 text-amber-300",
  NO_HIRE: "border-red-400/20 bg-red-500/10 text-red-300",
};

function AssessmentCard({ title, description, icon: Icon }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400">
          <Icon className="h-5 w-5" />
        </div>

        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      <p className="text-sm leading-7 text-slate-400">
        {description || "No assessment available."}
      </p>
    </div>
  );
}

function FeedbackList({ title, items, positive }) {
  const Icon = positive ? CheckCircle2 : Target;

  return (
    <div className="rounded-2xl border border-white/10 bg-slate-900/70 p-5">
      <div className="mb-4 flex items-center gap-2">
        <Icon
          className={`h-5 w-5 ${
            positive ? "text-emerald-400" : "text-amber-400"
          }`}
        />

        <h3 className="font-semibold text-white">{title}</h3>
      </div>

      {items?.length ? (
        <ul className="space-y-3">
          {items.map((item, index) => (
            <li
              key={`${index}-${item}`}
              className="flex items-start gap-3 text-sm leading-6 text-slate-400"
            >
              <span
                className={`mt-2 h-1.5 w-1.5 shrink-0 rounded-full ${
                  positive ? "bg-emerald-400" : "bg-amber-400"
                }`}
              />
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-slate-500">No information available.</p>
      )}
    </div>
  );
}

function LoadingView() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080D1A] px-4">
      <div className="text-center">
        <Loader2 className="mx-auto h-10 w-10 animate-spin text-indigo-400" />

        <h2 className="mt-5 text-lg font-semibold text-white">
          Loading your results
        </h2>

        <p className="mt-2 text-sm text-slate-400">
          Retrieving your interview evaluation...
        </p>
      </div>
    </div>
  );
}

export default function InterviewResults() {
  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchResults = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getInterviewResults(interviewId);
      setResults(data);
    } catch (err) {
      console.error("[RESULTS] Failed to fetch evaluation:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to retrieve your interview results. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;

    const loadResults = async () => {
      setLoading(true);
      setError("");

      try {
        const data = await getInterviewResults(interviewId);

        if (!cancelled) {
          setResults(data);
        }
      } catch (err) {
        console.error("[RESULTS] Failed to fetch evaluation:", err);

        if (!cancelled) {
          setError(
            err.response?.data?.detail ||
              "Unable to retrieve your interview results.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    loadResults();

    return () => {
      cancelled = true;
    };
  }, [interviewId]);

  if (loading) {
    return <LoadingView />;
  }

  if (error || !results) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#080D1A] px-4">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-900 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400" />

          <h2 className="mt-5 text-xl font-semibold text-white">
            Unable to load results
          </h2>

          <p className="mt-3 text-sm leading-relaxed text-slate-400">
            {error || "Evaluation data is unavailable."}
          </p>

          <button
            onClick={fetchResults}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>

          <button
            onClick={() => navigate("/")}
            className="mt-3 block w-full text-sm text-slate-400 hover:text-white"
          >
            Return Home
          </button>
        </div>
      </div>
    );
  }

  const evaluation = results.evaluation_data || {};
  const score = Number(results.overall_score ?? 0);
  const recommendation = results.recommendation || "NOT_AVAILABLE";

  const assessments = [
    {
      title: "Technical Assessment",
      description: evaluation.technical_assessment,
      icon: Brain,
    },
    {
      title: "Communication Assessment",
      description: evaluation.communication_assessment,
      icon: Lightbulb,
    },
    {
      title: "Experience Assessment",
      description: evaluation.experience_assessment,
      icon: Award,
    },
    {
      title: "Problem-Solving Assessment",
      description: evaluation.problem_solving_assessment,
      icon: Target,
    },
  ];

  const recommendationStyle =
    RECOMMENDATION_STYLES[recommendation] ||
    "border-slate-400/20 bg-slate-500/10 text-slate-300";

  const formattedDate = results.created_at
    ? new Date(results.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "Not available";

  return (
    <div className="min-h-screen bg-[#080D1A] font-sans text-white">
      {/* Header */}
      <header className="border-b border-white/10 bg-[#0B1120]">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/15 text-indigo-400">
              <ClipboardCheck className="h-6 w-6" />
            </div>

            <div>
              <h1 onClick={() => navigate("/")} className="text-lg font-bold cursor-pointer">
                Voxi
              </h1>
              <p className="text-xs text-slate-500">Interview Assessment</p>
            </div>
          </div>

          <button
            onClick={() => navigate("/")}
            className="text-sm text-slate-400 transition hover:text-white"
          >
            Return Home
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-8 px-5 py-10 sm:px-8">
        {/* Page heading */}
        <section>
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">
            Interview Report
          </p>

          <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Your Performance
          </h2>

          <p className="mt-2 text-sm text-slate-400">
            Review your interview performance and AI-generated feedback.
          </p>

          <p className="mt-3 text-xs text-slate-500">
            Completed evaluation · {formattedDate}
          </p>
        </section>

        {/* Overall score */}
        <section className="grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-indigo-500/10 to-slate-900 p-6 sm:p-8">
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <TrendingUp className="h-5 w-5 text-indigo-400" />
              Overall Interview Score
            </div>

            <div className="mt-5 flex items-end gap-3">
              <span className="text-6xl font-bold tracking-tight text-white">
                {score}
              </span>

              <span className="mb-2 text-lg text-slate-500">/ 100</span>
            </div>

            <div className="mt-5 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-400 transition-all duration-1000"
                style={{
                  width: `${Math.min(100, Math.max(0, score))}%`,
                }}
              />
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Overall assessment score provided by the AI evaluator.
            </p>
          </div>

          <div className="flex flex-col justify-center rounded-2xl border border-white/10 bg-slate-900/70 p-6 sm:p-8">
            <p className="text-sm text-slate-400">Hiring Recommendation</p>

            <div className="mt-4">
              <span
                className={`inline-flex rounded-full border px-4 py-2 text-sm font-semibold ${recommendationStyle}`}
              >
                {recommendation.replaceAll("_", " ")}
              </span>
            </div>

            <p className="mt-5 text-sm leading-7 text-slate-400">
              This recommendation reflects the AI evaluator's overall assessment
              of your interview responses.
            </p>
          </div>
        </section>

        {/* Overall summary */}
        <section className="rounded-2xl border border-indigo-400/10 bg-indigo-500/5 p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-indigo-400" />
            <h3 className="text-lg font-semibold text-white">
              Overall Feedback
            </h3>
          </div>

          <p className="mt-4 text-sm leading-8 text-slate-300">
            {evaluation.summary || "No overall summary available."}
          </p>
        </section>

        {/* Detailed assessments */}
        <section>
          <div className="mb-5">
            <h3 className="text-xl font-semibold text-white">
              Detailed Assessment
            </h3>

            <p className="mt-1 text-sm text-slate-400">
              Explore the feedback for each evaluation category.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {assessments.map((item) => (
              <AssessmentCard
                key={item.title}
                title={item.title}
                description={item.description}
                icon={item.icon}
              />
            ))}
          </div>
        </section>

        {/* Strengths and weaknesses */}
        <section className="grid gap-5 md:grid-cols-2">
          <FeedbackList
            title="Your Strengths"
            items={evaluation.strengths}
            positive
          />

          <FeedbackList
            title="Areas for Improvement"
            items={evaluation.weaknesses}
            positive={false}
          />
        </section>

        {/* Footer */}
        <footer className="border-t border-white/10 pt-6 text-center">
          <p className="text-xs text-slate-500">
            Interview ID: {results.interview_id}
          </p>

          <p className="mt-2 text-xs text-slate-600">
            Evaluation generated by Voxi AI Interviewer.
          </p>
        </footer>
      </main>
    </div>
  );
}
