"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight, GitCompareArrows, Globe, Map } from "lucide-react";
import { Button } from "@/components/ui/button";

const FEATURES = [
  {
    icon: Globe,
    title: "Search Any City",
    description: "Access population, housing, economic, and migration data for 10 Asian megacities.",
    href: "/cities",
    cta: "Browse Cities",
  },
  {
    icon: GitCompareArrows,
    title: "Compare Cities",
    description: "Side-by-side comparison matrix and charts across 20+ urban transformation metrics.",
    href: "/compare",
    cta: "Start Comparing",
  },
  {
    icon: Map,
    title: "Interactive Map",
    description: "Click any city on the Asia map to open its full demographic and economic dashboard.",
    href: "/map",
    cta: "Open Map",
  },
];

export default function CTASection() {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-teal-500/5" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-5xl font-bold mb-6 leading-tight">
            Start Researching
            <br />
            <span className="gradient-text">Asia's Urban Future</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto text-lg mb-8">
            Built for students, researchers, and policymakers who need
            rigorous data-driven insights on Asian urban transformation.
          </p>
          <Link href="/cities">
            <Button variant="gradient" size="xl" className="gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Link href={feature.href} className="block group">
                <div className="glass-card rounded-2xl p-6 text-center hover:shadow-xl hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-bold text-lg mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-primary">
                    {feature.cta}
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
