import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://gowider.in";

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/privacy", "/terms", "/refund-policy", "/contact"],
        disallow: [
          "/api/",
          "/dashboard/",
          "/dashboard",
          "/studio/",
          "/studio",
          "/projects/",
          "/projects",
          "/project/",
          "/account/",
          "/account",
          "/billing/",
          "/billing",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
