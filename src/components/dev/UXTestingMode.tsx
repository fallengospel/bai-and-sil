"use client";

import { useState, useEffect } from "react";
import { 
  FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo,
  FiEye, FiCode, FiLayout, FiUser, FiShield, FiZap,
  FiChevronDown, FiChevronUp, FiRefreshCw
} from "react-icons/fi";

type Persona = "qa" | "dev" | "designer";
type Severity = "pass" | "warn" | "fail" | "info";

interface Finding {
  id: string;
  severity: Severity;
  category: string;
  message: string;
  suggestion?: string;
  element?: string;
}

interface PersonaConfig {
  id: Persona;
  name: string;
  icon: React.ReactNode;
  color: string;
  description: string;
  checklist: string[];
}

const PERSONAS: PersonaConfig[] = [
  {
    id: "qa",
    name: "QA Tester",
    icon: <FiShield className="w-5 h-5" />,
    color: "bg-emerald-100 text-emerald-700",
    description: "Focuses on functionality, accessibility, and edge cases.",
    checklist: [
      "All interactive elements are keyboard accessible",
      "Focus states are visible",
      "Color contrast meets WCAG AA (4.5:1)",
      "Form fields have proper labels",
      "Error states are clear and helpful",
      "Loading states prevent double submission",
      "Mobile responsive on all breakpoints",
    ],
  },
  {
    id: "dev",
    name: "Developer",
    icon: <FiCode className="w-5 h-5" />,
    color: "bg-blue-100 text-blue-700",
    description: "Reviews code quality, performance, and maintainability.",
    checklist: [
      "No hydration mismatches",
      "Proper loading and error boundaries",
      "Images use next/image or proper sizing",
      "No unnecessary re-renders",
      "Consistent naming conventions",
      "TypeScript types are complete",
      "No console errors or warnings",
    ],
  },
  {
    id: "designer",
    name: "UX/UI Designer",
    icon: <FiLayout className="w-5 h-5" />,
    color: "bg-purple-100 text-purple-700",
    description: "Evaluates visual hierarchy, consistency, and user experience.",
    checklist: [
      "Visual hierarchy guides the eye",
      "Primary CTA is immediately visible",
      "Spacing follows the 4px grid",
      "Typography has clear hierarchy",
      "Color usage is purposeful",
      "Components are consistent",
      "Animations convey state (not decoration)",
    ],
  },
];

function generateFindings(persona: Persona): Finding[] {
  const findings: Finding[] = [];

  if (persona === "qa") {
    findings.push(
      { id: "qa-1", severity: "pass", category: "Accessibility", message: "Focus states are visible on all interactive elements", element: "button, a, input" },
      { id: "qa-2", severity: "pass", category: "Accessibility", message: "Color contrast meets WCAG AA standards", element: "text-gray-900 on bg-white" },
      { id: "qa-3", severity: "warn", category: "Forms", message: "Search input should have an aria-label", element: "SearchBar.tsx", suggestion: "Add aria-label='Search listings'" },
      { id: "qa-4", severity: "pass", category: "Responsive", message: "Mobile layout properly stacks hero content", element: "LandingPage.tsx" },
      { id: "qa-5", severity: "pass", category: "Navigation", message: "All links have clear hover states", element: "Link components" },
      { id: "qa-6", severity: "warn", category: "Performance", message: "Hero section uses client-side rendering for animations", element: "LandingPage.tsx", suggestion: "Consider server-side rendering with intersection observer" },
      { id: "qa-7", severity: "pass", category: "UX", message: "Loading states prevent double submission", element: "Button.tsx" },
      { id: "qa-8", severity: "info", category: "Testing", message: "Consider adding ARIA live regions for dynamic content", suggestion: "Use aria-live='polite' for status updates" },
    );
  }

  if (persona === "dev") {
    findings.push(
      { id: "dev-1", severity: "pass", category: "Code Quality", message: "TypeScript types are properly defined", element: "LandingPage.tsx" },
      { id: "dev-2", severity: "pass", category: "Architecture", message: "Components are properly separated", element: "components/landing/" },
      { id: "dev-3", severity: "warn", category: "Performance", message: "Static data (FEATURES, STEPS, etc.) could be moved to a separate file", element: "LandingPage.tsx", suggestion: "Create lib/data.ts for constants" },
      { id: "dev-4", severity: "pass", category: "Styling", message: "Tailwind classes follow consistent patterns", element: "globals.css" },
      { id: "dev-5", severity: "info", category: "Optimization", message: "Consider lazy loading below-fold sections", suggestion: "Use next/dynamic with ssr: false" },
      { id: "dev-6", severity: "pass", category: "Security", message: "No sensitive data exposed in client components", element: "LandingPage.tsx" },
      { id: "dev-7", severity: "warn", category: "Accessibility", message: "Category cards need keyboard navigation", element: "CategoryCard.tsx", suggestion: "Add tabIndex and onKeyDown handler" },
      { id: "dev-8", severity: "pass", category: "State", message: "Minimal client-side state usage", element: "LandingPage.tsx" },
    );
  }

  if (persona === "designer") {
    findings.push(
      { id: "des-1", severity: "pass", category: "Hierarchy", message: "Hero headline is immediately visible and readable", element: "h1" },
      { id: "des-2", severity: "pass", category: "Color", message: "Primary blue is used strategically for CTAs", element: "buttons" },
      { id: "des-3", severity: "pass", category: "Spacing", message: "Section padding follows the spacing scale", element: "section-padding" },
      { id: "des-4", severity: "warn", category: "Typography", message: "Hero text size might be too large on smaller desktops", element: "text-hero", suggestion: "Consider responsive sizing: text-hero-sm on md" },
      { id: "des-5", severity: "pass", category: "Motion", message: "Animations are purposeful (float for emphasis, not decoration)", element: "floating badges" },
      { id: "des-6", severity: "pass", category: "Consistency", message: "Border radius scale is consistent (rounded-2xl/3xl)", element: "cards, buttons" },
      { id: "des-7", severity: "info", category: "Brand", message: "Filipino language adds warmth and authenticity", element: "copy" },
      { id: "des-8", severity: "pass", category: "Layout", message: "One clear CTA per section (Impeccable principle)", element: "hero, features, CTA" },
    );
  }

  return findings;
}

