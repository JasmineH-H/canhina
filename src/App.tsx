import { useRef, useState } from "react";
import "./App.css";
import Header from "./Components/Header/Header";
import MainPanel from "./Components/MainPanel/MainPanel";
import FlickerScreen from "./Components/FlickerScreen/FlickerScreen";
import TextEffect from "./Components/TextEffect/TextEffect";
import TerminalLog from "./Components/TerminalLog/TerminalLog";

function App() {
  const [page, setPage] = useState<"main" | "terminal">("main");
  const [effectCount, setEffectCount] = useState(6);
  const [showFlicker, setShowFlicker] = useState(false);
  const returnTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
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
    }, 400);
  };

  const handleStartOver = () => {
    setPage("terminal");
    setEffectCount(6);
    setShowFlicker(false);

    if (flickerTimerRef.current) {
      clearTimeout(flickerTimerRef.current);
      flickerTimerRef.current = undefined;
    }

    if (returnTimerRef.current) {
      clearTimeout(returnTimerRef.current);
    }

    returnTimerRef.current = setTimeout(() => {
      setPage("main");
      setEffectCount(6);
      returnTimerRef.current = undefined;
    }, 15000);
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
              onStartOver={handleStartOver}
            />
            <TextEffect remainingCount={effectCount} />
          </div>
        </>
      ) : (
        <TerminalLog />
      )}
    </>
  );
}

export default App;
