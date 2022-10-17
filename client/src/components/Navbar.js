import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../images/icon.png";

export default function Navbar(props) {
  const [click, setClick] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    setClick(!click);
  };

  const closeMobileMenu = () => {
    setClick(false);
  };

  const logOut = () =>  {
    console.log('Logging out...')
    props.switchLogin()
    navigate("/")
  }

  function CheckUser(props) {
    console.log("check user called");
    console.log(props, "props");
    
    if (props.token) {
      return (
        <>
          <li className="nav-item">
            <Link to="/create" className="nav-links" onClick={closeMobileMenu}>
              Create Ad
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/view" className="nav-links" onClick={closeMobileMenu}>
              View Ad
            </Link>
          </li>
          <li className="nav-item nav-log">
            {/* <button onClick={props.logOut}>Log Out</button> */}
            <button onClick={logOut} className="nav-links">Log Out</button>
            {/* <Link to="/logout" onClick={props.switchLogin} className="nav-links">
              Log Out
            </Link> */}
          </li>
        </>
      );
    }
    return (
      <>
        <li className="nav-item">
          <Link to="/login" className="nav-links" onClick={closeMobileMenu}>
            Log In
          </Link>
        </li>
        {/* <li className="nav-item">
          <Link href="/signup" className="nav-links" onClick={closeMobileMenu}>
            Sign Up
          </Link>
        </li> */}
      </>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-name nav-items">
          <img src={logo} width={40} alt="logo"></img>
          <a href="/" className="nav-links name">
            Festify
          </a>
          {/* <div className="menu-icon" onClick={handleClick}>
            <i className={click ? "fas fa-times" : "fas fa-bars"}></i>
          </div> */}
        </div>
        <div >
          <ul className={click ? "nav-menu-active nav-items" : "nav-menu nav-items"}>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                Home
              </Link>
            </li>
            <CheckUser className="nav-links" token={props.token} logOut={props.switchLogin}/>
            {/* The following should show when not logged in */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
