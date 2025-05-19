import { createContext, useContext, useEffect, useState } from "react";

const NavigationContext = createContext();

export const NavigationProvider = ({ children }) => {
  const [navigation, setNavigation] = useState([]);

  useEffect(() => {
    const savedNavigation = localStorage.getItem("navigationData");
    if (savedNavigation) {
      setNavigation(JSON.parse(savedNavigation));
    }
  }, []);

  useEffect(() => {
    if (navigation.length > 0) {
      localStorage.setItem("navigationData", JSON.stringify(navigation));
    }
  }, [navigation]);

  return (
    <NavigationContext.Provider value={{ navigation, setNavigation }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigation = () => useContext(NavigationContext);
