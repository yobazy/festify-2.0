import React, { useState, useEffect } from "react";
import { Link, useNavigate, Navigate } from "react-router-dom";
import logo from "../images/icon.png";
import headerImg from "../images/banner.png";
import '../App.css';


export default function Header() {
  const headerWords = ["festivals", "playlists", "artists"];
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setCurrentWordIndex(currentWordIndex => (currentWordIndex + 1) % headerWords.length);
    }, 3000); // Change word every 3 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="header-box">
      <img src={headerImg} className="header-img" alt="header" />
      <div className="header-txt">
        <p className="text-lg">
          Discover <span className="rotating-word">{headerWords[currentWordIndex]}</span>
        </p>
        <h3 className="">
          BUTTON Let's go! BUTTON
        </h3>
      </div>
    </div>
  );
}
