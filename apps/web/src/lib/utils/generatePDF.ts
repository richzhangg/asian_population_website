import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { City, ComparisonMatrix } from "@/types/city";
import type { WorldBankCityData } from "@/types/worldbank";

// ── Helpers ───────────────────────────────────────────────────────────────────

function fmtLarge(n: number | null): string {
  if (n === null) return "N/A";
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(2)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
  return n.toFixed(1);
}

function fmtGdp(v: number | null): string {
  if (v === null) return "N/A";
  if (v >= 1e12) return `$${(v / 1e12).toFixed(2)}T`;
  if (v >= 1e9) return `$${(v / 1e9).toFixed(1)}B`;
  return `$${fmtLarge(v)}`;
}

function formatCompValue(value: number | null, format: string, metricKey?: string): string {
  if (value === null) return "–";
  if (metricKey === "gdp") return fmtGdp(value);
  if (metricKey === "gdpPerCapita") return `$${Math.round(value).toLocaleString()}`;
  switch (format) {
    case "percentage": return `${value.toFixed(2)}%`;
    case "currency": return `$${value.toLocaleString()}`;
    case "score": return `${value}/100`;
    default: return typeof value === "number" ? value.toFixed(1) : String(value);
  }
}

const BRAND: [number, number, number] = [99, 102, 241]; // indigo-500

