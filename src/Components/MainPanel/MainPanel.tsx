import { useState } from "react";
import TextBox from "../TextBox/TextBox";
import SubmissionComplete from "../SubmissionComplete/SubmissionComplete";
import "./MainPanel.css";

type MainPanelProps = {
  onEffectStep: () => void;
  onStandardizeStep: () => void;
  onSubmit: () => void;
  onStartOver: () => void;
};

const MainPanel = ({
  onEffectStep,
  onStandardizeStep,
  onSubmit,
  onStartOver,
}: MainPanelProps) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    onSubmit();
    setSubmitted(true);
  };

  return (
    <div className="mainpanel">
      <div className="apply">APPLY</div>

      {submitted ? (
        <SubmissionComplete onStartOver={onStartOver} />
      ) : (
        <>
          <div className="path">
            <p className="underline-text">Canina.na</p>
            <p className="arrow">{">"}</p>
            <p className="underline-text">Immigration and citizenship</p>
            <p className="arrow">{">"}</p>
            <p className="underline-text">Live in Canina</p>
            <p className="arrow">{">"}</p>
            <p className="underline-text">Statement Submission</p>
          </div>
          <div className="main-subtitle">
            <h3>Statement</h3>
            <h2>Create your profile and enter the pool</h2>
            <hr className="redline" />
          </div>
          <TextBox
            onSubmit={handleSubmit}
            onEffectStep={onEffectStep}
            onStandardizeStep={onStandardizeStep}
          />
        </>
      )}
    </div>
  );
};

export default MainPanel;