function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case "pass": return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
    case "warn": return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
    case "fail": return <FiXCircle className="w-5 h-5 text-coral" />;
    case "info": return <FiInfo className="w-5 h-5 text-blue-500" />;
  }
}

function ScoreBadge({ findings }: { findings: Finding[] }) {
  const pass = findings.filter(f => f.severity === "pass").length;
  const total = findings.length;
  const score = Math.round((pass / total) * 100);
  
  let color = "bg-emerald-100 text-emerald-700";
  if (score < 70) color = "bg-red-100 text-red-700";
  else if (score < 85) color = "bg-orange-100 text-orange-700";
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${color}`}>
      {score}%
    </span>
  );
}

export default function UXTestingMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>("qa");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);

  useEffect(() => {
    setFindings(generateFindings(activePersona));
  }, [activePersona]);

  const currentPersona = PERSONAS.find(p => p.id === activePersona)!;
  const passCount = findings.filter(f => f.severity === "pass").length;
  const warnCount = findings.filter(f => f.severity === "warn").length;
  const failCount = findings.filter(f => f.severity === "fail").length;
  const infoCount = findings.filter(f => f.severity === "info").length;

  // Only show in development
  if (process.env.NODE_ENV !== "development") return null;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-cartoon-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-sm font-bold"
      >
        <FiEye className="w-4 h-4" />
        <span className="hidden sm:inline">UI/UX Test</span>
        {isOpen ? <FiChevronDown className="w-4 h-4" /> : <FiChevronUp className="w-4 h-4" />}
      </button>

      {/* Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-[420px] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gray-900 text-white px-6 py-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-body font-bold flex items-center gap-2">
                <FiEye className="w-5 h-4" />
                UI/UX Testing Mode
              </h3>
              <span className="text-caption text-gray-500">Dev Only</span>
            </div>
            <p className="text-caption text-gray-500">
              Analyze from three expert perspectives
            </p>
          </div>

          {/* Persona tabs */}
          <div className="flex border-b border-gray-200">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                onClick={() => setActivePersona(persona.id)}
                className={`flex-1 px-4 py-3 text-center transition-all duration-200 ${
                  activePersona === persona.id
                    ? "bg-bai-blue text-white"
                    : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  {persona.icon}
                  <span className="text-body-sm font-bold">{persona.name}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="max-h-[400px] overflow-y-auto">
            {/* Persona description */}
            <div className="px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <p className="text-body-sm text-gray-600">
                  {currentPersona.description}{" "}
                  <span className="ml-1 inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded">
                    Static sample
                  </span>
                </p>
                <ScoreBadge findings={findings} />
              </div>
              
              {/* Summary */}
              <div className="flex items-center gap-4 mt-3">
                <span className="flex items-center gap-1 text-caption text-emerald-600">
                  <FiCheckCircle className="w-3 h-3" /> {passCount} pass
                </span>
                <span className="flex items-center gap-1 text-caption text-orange-600">
                  <FiAlertTriangle className="w-3 h-3" /> {warnCount} warn
                </span>
                {failCount > 0 && (
                  <span className="flex items-center gap-1 text-caption text-red-600">
                    <FiXCircle className="w-3 h-3" /> {failCount} fail
                  </span>
                )}
                <span className="flex items-center gap-1 text-caption text-blue-600">
                  <FiInfo className="w-3 h-3" /> {infoCount} info
                </span>
              </div>
            </div>

            {/* Findings list */}
            <div className="divide-y divide-gray-100">
              {findings.map((finding) => (
                <div
                  key={finding.id}
                  className="px-6 py-3 hover:bg-gray-50 transition-colors cursor-pointer"
                  onClick={() => setExpandedFinding(expandedFinding === finding.id ? null : finding.id)}
                >
                  <div className="flex items-start gap-3">
                    <SeverityIcon severity={finding.severity} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-caption font-bold text-gray-900">{finding.category}</span>
                      </div>
                      <p className="text-body-sm text-gray-700">{finding.message}</p>
                      
                      {expandedFinding === finding.id && finding.suggestion && (
                        <div className="mt-2 p-3 bg-blue-50 rounded-2xl">
                          <p className="text-caption text-blue-700">
                            <strong>Suggestion:</strong> {finding.suggestion}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Checklist */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <h4 className="text-body-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                {currentPersona.name} Checklist
              </h4>
              <div className="space-y-2">
                {currentPersona.checklist.map((item, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <FiCheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    <span className="text-caption text-gray-600">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setFindings(generateFindings(activePersona))}
              className="text-body-sm font-bold text-bai-blue hover:text-bai-blue-hover transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Reload sample
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
