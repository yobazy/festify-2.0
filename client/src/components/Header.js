import React, { useState } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import "./Navbar.css";
import logo from "../images/icon.png";
import headerImg from "../images/banner.png";
import '../App.css';


export default function Header() {
  return (
    <div className="header-box">
      <img src={headerImg} className="header-img" alt="header" />
      <div className="header-txt">
        <p className="lrg">Welcome to Festify!</p>
        <p className="med">
          Search for a event below. Festify will generate a Spotify playlist
          based on the event's lineup!
        </p>
      </div>
    </div>
  );
}
