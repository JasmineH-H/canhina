import type { CSSProperties } from "react";
import "./FlickerScreen.css";

const glitchLines = [
  { top: "5%", width: "22vw", left: "6%", height: "2px", shift: "18px", delay: "0s" },
  { top: "15%", width: "18vw", left: "34%", height: "2px", shift: "16px", delay: "-0.08s" },
  { top: "22%", width: "42vw", left: "8%", height: "4px", shift: "32px", delay: "-0.02s" },
  { top: "28%", width: "26vw", left: "67%", height: "2px", shift: "20px", delay: "-0.1s" },
  { top: "41%", width: "30vw", left: "45%", height: "2px", shift: "24px", delay: "-0.12s" },
  { top: "55%", width: "38vw", left: "52%", height: "4px", shift: "34px", delay: "-0.09s" },
  { top: "62%", width: "24vw", left: "27%", height: "2px", shift: "21px", delay: "-0.15s" },
  { top: "76%", width: "44vw", left: "12%", height: "2px", shift: "30px", delay: "-0.11s" },
];

const FlickerScreen = () => {
  return (
    <div className="screen-issue-overlay" aria-hidden="true">
      {glitchLines.map((line) => (
        <span
          className="rgb-glitch-line"
          key={`${line.top}-${line.left}`}
          style={
            {
              "--line-top": line.top,
              "--line-left": line.left,
              "--line-width": line.width,
              "--line-height": line.height,
              "--line-shift": line.shift,
              "--line-delay": line.delay,
            } as CSSProperties
          }
        />
      ))}
      <div className="rgb-scanlines" />
    </div>
  );
};

export default FlickerScreen;
