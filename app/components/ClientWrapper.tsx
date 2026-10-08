"use client";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react";
import store from "../redux/store";
import { CustomThemeProvider } from "../providers/ThemeProvider";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <CustomThemeProvider>
        <SessionProvider>
          {children}
        </SessionProvider>
      </CustomThemeProvider>
    </Provider>
  );
}
