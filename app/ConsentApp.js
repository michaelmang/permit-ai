"use client";

import { useSearchParams } from "next/navigation";
import GeneratorWizard from "../components/GeneratorWizard";
import ReceiptView from "../components/ReceiptView";

export default function ConsentApp() {
  const searchParams = useSearchParams();
  const d = searchParams.get("d");

  return d ? <ReceiptView d={d} /> : <GeneratorWizard />;
}
