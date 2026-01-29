"use client";

import { ScreensaverWrapper } from "./ScreensaverWrapper";

interface ClientScreensaverProviderProps {
  children: React.ReactNode;
}

export const ClientScreensaverProvider = ({ children }: ClientScreensaverProviderProps) => {
  return (
    <ScreensaverWrapper idleTimeout={30 * 1000}>
      {children}
    </ScreensaverWrapper>
  );
};
