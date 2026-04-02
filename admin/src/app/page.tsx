"use client";

import dynamic from "next/dynamic";
import { Analytics } from "@vercel/analytics/react";

const App = dynamic(() => import("../../../src/App"), { ssr: false });

export default function PublicHomePage() {
  return (
    <>
      <App />
      <Analytics />
    </>
  );
}

