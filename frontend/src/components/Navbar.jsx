import { Link } from "react-router-dom";
const Navbar = () => {
  return (
    <>
      <nav>
        <div>
          <Link to="/">
            <img src="lyfter_logo.png" />
          </Link>
        </div>
        <div>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/about">About</Link>
          <Link to="/login">Login</Link>
        </div>
      </nav>
    </>
  );
};
export default Navbar;