function drawHeader(doc: jsPDF, title: string, subtitle: string) {
  const W = doc.internal.pageSize.getWidth();
  doc.setFillColor(...BRAND);
  doc.rect(0, 0, W, 28, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont("helvetica", "bold");
  doc.text(title, 14, 12);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(subtitle, 14, 21);

  doc.setTextColor(0, 0, 0);
}

function drawFooter(doc: jsPDF) {
  const W = doc.internal.pageSize.getWidth();
  const H = doc.internal.pageSize.getHeight();
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Source: World Bank Open Data · Generated ${new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}`,
    14,
    H - 8
  );
  doc.text("Asian Urban Transformation Matrix (AUTM)", W - 14, H - 8, { align: "right" });
}

// ── City PDF ──────────────────────────────────────────────────────────────────

export function generateCityPDF(city: City, wbData: WorldBankCityData): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  drawHeader(
    doc,
    `${city.name} — World Bank Data`,
    `${wbData.countryName} (${wbData.countryCode}) · ${city.region}`
  );

  let y = 36;

  // City description
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  const lines = doc.splitTextToSize(city.description, 182) as string[];
  doc.text(lines, 14, y);
  y += lines.length * 4.5 + 4;

  // Population & Urbanization
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Population & Urbanization", 14, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["Indicator", "World Bank Code", "Value", "Year"]],
    body: [
      [
        "Population, total",
        wbData.totalPopulation.indicatorId,
        fmtLarge(wbData.totalPopulation.value),
        String(wbData.totalPopulation.year ?? "—"),
      ],
      [
        "Population density (people per km²)",
        wbData.populationDensity.indicatorId,
        wbData.populationDensity.value !== null
          ? `${wbData.populationDensity.value.toFixed(1)} / km²`
          : "N/A",
        String(wbData.populationDensity.year ?? "—"),
      ],
      [
        "Urban population",
        wbData.urbanPopulation.indicatorId,
        fmtLarge(wbData.urbanPopulation.value),
        String(wbData.urbanPopulation.year ?? "—"),
      ],
      [
        "Urban population (% of total)",
        wbData.urbanPopulationPercent.indicatorId,
        wbData.urbanPopulationPercent.value !== null
          ? `${wbData.urbanPopulationPercent.value.toFixed(1)}%`
          : "N/A",
        String(wbData.urbanPopulationPercent.year ?? "—"),
      ],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // Economic Indicators
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text("Economic Indicators", 14, y);
  y += 2;

  const eco = wbData.economicData;
  autoTable(doc, {
    startY: y,
    head: [["Indicator", "World Bank Code", "Value", "Year"]],
    body: [
      ["GDP (current USD)", eco.gdp.indicatorId, fmtGdp(eco.gdp.value), String(eco.gdp.year ?? "—")],
      [
        "GDP per capita (current USD)",
        eco.gdpPerCapita.indicatorId,
        eco.gdpPerCapita.value !== null
          ? `$${Math.round(eco.gdpPerCapita.value).toLocaleString()}`
          : "N/A",
        String(eco.gdpPerCapita.year ?? "—"),
      ],
      [
        "GDP growth (annual %)",
        eco.gdpGrowth.indicatorId,
        eco.gdpGrowth.value !== null ? `${eco.gdpGrowth.value.toFixed(2)}%` : "N/A",
        String(eco.gdpGrowth.year ?? "—"),
      ],
      [
        "Unemployment (% of labor force)",
        eco.unemployment.indicatorId,
        eco.unemployment.value !== null ? `${eco.unemployment.value.toFixed(1)}%` : "N/A",
        String(eco.unemployment.year ?? "—"),
      ],
      [
        "Inflation, CPI (annual %)",
        eco.inflation.indicatorId,
        eco.inflation.value !== null ? `${eco.inflation.value.toFixed(2)}%` : "N/A",
        String(eco.inflation.year ?? "—"),
      ],
    ],
    styles: { fontSize: 9 },
    headStyles: { fillColor: [16, 185, 129], textColor: 255 },
    alternateRowStyles: { fillColor: [245, 250, 247] },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // Population History + GDP History side by side (last 15 entries)
  const popHistory = wbData.populationHistory.slice(-15);
  const gdpHistory = wbData.economicData.gdpHistory.slice(-15);

  if (popHistory.length > 0 || gdpHistory.length > 0) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    y = (doc as any).lastAutoTable.finalY + 8;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Historical Data", 14, y);
    y += 2;

    const pageW = doc.internal.pageSize.getWidth();
    const colW = (pageW - 28 - 6) / 2; // two columns with 6mm gap

    if (popHistory.length > 0) {
      autoTable(doc, {
        startY: y,
        head: [["Year", "Population"]],
        body: popHistory.map((h) => [String(h.year), fmtLarge(h.value)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: BRAND, textColor: 255 },
        alternateRowStyles: { fillColor: [245, 245, 250] },
        margin: { left: 14, right: pageW - 14 - colW },
        tableWidth: colW,
      });
    }

    if (gdpHistory.length > 0) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const leftFinalY = popHistory.length > 0 ? (doc as any).lastAutoTable.finalY : y;
      autoTable(doc, {
        startY: y,
        head: [["Year", "GDP (USD)"]],
        body: gdpHistory.map((h) => [String(h.year), fmtGdp(h.value)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 185, 129] as [number, number, number], textColor: 255 },
        alternateRowStyles: { fillColor: [245, 250, 247] },
        margin: { left: 14 + colW + 6, right: 14 },
        tableWidth: colW,
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rightFinalY = (doc as any).lastAutoTable.finalY;
      // Move y past whichever column is taller
      y = Math.max(leftFinalY, rightFinalY);
    }
  }

  drawFooter(doc);
  doc.save(`${city.slug}-world-bank-data.pdf`);
}

// ── Comparison PDF ────────────────────────────────────────────────────────────

export function generateComparisonPDF(
  matrix: ComparisonMatrix,
  yearRange?: { start: number; end: number }
): void {
  const doc = new jsPDF({ unit: "mm", format: "a4", orientation: "landscape" });

  const cityNames = matrix.cities.map((c) => c.name).join(", ");
  const yearLabel = yearRange
    ? `${yearRange.start}–${yearRange.end}`
    : new Date(matrix.generatedAt).getFullYear().toString();
  drawHeader(doc, "City Comparison Report", `${cityNames} · Data year: ${yearLabel}`);

  let y = 36;

  // Cities summary
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Comparing ${matrix.cities.length} cities`, 14, y);
  y += 2;

  autoTable(doc, {
    startY: y,
    head: [["City", "Country", "Region", "Tier"]],
    body: matrix.cities.map((c) => [c.name, c.country, c.region, `Tier ${c.cityTier}`]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 8;

  // Comparison matrix
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(0, 0, 0);
  doc.text(`Comparison Matrix — ${yearLabel}`, 14, y);
  y += 2;

  const slugs = matrix.cities.map((c) => c.slug);

  autoTable(doc, {
    startY: y,
    head: [
      [
        { content: "Metric", styles: { fontStyle: "bold" as const } },
        { content: "Unit", styles: { fontStyle: "bold" as const } },
        ...matrix.cities.map((c) => ({ content: c.name, styles: { fontStyle: "bold" as const } })),
      ],
    ],
    body: matrix.rows.map((row) => [
      row.metric.label,
      row.metric.unit,
      ...slugs.map((slug) => {
        const val = row.values[slug];
        const formatted = formatCompValue(val ?? null, row.metric.format, row.metric.key);
        const isBest = row.best === slug;
        const isWorst = row.worst === slug && slug !== row.best;
        const textColor: [number, number, number] = isBest
          ? [5, 150, 105]
          : isWorst
          ? [220, 38, 38]
          : [0, 0, 0];
        return {
          content: `${isBest ? "★ " : isWorst ? "▼ " : ""}${formatted}`,
          styles: { textColor },
        };
      }),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: BRAND, textColor: 255 },
    alternateRowStyles: { fillColor: [245, 245, 250] },
    margin: { left: 14, right: 14 },
  });

  // Legend + year note
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  y = (doc as any).lastAutoTable.finalY + 6;
  doc.setFontSize(8);
  doc.setTextColor(80, 80, 80);
  doc.text(`★ Best in category   ▼ Worst in category   ·   Data year: ${yearLabel}`, 14, y);

  drawFooter(doc);

  const slugStr = slugs.join("-vs-");
  doc.save(`comparison-${slugStr}-${yearLabel}.pdf`);
}
