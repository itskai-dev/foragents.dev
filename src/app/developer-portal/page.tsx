/* eslint-disable react/no-unescaped-entities */
import { Metadata } from "next";
import DeveloperPortalClient from "./developer-portal-client";

export const metadata: Metadata = {
  title: "Developer Portal | forAgents.dev",
  description:
    "Explore API, SDK, tools, and examples for agent builders. Filter resources and submit new entries.",
};

export default function DeveloperPortalPage() {
  return <DeveloperPortalClient />;
}
