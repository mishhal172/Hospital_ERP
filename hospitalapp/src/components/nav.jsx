import React from "react";
import "./nav.css";

function Nav() {
  const handleHamburgerClick = () => {
    const sidebar = document.querySelector(".sidebar");
    
    if (sidebar) {
      sidebar.classList.toggle("active-sidebar");
    } else {
      console.error("Sidebar element not found in the DOM!");
    }
  };

  return (
    <div className="navbar">
      <div className="nav-left">
        <button className="hamburger" onClick={handleHamburgerClick} aria-label="Toggle Menu">
          <span></span>
          <span></span>
          <span></span>
        </button>
        
        <img src="image/hospital.webp" alt="logo" />
        <h2>Hospital</h2>
      </div>
      <p>Your Health, Our Priority</p>
    </div>
  );
}

export default Nav;