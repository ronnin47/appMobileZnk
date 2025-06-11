import React, { createContext, useState } from 'react';

export const ColeccionPersonajesContext = createContext();

export const ColeccionPersonajesProvider = ({ children }) => {
  const [coleccionPersonajes, setColeccionPersonajes] = useState([]);

  return (
    <ColeccionPersonajesContext.Provider value={{ coleccionPersonajes, setColeccionPersonajes }}>
      {children}
    </ColeccionPersonajesContext.Provider>
  );
};