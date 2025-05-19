import React from "react";
import { Link } from "react-router-dom";
import "./Landing.css";
import { useTheme } from "../ThemeContext";

const Landing = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";
  return (
    <div className="landing-page container-fluid px-0">
      <section className="landing-carousel-section">
        <div
          id="lyfterCarousel"
          className="carousel slide carousel-fade"
          data-bs-ride="carousel"
          data-bs-interval="4000"
          data-bs-pause="hover"
          data-bs-touch="true"
        >
          <div className="carousel-inner">
            <div className="carousel-item active">
              <img
                src="arobh.jpg"
                className="d-block w-100 landing-carousel-img"
                alt="Slide 1"
                onClick={() => (window.location.href = "/rides")}
              />
              {/* <div className="carousel-caption d-none d-md-block">
                <h2 className="fw-bold">Welcome to Lyfter</h2>
                <p>
                  Smarter, affordable, and more human ride-sharing experience.
                </p>
              </div> */}
            </div>

            <div className="carousel-item">
              <img
                src="avnish.jpg"
                className="d-block w-100 landing-carousel-img"
                alt="Slide 2"
                onClick={() => (window.location.href = "/signup")}
              />
              {/* <div className="carousel-caption d-none d-md-block">
                <h2 className="fw-bold">Drive & Earn</h2>
                <p>
                  Post your route, find passengers, and make your drive pay.
                </p>
              </div> */}
            </div>

            <div className="carousel-item">
              <img
                src="simran.jpg"
                className="d-block w-100 landing-carousel-img"
                alt="Slide 3"
                onClick={() => (window.location.href = "/about")}
              />
              {/* <div className="carousel-caption d-none d-md-block">
                <h2 className="fw-bold">Reverse Requests</h2>
                <p>Let drivers find passengers and passengers find you.</p>
              </div> */}
            </div>
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

      {/* About Us CTA */}
      <section
        className={`landing-about-cta py-5 text-center ${
          isDark ? "text-light" : "text-dark"
        }`}
      >
        <h2 className="fw-bold mb-3">Want to Know About Us More?</h2>
        <p className="mb-4">
          Explore our vision, values, and the team behind Lyfter.
        </p>
        <Link to="/about" className="btn btn-outline-light btn-lg">
          Learn More
        </Link>
      </section>

      {/* Stats Section */}
      <section className="landing-stats-section py-5 text-center bg-light">
        <div className="container">
          <h2 className="fw-bold mb-4">Lyfter in Numbers</h2>
          <div className="row">
            <div className="col-md-4 mb-3">
              <h3 className="fw-bold">50K+</h3>
              <p className="text-muted">Rides Completed</p>
            </div>
            <div className="col-md-4 mb-3">
              <h3 className="fw-bold">4.9★</h3>
              <p className="text-muted">Average Driver Rating</p>
            </div>
            <div className="col-md-4 mb-3">
              <h3 className="fw-bold">25+ Cities</h3>
              <p className="text-muted">Service Coverage</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="landing-testimonials py-5 text-center bg-white">
        <div className="container">
          <h2 className="fw-bold mb-5">What Our Users Say</h2>
          <div className="row">
            <div className="col-md-6 mb-4">
              <div className="testimonial p-4 shadow-sm h-100">
                <p className="mb-3">
                  "Lyfter helped me cut travel costs in half while meeting
                  amazing people!"
                </p>
                <h6 className="fw-bold">— Meena, College Student</h6>
              </div>
            </div>
            <div className="col-md-6 mb-4">
              <div className="testimonial p-4 shadow-sm h-100">
                <p className="mb-3">
                  "As a driver, I can post my route and get passengers
                  instantly. Super efficient."
                </p>
                <h6 className="fw-bold">— Rajeev, Daily Commuter</h6>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="landing-cta-section text-center py-5 bg-primary text-white">
        <h2 className="fw-bold mb-3">Join the Lyfter Movement</h2>
        <p className="mb-4">
          Thousands are saving money and riding smart — you can too.
        </p>
        <Link to="/signup" className="btn btn-light btn-lg px-5">
          Get Started
        </Link>
      </section>
    </div>
  );
};

export default Landing;
