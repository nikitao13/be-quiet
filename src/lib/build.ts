import { version as astroVersion } from "astro/package.json";

export interface BuildData {
  built: string;
  commit: string;
  branch: string;
  astro: string;
  platform: string;
}

export const getBuildData = (): BuildData => {
  return {
    built: new Date().toISOString().split("T")[0],
    commit: process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ?? "dev",
    branch: process.env.CF_PAGES_BRANCH ?? "local",
    astro: astroVersion,
    platform: process.env.CF_PAGES ? "cloudflare pages" : "local",
  };
};
