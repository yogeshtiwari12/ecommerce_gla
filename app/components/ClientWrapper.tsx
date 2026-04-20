"use client";
import { Provider } from "react-redux";
import { SessionProvider } from "next-auth/react"; // Corrected import
import store, { persistor } from "../redux/store";
import { PersistGate } from "redux-persist/integration/react";
import { CustomThemeProvider } from "../providers/ThemeProvider";

export default function ClientWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <CustomThemeProvider>
          <SessionProvider> {/* Use SessionProvider from next-auth */}
            {children}
          </SessionProvider>
        </CustomThemeProvider>
      </PersistGate>
    </Provider>
  );
}
