import React, { useContext } from "react";
import { useTheme } from "../ThemeContext";
import "./About.css";

const About = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`about-page py-5`}>
      <div className="container">
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold about-header animate-fade-in">
            Welcome to
          </h1>
          <img
            src={`${
              isDark ? "lyfter_text_white.png" : "lyfter_text_black.png"
            }`}
            alt="Lyfter Hero"
            className="img-fluid animate-zoom-in about-hero-img"
          />
          <p className="lead">Revolutionizing the way you ride.</p>
        </header>

        <section className="row align-items-center mb-5">
          <div className="col-md-6">
            <img
              src="carpool_waze.gif"
              className="img-fluid rounded shadow about-mission-img w-100"
              alt="Mission"
            />
          </div>
          <div className="col-md-6">
            <h2 className="fw-bold mb-3">Our Mission</h2>
            <p>
              At Lyfter, our mission is to provide safe, affordable, and
              eco-friendly rides to everyone, everywhere. We connect riders and
              drivers in real-time with a reliable experience that goes beyond
              transportation.
            </p>
          </div>
        </section>

        <section className="mb-5">
          <h2 className="text-center fw-bold mb-4">Why Choose Lyfter?</h2>
          <div className="row text-center">
            <div className="col-md-4 mb-4">
              <div className="card h-100 about-feature-card shadow-sm animate-slide-up">
                <div className="card-body">
                  <i className="bi bi-shield-check display-4 mb-3 text-success"></i>
                  <h5 className="card-title">Easy Booking Experience</h5>
                  <p className="card-text">
                    Our easy-to-use app and website help you book rides fast and
                    hassle-free, so you can stay focused on your day. With just
                    a few taps, you can schedule a ride, track your driver live,
                    and get real-time updates — all in one simple flow. Lyfter
                    keeps travel stress-free, giving you more time for what
                    really matters.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 about-feature-card shadow-sm animate-slide-up delay-1">
                <div className="card-body">
                  <i className="bi bi-cash-coin display-4 mb-3 text-warning"></i>
                  <h5 className="card-title">
                    Flexible Pricing & Mutual Bargaining
                  </h5>
                  <p className="card-text">
                    At Lyfter, we offer transparent base fares so you know
                    exactly what you’re paying. Plus, our platform encourages
                    open communication between riders and drivers — you can
                    discuss and agree on a fair price together, ensuring a ride
                    that fits your budget and needs.
                  </p>
                </div>
              </div>
            </div>
            <div className="col-md-4 mb-4">
              <div className="card h-100 about-feature-card shadow-sm animate-slide-up delay-2">
                <div className="card-body">
                  <i className="bi bi-globe2 display-4 mb-3 text-primary"></i>
                  <h5 className="card-title">
                    Drivers Can Find Passengers Too
                  </h5>
                  <p className="card-text">
                    Lyfter isn’t just for riders to request rides — drivers can
                    also proactively search for passengers heading their way.
                    This two-way connection boosts ride-sharing opportunities,
                    reduces wait times, and helps everyone get where they need
                    to go faster and more efficiently.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="mb-5">
          <h2 className="text-center fw-bold mb-4">Meet Our Team</h2>
          <div className="row justify-content-center text-center">
            {[
              { name: "Arobh Kumar", role: "Developer", img: "arobh.jpg" },
              { name: "Avnish Kumar", role: "Developer", img: "avnish.jpg" },
              { name: "Simran Sahiwal", role: "Developer", img: "simran.jpg" },
            ].map((member, idx) => (
              <div
                className="col-md-4 mb-4 d-flex justify-content-center"
                key={idx}
              >
                <div
                  className="card h-100 about-team-card shadow-sm"
                  style={{ maxWidth: "250px", width: "100%" }}
                >
                  <img
                    src={member.img}
                    className="card-img-top"
                    alt={member.name}
                  />
                  <div className="card-body">
                    <h5 className="card-title">{member.name}</h5>
                    <p className="card-text text-muted">{member.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="text-center">
          <h3 className="fw-bold mb-3">
            Join the Lyfter Movement, Move with us!
          </h3>
          <p className="mb-4">
            Whether you’re a rider or driver, Lyfter brings the world closer.
            Sign up now and be part of the journey.
          </p>
          <a
            href="/dashboard"
            className={`btn ${isDark ? "btn-light" : "btn-dark"}`}
          >
            Get Started
          </a>
        </section>
      </div>
    </div>
  );
};

export default About;
