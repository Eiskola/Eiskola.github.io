import { siteConfig } from "./config";

export const SITE = {
  title: siteConfig.title,
  description: siteConfig.description,
  author: siteConfig.author,
  url: siteConfig.url,
} as const;
