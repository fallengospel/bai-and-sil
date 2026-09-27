"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import toast from "react-hot-toast";
import {
  FiCheckCircle, FiAlertTriangle, FiXCircle, FiInfo,
  FiEye, FiCode, FiLayout, FiUser, FiShield, FiZap,
  FiChevronDown, FiChevronUp, FiRefreshCw, FiCopy
} from "react-icons/fi";
import {
  installConsoleCapture,
  runAudits,
  highlightElement,
  type Finding,
  type Persona,
  type Severity,
} from "./triLensAudits";

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

function SeverityIcon({ severity }: { severity: Severity }) {
  switch (severity) {
    case "pass": return <FiCheckCircle className="w-5 h-5 text-emerald-500" />;
    case "warn": return <FiAlertTriangle className="w-5 h-5 text-orange-500" />;
    case "fail": return <FiXCircle className="w-5 h-5 text-coral" />;
    case "info": return <FiInfo className="w-5 h-5 text-blue-500" />;
  }
}

function computeScore(findings: Finding[]): number {
  const scored = findings.filter(f => f.severity !== "info");
  if (scored.length === 0) return 100;
  const pass = scored.filter(f => f.severity === "pass").length;
  const warn = scored.filter(f => f.severity === "warn").length;
  return Math.round(((pass + 0.5 * warn) / scored.length) * 100);
}

