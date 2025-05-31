// components/RedirectExternal.jsx
import { useEffect } from "react";

const RedirectExternal = () => {
  useEffect(() => {
    window.location.replace("https://www.youtube.com");
  }, []);

  return null; // Don't render anything
};

export default RedirectExternal;
