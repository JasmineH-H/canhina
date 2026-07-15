import { useEffect, useMemo, useRef, useState } from "react";
import "./TerminalLog.css";

const CHARACTER_PRINT_DELAY = 24;
const SHUTDOWN_DELAY = 5000;
const SHUTDOWN_ANIMATION_DURATION = 3350;

type TerminalLogProps = {
  onShutdownComplete: () => void;
  submissionCount: number;
};

export default function TerminalLog({
  onShutdownComplete,
  submissionCount,
}: TerminalLogProps) {
  const logRef = useRef<HTMLPreElement | null>(null);
  const lines = useMemo(
    () =>
      `====================
SYS_AUDIT   RPT V2.0
ACCESS:      GRANTED
CLEARANCE:    LEVEL4

====================
[I]  GLOBAL  METRICS
LEDGER: ${submissionCount.toLocaleString().padStart(11, " ")}
INCR_STATUS:  ACTIVE
DAILY_PROC: 14,203U

UID:  5241882-ALPHA
TODAY_RANK:   #08421
PROC_TYPE:
 [SELF-DIVESTMENT]

SYS_NOTICE >>>>>>
YOU: 8421ST USER TDY
NARRATIVE > DIVESTED
INDIVID  >> COMPLNCE

====================
[II]  DATA_REDUCTION
SRC_BUF:     5241CHR
SRC_LANG:       [ZH]

EMO_DENSITY:    HIGH
OUT_TGT:      298WRD
FILT_RATE:    94.31%
LATENCY:     0.82SEC

====================
[III]     PURGED_LOG
ERR_404: SEM_OVRLOAD
DELETING:  NON-PROD>

[SENSORY_INTERFERE]
OLFACT: WINT_CABBAGE
TACTIL:   HMTWN_RAIN
>STATUS:     DELETED

[BIO_STUTTER]
RESP_PAUSE:     142
BKSP_STRIKES:   387
FLAG:   LING_INSTAB

[LOGIC_REDUNDANCY]
ID_CRISIS_SEG:   18
UNSPKN_BELONG:   18
FLAG:  ZERO_LBR_VAL

====================
[IV]     FINAL_CHECK
LING_ALGO:   100.00%
INDIVID:      <0.50%
STATUS:  [COMPLIANT]`.split("\n"),
    [submissionCount],
  );
  const logText = lines.join("\n");
  const [visibleCharacterCount, setVisibleCharacterCount] = useState(0);
  const [isShuttingDown, setIsShuttingDown] = useState(false);

  useEffect(() => {
    setVisibleCharacterCount(0);
    setIsShuttingDown(false);

    const printTimer = window.setInterval(() => {
      setVisibleCharacterCount((currentCount) => {
        if (currentCount >= logText.length) {
          window.clearInterval(printTimer);
          return currentCount;
        }

        return currentCount + 1;
      });
    }, CHARACTER_PRINT_DELAY);

    return () => window.clearInterval(printTimer);
  }, [logText]);

  useEffect(() => {
    if (visibleCharacterCount < logText.length || isShuttingDown) {
      return;
    }

    const shutdownTimer = window.setTimeout(() => {
      setIsShuttingDown(true);
    }, SHUTDOWN_DELAY);

    return () => window.clearTimeout(shutdownTimer);
  }, [isShuttingDown, logText.length, visibleCharacterCount]);

  useEffect(() => {
    if (!isShuttingDown) {
      return;
    }

    const completeTimer = window.setTimeout(() => {
      onShutdownComplete();
    }, SHUTDOWN_ANIMATION_DURATION);

    return () => window.clearTimeout(completeTimer);
  }, [isShuttingDown, onShutdownComplete]);

  useEffect(() => {
    logRef.current?.scrollTo({
      top: logRef.current.scrollHeight,
    });
  }, [visibleCharacterCount]);

  return (
    <div className={isShuttingDown ? "log-container shutdown" : "log-container"}>
      <pre className="log" ref={logRef} aria-live="polite">
        <span className="log-text">{logText.slice(0, visibleCharacterCount)}</span>
        {visibleCharacterCount < logText.length && (
          <span className="terminal-cursor" aria-hidden="true">
            █
          </span>
        )}
      </pre>
    </div>
  );
}
