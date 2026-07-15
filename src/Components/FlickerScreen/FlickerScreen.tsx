import "./FlickerScreen.css";

const FlickerScreen = () => {
  return (
    <div className="screen-issue-overlay" aria-hidden="true">
      <div className="screen-issue-noise" />
      <div className="screen-issue-tears" />
    </div>
  );
};

export default FlickerScreen;
