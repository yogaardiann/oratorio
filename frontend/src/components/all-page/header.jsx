import React, { useState, useEffect } from "react";
import "./header.css";

function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  const [user, setUser] = useState(null);

  // Load user dari localStorage ketika header ditampilkan
  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      setUser(JSON.parse(u));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <header className="site-header">
      <div className="header-container">

        {/* LEFT: Logo */}
        <div className="header-left">
          <a href="/" className="header-brand">ORATORIO</a>
        </div>

        {/* CENTER MENU */}
        <div className="header-center">
          <a href="/" className="header-link">Home</a>
          <a href="/history" className="header-link">History</a>

          <div
            className="header-dropdown"
            onMouseEnter={() => setIsHistoryOpen(true)}
            onMouseLeave={() => setIsHistoryOpen(false)}
          >
            <button className="header-link dropdown-toggle">
              Torio
              <svg className="chevron-icon" width="14" height="14" viewBox="0 0 24 24">
                <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
              </svg>
            </button>

            {isHistoryOpen && (
              <div className="dropdown-menu">
                <a href="/ar" className="dropdown-item">🌀 AR Interface</a>
                <a href="/vr" className="dropdown-item">👓 VR Interface</a>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT SIDE: USER */}
        <div className="header-right">
          <div
            className="user-dropdown"
            onClick={() => setIsUserOpen(!isUserOpen)}
          >
            <div className="user-icon-container">
              <span>
                {user ? user.email.split("@")[0] : "User"}
              </span>

              <svg className="chevron-icon" width="14" height="14" viewBox="0 0 24 24">
                <path d="M7 10L12 15L17 10H7Z" fill="currentColor" />
              </svg>
            </div>

            {isUserOpen && (
              <div className="dropdown-menu user-menu">

                {!user && (
                  <>
                    <a href="/login" className="dropdown-item">Login</a>
                    <a href="/register" className="dropdown-item">Register</a>
                  </>
                )}

                {user && (
                  <>
                    <a href="/profile" className="dropdown-item">Profile</a>
                    <button onClick={handleLogout} className="dropdown-item" style={{ textAlign: "left", background: "none", border: "none", cursor: "pointer" }}>
                      Logout
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MOBILE HAMBURGER */}
          <div className="hamburger-menu" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            <div className="bar"></div>
            <div className="bar"></div>
            <div className="bar"></div>
          </div>

        </div>
      </div>

      {/* MOBILE MENU */}
      <div className={`header-links-mobile ${isMenuOpen ? "active" : ""}`}>
        <a href="/" className="header-link">Home</a>
        <a href="/history" className="header-link">History</a>

        {!user && (
          <>
            <a href="/login" className="header-link">Login</a>
            <a href="/register" className="header-link">Register</a>
          </>
        )}

        {user && (
          <>
            <a href="/profile" className="header-link">Profile</a>
            <a onClick={handleLogout} className="header-link">Logout</a>
          </>
        )}
      </div>
    </header>
  );
}

export default Header;
