import { useEffect, useState } from "react";

type TypeStep =
  | { type: "type"; text: string; speed?: number }
  | { type: "pause"; duration: number }
  | { type: "delete"; count: number; speed?: number };

type SmartTypewriterProps = {
  steps: TypeStep[];
  onDone?: () => void;
  cursor?: boolean;
};

export default function SmartTypewriter({
  steps,
  onDone,
  cursor = true,
}: SmartTypewriterProps) {
  const [text, setText] = useState("");

  useEffect(() => {
    let alive = true;

    const sleep = (ms: number) =>
      new Promise((resolve) => setTimeout(resolve, ms));

    const run = async () => {
      let buffer = "";

      for (const step of steps) {
        if (!alive) return;

        if (step.type === "type") {
          for (const ch of step.text) {
            if (!alive) return;
            buffer += ch;
            setText(buffer);
            await sleep(step.speed ?? 50);
          }
        }

        if (step.type === "pause") {
          await sleep(step.duration);
        }

        if (step.type === "delete") {
          const amount = Math.min(step.count, buffer.length);

          for (let i = 0; i < amount; i++) {
            if (!alive) return;
            buffer = buffer.slice(0, -1);
            setText(buffer);
            await sleep(step.speed ?? 40);
          }
        }
      }

      onDone?.();
    };

    run();

    return () => {
      alive = false;
    };
  }, []);

  return (
    <span>
      {text}
      {cursor && <span className="typing-cursor">|</span>}
    </span>
  );
}