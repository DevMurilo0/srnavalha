import type { MetadataRoute } from "next";
import { brand } from "@/config/brand";

export default function sitemap(): MetadataRoute.Sitemap {
  return brand.siteUrl
    ? [{ url: brand.siteUrl, changeFrequency: "monthly", priority: 1 }]
    : [];
}
