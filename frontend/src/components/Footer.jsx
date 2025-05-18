import React from "react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedin,
  FaGithub,
} from "react-icons/fa";
import { useTheme } from "../ThemeContext";
import "./Footer.css";

const Footer = () => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <footer
      className={`pb-3 ${
        isDark ? "bg-dark text-white" : "bg-light text-dark"
      } ${
        isDark ? "text-white border-light" : "text-dark border-dark"
      } border-top pt-3`}
    >
      <div className="container text-center">
        <h5 className="mb-3 fw-bold">Connect with us</h5>

        <div className="d-flex justify-content-center gap-4 fs-4 social-icons">
          <a
            href="https://facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebookF />
          </a>
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram />
          </a>
          <a
            href="https://twitter.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaTwitter />
          </a>
          <a
            href="https://linkedin.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaLinkedin />
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaGithub />
          </a>
        </div>

        <div className="mt-4 d-flex justify-content-center">
          <table className="contact-table">
            <tbody>
              <tr>
                <td className="icon-cell" aria-label="Email">
                  📧 <strong>Email:</strong>
                </td>
                <td>lyfter.contact@gmail.com</td>
              </tr>
              <tr>
                <td className="icon-cell" aria-label="Phone">
                  📞 <strong>Phone:</strong>
                </td>
                <td>+91-00000-00000</td>
              </tr>
              <tr>
                <td className="icon-cell" aria-label="Address">
                  🏢 <strong>Address:</strong>
                </td>
                <td>Mahatma Gandhi Central University, Motihari, India</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <div className="container mt-4">
        <div className="accordion" id="contactAccordion">
          <div className="accordion-item">
            <h2 className="accordion-header" id="headingOne">
              <button
                className={`accordion-button collapsed ${
                  isDark ? "bg-dark text-white" : ""
                }`}
                type="button"
                data-bs-toggle="collapse"
                data-bs-target="#collapseOne"
                aria-expanded="false"
                aria-controls="collapseOne"
              >
                Lyfter Team
              </button>
            </h2>
            <div
              id="collapseOne"
              className="accordion-collapse collapse"
              aria-labelledby="headingOne"
              data-bs-parent="#contactAccordion"
            >
              <div
                className={`accordion-body ${
                  isDark ? "bg-dark text-white" : ""
                }`}
              >
                <div className="d-flex justify-content-center flex-wrap gap-4">
                  {[
                    {
                      img: "/arobh.jpg",
                      name: "Arobh Kumar",
                      email: "aarobhs087@gmail.com",
                      phone: "+91-6202678690",
                    },
                    {
                      img: "/avnish.jpg",
                      name: "Avnish Kumar",
                      email: "avnishkt2783@gmail.com",
                      phone: "+91-7033974269",
                    },
                    {
                      img: "/simran.jpg",
                      name: "Simran Sahiwal",
                      email: "sahiwalsimran@gmail.com",
                      phone: "+91-6206124541",
                    },
                  ].map((member, index) => (
                    <div className="flip-card" key={index}>
                      <div className="flip-card-inner">
                        <div className="flip-card-front">
                          <img
                            src={member.img}
                            alt={member.name}
                            className="img-fluid rounded"
                          />
                        </div>
                        <div
                          className={`flip-card-back d-flex flex-column justify-content-center align-items-center p-3 position-relative ${
                            isDark ? "text-white" : "text-dark"
                          }`}
                        >
                          <div
                            className="blurred-bg"
                            style={{ backgroundImage: `url(${member.img})` }}
                          ></div>
                          <div
                            className={`content-overlay text-center text-white`}
                          >
                            <h6>{member.name}</h6>
                            <p className="mb-1">
                              <a
                                href={`mailto:${member.email}`}
                                className="contact-icon-link"
                                title={`Email ${member.name}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                📧
                              </a>{" "}
                              <a
                                href={`mailto:${member.email}`}
                                className="contact-text-link"
                                title={`Email ${member.name}`}
                                style={{
                                  textDecoration: "underline",
                                  color: "inherit",
                                }}
                              >
                                Email
                              </a>
                            </p>
                            <p>
                              <a
                                href={`tel:${member.phone.replace(
                                  /[^+\d]/g,
                                  ""
                                )}`}
                                className="contact-icon-link"
                                title={`Call ${member.name}`}
                                style={{
                                  textDecoration: "none",
                                  color: "inherit",
                                }}
                              >
                                📞
                              </a>{" "}
                              <a
                                href={`tel:${member.phone.replace(
                                  /[^+\d]/g,
                                  ""
                                )}`}
                                className="contact-text-link"
                                title={`Call ${member.name}`}
                                style={{
                                  textDecoration: "underline",
                                  color: "inherit",
                                }}
                              >
                                Phone
                              </a>
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`text-center mt-4 pt-3 small ${
          isDark ? "text-white border-light" : "text-dark border-dark"
        }`}
      >
        © {new Date().getFullYear()} Lyfter. All rights reserved. | Made with ❤
        by Lyfter Team
      </div>
    </footer>
  );
};

export default Footer;
