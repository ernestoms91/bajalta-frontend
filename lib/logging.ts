// lib/logging.ts
import type { NextConfig } from "next";

export const loggingConfig: Pick<NextConfig, "logging"> = {
  logging: {
    fetches: {
      fullUrl: true,
      hmrRefreshes: true,
    },
    incomingRequests: {
      ignore: [
        /\/_next\/static/,
        /\/_next\/image/,
        /\/favicon.ico/,
        /\/api\/health/,
      ],
    },
    browserToTerminal: true,
    serverFunctions: true,
  },
};