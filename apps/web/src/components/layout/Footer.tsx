import Link from "next/link";
import { BarChart3, Github, Globe } from "lucide-react";

const LINKS = {
  Platform: [
    { label: "City Search", href: "/cities" },
    { label: "Compare Matrix", href: "/compare" },
    { label: "Interactive Map", href: "/map" },
  ],
  "Data Sources": [
    { label: "UN World Urbanization", href: "#" },
    { label: "World Bank WDI", href: "#" },
    { label: "OECD Housing Data", href: "#" },
    { label: "BIS Housing Stats", href: "#" },
  ],
  Research: [
    { label: "Methodology", href: "#" },
    { label: "Data Dictionary", href: "#" },
    { label: "About AUTM", href: "#" },
    { label: "Contact", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
                <BarChart3 className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold text-sm gradient-text">AUTM</span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Asian Urban Transformation Matrix — a research platform tracking
              how population change reshapes cities, housing, and economies
              across Asia.
            </p>
            <div className="flex gap-2 pt-1">
              <a
                href="https://github.com"
                className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
              <a
                href="#"
                className="w-8 h-8 rounded-lg border border-border/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors"
              >
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([title, links]) => (
            <div key={title} className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {title}
              </h3>
              <ul className="space-y-2">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border/40 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Asian Urban Transformation Matrix.
            Data for research purposes only.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js · FastAPI · PostgreSQL · OpenAI
          </p>
        </div>
      </div>
    </footer>
  );
}
