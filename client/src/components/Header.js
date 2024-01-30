import React, { useState, useEffect } from "react";
import logo from "../images/icon.png";
import headerImg from "../images/banner.png";
// import '../App.css';
import '../output.css';

const scrollDown = () => {
    // Calculate the viewport height
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Scroll down by one viewport height
    window.scrollBy({
      top: viewportHeight, // 100% of the viewport height
      left: 0,
      behavior: 'smooth' // Smooth scrolling
    });
}

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
        <p className="header-title">
          Discover <span className="rotating-word">{headerWords[currentWordIndex]}</span>
        </p>
        <button onClick={scrollDown} className="">
          Browse events
        </button>
      </div>
    </div>
  );
}
