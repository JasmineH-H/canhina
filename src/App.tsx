import { useEffect, useRef, useState } from "react";
import "./App.css";
import Header from "./Components/Header/Header";
import MainPanel from "./Components/MainPanel/MainPanel";
import FlickerScreen from "./Components/FlickerScreen/FlickerScreen";
import TextEffect from "./Components/TextEffect/TextEffect";
import TerminalLog from "./Components/TerminalLog/TerminalLog";

const SUBMISSION_COUNT_STORAGE_KEY = "canina.totalSubmissions";
const SUBMISSION_COUNT_API_PATH = "/api/submission-count";

function saveStoredSubmissionCount(count: number) {
  window.localStorage.setItem(SUBMISSION_COUNT_STORAGE_KEY, String(count));
}

function readStoredSubmissionCount() {
  const storedCount = Number(
    window.localStorage.getItem(SUBMISSION_COUNT_STORAGE_KEY),
  );

  return Number.isFinite(storedCount) ? storedCount : 0;
}

async function readSharedSubmissionCount() {
  const response = await fetch(SUBMISSION_COUNT_API_PATH, { cache: "no-store" });
  if (!response.ok) throw new Error("Unable to read submission count");

  const data = (await response.json()) as { count?: unknown };
  return typeof data.count === "number" && Number.isFinite(data.count)
    ? data.count
    : 0;
}

async function incrementSharedSubmissionCount() {
  const response = await fetch(SUBMISSION_COUNT_API_PATH, { method: "POST" });
  if (!response.ok) throw new Error("Unable to update submission count");

  const data = (await response.json()) as { count?: unknown };
  return typeof data.count === "number" && Number.isFinite(data.count)
    ? data.count
    : 0;
}

async function setSharedSubmissionCount(count: number) {
  const response = await fetch(SUBMISSION_COUNT_API_PATH, {
    body: JSON.stringify({ count }),
    headers: { "Content-Type": "application/json" },
    method: "PUT",
  });
  if (!response.ok) throw new Error("Unable to sync submission count");

  const data = (await response.json()) as { count?: unknown };
  return typeof data.count === "number" && Number.isFinite(data.count)
    ? data.count
    : 0;
}

function App() {
  const [page, setPage] = useState<"main" | "terminal">("main");
  const [effectCount, setEffectCount] = useState(6);
  const [showFlicker, setShowFlicker] = useState(false);
  const [submissionCount, setSubmissionCount] = useState(
    readStoredSubmissionCount,
  );
  const flickerTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  const handleEffectStep = () => {
    setEffectCount((prev) => Math.max(prev - 1, 0));
  };

  const handleStandardizeStep = () => {
    setEffectCount((prev) => Math.max(prev - 1, 0));
    setShowFlicker(true);

    if (flickerTimerRef.current) {
      clearTimeout(flickerTimerRef.current);
    }

    flickerTimerRef.current = setTimeout(() => {
      setShowFlicker(false);
      flickerTimerRef.current = undefined;
    }, 700);
  };

  const handleSubmit = () => {
    setSubmissionCount((prev) => {
      const nextCount = prev + 1;
      saveStoredSubmissionCount(nextCount);
      return nextCount;
    });

    void incrementSharedSubmissionCount()
      .then((count) => {
        saveStoredSubmissionCount(count);
        setSubmissionCount(count);
      })
      .catch(() => {
        // Browser storage remains as a fallback when the shared dev endpoint is unavailable.
      });
  };

  const handleStartOver = () => {
    setPage("terminal");
    setEffectCount(6);
    setShowFlicker(false);

    if (flickerTimerRef.current) {
      clearTimeout(flickerTimerRef.current);
      flickerTimerRef.current = undefined;
    }

  };

  const handleTypingStartOver = () => {
    setEffectCount(6);
    setShowFlicker(false);

    if (flickerTimerRef.current) {
      clearTimeout(flickerTimerRef.current);
      flickerTimerRef.current = undefined;
    }
  };

  const handleTerminalComplete = () => {
    setPage("main");
    setEffectCount(6);
  };

  useEffect(() => {
    let ignore = false;

    void readSharedSubmissionCount()
      .then(async (sharedCount) => {
        if (ignore) return;
        const storedCount = readStoredSubmissionCount();
        const count =
          storedCount > sharedCount
            ? await setSharedSubmissionCount(storedCount)
            : sharedCount;
        if (ignore) return;
        saveStoredSubmissionCount(count);
        setSubmissionCount(count);
      })
      .catch(() => {
        // Keep the locally stored browser value for static builds or file previews.
      });

    return () => {
      ignore = true;
    };
  }, []);

  return (
    <>
      {page === "main" ? (
        <>
          {showFlicker && <FlickerScreen />}
          <div>
            <Header />
            <hr className="line" />
            <MainPanel
              onEffectStep={handleEffectStep}
              onStandardizeStep={handleStandardizeStep}
              onSubmit={handleSubmit}
              onStartOver={handleStartOver}
              onTypingStartOver={handleTypingStartOver}
            />
            <TextEffect remainingCount={effectCount} />
          </div>
        </>
      ) : (
        <TerminalLog
          submissionCount={submissionCount}
          onShutdownComplete={handleTerminalComplete}
        />
      )}
    </>
  );
}

export default App;
