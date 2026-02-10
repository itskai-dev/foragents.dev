/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";
import { BrandClientPage } from "./brand-client";

export const metadata: Metadata = {
  title: "Brand Guidelines — forAgents.dev",
  description: "Logo usage, color palette, typography, and press kit resources for forAgents.dev",
  openGraph: {
    title: "Brand Guidelines — forAgents.dev",
    description: "Logo usage, color palette, typography, and press kit resources for forAgents.dev",
    url: "https://foragents.dev/brand",
    siteName: "forAgents.dev",
    type: "website",
  },
};

export default function BrandPage() {
  return <BrandClientPage />;
}
