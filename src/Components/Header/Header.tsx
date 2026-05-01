import "./Header.css";
import searchBtn from "../../assets/searchBtn.png";
import logo from "../../assets/logo.png";
const Header = () => {
  return (
    <>
      <div className="header">
        <div className="logo-section">
          <img className="logo" src={logo} />
          <p className="logo-text">Goverment of Canhina</p>
          <p className="logo-text-cn">卡尼亚共和国移民局</p>
        </div>
        <div className="search-bar">
          <input
            className="search-input"
            type="text"
            placeholder="Search"
            readOnly
          />
          <img className="search-btn" src={searchBtn} />
        </div>
      </div>
      
    </>
  );
};

export default Header;
