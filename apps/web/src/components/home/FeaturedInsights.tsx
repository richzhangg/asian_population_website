"use client";
import { motion } from "framer-motion";
import { TrendingDown, Building2, Users, ArrowRight, BarChart3 } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const INSIGHTS = [
  {
    icon: TrendingDown,
    city: "Seoul",
    country: "South Korea",
    tag: "Demographic Crisis",
    tagColor: "text-rose-500 bg-rose-50 dark:bg-rose-950/40",
    headline: "World's Lowest Fertility Rate Won't Ease Housing Pressure",
    body: "Seoul's fertility rate of 0.72 — the lowest ever recorded for a major city — does not translate into housing relief. Young professionals continue concentrating in Gangnam and Mapo, keeping the price-to-income ratio at 18x while the broader metro population declines.",
    href: "/cities/seoul",
  },
  {
    icon: Building2,
    city: "Shenzhen",
    country: "China",
    tag: "Economic Miracle",
    tagColor: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40",
    headline: "From Fishing Village to $1T Economy in Four Decades",
    body: "Shenzhen's transformation from a 30,000-person fishing village (1979) to a 17-million-person tech megacity represents the fastest urbanization in human history. Its tech-to-GDP share now rivals Silicon Valley, while average wages have grown 400x in real terms.",
    href: "/cities/shenzhen",
  },
  {
    icon: Users,
    city: "Tokyo",
    country: "Japan",
    tag: "Aging Society",
    tagColor: "text-amber-600 bg-amber-50 dark:bg-amber-950/40",
    headline: "23% Elderly Population Reshapes Urban Infrastructure Priorities",
    body: "Tokyo's 65+ population share of 23.7% is triggering a generational shift in urban policy: silver-economy retail, hospital-adjacent housing, automated care facilities, and downward pressure on school enrollment create compound challenges for city planners.",
    href: "/cities/tokyo",
  },
];

export default function FeaturedInsights() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12"
        >
          <div>
            <div className="flex items-center gap-2 mb-3">
              <BarChart3 className="w-4 h-4 text-primary" />
              <p className="text-sm font-semibold uppercase tracking-widest text-primary">
                Research Highlights
              </p>
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold">
              What the Data Reveals
            </h2>
          </div>
          <Link href="/cities">
            <Button variant="outline" className="gap-2">
              Explore All Cities
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {INSIGHTS.map((insight, i) => (
            <motion.article
              key={insight.city}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={insight.href} className="block group h-full">
                <div className="glass-card rounded-2xl p-6 h-full flex flex-col gap-4 hover:shadow-lg hover:border-primary/30 transition-all duration-300">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                        <insight.icon className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{insight.city}</p>
                        <p className="text-xs text-muted-foreground">{insight.country}</p>
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${insight.tagColor}`}>
                      {insight.tag}
                    </span>
                  </div>

                  <h3 className="font-bold text-base leading-snug group-hover:text-primary transition-colors">
                    {insight.headline}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed flex-1">
                    {insight.body}
                  </p>

                  <div className="flex items-center gap-1 text-sm font-medium text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                    View city dashboard
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              </Link>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}
