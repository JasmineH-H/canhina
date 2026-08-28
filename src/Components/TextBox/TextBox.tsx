import { type MouseEvent, useEffect, useMemo, useRef, useState } from "react";
import { TypeAnimation } from "react-type-animation";
import {
  AI_STEPS,
  FORMALIZES_STEPS,
  REPLACEMENT_PARTS,
  type SourceStep,
} from "./TypingContent";
import "./TextBox.css";

const POPOVER_HIDE_DELAY = 350;
const FORMALIZE_PART_COUNT = 3;
const AI_PART_COUNT = 3;
const PART_COUNT = FORMALIZE_PART_COUNT + AI_PART_COUNT;
const SKIP_FORMALIZE_TYPE_ANIMATION = false;
const SKIP_AI_TYPE_ANIMATION = false;
const SKIP_ALL_TYPE_ANIMATION = false;

type TextBoxProps = {
  onSubmit: () => void;
  onEffectStep: () => void;
  onStandardizeStep: () => void;
};

type AnimationBlock = {
  delayAfter: number;
  delayBefore: number;
  deletionSpeed: number;
  fromText: string;
  id: number;
  speed: number;
  toText: string;
};

type AnimatedPartProps = {
  onComplete: () => void;
  onCursorChange: (isActive: boolean) => void;
  steps: SourceStep[];
};

const buildAnimationBlocks = (steps: SourceStep[]): AnimationBlock[] => {
  let buffer = "";
  let delayBefore = 0;
  const blocks: AnimationBlock[] = [];

  const addBlock = ({
    deletionSpeed,
    speed,
    toText,
  }: {
    deletionSpeed: number;
    speed: number;
    toText: string;
  }) => {
    blocks.push({
      delayAfter: 0,
      delayBefore,
      deletionSpeed,
      fromText: buffer,
      id: blocks.length,
      speed,
      toText,
    });
    buffer = toText;
    delayBefore = 0;
  };

  steps.forEach((step) => {
    if (step.type === "T") {
      addBlock({
        deletionSpeed: step.speed,
        speed: step.speed,
        toText: buffer + step.text,
      });
      return;
    }

    if (step.type === "D") {
      const deleteCount =
        step.count >= 999 ? buffer.length : Math.min(step.count, buffer.length);
      addBlock({
        deletionSpeed: step.speed,
        speed: step.speed,
        toText: buffer.slice(0, Math.max(0, buffer.length - deleteCount)),
      });
      return;
    }

    if (step.type === "P") {
      delayBefore += step.duration;
    }
  });

  if (delayBefore > 0 && blocks.length > 0) {
    blocks[blocks.length - 1].delayAfter = delayBefore;
  }

  return blocks;
};

const getFinalDraftText = (steps: SourceStep[]) =>
  buildAnimationBlocks(steps).at(-1)?.toText ?? "";

function AnimatedPart({ onComplete, onCursorChange, steps }: AnimatedPartProps) {
  const animationBlocks = useMemo(() => buildAnimationBlocks(steps), [steps]);
  const [currentAnimation, setCurrentAnimation] = useState(0);
  const hasCompletedRef = useRef(false);
  const activeBlock = animationBlocks[currentAnimation] ?? animationBlocks[0];

  useEffect(() => {
    onCursorChange(true);
    return () => onCursorChange(false);
  }, [onCursorChange]);

  if (!activeBlock) return null;

  const complete = () => {
    if (currentAnimation < animationBlocks.length - 1) {
      setCurrentAnimation((current) => current + 1);
      return;
    }

    if (!hasCompletedRef.current) {
      hasCompletedRef.current = true;
      onCursorChange(false);
      onComplete();
    }
  };

  return (
    <TypeAnimation
      key={activeBlock.id}
      preRenderFirstString={true}
      sequence={[
        activeBlock.fromText,
        activeBlock.delayBefore,
        activeBlock.toText,
        activeBlock.delayAfter,
        complete,
      ]}
      wrapper="span"
      speed={{ type: "keyStrokeDelayInMs", value: activeBlock.speed }}
      deletionSpeed={{
        type: "keyStrokeDelayInMs",
        value: activeBlock.deletionSpeed,
      }}
      cursor={false}
      style={{ whiteSpace: "pre-line" }}
    />
  );
}

