import React, { createContext, useContext, useState } from "react";

const LogoutModalContext = createContext({
  show: false,
  open: () => {},
  close: () => {},
});

export function LogoutModalProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [show, setShow] = useState(false);
  return (
    <LogoutModalContext.Provider
      value={{
        show,
        open: () => setShow(true),
        close: () => setShow(false),
      }}
    >
      {children}
    </LogoutModalContext.Provider>
  );
}

export function useLogoutModal() {
  return useContext(LogoutModalContext);
}
