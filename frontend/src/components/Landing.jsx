import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import LandingStats from "./LandingStats";
import "./Landing.css";
import { useTheme } from "../ThemeContext";

const Landing = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div
      className={`landing-page container-fluid px-0 py-5 ${
        isDark ? "bg-dark text-light" : "bg-white text-dark"
      }`}
    >
      <header className="text-center mb-5">
        <h1 className="display-4 fw-bold about-header animate-fade-in">
          Welcome to
        </h1>
        <img
          src={`${isDark ? "lyfter_text_white.png" : "lyfter_text_black.png"}`}
          alt="Lyfter Hero"
          className="img-fluid animate-zoom-in about-hero-img"
        />
        <p className="lead">Revolutionizing the way you ride.</p>
      </header>

      <section className="landing-carousel-section px-3">
        <div
          id="lyfterCarousel"
          className="carousel slide"
          data-bs-ride="carousel"
          data-bs-interval="3000"
        >
          <div className="carousel-inner">
            {[1, 2, 3].map((slide, i) => (
              <div
                key={i}
                className={`carousel-item ${i === 0 ? "active" : ""}`}
              >
                <img
                  src={`Lyfter_Banner_${i + 1}.png`}
                  className="landing-carousel-img"
                  alt={`Slide ${i + 1}`}
                  onClick={() => {
                    const links = ["/#", "/dashboard", "/driver-dashboard"];
                    window.location.href = links[i];
                  }}
                />
              </div>
            ))}
          </div>

          <button
            className="carousel-control-prev"
            type="button"
            data-bs-target="#lyfterCarousel"
            data-bs-slide="prev"
          >
            <span
              className="carousel-control-prev-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Previous</span>
          </button>
          <button
            className="carousel-control-next"
            type="button"
            data-bs-target="#lyfterCarousel"
            data-bs-slide="next"
          >
            <span
              className="carousel-control-next-icon"
              aria-hidden="true"
            ></span>
            <span className="visually-hidden">Next</span>
          </button>
        </div>
      </section>

      <LandingStats />

      <section
        className={`landing-testimonials py-5 text-center ${
          isDark ? "bg-dark text-light" : "bg-white text-dark"
        }`}
      >
        <div className="container">
          <h2 className="fw-bold mb-5">What Our Users Say</h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div
                className={`testimonial p-4 shadow-sm h-100 ${
                  isDark ? "bg-dark border text-light" : "bg-light text-dark"
                }`}
              >
                <p className="mb-3">
                  "Lyfter helped me cut travel costs in half while meeting
                  amazing people!"
                </p>
                <h6 className="fw-bold">— Person, Designation</h6>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div
                className={`testimonial p-4 shadow-sm h-100 ${
                  isDark ? "bg-dark border text-light" : "bg-light text-dark"
                }`}
              >
                <p className="mb-3">
                  "As a driver, I can post my route and get passengers
                  instantly. Super efficient."
                </p>
                <h6 className="fw-bold">— Person, Designation</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section
        className={`landing-about-cta py-5 text-center ${
          isDark ? "bg-dark text-light" : "bg-white text-dark"
        }`}
      >
        <h2 className="fw-bold mb-3">Want to Know About Us More?</h2>
        <p className="mb-4">
          Explore our vision, values, and the team behind Lyfter.
        </p>
        <Link
          to="/about"
          className={`btn btn-lg ${
            isDark ? "btn-outline-light" : "btn-outline-dark"
          }`}
        >
          Learn More
        </Link>
      </section>

      <section
        className={`landing-cta-section text-center py-5 ${
          isDark ? "text-light" : "text-dark"
        }`}
      >
        <h2 className="fw-bold mb-3">Join the Lyfter Movement</h2>
        <p className="mb-4">
          Thousands are saving money and riding smart — you can too.
        </p>
        <Link
          to="/dashboard"
          className={`btn btn-lg px-5 ${isDark ? "btn-light" : "btn-dark"}`}
        >
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default Landing;
