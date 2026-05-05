import "./MainPanel.css";

const MainPanel = () => {
  return (
    <div className="mainpanel">
      <div className="apply">APPLY</div>
      <div className="path">
        <p className="underline-text">Canina.na</p>
        <p className="arrow">{">"}</p>
        <p className="underline-text">Immigration and citizenship</p>
        <p className="arrow">{">"}</p>
        <p className="underline-text">Live in Canina</p>
        <p className="arrow">{">"}</p>
        <p className="underline-text">Statement
        Submission</p>
      </div>
      <div className="main-subtitle">
        <h3>Statement</h3>
        <h2>Create your profile and enter the pool</h2>
        <hr className="redline" />
      </div>
    </div>
  );
};

export default MainPanel;
