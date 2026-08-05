import type { NextConfig } from "next";
import { validateEnv } from "./lib/env/validate";
import { loggingConfig } from "./lib/logging";

validateEnv();

const nextConfig: NextConfig = {
  ...loggingConfig,
};

export default nextConfig;
