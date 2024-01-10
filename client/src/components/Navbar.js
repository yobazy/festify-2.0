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

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo-name nav-items">
          <img src={logo} width={30} alt="logo"></img>
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
                Events
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                Artists (coming soon)
              </Link>
            </li>
            <li className="nav-item">
              <Link to="/" className="nav-links" onClick={closeMobileMenu}>
                Connect to Spotify
              </Link>
            </li>
            {/* <CheckUser className="nav-links" token={props.token} logOut={props.switchLogin}/> */}
            {/* The following should show when not logged in */}
          </ul>
        </div>
      </div>
    </nav>
  );
}
