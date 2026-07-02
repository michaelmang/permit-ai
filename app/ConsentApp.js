"use client";

import { useSearchParams } from "next/navigation";
import GeneratorWizard from "../components/GeneratorWizard";
import ReceiptView from "../components/ReceiptView";

export default function ConsentApp() {
  const searchParams = useSearchParams();
  const d = searchParams.get("d");
  const mode = searchParams.get("m") === "view" ? "view" : "route";

  return d ? <ReceiptView d={d} mode={mode} /> : <GeneratorWizard />;
}
