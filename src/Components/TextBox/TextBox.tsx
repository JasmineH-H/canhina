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
  // 38 animation blocks total; final state = 39
  const [currentAnimation, setCurrentAnimation] = useState(
    SKIP_TYPE_ANIMATION ? 39 : 1,
  );
  const letterBoxRef = useRef<HTMLDivElement | null>(null);
  const fixedTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const suggestionTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const hidePopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hideAiPopoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const standardizeSuggestions = [
    "Dear Immigration Officer,\n\nI am writing to respectfully submit my personal statement in support of my application for permanent residence in Canada. I first arrived in Toronto on August 24, 2015, at the age of 15, and have since resided in Canada continuously for over eleven years. During this period, I completed my secondary education at a local high school, where I integrated into the community through extracurricular activities and developed lasting friendships with local residents.",
    "I subsequently pursued post-secondary education in Business Photography at a Canadian institution, completing my studies despite significant disruptions caused by the COVID-19 pandemic. Throughout my studies and beyond, I maintained stable housing, consistent social engagement, and demonstrated strong commitment to personal and professional development. I have no criminal record and have complied with all immigration conditions during my time in Canada.",
    "Following graduation, I secured employment in my field and relocated to Vancouver, British Columbia, to pursue long-term career development. After eleven years of residence, I have established deep personal, professional, and social ties to Canada. Canada has profoundly shaped my values, worldview, and identity. I respectfully request that my application for permanent residence be given favourable consideration, as I sincerely intend to continue contributing to Canadian society.\n\nThank you sincerely for your time and consideration.\n\nSincerely,\nRicardo Zhang (Zhang Yuming)",
  ];

  const [fixedParts, setFixedParts] = useState([false, false, false]);
  const [dismissedParts, setDismissedParts] = useState([false, false, false]);
  const [lastFixedPart, setLastFixedPart] = useState<number | null>(null);
  const [activeSuggestionPart, setActiveSuggestionPart] = useState<number | null>(null);
  const [popoverPosition, setPopoverPosition] = useState({ left: 0, maxHeight: 260, top: 0 });
  const [activeAiSuggestion, setActiveAiSuggestion] = useState<number | null>(null);
  const [aiPopoverPosition, setAiPopoverPosition] = useState({ left: 0, maxHeight: 180, top: 0 });
  const handledStandardizeCount = fixedParts.filter(Boolean).length + dismissedParts.filter(Boolean).length;

  const getErrorTextClassName = (partNumber: number, isActive: boolean) => {
    const classNames = ["error-text"];
    const isDismissed = dismissedParts[partNumber - 1];
    const isHandled = fixedParts[partNumber - 1] || isDismissed;
    if (isActive && !isDismissed) classNames.push("active");
    if (isActive && !isHandled) classNames.push("standardize-target", "has-fix-suggestion");
    return classNames.join(" ");
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

  const getPopoverPositionFromPoint = (
    point: { x: number; y: number },
    width: number,
    maxHeight: number,
  ) => {
    const popoverWidth = Math.min(width, window.innerWidth - 32);
    const left = Math.min(Math.max(point.x - 24, 16), window.innerWidth - popoverWidth - 16);
    const top = point.y + 12;
    const availableHeight = window.innerHeight - top - 16;
    return { left, maxHeight: Math.max(120, Math.min(maxHeight, availableHeight)), top };
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
    if (!isActive || fixedParts[partNumber - 1] || dismissedParts[partNumber - 1]) return;
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
          {standardizeSuggestions[activeSuggestionPart - 1]}
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

  useEffect(() => {
    if (lastFixedPart === null) return;
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
    if (acceptedCount !== suggestionNumber - 1) return;
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
      </div>
    );
  };

  useEffect(() => {
    if (handledStandardizeCount !== 3 || acceptedCount >= 3) return;
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
  }, [acceptedCount, handledStandardizeCount]);

  const handleSubmit = () => { onSubmit(); };

  return (
    <div className="letter-page">
      <div className="letter-box" ref={letterBoxRef}>
        <p>

          {/* ═══════════════════════════════════════════════════
              SPAN 1 — Opening header + Toronto / high school
              Permanent typos: onley, classmetes
              v7 behaviours: fancy abandon, cap fix, delayed
              discovery (arived), post-correction slowdown,
              emotional pause (meatballs), mid-word pause
              (High[pause]way)
          ═══════════════════════════════════════════════════ */}
          {step >= 1 &&
            (fixedParts[0] ? (
              <span
                className="fixed-text"
                ref={(el) => { fixedTextRefs.current[0] = el; }}
              >
                Dear Immigration Officer,<br /><br />
                I am writing to respectfully submit my personal statement in
                support of my application for permanent residence in Canada. I
                first arrived in Toronto on August 24, 2015, at the age of 15,
                and have since resided in Canada continuously for over eleven
                years. During this period, I completed my secondary education at
                a local high school, where I integrated into the community
                through extracurricular activities and developed lasting
                friendships with local residents.
              </span>
            ) : (
              <span
                className={getErrorTextClassName(1, step >= 2)}
                onMouseEnter={(event) => showFixSuggestion(1, step >= 2, event)}
                onMouseLeave={hideFixSuggestion}
              >
                {/* ── SKIP static text (permanent typos visible) ── */}
                {SKIP_TYPE_ANIMATION && (
                  <>
                    Dear Officer,<br />
                    When I first arrived in Toronto, I was onley 15 years old.
                    I enrolled in a modest-sized high school and lived with an
                    Italian-Canadian host family. My host family treated me with
                    great kindness, and to this day I still remember the
                    meatballs Anna used to make. They were the best meatballs I
                    have ever had. My high school life was simple and happy. My
                    classmetes and I would go to KTV together, and late at night
                    I would take the Route 77 bus home along Highway 7. Those
                    days were the first time I truly felt the freedom and trust
                    that came with living in Canada.<br /><br />
                  </>
                )}

                {/* ── Anim 1: "Dear Immi → Officer,\n"
                    Fancy abandon: start "Immigration", too formal, pull back ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 1 && (
                  <TypeAnimation
                    sequence={[
                      "",          1500,
                      "Dear ",     2200,
                      "Dear Immi", 1600,
                      "Dear ",      300,
                      "Dear Officer,\n", 3800,
                      () => { setActiveCursor(2); setCurrentAnimation(2); },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 130 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 55 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 1 && (
                  <span className="typing-cursor">|</span>
                )}

                {/* ── Anim 2: "when → When"
                    Cap fix: sentence-start lowercase, catch quickly ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 2 && (
                  <TypeAnimation
                    sequence={[
                      "when", 400,
                      "",      100,
                      "When",  500,
                      () => setCurrentAnimation(3),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 55 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 3: " I first arived in T → ' I first '"
                    Delayed discovery: type 6 chars past the error
                    before noticing ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 3 && (
                  <TypeAnimation
                    sequence={[
                      " I first ",           500,
                      " I first arived in T", 780,
                      " I first ",            100,
                      () => setCurrentAnimation(4),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 62 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 58 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 4: "arrived in Toronto"
                    Post-correction slowdown: type carefully after mistake ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 4 && (
                  <TypeAnimation
                    sequence={[
                      "arrived in Toronto", 480,
                      () => setCurrentAnimation(5),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 120 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 5: ", I was onley 15...host family."
                    Permanent typo "onley" (only); fast burst = missed ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 5 && (
                  <TypeAnimation
                    sequence={[
                      ", I was onley 15 years old. I enrolled in a modest-sized high school and lived with an Italian-Canadian host family.", 100,
                      () => setCurrentAnimation(6),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 75 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 6: " My host family...still remember"
                    Slowing into emotional territory ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 6 && (
                  <TypeAnimation
                    sequence={[
                      " My host family treated me with great kindness, and to this day I still remember", 100,
                      () => setCurrentAnimation(7),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 7: " the meatballs Anna used to make."
                    Emotional pause: very slow, deliberate; long pause after ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 7 && (
                  <TypeAnimation
                    sequence={[
                      " the meatballs Anna used to make.", 1800,
                      () => setCurrentAnimation(8),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 128 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 8: " They were the best meatballs I have ever had."
                    Still slow, lingering on the memory ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 8 && (
                  <TypeAnimation
                    sequence={[
                      " They were the best meatballs I have ever had.", 100,
                      () => setCurrentAnimation(9),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 95 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 9: " My high school life...Highway 7."
                    Permanent typo "classmetes"; mid-word pauses on
                    "class[700ms]metes" and "High[900ms]way" ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 9 && (
                  <TypeAnimation
                    sequence={[
                      " My high school life was simple and happy. My class",   700,
                      " My high school life was simple and happy. My classmetes and I would go to KTV together, and late at night I would take the Route 77 bus home along High", 900,
                      " My high school life was simple and happy. My classmetes and I would go to KTV together, and late at night I would take the Route 77 bus home along Highway 7.", 100,
                      () => setCurrentAnimation(10),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 68 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 10: " Those days...living in Canada.\n\n"
                    Emotional close of paragraph; slow ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 10 && (
                  <TypeAnimation
                    sequence={[
                      " Those days were the first time I truly felt the freedom and trust that came with living in Canada.\n\n", 100,
                      () => { setStep(2); setActiveCursor(3); setCurrentAnimation(11); },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 100 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 2 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* ═══════════════════════════════════════════════════
              SPAN 2 — High school (Ms. De Luca, basketball) +
                       College (pandemic, Ma Pengfei)
              Permanent typos: especialy, semster, pandamic,
                               uncertainity
              v7 behaviours: importent→important correction,
              Photo[pause]graphy mid-word pause, emotional
              slowing for Ma Pengfei / "most precious times"
          ═══════════════════════════════════════════════════ */}
          {step >= 2 &&
            (fixedParts[1] ? (
              <span
                className="fixed-text"
                ref={(el) => { fixedTextRefs.current[1] = el; }}
              >
                {" "}<br /><br />
                I subsequently pursued post-secondary education in Business
                Photography at a Canadian institution, completing my studies
                despite significant disruptions caused by the COVID-19 pandemic.
                Throughout my studies and beyond, I maintained stable housing,
                consistent social engagement, and demonstrated strong commitment
                to personal and professional development. I have no criminal
                record and have complied with all immigration conditions during
                my time in Canada.
              </span>
            ) : (
              <span
                className={getErrorTextClassName(2, step >= 3)}
                onMouseEnter={(event) => showFixSuggestion(2, step >= 3, event)}
                onMouseLeave={hideFixSuggestion}
              >
                {/* ── SKIP static text ── */}
                {SKIP_TYPE_ANIMATION && (
                  <>
                    {" "}
                    During high school, I also met many kind and supportive
                    teachers. One of them, Ms. De Luca, was especialy caring
                    toward international students. She understood the language
                    and cultural challenges we faced and always showed us extra
                    patience. Basketball also became an important way for me to
                    integrate into local life. Because of my love for the sport,
                    I made many local friends. We played basketball together,
                    watched NBA games, and talked about Kobe Bryant's final
                    All-Star Game. Through these friendships, my English
                    gradually improved from being afraid to speak, to having no
                    choice but to speak, and eventually to becoming fairly
                    fluent. Sports became the most natural way for me to connect
                    with others, and that continued later in college, at work,
                    and in everyday life.<br /><br />
                    Later, I chose Business Photography as my college major.
                    Studying art was not easy, and the future it offered was not
                    always stable, but I wanted to combine my personal interest
                    with practical skills. On the first day of college, I met
                    people who would later become very important to me, including
                    some of my closest friends during those years. In the second
                    semster of my first year, the pandamic began. The whole
                    world suddenly came to a halt. Classes moved online, and
                    both professors and students felt lost and uncertain. During
                    that difficult time, I lived with my friend Ma Pengfei. We
                    ate together, drank together, played video games, and kept
                    each other company through a period full of uncertainity.
                    After the pandemic gradually eased, I moved into David's
                    house. My friends and I went to class, played basketball,
                    went fishing, cooked, and ate together. During that time, I
                    truly experienced the happiness of having my best friends by
                    my side and the person I loved right across from me. Even
                    now, when I look back, that period remains one of the most
                    precious times in my life.<br /><br />
                  </>
                )}

                {/* ── Anim 11: " During high school...was especialy"
                    Permanent typo "especialy" (especially); fast pace ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 11 && (
                  <TypeAnimation
                    sequence={[
                      " During high school, I also met many kind and supportive teachers. One of them, Ms. De Luca, was especialy", 100,
                      () => setCurrentAnimation(12),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 55 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 12: " caring...extra patience."
                    Continue at pace ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 12 && (
                  <TypeAnimation
                    sequence={[
                      " caring toward international students. She understood the language and cultural challenges we faced and always showed us extra patience.", 100,
                      () => setCurrentAnimation(13),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 50 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 13: " Basketball also became an "
                    Hesitate before choosing the right word ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 13 && (
                  <TypeAnimation
                    sequence={[
                      " Basketball also became an ", 100,
                      () => setCurrentAnimation(14),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 14: "importent → important "
                    Corrected typo: type, pause to notice, delete 3,
                    retype ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 14 && (
                  <TypeAnimation
                    sequence={[
                      "importent",  530,
                      "import",     100,
                      "important ", 100,
                      () => setCurrentAnimation(15),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 92 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 65 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 15: " way for me...everyday life.\n\n"
                    Long narrative block; fast ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 15 && (
                  <TypeAnimation
                    sequence={[
                      " way for me to integrate into local life. Because of my love for the sport, I made many local friends. We played basketball together, watched NBA games, and talked about Kobe Bryant's final All-Star Game. Through these friendships, my English gradually improved from being afraid to speak, to having no choice but to speak, and eventually to becoming fairly fluent. Sports became the most natural way for me to connect with others, and that continued later in college, at work, and in everyday life.\n\n", 100,
                      () => setCurrentAnimation(16),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 40 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}

                {/* ── Anim 16: " Later...Business Photo[pause]graphy..."
                    Mid-word pause after "Photo" (800 ms); slow on
                    this deliberate word ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 16 && (
                  <TypeAnimation
                    sequence={[
                      " Later, I chose Business Photo",                          800,
                      " Later, I chose Business Photography as my college major.", 100,
                      () => setCurrentAnimation(17),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 17: " Studying art...those years."
                    Fast narrative ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 17 && (
                  <TypeAnimation
                    sequence={[
                      " Studying art was not easy, and the future it offered was not always stable, but I wanted to combine my personal interest with practical skills. On the first day of college, I met people who would later become very important to me, including some of my closest friends during those years.", 100,
                      () => setCurrentAnimation(18),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 45 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 18: " In the second semster...pandamic began."
                    Permanent typos "semster" (semester) and
                    "pandamic" (pandemic); emotional pause before ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 18 && (
                  <TypeAnimation
                    sequence={[
                      " In the second semster of my first year, the pandamic began.", 100,
                      () => setCurrentAnimation(19),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 19: " The whole world...Ma Pengfei."
                    Slowing on the pandemic narrative ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 19 && (
                  <TypeAnimation
                    sequence={[
                      " The whole world suddenly came to a halt. Classes moved online, and both professors and students felt lost and uncertain. During that difficult time, I lived with my friend Ma Pengfei.", 100,
                      () => setCurrentAnimation(20),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 62 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 20: " We ate...uncertainity."
                    Permanent typo "uncertainity" (uncertainty) ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 20 && (
                  <TypeAnimation
                    sequence={[
                      " We ate together, drank together, played video games, and kept each other company through a period full of uncertainity.", 100,
                      () => setCurrentAnimation(21),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 75 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 21: " After the pandemic...together."
                    Back to normal pace ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 21 && (
                  <TypeAnimation
                    sequence={[
                      " After the pandemic gradually eased, I moved into David's house. My friends and I went to class, played basketball, went fishing, cooked, and ate together.", 100,
                      () => setCurrentAnimation(22),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 55 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 22: " During that time...right across from me."
                    Very slow: emotional peak; the person I loved ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 22 && (
                  <TypeAnimation
                    sequence={[
                      " During that time, I truly experienced the happiness of having my best friends by my side and the person I loved right across from me.", 100,
                      () => setCurrentAnimation(23),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 110 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 23: " Even now...precious times in my life.\n\n"
                    Slowest in this span; long pause at end ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 23 && (
                  <TypeAnimation
                    sequence={[
                      " Even now, when I look back, that period remains one of the most precious times in my life.\n\n", 100,
                      () => { setStep(3); setActiveCursor(4); setCurrentAnimation(24); },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 110 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 3 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* ═══════════════════════════════════════════════════
              SPAN 3 — Post-graduation / grandparents /
                       Vancouver drive + life / conclusion
              Permanent typos: seperation, oppertunity
              v7 behaviours: grandparents typed very slowly
              (emotional), accidental space in "Trans-Canada
              High[space]way", re-read retype on "vastness and
              beauty", "I want to stay" typed at crawl pace
          ═══════════════════════════════════════════════════ */}
          {step >= 3 &&
            (fixedParts[2] ? (
              <span
                className="fixed-text"
                ref={(el) => { fixedTextRefs.current[2] = el; }}
              >
                {" "}<br /><br />
                Following graduation, I secured employment in my field and
                relocated to Vancouver, British Columbia, to pursue long-term
                career development. After eleven years of residence, I have
                established deep personal, professional, and social ties to
                Canada. Canada has profoundly shaped my values, worldview, and
                identity. I respectfully request that my application for
                permanent residence be given favourable consideration, as I
                sincerely intend to continue contributing to Canadian
                society.<br /><br />
                Thank you sincerely for your time and
                consideration.<br /><br />
                Sincerely,<br />
                Ricardo Zhang (Zhang Yuming)
              </span>
            ) : (
              <span
                className={getErrorTextClassName(3, step >= 4)}
                onMouseEnter={(event) => showFixSuggestion(3, step >= 4, event)}
                onMouseLeave={hideFixSuggestion}
              >
                {/* ── SKIP static text ── */}
                {SKIP_TYPE_ANIMATION && (
                  <>
                    {" "}
                    After graduation, my friends each went in different
                    directions. Some returned to China, some began working, and
                    some left. I also went through a breakup. Later, my
                    grandparents passed away one after another, which deepened
                    my understanding of seperation and loss. From that point on,
                    I began to realize how precious the connections between
                    people, places, and memories truly are.<br /><br />
                    After living in Toronto for nine years, I found a job in
                    Vancouver and decided to drive across Canada to start a new
                    chapter of my life. I travelled alone along the
                    Trans-Canada Highway, crossing the Prairies and the Rocky
                    Mountains, and finally arrived in Vancouver one evening
                    under a purple sunset. It was the first time I truly felt
                    the vastness and beauty of Canada. When I first arrived in
                    Vancouver, I lived in a semi-basement in Burnaby owned by a
                    family from Shanghai. The place was simple, but it had its
                    own bathroom and kitchen, which was enough for me at the
                    time. Later, I moved into an older apartment where I could
                    live on my own, and that was when my life in Vancouver truly
                    began.<br /><br />
                    My first impression of Vancouver was very positive. In the
                    summer, the city is full of sunshine, mountains, beaches,
                    lakes, and ocean views. I would watch sunsets at Kitsilano
                    Beach or UBC, and I would spend time on the water at the
                    lake. As someone who grew up inland, these were experiences
                    I had never had before. In the winter, Vancouver becomes
                    rainy and grey. Sometimes a light rain can last for an
                    entire week, which is why I developed the habit of taking
                    Vitamin D during the winter. Gradually, I became familiar
                    with life here: my routine became work, the gym, and home. I
                    also got to know the food around my neighbourhood, such as
                    the lunch buffet at Uncle Willy's, the beef rice at
                    Mixueyuan, and the Chinese-American food at the Metrotown
                    food court that I would crave once or twice a month. Later,
                    I made new friends here as well. We would watch the sunset
                    at English Bay, paddleboard at Deep Cove, and visit UU
                    Family Farm to see the animals. Little by little, Vancouver
                    changed from a strange new city into my new home.<br /><br />
                    Now, as my work permit is approaching its expiry date, I
                    have to seriously think about whether I can stay or must
                    leave. To be honest, I want to stay. After eleven years, I
                    have become completely used to life in Canada. I am used to
                    a social environment where English and Chinese naturally mix
                    together. I am used to being able to walk to Metrotown in
                    just a few minutes. I am used to going up to Cypress
                    Mountain late at night to look out over the ocean. I am used
                    to flying three and a half hours back to Toronto to see my
                    old friends. Canada has shaped who I am today. What it has
                    taught me is not only language, knowledge, or skills, but
                    also a way of life: respect, inclusion, self-discipline, and
                    an understanding of freedom.<br /><br />
                    I also understand that Canada now faces real challenges,
                    including a high cost of living and increasing pressure in
                    daily life. The high gas prices and living expenses in
                    British Columbia have also been difficult for me. Even so,
                    this place remains deeply important to me. To me, Canada is
                    not only a country where I once lived; it is the place that
                    helped me become the person I am today. If possible, I
                    sincerely hope to continue living and working here, to carry
                    forward everything I have built, and to give back to this
                    society in my own way.<br /><br />
                    Thank you for taking the time to read my statement, and
                    thank you to Canada for giving me growth, freedom, and
                    oppertunity over the past eleven years.<br /><br />
                    Sincerely,<br />
                    Ricardo Zhang<br />
                    Zhang Yuming
                  </>
                )}

                {/* ── Anim 24: " After graduation...breakup."
                    Medium pace; matter-of-fact ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 24 && (
                  <TypeAnimation
                    sequence={[
                      " After graduation, my friends each went in different directions. Some returned to China, some began working, and some left. I also went through a breakup.", 100,
                      () => setCurrentAnimation(25),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 62 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 25: " Later, my grandparents"
                    Emotional slow: this sentence is hard to write;
                    long pause after ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 25 && (
                  <TypeAnimation
                    sequence={[
                      " Later, my grandparents", 1800,
                      () => setCurrentAnimation(26),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 128 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 26: " passed away one after another,"
                    Slowest typing in the whole letter ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 26 && (
                  <TypeAnimation
                    sequence={[
                      " passed away one after another,", 100,
                      () => setCurrentAnimation(27),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 138 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 27: " which deepened...seperation and loss."
                    Permanent typo "seperation" (separation); slow ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 27 && (
                  <TypeAnimation
                    sequence={[
                      " which deepened my understanding of seperation and loss.", 100,
                      () => setCurrentAnimation(28),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 95 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 28: " From that point on...truly are.\n\n"
                    Recovering pace; long pause before next paragraph ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 28 && (
                  <TypeAnimation
                    sequence={[
                      " From that point on, I began to realize how precious the connections between people, places, and memories truly are.\n\n", 100,
                      () => setCurrentAnimation(29),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}

                {/* ── Anim 29: " After living...Trans"
                    Sets up for accidental-space block; steady pace ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 29 && (
                  <TypeAnimation
                    sequence={[
                      " After living in Toronto for nine years, I found a job in Vancouver and decided to drive across Canada to start a new chapter of my life. I travelled alone along the Trans", 100,
                      () => setCurrentAnimation(30),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 62 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 30: "-Canada High[space]way..." accidental space
                    Mistouch space bar mid-word; instant reflex delete ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 30 && (
                  <TypeAnimation
                    sequence={[
                      "-Canada High",   100,
                      "-Canada High ",   230,
                      "-Canada Highway, crossing the Prairies and the Rocky Mountains, and finally arrived in Vancouver one evening under a purple sunset.", 600,
                      () => setCurrentAnimation(31),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 62 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 38 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 31: " It was...vastness and beauty of Canada."
                    Re-read retype: type sentence, pause to re-read,
                    delete most, retype ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 31 && (
                  <TypeAnimation
                    sequence={[
                      " It was the first time I truly felt the vastness and beauty of Canada.",  1600,
                      " It was the first time",  550,
                      " It was the first time I truly felt the vastness and beauty of Canada.",  700,
                      () => setCurrentAnimation(32),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 90 }}
                    deletionSpeed={{ type: "keyStrokeDelayInMs", value: 28 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 32: " When I first arrived in Vancouver...new home.\n\n"
                    Long descriptive Vancouver passage; fast ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 32 && (
                  <TypeAnimation
                    sequence={[
                      " When I first arrived in Vancouver, I lived in a semi-basement in Burnaby owned by a family from Shanghai. The place was simple, but it had its own bathroom and kitchen, which was enough for me at the time. Later, I moved into an older apartment where I could live on my own, and that was when my life in Vancouver truly began.\n\nMy first impression of Vancouver was very positive. In the summer, the city is full of sunshine, mountains, beaches, lakes, and ocean views. I would watch sunsets at Kitsilano Beach or UBC, and I would spend time on the water at the lake. As someone who grew up inland, these were experiences I had never had before. In the winter, Vancouver becomes rainy and grey. Sometimes a light rain can last for an entire week, which is why I developed the habit of taking Vitamin D during the winter. Gradually, I became familiar with life here: my routine became work, the gym, and home. I also got to know the food around my neighbourhood, such as the lunch buffet at Uncle Willy's, the beef rice at Mixueyuan, and the Chinese-American food at the Metrotown food court that I would crave once or twice a month. Later, I made new friends here as well. We would watch the sunset at English Bay, paddleboard at Deep Cove, and visit UU Family Farm to see the animals. Little by little, Vancouver changed from a strange new city into my new home.\n\n", 100,
                      () => setCurrentAnimation(33),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 30 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}

                {/* ── Anim 33: " Now...stay or must leave."
                    Slowing into the conclusion; weight of this moment ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 33 && (
                  <TypeAnimation
                    sequence={[
                      " Now, as my work permit is approaching its expiry date, I have to seriously think about whether I can stay or must leave.", 100,
                      () => setCurrentAnimation(34),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 88 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 34: " To be honest,"
                    Pause 2800 ms after this phrase; long emotional beat ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 34 && (
                  <TypeAnimation
                    sequence={[
                      " To be honest,", 2800,
                      () => setCurrentAnimation(35),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 115 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 35: " I want to stay."
                    Slowest emotional line in the whole letter ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 35 && (
                  <TypeAnimation
                    sequence={[
                      " I want to stay.", 100,
                      () => setCurrentAnimation(36),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 135 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 36: " After eleven years...understanding of freedom."
                    Measured, reflective pace ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 36 && (
                  <TypeAnimation
                    sequence={[
                      " After eleven years, I have become completely used to life in Canada. I am used to a social environment where English and Chinese naturally mix together. I am used to being able to walk to Metrotown in just a few minutes. I am used to going up to Cypress Mountain late at night to look out over the ocean. I am used to flying three and a half hours back to Toronto to see my old friends. Canada has shaped who I am today. What it has taught me is not only language, knowledge, or skills, but also a way of life: respect, inclusion, self-discipline, and an understanding of freedom.", 100,
                      () => setCurrentAnimation(37),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 68 }}
                    cursor={false}
                  />
                )}

                {/* ── Anim 37: " I also understand...my own way."
                    Steady close ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 37 && (
                  <TypeAnimation
                    sequence={[
                      "\n\nI also understand that Canada now faces real challenges, including a high cost of living and increasing pressure in daily life. The high gas prices and living expenses in British Columbia have also been difficult for me. Even so, this place remains deeply important to me. To me, Canada is not only a country where I once lived; it is the place that helped me become the person I am today. If possible, I sincerely hope to continue living and working here, to carry forward everything I have built, and to give back to this society in my own way.", 100,
                      () => setCurrentAnimation(38),
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 65 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}

                {/* ── Anim 38: " Thank you...Zhang Yuming"
                    Permanent typo "oppertunity" (opportunity);
                    closing the letter slowly ── */}
                {!SKIP_TYPE_ANIMATION && currentAnimation >= 38 && (
                  <TypeAnimation
                    sequence={[
                      "\n\nThank you for taking the time to read my statement, and thank you to Canada for giving me growth, freedom, and oppertunity over the past eleven years.\n\nSincerely,\nRicardo Zhang\nZhang Yuming", 100,
                      () => { setStep(4); setActiveCursor(5); setCurrentAnimation(39); },
                    ]}
                    wrapper="span"
                    speed={{ type: "keyStrokeDelayInMs", value: 80 }}
                    cursor={false}
                    style={{ whiteSpace: "pre-line" }}
                  />
                )}
                {!SKIP_TYPE_ANIMATION && activeCursor === 4 && (
                  <span className="typing-cursor">|</span>
                )}
              </span>
            ))}

          {/* ── Ending cursor; transitions step 4 → 5 ── */}
          {!SKIP_TYPE_ANIMATION && step >= 4 && acceptedCount === 0 && (
            <TypeAnimation
              sequence={[
                "",
                () => { setStep(5); },
              ]}
              wrapper="span"
              speed={{ type: "keyStrokeDelayInMs", value: 90 }}
              cursor={true}
            />
          )}

          {/* ═══════════════════════════════════════════════════
              AI SUGGESTIONS (unlocked after all 3 spans fixed)
          ═══════════════════════════════════════════════════ */}
          {step >= 5 && handledStandardizeCount === 3 && (
            <>
              {acceptedCount >= 0 && (
                <span
                  className={
                    acceptedCount >= 1
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(el) => { suggestionTextRefs.current[0] = el; }}
                  onMouseEnter={(event) => showAiSuggestion(1, event)}
                  onMouseLeave={hideAiSuggestion}
                >
                  {" "}
                  During my time in Canada, I completed both my secondary and
                  post-secondary education and obtained a diploma in Business
                  Photography. Throughout my studies, I fulfilled academic
                  requirements while progressively improving my language
                  proficiency and professional skills. In addition, through
                  participation in sports and daily social interactions, I have
                  established stable local relationships and developed strong
                  English communication skills, as well as cross-cultural
                  adaptability.<br /><br />
                </span>
              )}

              {acceptedCount >= 1 && (
                <span
                  className={
                    acceptedCount >= 2
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(el) => { suggestionTextRefs.current[1] = el; }}
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
                  environment.<br /><br />
                </span>
              )}

              {acceptedCount >= 2 && (
                <span
                  className={
                    acceptedCount >= 3
                      ? "suggestion-text accepted"
                      : "suggestion-text"
                  }
                  ref={(el) => { suggestionTextRefs.current[2] = el; }}
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
                  Thank you for your time and consideration.<br /><br />
                  Sincerely,<br />Ricardo (Yuming Zhang)
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