export default function TextBox({
  onSubmit,
  onEffectStep,
  onStandardizeStep,
}: TextBoxProps) {
  const letterBoxRef = useRef<HTMLDivElement | null>(null);
  const fixedTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const suggestionTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hidePopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hideAiPopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const skipFormalizeAnimation =
    SKIP_ALL_TYPE_ANIMATION || SKIP_FORMALIZE_TYPE_ANIMATION;
  const skipAiAnimation = SKIP_ALL_TYPE_ANIMATION || SKIP_AI_TYPE_ANIMATION;

  const [completedParts, setCompletedParts] = useState(
    Array.from({ length: PART_COUNT }, (_, index) =>
      index < FORMALIZE_PART_COUNT ? skipFormalizeAnimation : skipAiAnimation,
    ),
  );
  const [activeCursor, setActiveCursor] = useState(
    skipFormalizeAnimation ? 0 : 1,
  );
  const [fixedParts, setFixedParts] = useState(
    Array(FORMALIZE_PART_COUNT).fill(false) as boolean[],
  );
  const [dismissedParts, setDismissedParts] = useState(
    Array(FORMALIZE_PART_COUNT).fill(false) as boolean[],
  );
  const [lastFixedPart, setLastFixedPart] = useState<number | null>(null);
  const [activeSuggestionPart, setActiveSuggestionPart] = useState<
    number | null
  >(null);
  const [popoverPosition, setPopoverPosition] = useState({
    left: 0,
    maxHeight: 260,
    top: 0,
  });
  const [acceptedCount, setAcceptedCount] = useState(0);
  const [dismissedAiParts, setDismissedAiParts] = useState(
    Array(AI_PART_COUNT).fill(false) as boolean[],
  );
  const [activeAiSuggestion, setActiveAiSuggestion] = useState<number | null>(
    null,
  );
  const [aiPopoverPosition, setAiPopoverPosition] = useState({
    left: 0,
    maxHeight: 180,
    top: 0,
  });

  const handledStandardizeCount =
    fixedParts.filter(Boolean).length + dismissedParts.filter(Boolean).length;
  const allFormalizeHandled =
    handledStandardizeCount === FORMALIZE_PART_COUNT;
  const canSubmit = fixedParts.some(Boolean);
  const stepParts = [...FORMALIZES_STEPS, ...AI_STEPS];

  const clearHidePopoverTimer = () => {
    if (hidePopoverTimerRef.current) {
      clearTimeout(hidePopoverTimerRef.current);
      hidePopoverTimerRef.current = null;
    }
  };

  const clearHideAiPopoverTimer = () => {
    if (hideAiPopoverTimerRef.current) {
      clearTimeout(hideAiPopoverTimerRef.current);
      hideAiPopoverTimerRef.current = null;
    }
  };

  const getErrorTextClassName = (partNumber: number, isActive: boolean) => {
    const classNames = ["error-text"];
    const partIndex = partNumber - 1;
    const isDismissed = dismissedParts[partIndex];
    const isHandled = fixedParts[partIndex] || isDismissed;

    if (isActive && !isDismissed) classNames.push("active");
    if (isActive && !isHandled)
      classNames.push("standardize-target", "has-fix-suggestion");

    return classNames.join(" ");
  };

  const getPopoverPositionFromPoint = (
    point: { x: number; y: number },
    width: number,
    maxHeight: number,
  ) => {
    const popoverWidth = Math.min(width, window.innerWidth - 32);
    const left = Math.min(
      Math.max(point.x - 24, 16),
      window.innerWidth - popoverWidth - 16,
    );
    const top = point.y + 12;
    const availableHeight = window.innerHeight - top - 16;

    return {
      left,
      maxHeight: Math.max(120, Math.min(maxHeight, availableHeight)),
      top,
    };
  };

  const hideFixSuggestion = () => {
    clearHidePopoverTimer();
    hidePopoverTimerRef.current = setTimeout(() => {
      setActiveSuggestionPart(null);
      hidePopoverTimerRef.current = null;
    }, POPOVER_HIDE_DELAY);
  };

  const showFixSuggestion = (
    partNumber: number,
    isActive: boolean,
    event: MouseEvent<HTMLSpanElement>,
  ) => {
    const partIndex = partNumber - 1;
    if (!isActive || fixedParts[partIndex] || dismissedParts[partIndex]) return;

    clearHidePopoverTimer();
    setPopoverPosition(
      getPopoverPositionFromPoint(
        { x: event.clientX, y: event.clientY },
        620,
        260,
      ),
    );
    setActiveSuggestionPart(partNumber);
  };

  const handleFix = (partNumber: number) => {
    const partIndex = partNumber - 1;
    if (fixedParts[partIndex] || dismissedParts[partIndex]) return;

    setFixedParts((prev) => {
      const next = [...prev];
      next[partIndex] = true;
      return next;
    });
    setLastFixedPart(partNumber);
    setActiveSuggestionPart(null);
    onStandardizeStep();
  };

  const handleDismissFix = () => {
    if (activeSuggestionPart === null) return;

    const partIndex = activeSuggestionPart - 1;
    if (fixedParts[partIndex] || dismissedParts[partIndex]) return;

    clearHidePopoverTimer();
    setDismissedParts((prev) => {
      const next = [...prev];
      next[partIndex] = true;
      return next;
    });
    setActiveSuggestionPart(null);
    onEffectStep();
  };

  const hideAiSuggestion = () => {
    clearHideAiPopoverTimer();
    hideAiPopoverTimerRef.current = setTimeout(() => {
      setActiveAiSuggestion(null);
      hideAiPopoverTimerRef.current = null;
    }, POPOVER_HIDE_DELAY);
  };

  const showAiSuggestion = (
    suggestionNumber: number,
    isActive: boolean,
    event: MouseEvent<HTMLSpanElement>,
  ) => {
    if (!isActive || acceptedCount !== suggestionNumber - 1) return;

    clearHideAiPopoverTimer();
    setAiPopoverPosition(
      getPopoverPositionFromPoint(
        { x: event.clientX, y: event.clientY },
        320,
        180,
      ),
    );
    setActiveAiSuggestion(suggestionNumber);
  };

  const handleAccept = () => {
    if (acceptedCount < AI_PART_COUNT) {
      const acceptedPartNumber = FORMALIZE_PART_COUNT + acceptedCount + 1;
      setActiveAiSuggestion(null);
      completePart(acceptedPartNumber);
      setPartCursor(acceptedPartNumber, false);
      setAcceptedCount((prev) => prev + 1);
      onEffectStep();
    }
  };

  const handleDismissAiSuggestion = () => {
    if (activeAiSuggestion === null) return;

    clearHideAiPopoverTimer();
    setDismissedAiParts((prev) => {
      const next = [...prev];
      next[activeAiSuggestion - 1] = true;
      return next;
    });
    setActiveAiSuggestion(null);
    onEffectStep();
  };

  const completePart = (partNumber: number) => {
    setCompletedParts((prev) => {
      if (prev[partNumber - 1]) return prev;
      const next = [...prev];
      next[partNumber - 1] = true;
      return next;
    });
  };

  const setPartCursor = (partNumber: number, isActive: boolean) => {
    setActiveCursor((current) => {
      if (isActive) return partNumber;
      return current === partNumber ? 0 : current;
    });
  };

  const renderFixSuggestion = () => {
    if (activeSuggestionPart === null) return null;

    return (
      <div
        className="fix-popover"
        role="tooltip"
        style={popoverPosition}
        onMouseEnter={clearHidePopoverTimer}
        onMouseLeave={hideFixSuggestion}
      >
        <span className="fix-popover-title">Accept formalize</span>
        <button
          className="fix-suggestion-btn"
          type="button"
          onClick={() => handleFix(activeSuggestionPart)}
        >
          {REPLACEMENT_PARTS[activeSuggestionPart - 1].text}
        </button>
        <button
          className="fix-dismiss-btn"
          type="button"
          onClick={handleDismissFix}
        >
          <svg
            aria-hidden="true"
            className="fix-dismiss-icon"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path d="M9 3h6" />
            <path d="M4 6h16" />
            <path d="M7 6l1 15h8l1-15" />
            <path d="M10 10v7" />
            <path d="M14 10v7" />
          </svg>
          Dismiss
        </button>
      </div>
    );
  };

  const renderAiSuggestion = () => {
    if (activeAiSuggestion === null) return null;

    return (
      <div
        className="ai-popover"
        role="tooltip"
        style={aiPopoverPosition}
        onMouseEnter={clearHideAiPopoverTimer}
        onMouseLeave={hideAiSuggestion}
      >
        <span className="ai-popover-title">AI writing</span>
        <button className="ai-accept-btn" type="button" onClick={handleAccept}>
          Accept
        </button>
        <button
          className="fix-dismiss-btn"
          type="button"
          onClick={handleDismissAiSuggestion}
        >
          <svg
            aria-hidden="true"
            className="fix-dismiss-icon"
            fill="none"
            viewBox="0 0 24 24"
          >
            <path d="M9 3h6" />
            <path d="M4 6h16" />
            <path d="M7 6l1 15h8l1-15" />
            <path d="M10 10v7" />
            <path d="M14 10v7" />
          </svg>
          Dismiss
        </button>
      </div>
    );
  };

  const renderPart = (partNumber: number) => {
    const partIndex = partNumber - 1;
    const isFormalizePart = partNumber <= FORMALIZE_PART_COUNT;
    const aiPartNumber = partNumber - FORMALIZE_PART_COUNT;
    const previousPartComplete =
      partNumber === 1 || completedParts[partIndex - 1];
    const canRenderFormalize = isFormalizePart && previousPartComplete;
    const canRenderAi =
      !isFormalizePart &&
      allFormalizeHandled &&
      aiPartNumber - 1 <= acceptedCount &&
      previousPartComplete;
    const isComplete = completedParts[partIndex];
    const skipCurrentAnimation = isFormalizePart
      ? skipFormalizeAnimation
      : skipAiAnimation;
    const finalDraftText = skipCurrentAnimation
      ? getFinalDraftText(stepParts[partIndex])
      : "";
    const dismissedThirdFormalizePart =
      partNumber === FORMALIZE_PART_COUNT && dismissedParts[partIndex];
    const formalizeSeparator = dismissedThirdFormalizePart ? "\n" : "";

    if (isFormalizePart) {
      if (!canRenderFormalize) return null;

      return fixedParts[partIndex] ? (
        <span
          className="fixed-text"
          ref={(element) => {
            fixedTextRefs.current[partIndex] = element;
          }}
          style={{ whiteSpace: "pre-line" }}
        >
          {REPLACEMENT_PARTS[partIndex].text}
          {formalizeSeparator}
        </span>
      ) : (
        <span
          className={getErrorTextClassName(partNumber, isComplete)}
          onMouseEnter={(event) =>
            showFixSuggestion(partNumber, isComplete, event)
          }
          onMouseLeave={hideFixSuggestion}
          style={{ whiteSpace: "pre-line" }}
        >
          {skipCurrentAnimation ? (
            <span style={{ whiteSpace: "pre-line" }}>{finalDraftText}</span>
          ) : (
            <AnimatedPart
              steps={stepParts[partIndex]}
              onComplete={() => completePart(partNumber)}
              onCursorChange={(isActive) => setPartCursor(partNumber, isActive)}
            />
          )}
          {formalizeSeparator}
          {!skipCurrentAnimation &&
            activeCursor === partNumber &&
            !dismissedParts[partIndex] && (
            <span className="typing-cursor">|</span>
          )}
        </span>
      );
    }

    if (!canRenderAi) return null;

    return acceptedCount >= aiPartNumber ? (
      <span
        className="suggestion-text accepted"
        ref={(element) => {
          suggestionTextRefs.current[aiPartNumber - 1] = element;
        }}
        style={{ whiteSpace: "pre-line" }}
      >
        {REPLACEMENT_PARTS[partIndex].text}
        {partNumber < PART_COUNT ? "\n\n" : ""}
      </span>
    ) : (
      <span style={{ whiteSpace: "pre-line" }}>
        <span>
          {skipCurrentAnimation ? (
            finalDraftText
          ) : (
            <AnimatedPart
              steps={stepParts[partIndex]}
              onComplete={() => completePart(partNumber)}
              onCursorChange={(isActive) => setPartCursor(partNumber, isActive)}
            />
          )}
          {!skipCurrentAnimation && activeCursor === partNumber && (
            <span className="typing-cursor">|</span>
          )}
        </span>
        {!dismissedAiParts[aiPartNumber - 1] && (
          <>
            {" "}
            <span
              className="suggestion-text"
              ref={(element) => {
                suggestionTextRefs.current[aiPartNumber - 1] = element;
              }}
              onMouseEnter={(event) =>
                showAiSuggestion(aiPartNumber, true, event)
              }
              onMouseLeave={hideAiSuggestion}
            >
              {REPLACEMENT_PARTS[partIndex].text}
            </span>
          </>
        )}
        {partNumber < PART_COUNT ? "\n\n" : ""}
      </span>
    );
  };

  useEffect(() => {
    if (lastFixedPart === null) return;
    fixedTextRefs.current[lastFixedPart - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [lastFixedPart]);

  useEffect(() => {
    if (!allFormalizeHandled || acceptedCount >= AI_PART_COUNT) return;

    const animationFrame = requestAnimationFrame(() => {
      const letterBox = letterBoxRef.current;
      const activeSuggestion = suggestionTextRefs.current[acceptedCount];
      if (!letterBox || !activeSuggestion) return;

      const letterBoxRect = letterBox.getBoundingClientRect();
      const suggestionRect = activeSuggestion.getBoundingClientRect();
      letterBox.scrollTo({
        behavior: "smooth",
        top: letterBox.scrollTop + suggestionRect.top - letterBoxRect.top - 16,
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [acceptedCount, allFormalizeHandled]);

  useEffect(() => {
    return () => {
      clearHidePopoverTimer();
      clearHideAiPopoverTimer();
    };
  }, []);

  return (
    <div className="letter-page">
      <div className="letter-box" ref={letterBoxRef}>
        <p>{Array.from({ length: PART_COUNT }, (_, index) => renderPart(index + 1))}</p>
      </div>

      {renderFixSuggestion()}
      {renderAiSuggestion()}

      <button
        className="submit-btn"
        disabled={!canSubmit}
        onClick={onSubmit}
      >
        Submit
      </button>
    </div>
  );
}
