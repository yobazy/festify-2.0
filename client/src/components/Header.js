import React, { useState, useEffect } from "react";
import headerImg from "../images/banner.png";
import headerVideo from "../videos/header-video.mp4";
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
      {/* <img src={headerImg} className="header-img" alt="header" /> */}
      <video autoPlay loop muted playsInline className="inset-0 w-full h-[90vh] object-cover opacity-40 mx-auto blur-sm">
        <source src={headerVideo} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      <div className="text-white absolute inset-0 text-bold pt-48 align-center ">
        <div className="grid grid-cols-2 flex-wrap header-title">
          <p className="text-right">Discover</p>
          <span className="ps-4 rotating-word">{headerWords[currentWordIndex]}</span>
        </div>
        <div className="text-center">
        <button className="p-2 text-white bg-purple-800 hover:bg-purple-700 text-center rounded-md transition-colors duration-150 ease-in-out" onClick={scrollDown} >
          Browse events
        </button>
        </div>
      </div>
    </div>
  );
}
