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
        <h1 className="">Welcome to Festify!</h1>
        <h3 className="">
          Search for a event below. Festify will generate a Spotify playlist
          based on the event's lineup!
        </h3>
      </div>
    </div>
  );
}
