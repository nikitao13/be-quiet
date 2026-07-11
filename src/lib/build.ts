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
    built: new Date().toLocaleDateString("en-AU", {
      year: "2-digit",
      month: "2-digit",
      day: "2-digit",
    }),
    commit: process.env.CF_PAGES_COMMIT_SHA?.slice(0, 7) ?? "dev",
    branch: process.env.CF_PAGES_BRANCH ?? "local",
    astro: astroVersion,
    platform: process.env.CF_PAGES ? "cloudflare pages" : "local",
  };
};
