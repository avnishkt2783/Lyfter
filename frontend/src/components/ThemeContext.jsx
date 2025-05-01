import { createContext, useContext, useState, useEffect } from "react";
//create context
const ThemeContext = createContext()

//provider
export const ThemeProvider = ({children})=>{
    const [theme,setTheme] = useState('dark');

    const toggleTheme = () =>{
        setTheme((pre)=>(pre==='dark'?'light':'dark'))
    }

    // Apply theme to the root <html> element
  useEffect(() => {
    document.documentElement.setAttribute("data-bs-theme", theme);
  }, [theme]);


    return(
        <>
        <ThemeContext.Provider value={{theme,toggleTheme}}>
            {children}
        </ThemeContext.Provider>
        </>
    )
}
export const useTheme = () =>useContext(ThemeContext)