import { TypeAnimation } from "react-type-animation";
import { useEffect, useRef, useState } from "react";
import "./TextBox.css";

const SKIP_TYPE_ANIMATION = import.meta.env.DEV;

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
  const [showStandardizePreview, setShowStandardizePreview] = useState(false);
  const fixedTextRefs = useRef<Array<HTMLSpanElement | null>>([]);
  const suggestionTextRefs = useRef<Array<HTMLSpanElement | null>>([]);

  // standardize text count
  const [fixedCount, setFixedCount] = useState(0);

  const getErrorTextClassName = (partNumber: number, isActive: boolean) => {
    const classNames = ["error-text"];

    if (isActive) {
      classNames.push("active");
    }

    if (fixedCount === partNumber - 1) {
      classNames.push("standardize-target");
    }

    return classNames.join(" ");
  };

  const handleFix = () => {
    if (fixedCount < 3) {
      setShowStandardizePreview(false);
      setFixedCount((prev) => prev + 1);
      onStandardizeStep();
    }
  };

  useEffect(() => {
    if (fixedCount === 0) {
      return;
    }

    fixedTextRefs.current[fixedCount - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [fixedCount]);

  // suggestion text count
  const [acceptedCount, setAcceptedCount] = useState(0);
  const handleAccept = () => {
    if (acceptedCount < 3) {
      setAcceptedCount((prev) => prev + 1);
      onEffectStep();
    }
  };

  useEffect(() => {
    if (acceptedCount === 0) {
      return;
    }

    suggestionTextRefs.current[acceptedCount - 1]?.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  }, [acceptedCount]);

  const handleSubmit = () => {
    onSubmit();
  };

  return (
    <div
      className={
        showStandardizePreview
          ? "letter-page standardize-preview"
          : "letter-page"
      }
    >
      <div className="letter-box">
        <p>
          {/* Suggestion 1 */}
          {step >= 1 &&
            (fixedCount >= 1 ? (
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
              <span className={getErrorTextClassName(1, step >= 2)}>
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

                      "of who I wanted to become. ",
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
            (fixedCount >= 2 ? (
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
              <span className={getErrorTextClassName(2, step >= 3)}>
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
                      "I never",
                      2000,

                      "I never anticip",
                      1600,

                      "I never ",
                      500,

                      "I never imagined that ",
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

                      "and moments of growth in my entire life - ",
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
            (fixedCount >= 3 ? (
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
              <span className={getErrorTextClassName(3, step >= 4)}>
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
                      "or that Canada",
                      1400,

                      "or that Canada would ",
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

          {step >= 5 && fixedCount >= 3 && (
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

      {/* Button */}
      {step >= 2 && fixedCount < 3 && (
        <button
          className="standardize-btn"
          onClick={handleFix}
          onMouseEnter={() => setShowStandardizePreview(true)}
          onMouseLeave={() => setShowStandardizePreview(false)}
        >
          Standardize
        </button>
      )}

      {step >= 4 && fixedCount >= 3 && acceptedCount < 3 && (
        <button className="standardize-btn" onClick={handleAccept}>
          Accept
        </button>
      )}

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
