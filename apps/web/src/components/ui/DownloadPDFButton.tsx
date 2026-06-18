"use client";
import { useState } from "react";
import { FileDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { City, ComparisonMatrix } from "@/types/city";
import type { WorldBankCityData } from "@/types/worldbank";

interface CityProps {
  mode: "city";
  city: City;
  wbData: WorldBankCityData;
}

interface CompareProps {
  mode: "compare";
  matrix: ComparisonMatrix;
  yearRange?: { start: number; end: number };
}

type Props = CityProps | CompareProps;

export default function DownloadPDFButton(props: Props) {
  const [loading, setLoading] = useState(false);

  async function handleClick() {
    setLoading(true);
    try {
      if (props.mode === "city") {
        const { generateCityPDF } = await import("@/lib/utils/generatePDF");
        generateCityPDF(props.city, props.wbData);
      } else {
        const { generateComparisonPDF } = await import("@/lib/utils/generatePDF");
        generateComparisonPDF(props.matrix, props.yearRange);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={handleClick}
      disabled={loading}
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <FileDown className="w-4 h-4" />
      )}
      {loading ? "Generating PDF…" : "Download PDF"}
    </Button>
  );
}
