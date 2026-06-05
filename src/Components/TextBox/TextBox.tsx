import { TypeAnimation } from "react-type-animation";
import { type MouseEvent, useEffect, useRef, useState } from "react";
import "./TextBox.css";

const SKIP_TYPE_ANIMATION = false;
const POPOVER_HIDE_DELAY = 350;

type TextBoxProps = {
  onSubmit: () => void;
  onEffectStep: () => void;
  onStandardizeStep: () => void;
};

export default function TextBox({
  onSubmit,
  onEffectStep,
  onStandardizeStep,
}: TextBoxProps) {
  const [step, setStep] = useState(SKIP_TYPE_ANIMATION ? 5 : 1);

  const [activeCursor, setActiveCursor] = useState(
    SKIP_TYPE_ANIMATION ? 5 : 1,
  );

  const [currentAnimation, setCurrentAnimation] = useState(
    SKIP_TYPE_ANIMATION ? 21 : 1,
  );
  const letterBoxRef = useRef<HTMLDivElement | null>(null);
  const fixedTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const suggestionTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hidePopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const hideAiPopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const standardizeSuggestions = [
    "Dear Immigration Officer,\n\nMy name is Ricardo (Yuming Zhang). Since my initial entry into Canada on August 24, 2015, I have resided in Canada for over eleven years (approximately more than 3,900 days), Canada has become my primary country of residence and long-term development. ",
    "Throughout my long-term residence in Canada, I have complied with all applicable laws and regulations and have no adverse records. I have established a stable lifestyle, including consistent housing, regular employment, and ongoing self-improvement. ",
    "Canada’s multicultural environment has had a significant and positive impact on my personal development, career planning, and values.",
  ];

  // standardize text count
  const [fixedParts, setFixedParts] = useState([false, false, false]);
  const [lastFixedPart, setLastFixedPart] = useState<number | null>(null);
  const [activeSuggestionPart, setActiveSuggestionPart] = useState<
    number | null
  >(null);
  const [popoverPosition, setPopoverPosition] = useState({
    left: 0,
    maxHeight: 260,
    top: 0,
  });
  const [activeAiSuggestion, setActiveAiSuggestion] = useState<number | null>(
    null,
  );
  const [aiPopoverPosition, setAiPopoverPosition] = useState({
    left: 0,
    maxHeight: 180,
    top: 0,
  });
  const fixedCount = fixedParts.filter(Boolean).length;

  const getErrorTextClassName = (partNumber: number, isActive: boolean) => {
    const classNames = ["error-text"];
    const isFixed = fixedParts[partNumber - 1];

    if (isActive) {
      classNames.push("active");
    }

    if (isActive && !isFixed) {
      classNames.push("standardize-target", "has-fix-suggestion");
    }

    return classNames.join(" ");
  };

  const handleFix = (partNumber: number) => {
    const partIndex = partNumber - 1;

    if (fixedParts[partIndex]) {
      return;
    }

    setFixedParts((prev) => {
      const next = [...prev];
      next[partIndex] = true;
      return next;
    });
    setLastFixedPart(partNumber);
    setActiveSuggestionPart(null);
    onStandardizeStep();
  };

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

  const getPopoverPosition = (
    targetRect: DOMRect,
    width: number,
    maxHeight: number,
  ) => {
    const popoverWidth = Math.min(width, window.innerWidth - 32);
    const left = Math.min(
      Math.max(targetRect.left, 16),
      window.innerWidth - popoverWidth - 16,
    );
    const top = targetRect.bottom + 8;
    const availableHeight = window.innerHeight - top - 16;

    return {
      left,
      maxHeight: Math.max(120, Math.min(maxHeight, availableHeight)),
      top,
    };
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
    if (!isActive || fixedParts[partNumber - 1]) {
      return;
    }

    clearHidePopoverTimer();

    setPopoverPosition(
      getPopoverPosition(event.currentTarget.getBoundingClientRect(), 620, 260),
    );
    setActiveSuggestionPart(partNumber);
  };

  const renderFixSuggestion = () => {
    if (activeSuggestionPart === null) {
      return null;
    }

    return (
      <div
        className="fix-popover"
        role="tooltip"
        style={popoverPosition}
        onMouseEnter={clearHidePopoverTimer}
        onMouseLeave={hideFixSuggestion}
      >
        <span className="fix-popover-title">Formalize</span>
        <button
          className="fix-suggestion-btn"
          type="button"
          onClick={() => handleFix(activeSuggestionPart)}
        >
          {standardizeSuggestions[activeSuggestionPart - 1]}
        </button>
      </div>
    );
  };

  useEffect(() => {
    if (lastFixedPart === null) {
      return;
    }

    fixedTextRefs.current[lastFixedPart - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [lastFixedPart]);

  useEffect(() => {
    return () => {
      clearHidePopoverTimer();
      clearHideAiPopoverTimer();
    };
  }, []);

  // suggestion text count
  const [acceptedCount, setAcceptedCount] = useState(0);
  const handleAccept = () => {
    if (acceptedCount < 3) {
      setActiveAiSuggestion(null);
      setAcceptedCount((prev) => prev + 1);
      onEffectStep();
    }
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
    event: MouseEvent<HTMLSpanElement>,
  ) => {
    if (acceptedCount !== suggestionNumber - 1) {
      return;
    }

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

  const renderAiSuggestion = () => {
    if (activeAiSuggestion === null) {
      return null;
    }

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
      </div>
    );
  };

  useEffect(() => {
    if (fixedCount !== 3 || acceptedCount >= 3) {
      return;
    }

    const animationFrame = requestAnimationFrame(() => {
      const letterBox = letterBoxRef.current;
      const activeSuggestion = suggestionTextRefs.current[acceptedCount];

      if (!letterBox || !activeSuggestion) {
        return;
      }

      const letterBoxRect = letterBox.getBoundingClientRect();
      const suggestionRect = activeSuggestion.getBoundingClientRect();
      letterBox.scrollTo({
        behavior: "smooth",
        top: letterBox.scrollTop + suggestionRect.top - letterBoxRect.top - 16,
      });
    });

    return () => cancelAnimationFrame(animationFrame);
  }, [acceptedCount, fixedCount]);

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div className="letter-page">
      <div className="letter-box" ref={letterBoxRef}>
        <p>
          {/* Suggestion 1 */}
          {step >= 1 &&
            (fixedParts[0] ? (
              <span
                className="fixed-text"
                ref={(element) => {
                  fixedTextRefs.current[0] = element;
                }}
              >
                Dear Immigration Officer,<br></br><br></br>My name is Ricardo (Yuming
                Zhang). Since my initial entry into Canada on August 24, 2015, I
                have resided in Canada for over eleven years (approximately more
                than 3,900 days), Canada has become my primary country of
                residence and long-term development.
              </span>
            ) : (
              <span
                className={getErrorTextClassName(1, step >= 2)}
                onMouseEnter={(event) =>
                  showFixSuggestion(1, step >= 2, event)
                }
                onMouseLeave={hideFixSuggestion}
              >
                {SKIP_TYPE_ANIMATION && (
                  <>
                    Dear Officer<br></br>
                    When I first arrived in Canada on August 24, 2015, I was
                    only a young teenager carrying two suitcases poor grades and
                    very little understanding of who I wanted to become.{" "}
                  </>
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 1 && (
                  <TypeAnimation
                    sequence={[
                      "",
                      1500,

                      "Dear ",
                      2200,

                      "Dear Immi",
                      1600,

                      "Dear ",
                      300,

                      "Dear Officer\n",
                      3800,

                      () => {
                        setActiveCursor(2);
                        setCurrentAnimation(2);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 130 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 1 && (
                  <span className="typing-cursor">|</span>
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 2 && (
                  <TypeAnimation
                    sequence={[
                      "When I first",
                      500,
                      () => setCurrentAnimation(3),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 30 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 3 && (
                  <TypeAnimation
                    sequence={[
                      " ",
                      100,

                      " arived",
                      850,

                      " ar",
                      100,

                      " arrived",
                      100,
                      () => {
                        setCurrentAnimation(4);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={90}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 4 && (
                  <TypeAnimation
                    sequence={[
                      " in",
                      100,

                      " in Canada on August",
                      350,

                      " in Canada on August 24, 2015,",
                      1600,

                      " in Canada on August 24, 2015, I was only a",
                      1800,

                      " in Canada on August 24, 2015, I was only a young",
                      1100,

                      " in Canada on August 24, 2015, I was only a teenager carrying two ",
                      1100,

                      () => {
                        setCurrentAnimation(5);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 5 && (
                  <TypeAnimation
                    sequence={[
                      "luggages",
                      850,

                      "",
                      100,

                      "suitcases ",
                      1900,

                      () => {
                        setCurrentAnimation(6);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 6 && (
                  <TypeAnimation
                    sequence={[
                      "inade",
                      1400,

                      "",
                      450,

                      "poor grades and very ",
                      100,

                      () => {
                        setCurrentAnimation(7);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 7 && (
                  <TypeAnimation
                    sequence={[
                      "litte",
                      480,

                      "",
                      100,

                      "little ",
                      1000,

                      () => {
                        setCurrentAnimation(8);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 8 && (
                  <TypeAnimation
                    sequence={[
                      "comprehen",
                      1500,

                      "understanding ",
                      380,

                      () => {
                        setCurrentAnimation(10);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 10 && (
                  <TypeAnimation
                    sequence={[
                      "of who I was",
                      1200,

                      "of who I ",
                      800,

                      "of who I wanted to become.",
                      3200,

                      () => {
                        setStep(2);
                        setActiveCursor(3);
                        setCurrentAnimation(11);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 2 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* Sentence 2 */}
          {step >= 2 &&
            (fixedParts[1] ? (
              <span
                className="fixed-text"
                ref={(element) => {
                  fixedTextRefs.current[1] = element;
                }}
              >
                {" "}
                <br></br><br></br>Throughout my long-term residence in Canada, I have complied
                with all applicable laws and regulations and have no adverse
                records. I have established a stable lifestyle, including
                consistent housing, regular employment, and ongoing
                self-improvement.
              </span>
            ) : (
              <span
                className={getErrorTextClassName(2, step >= 3)}
                onMouseEnter={(event) =>
                  showFixSuggestion(2, step >= 3, event)
                }
                onMouseLeave={hideFixSuggestion}
              >
                {SKIP_TYPE_ANIMATION && (
                  <>
                    {" "}
                     I never imagined that eleven years latre this country would
                    hold some of the most important memoreis, relationships, and
                    moments of growth in my entire life -{" "}
                  </>
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 11 && (
                  <TypeAnimation
                    sequence={[
                      " I never",
                      2000,

                      " I never anticip",
                      1600,

                      " I never ",
                      500,

                      " I never imagined that ",
                      500,

                      () => setCurrentAnimation(12),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 12 && (
                  <TypeAnimation
                    sequence={[
                      "elevan",
                      500,

                      "",
                      100,

                      "eleven ",
                      500,

                      () => setCurrentAnimation(13),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 13 && (
                  <TypeAnimation
                    sequence={[
                      "years latre ",
                      600,

                      "years latre this country would",
                      1800,

                      "years latre this country would encom",
                      1300,

                      "years latre this country would ",
                      100,

                      "years latre this country would hold some of the most ",
                      100,

                      () => setCurrentAnimation(14),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 14 && (
                  <TypeAnimation
                    sequence={[
                      "importent",
                      530,

                      "import",
                      100,

                      "important memoreis,",
                      500,

                      "important memoreis, relationships, ",
                      900,

                      () => setCurrentAnimation(15),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 15 && (
                  <TypeAnimation
                    sequence={[
                      "and moments of",
                      2100,

                      "and moments of transfor",
                      950,

                      "and moments of growth in my entire life",
                      700,

                      "and moments of growth in my entire life -",
                      1300,

                      () => {
                        setStep(3);
                        setActiveCursor(4);
                        setCurrentAnimation(16);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    cursor={false}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 3 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* Sentence 3 */}
          {step >= 3 &&
            (fixedParts[2] ? (
              <span
                className="fixed-text"
                ref={(element) => {
                  fixedTextRefs.current[2] = element;
                }}
              >
                {" "}
                Canada’s multicultural environment has had a significant and
                positive impact on my personal development, career planning, and
                values.<br></br><br></br>
              </span>
            ) : (
              <span
                className={getErrorTextClassName(3, step >= 4)}
                onMouseEnter={(event) =>
                  showFixSuggestion(3, step >= 4, event)
                }
                onMouseLeave={hideFixSuggestion}
              >
                {SKIP_TYPE_ANIMATION && (
                  <>
                    {" "}
                     or that Canada would begin to feel more like home than
                    anywere else in the world.
                  </>
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 16 && (
                  <TypeAnimation
                    sequence={[
                      " or that Canada",
                      1400,

                      " or that Canada would ",
                      100,

                      () => {
                        setCurrentAnimation(17);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 17 && (
                  <TypeAnimation
                    sequence={[
                      "gradually",
                      1100,

                      "",
                      100,

                      () => {
                        setCurrentAnimation(18);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 18 && (
                  <TypeAnimation
                    sequence={[
                      "begin to",
                      600,

                      "begin to resemble",
                      1000,

                      "begin to feel more like home than ",
                      450,

                      () => {
                        setCurrentAnimation(19);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 19 && (
                  <TypeAnimation
                    sequence={[
                      "anywere ",
                      100,

                      () => {
                        setCurrentAnimation(20);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 200 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    cursor={false}
                  />
                )}

                {!SKIP_TYPE_ANIMATION && currentAnimation >= 20 && (
                  <TypeAnimation
                    sequence={[
                      "else in the world.",
                      100,

                      () => {
                        setCurrentAnimation(21);
                        setStep(4);
                        setActiveCursor(5);
                      },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    cursor={false}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 4 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* Ending */}
          {!SKIP_TYPE_ANIMATION && step >= 4 && acceptedCount === 0 && (
            <TypeAnimation
              sequence={[
                "",

                () => {
                  setStep(5);
                },
              ]}
              wrapper="span"
              speed={{ type: "keyStrokeDelayInMs", value: 90 }}
              deletionSpeed={{ type: "keyStrokeDelayInMs", value: 100 }}
              cursor={true}
            />
          )}

          {step >= 5 && fixedCount === 3 && (
            <>
              {/* Suggestion 1 */}
              {acceptedCount >= 0 && (
                <span
                  className={
                    acceptedCount >= 1
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(element) => {
                    suggestionTextRefs.current[0] = element;
                  }}
                  onMouseEnter={(event) => showAiSuggestion(1, event)}
                  onMouseLeave={hideAiSuggestion}
                >
                  {" "}
                  During my time in Canada, I completed both my secondary and
                  post-secondary education and obtained a diploma in Commercial
                  Photography. Throughout my studies, I fulfilled academic
                  requirements while progressively improving my language
                  proficiency and professional skills. In addition, through
                  participation in sports and daily social interactions, I have
                  established stable local relationships and developed strong
                  English communication skills, as well as cross-cultural
                  adaptability.<br></br><br></br>
                </span>
              )}

              {/* Suggestion 2 */}
              {acceptedCount >= 1 && (
                <span
                  className={
                    acceptedCount >= 2
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(element) => {
                    suggestionTextRefs.current[1] = element;
                  }}
                  onMouseEnter={(event) => showAiSuggestion(2, event)}
                  onMouseLeave={hideAiSuggestion}
                >
                  {" "}
                  After graduation, I entered the workforce and secured
                  employment in Vancouver. I subsequently relocated from Toronto
                  to British Columbia to pursue long-term career development. In
                  both my professional and personal life, I have maintained a
                  stable routine, continued to engage in community activities,
                  built new social networks, and gradually adapted to the local
                  environment.<br></br><br></br>
                </span>
              )}

              {/* Suggestion 3 */}
              {acceptedCount >= 2 && (
                <span
                  className={
                    acceptedCount >= 3
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(element) => {
                    suggestionTextRefs.current[2] = element;
                  }}
                  onMouseEnter={(event) => showAiSuggestion(3, event)}
                  onMouseLeave={hideAiSuggestion}
                >
                  {" "}
                  Based on my educational background, language proficiency, work
                  experience, and level of social integration, I have developed
                  a strong alignment with Canadian society. Through years of
                  study and living in Canada, I have demonstrated the ability
                  and readiness to continue residing and contributing to the
                  country. Given the above, I respectfully seek to obtain
                  permanent resident status in order to continue my long-term
                  development in Canada, participate in social and economic
                  activities, and contribute positively to the local community.
                  Thank you for your time and consideration.<br></br><br></br>
                  Sincerely,<br></br>Ricardo (Yuming Zhang)
                </span>
              )}
            </>
          )}
        </p>
      </div>
      {renderFixSuggestion()}
      {renderAiSuggestion()}

      <button
        className="submit-btn"
        disabled={acceptedCount < 3}
        onClick={handleSubmit}
      >
        Submit
      </button>
    </div>
  );
}
