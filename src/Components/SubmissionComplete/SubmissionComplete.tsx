import { useEffect, useState } from "react";
import "./SubmissionComplete.css";

type SubmissionCompleteProps = {
  onStartOver: () => void;
};

function formatDateTime(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  const Y = d.getFullYear();
  const M = pad(d.getMonth() + 1);
  const D = pad(d.getDate());
  const h = pad(d.getHours());
  const m = pad(d.getMinutes());
  const s = pad(d.getSeconds());
  return `${Y}-${M}-${D} ${h}:${m}:${s}`;
}

const SubmissionComplete = ({ onStartOver }: SubmissionCompleteProps) => {
  const [timestamp, setTimestamp] = useState("");

  useEffect(() => {
    setTimestamp(formatDateTime(new Date()));
  }, []);

  return (
    <div className="submission-complete">
      <div className="toolbar">
        <p>[Close] [Print Receipt]</p>
      </div>
      <div className="submission-status">
        <p>
          Application Status: <span className="bold">Submitted</span>
        </p>
        <p>Submission ID: CAN-PR-2026-08X99Z</p>
        <p>
          Date/Time: <span>{timestamp}</span>
        </p>
      </div>
      <div className="submission-detail">
        <p>
          Your application for a Work Permit has been successfully recorded in
          our central database.
        </p>
        <p>
          Current Status: <span className="boldRed">Pending Review</span>
        </p>
        <p>
          Estimated Wait Time: <span className="boldRed">Unknown</span>
        </p>
      </div>
      <div className="submission-status">
        <p>
          Please do not contact our offices regarding the status of this
          application. Any further inquiries may result in processing delays.
        </p>
      </div>
      <button className="restart-btn" onClick={onStartOver}>
        Start Over
      </button>
    </div>
  );
};

export default SubmissionComplete;
