import { useRef, useState } from "react";
import "./App.css";
import Header from "./Components/Header/Header";
import MainPanel from "./Components/MainPanel/MainPanel";
import FlickerScreen from "./Components/FlickerScreen/FlickerScreen";
import TextEffect from "./Components/TextEffect/TextEffect";
import TerminalLog from "./Components/TerminalLog/TerminalLog";

const SUBMISSION_COUNT_STORAGE_KEY = "canina.totalSubmissions";

function readStoredSubmissionCount() {
  const storedCount = Number(
    window.localStorage.getItem(SUBMISSION_COUNT_STORAGE_KEY),
  );

  return Number.isFinite(storedCount) ? storedCount : 0;
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
      window.localStorage.setItem(
        SUBMISSION_COUNT_STORAGE_KEY,
        String(nextCount),
      );
      return nextCount;
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

  const handleTerminalComplete = () => {
    setPage("main");
    setEffectCount(6);
  };

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
