import { Metadata } from "next";
import LandingPageComponent from "./landing-component";

export const metadata: Metadata = {
  title: "PolicyBridge - Transform Your Insurance Operations",
  description:
    "The most advanced insurance management platform designed for African markets. Reduce costs, automate workflows, and scale with confidence.",
  keywords:
    "insurance, management, platform, Africa, Botswana, policy, claims, premium",
};

export default function LandingPage() {
  return <LandingPageComponent />;
}
