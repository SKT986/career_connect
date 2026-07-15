"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  MessagesSquare,
  GraduationCap,
  Sparkles,
  Mic,
  Accessibility,
  Building2,
  ShieldCheck,
  ArrowRight,
} from "lucide-react";

const AUDIENCES = [
  "International students",
  "Students with disabilities",
  "LGBTQ+ students",
  "Mental health & isolation",
  "First-gen job seekers",
];

const FEATURES = [
  {
    icon: MessagesSquare,
    title: "Anonymous community",
    description:
      "Ask the questions you'd never post under your real name. Category-tagged, searchable, and moderated for safety.",
  },
  {
    icon: GraduationCap,
    title: "Mentor support",
    description: "Verified mentors reply to posts, host AMAs, and share stories from people who've been there.",
  },
  {
    icon: Sparkles,
    title: "AI career assistant",
    description:
      "Resume feedback, cover letters, STAR answers, and career advice in English or Japanese, day or night.",
  },
  {
    icon: Mic,
    title: "AI mock interviews",
    description: "Practice by text or voice, choose your difficulty, and get scored with actionable feedback.",
  },
  {
    icon: Accessibility,
    title: "Accessibility first",
    description:
      "Dark mode, large text, high contrast, screen reader support, and multi-language — not an afterthought.",
  },
  {
    icon: Building2,
    title: "Consent-based matching",
    description:
      "Build an anonymous profile. Companies search skills and goals — never your identity, unless you choose to share it.",
  },
];

function useMotionProps() {
  const reduceMotion = useReducedMotion();
  return {
    initial: { opacity: 0, y: reduceMotion ? 0 : 16 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: "-80px" },
    transition: { duration: reduceMotion ? 0 : 0.5 },
  };
}

export default function LandingPage() {
  const reveal = useMotionProps();

  return (
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      {/* Hero */}
      <section className="grid gap-10 py-16 sm:py-24 lg:grid-cols-2 lg:items-center lg:py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground">
            <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            Private by default. Always.
          </span>
          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            A career journey where you don&apos;t have to explain yourself first.
          </h1>
          <p className="mt-5 max-w-lg text-lg text-muted-foreground">
            Career Connect is a psychologically safe space for international, disabled, LGBTQ+, and
            isolated students to ask career questions anonymously, get mentor support, practice with AI,
            and meet companies who already understand.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg" className="rounded-full">
              <Link href="/register">
                Get started free <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="rounded-full">
              <Link href="/login">Sign in</Link>
            </Button>
          </div>
          <ul className="mt-8 flex flex-wrap gap-2">
            {AUDIENCES.map((a) => (
              <li
                key={a}
                className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium text-muted-foreground"
              >
                {a}
              </li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <Card className="rounded-3xl border-border/80 bg-card shadow-xl">
            <CardContent className="space-y-4 p-6">
              <div className="flex items-center gap-2">
                <span className="h-9 w-9 rounded-full bg-secondary" aria-hidden="true" />
                <div>
                  <p className="text-sm font-medium">Anon-4f8c2a</p>
                  <p className="text-xs text-muted-foreground">2h ago · International Students</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Is it normal to feel behind because interviews here work so differently from back home?
                I froze during a group discussion round and don&apos;t know how to prepare next time.
              </p>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span>♥ 38</span>
                <span>💬 12 replies</span>
                <span className="rounded-full bg-accent px-2 py-0.5 text-accent-foreground">Mentor replied</span>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </section>

      {/* Features */}
      <section className="py-16 sm:py-20">
        <motion.div {...reveal} className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-semibold tracking-tight">Everything you need, none of the pressure</h2>
          <p className="mt-3 text-muted-foreground">
            Built around trust, privacy, and accessibility from the first line of code.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Card className="h-full rounded-3xl transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-3 p-6">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent text-accent-foreground">
                    <feature.icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <h3 className="font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <motion.section {...reveal} className="py-16 sm:py-20">
        <Card className="rounded-3xl bg-primary text-primary-foreground">
          <CardContent className="flex flex-col items-center gap-4 p-10 text-center sm:p-14">
            <h2 className="text-3xl font-semibold tracking-tight">You belong in this job market.</h2>
            <p className="max-w-md text-primary-foreground/90">
              Join a community that was built with you in mind, not as an edge case.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full">
              <Link href="/register">
                Create your free account <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardContent>
        </Card>
      </motion.section>
    </div>
  );
}