function ScoreBadge({ findings }: { findings: Finding[] }) {
  const score = computeScore(findings);
  
  let color = "bg-emerald-100 text-emerald-700";
  if (score < 70) color = "bg-red-100 text-red-700";
  else if (score < 85) color = "bg-orange-100 text-orange-700";
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-lg text-sm font-bold ${color}`}>
      {score}%
    </span>
  );
}

const CHECKLIST_KEY = "trilens-checklist-v1";
type ChecklistState = Record<string, boolean[]>;

const SEVERITY_ICON: Record<Severity, string> = { pass: "PASS", warn: "WARN", fail: "FAIL", info: "INFO" };

function loadChecklist(): ChecklistState {
  try {
    const raw = window.localStorage.getItem(CHECKLIST_KEY);
    if (raw) return JSON.parse(raw) as ChecklistState;
  } catch {
    // ignore corrupted state
  }
  return {};
}

export default function UXTestingMode() {
  const [isOpen, setIsOpen] = useState(false);
  const [activePersona, setActivePersona] = useState<Persona>("qa");
  const [findings, setFindings] = useState<Finding[]>([]);
  const [expandedFinding, setExpandedFinding] = useState<string | null>(null);
  const [checklist, setChecklist] = useState<ChecklistState>({});
  const pathname = usePathname();

  useEffect(() => {
    installConsoleCapture();
    setChecklist(loadChecklist());
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    setFindings(runAudits(activePersona));
  }, [isOpen, activePersona, pathname]);

  const toggleCheck = (personaId: Persona, index: number) => {
    setChecklist((prev) => {
      const arr = [...(prev[personaId] ?? [])];
      arr[index] = !arr[index];
      const next = { ...prev, [personaId]: arr };
      try {
        window.localStorage.setItem(CHECKLIST_KEY, JSON.stringify(next));
      } catch {
        // storage unavailable — keep in-memory state
      }
      return next;
    });
  };

  const copyReport = async () => {
    const lines = [
      `# Tri-Lens Review — ${pathname}`,
      `**Lens:** ${currentPersona.name} · **Score:** ${computeScore(findings)}% · **When:** ${new Date().toLocaleString()}`,
      "",
      "## Findings",
      ...findings.map((f) => {
        const base = `- [${SEVERITY_ICON[f.severity]}] ${f.category} — ${f.message}`;
        return f.suggestion ? `${base}\n  - suggestion: ${f.suggestion}` : base;
      }),
      "",
      `## ${currentPersona.name} checklist`,
      ...currentPersona.checklist.map(
        (item, i) => `- [${checklist[activePersona]?.[i] ? "x" : " "}] ${item}`
      ),
    ];
    const md = lines.join("\n");
    try {
      await navigator.clipboard.writeText(md);
      toast.success("Tri-Lens report copied");
      return;
    } catch {
      const area = document.createElement("textarea");
      area.value = md;
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy");
        toast.success("Tri-Lens report copied");
      } catch {
        toast.error("Could not copy report");
      }
      area.remove();
    }
  };

  const currentPersona = PERSONAS.find(p => p.id === activePersona)!;
  const passCount = findings.filter(f => f.severity === "pass").length;
  const warnCount = findings.filter(f => f.severity === "warn").length;
  const failCount = findings.filter(f => f.severity === "fail").length;
  const infoCount = findings.filter(f => f.severity === "info").length;
  const checkedCount = currentPersona.checklist.filter((_, i) => checklist[activePersona]?.[i]).length;

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-label="Tri-Lens Review: QA, developer, and design analysis"
        className="bg-gray-900 text-white px-4 py-3 rounded-2xl shadow-cartoon-lg hover:bg-gray-800 transition-all duration-200 flex items-center gap-2 text-sm font-bold"
      >
        <FiEye className="w-4 h-4" />
        <span className="hidden sm:inline">Tri-Lens Review</span>
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
                Tri-Lens Review
              </h3>
              <span className="text-caption text-gray-500">testing / staging only</span>
            </div>
            <p className="text-caption text-gray-500">
              One pass, three lenses: QA, Developer, and UX/UI Designer
            </p>
          </div>

          {/* Persona tabs */}
          <div className="flex border-b border-gray-200" role="tablist" aria-label="Review perspectives">
            {PERSONAS.map((persona) => (
              <button
                key={persona.id}
                role="tab"
                aria-selected={activePersona === persona.id}
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
                  <span className="ml-1 inline-flex items-center px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded">
                    LIVE · {pathname.length > 24 ? `${pathname.slice(0, 22)}…` : pathname}
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
                  onClick={() => {
                    setExpandedFinding(expandedFinding === finding.id ? null : finding.id);
                    highlightElement(finding.element);
                  }}
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
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-body-sm font-bold text-gray-900 flex items-center gap-2">
                  <FiCheckCircle className="w-4 h-4 text-emerald-500" />
                  {currentPersona.name} Checklist
                </h4>
                <span className="text-caption text-gray-500">
                  {checkedCount}/{currentPersona.checklist.length}
                </span>
              </div>
              <div className="h-1.5 bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{
                    width: `${currentPersona.checklist.length ? (checkedCount / currentPersona.checklist.length) * 100 : 0}%`,
                  }}
                />
              </div>
              <div className="space-y-2">
                {currentPersona.checklist.map((item, i) => {
                  const checked = !!checklist[activePersona]?.[i];
                  return (
                    <button
                      key={i}
                      type="button"
                      role="checkbox"
                      aria-checked={checked}
                      onClick={() => toggleCheck(activePersona, i)}
                      className="flex items-start gap-2 text-left w-full group"
                    >
                      {checked ? (
                        <FiCheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      ) : (
                        <span className="w-4 h-4 mt-0.5 shrink-0 rounded-full border-2 border-gray-300 group-hover:border-emerald-400 transition-colors" />
                      )}
                      <span className={`text-caption ${checked ? "text-gray-400 line-through" : "text-gray-600"}`}>
                        {item}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t border-gray-200 bg-gray-50 flex items-center justify-between gap-3">
            <button
              onClick={() => {
                setExpandedFinding(null);
                setFindings(runAudits(activePersona));
              }}
              className="text-body-sm font-bold text-bai-blue hover:text-bai-blue-hover transition-colors flex items-center gap-2"
            >
              <FiRefreshCw className="w-4 h-4" />
              Re-run
            </button>
            <button
              onClick={copyReport}
              className="text-body-sm font-bold text-bai-blue hover:text-bai-blue-hover transition-colors flex items-center gap-2"
            >
              <FiCopy className="w-4 h-4" />
              Copy report
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
