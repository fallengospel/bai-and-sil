export type Persona = "qa" | "dev" | "designer";
export type Severity = "pass" | "warn" | "fail" | "info";

export interface Finding {
  id: string;
  severity: Severity;
  category: string;
  message: string;
  suggestion?: string;
  element?: string;
}

let captureInstalled = false;
const consoleErrors = new Map<string, number>();
const consoleWarnings = new Map<string, number>();
const MAX_CONSOLE_ENTRIES = 30;

function formatArgs(args: unknown[]): string {
  return args
    .map((a) => {
      if (typeof a === "string") return a;
      if (a instanceof Error) return `${a.name}: ${a.message}`;
      try {
        const json = JSON.stringify(a);
        return json === undefined ? String(a) : json;
      } catch {
        return String(a);
      }
    })
    .join(" ")
    .slice(0, 240);
}

function record(map: Map<string, number>, message: string) {
  if (!message) return;
  const existing = map.get(message);
  if (existing !== undefined) map.set(message, existing + 1);
  else if (map.size < MAX_CONSOLE_ENTRIES) map.set(message, 1);
}

export function installConsoleCapture() {
  if (captureInstalled || typeof window === "undefined") return;
  captureInstalled = true;

  const originalError = console.error;
  const originalWarn = console.warn;

  console.error = (...args: unknown[]) => {
    record(consoleErrors, formatArgs(args));
    originalError.apply(console, args);
  };
  console.warn = (...args: unknown[]) => {
    record(consoleWarnings, formatArgs(args));
    originalWarn.apply(console, args);
  };

  window.addEventListener("error", (e) => record(consoleErrors, e.message));
  window.addEventListener("unhandledrejection", (e) =>
    record(consoleErrors, `Unhandled rejection: ${String(e.reason)}`)
  );
}

function visible(el: Element): boolean {
  return el.getClientRects().length > 0;
}

function sel(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const rawClass =
    typeof el.className === "string" ? el.className.trim().split(/\s+/).slice(0, 2).join(".") : "";
  return `${tag}${id}${rawClass ? `.${rawClass}` : ""}`.slice(0, 70);
}

function sampleList(els: Element[], max = 3): string {
  const names = Array.from(new Set(els.map(sel))).slice(0, max);
  const extra = els.length > max ? ` (+${els.length - max} more)` : "";
  return `${names.join(", ")}${extra}`;
}

function accessibleName(el: Element): string {
  const aria = el.getAttribute("aria-label");
  if (aria && aria.trim()) return aria.trim();
  const labelledBy = el.getAttribute("aria-labelledby");
  if (labelledBy) {
    const text = labelledBy
      .split(/\s+/)
      .map((id) => document.getElementById(id)?.textContent ?? "")
      .join(" ")
      .trim();
    if (text) return text;
  }
  const text = (el.textContent ?? "").trim();
  if (text) return text;
  const img = el.querySelector("img[alt]");
  const imgAlt = img?.getAttribute("alt")?.trim();
  if (imgAlt) return imgAlt;
  const title = el.getAttribute("title");
  if (title && title.trim()) return title.trim();
  return "";
}

function parseRgb(color: string): { r: number; g: number; b: number; a: number } | null {
  const match = color.match(/rgba?\(([^)]+)\)/);
  if (!match) return null;
  const parts = match[1]
    .split(/[,\s/]+/)
    .filter(Boolean)
    .map(Number);
  if (parts.length < 3 || parts.some((n) => Number.isNaN(n))) return null;
  return { r: parts[0], g: parts[1], b: parts[2], a: parts.length > 3 ? parts[3] : 1 };
}

function relativeLuminance(c: { r: number; g: number; b: number }): number {
  const channel = (v: number) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(c.r) + 0.7152 * channel(c.g) + 0.0722 * channel(c.b);
}

function contrastRatio(
  fg: { r: number; g: number; b: number },
  bg: { r: number; g: number; b: number }
): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function compositeOver(
  top: { r: number; g: number; b: number; a: number },
  bottom: { r: number; g: number; b: number }
): { r: number; g: number; b: number } {
  return {
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
  };
}

function effectiveBackground(el: Element): { r: number; g: number; b: number } {
  const stack: { r: number; g: number; b: number; a: number }[] = [];
  let node: Element | null = el;
  while (node) {
    const bg = parseRgb(getComputedStyle(node).backgroundColor);
    if (bg && bg.a > 0) stack.push(bg);
    node = node.parentElement;
  }
  let base = { r: 255, g: 255, b: 255 };
  for (let i = stack.length - 1; i >= 0; i--) base = compositeOver(stack[i], base);
  return base;
}

function directText(el: Element): string {
  let text = "";
  el.childNodes.forEach((child) => {
    if (child.nodeType === Node.TEXT_NODE) text += child.textContent ?? "";
  });
  return text.trim();
}

function auditQa(): Finding[] {
  const findings: Finding[] = [];

  const fields = Array.from(
    document.querySelectorAll<HTMLInputElement>("input, select, textarea")
  ).filter((el) => el.type !== "hidden" && visible(el));
  const unlabeled = fields.filter((el) => {
    if (el.labels && el.labels.length > 0) return false;
    if (el.getAttribute("aria-label")?.trim()) return false;
    if (el.getAttribute("aria-labelledby")?.trim()) return false;
    if (el.getAttribute("title")?.trim()) return false;
    return true;
  });
  findings.push(
    unlabeled.length === 0
      ? {
          id: "qa-labels",
          severity: "pass",
          category: "Accessibility",
          message: `All ${fields.length} visible form field(s) have an accessible label`,
          element: "input, select, textarea",
        }
      : {
          id: "qa-labels",
          severity: "fail",
          category: "Accessibility",
          message: `${unlabeled.length} form field(s) have no accessible label`,
          element: sampleList(unlabeled),
          suggestion:
            "Associate a <label htmlFor> with the field id, or add an aria-label attribute",
        }
  );

  const interactive = Array.from(
    document.querySelectorAll<HTMLElement>("a[href], button, [role='button'], [role='link'], [role='tab']")
  ).filter(visible);
  const nameless = interactive.filter((el) => !accessibleName(el));
  findings.push(
    nameless.length === 0
      ? {
          id: "qa-names",
          severity: "pass",
          category: "Accessibility",
          message: `All ${interactive.length} visible interactive element(s) have an accessible name`,
          element: "a, button",
        }
      : {
          id: "qa-names",
          severity: "fail",
          category: "Accessibility",
          message: `${nameless.length} interactive element(s) have no accessible name (no text, aria-label, or title)`,
          element: sampleList(nameless),
          suggestion: "Add visible text or an aria-label describing the action",
        }
  );

  const images = Array.from(document.querySelectorAll("img")).filter(visible);
  const noAlt = images.filter((img) => img.getAttribute("alt") === null);
  findings.push(
    noAlt.length === 0
      ? {
          id: "qa-alt",
          severity: "pass",
          category: "Accessibility",
          message: `All ${images.length} visible image(s) have an alt attribute`,
          element: "img",
        }
      : {
          id: "qa-alt",
          severity: "fail",
          category: "Accessibility",
          message: `${noAlt.length} image(s) are missing an alt attribute`,
          element: sampleList(noAlt),
          suggestion: 'Add alt="" for decorative images, or a descriptive alt for content images',
        }
  );

  const lang = document.documentElement.getAttribute("lang");
  findings.push(
    lang
      ? {
          id: "qa-lang",
          severity: "pass",
          category: "Accessibility",
          message: `<html lang="${lang}"> is set correctly`,
          element: "html",
        }
      : {
          id: "qa-lang",
          severity: "fail",
          category: "Accessibility",
          message: "The <html> element has no lang attribute",
          element: "html",
          suggestion: 'Add lang="en" to the <html> element',
        }
  );

  const h1s = Array.from(document.querySelectorAll("h1")).filter(visible);
  const headings = Array.from(
    document.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6")
  ).filter(visible);
  let skips = 0;
  let firstSkip = "";
  let prevLevel = 0;
  for (const heading of headings) {
    const level = Number(heading.tagName[1]);
    if (prevLevel && level > prevLevel + 1) {
      skips++;
      if (!firstSkip) firstSkip = `h${prevLevel} → h${level}`;
    }
    prevLevel = level;
  }
  if (h1s.length !== 1) {
    findings.push({
      id: "qa-h1",
      severity: "warn",
      category: "Structure",
      message: `Expected exactly one visible <h1>, found ${h1s.length}`,
      element: h1s.length ? sampleList(h1s) : "no h1 on page",
      suggestion: "Keep one h1 per page and demote the others to h2/h3",
    });
  } else {
    findings.push({
      id: "qa-h1",
      severity: "pass",
      category: "Structure",
      message: "Exactly one visible <h1> on the page",
      element: sel(h1s[0]),
    });
  }
  findings.push(
    skips === 0
      ? {
          id: "qa-heading-order",
          severity: "pass",
          category: "Structure",
          message: `${headings.length} heading(s) follow a continuous hierarchy`,
          element: "h1–h6",
        }
      : {
          id: "qa-heading-order",
          severity: "warn",
          category: "Structure",
          message: `${skips} heading level skip(s) detected (first: ${firstSkip})`,
          suggestion: "Do not skip heading levels — screen reader users navigate by outline",
        }
  );

  const tappable = Array.from(
    document.querySelectorAll<HTMLElement>(
      "a[href], button, [role='button'], [role='tab'], input[type='checkbox'], input[type='radio']"
    )
  ).filter(visible);
  const standalone = tappable.filter((el) => getComputedStyle(el).display !== "inline");
  const smallTargets = standalone.filter((el) => {
    const rect = el.getBoundingClientRect();
    return rect.width > 0 && rect.height > 0 && (rect.width < 44 || rect.height < 44);
  });
  findings.push(
    smallTargets.length === 0
      ? {
          id: "qa-targets",
          severity: "pass",
          category: "Responsive",
          message: `All ${standalone.length} standalone control(s) meet the 44×44px touch target size`,
          element: "buttons, block links",
        }
      : {
          id: "qa-targets",
          severity: "warn",
          category: "Responsive",
          message: `${smallTargets.length} standalone control(s) are smaller than 44×44px`,
          element: sampleList(smallTargets),
          suggestion: "Increase padding or min-width/min-height to at least 44×44px",
        }
  );

  const previouslyFocused = document.activeElement as HTMLElement | null;
  const focusSample = standalone.slice(0, 8);
  let focusIssues = 0;
  for (const el of focusSample) {
    el.focus({ preventScroll: true });
    const style = getComputedStyle(el);
    const classes = el.getAttribute("class") ?? "";
    const hasFocusClass = /(^|\s)(focus|focus-visible)[:[]/.test(classes);
    const outlineVisible =
      style.outlineStyle !== "none" &&
      parseFloat(style.outlineWidth) > 0 &&
      parseRgb(style.outlineColor || "rgba(0,0,0,1)") !== null &&
      (parseRgb(style.outlineColor)?.a ?? 1) > 0.1 &&
      style.outlineColor !== "rgba(0, 0, 0, 0)" &&
      style.outlineColor !== "transparent";
    const shadowVisible = style.boxShadow !== "none";
    if (!hasFocusClass && !outlineVisible && !shadowVisible) focusIssues++;
    el.blur();
  }
  if (previouslyFocused && typeof previouslyFocused.focus === "function") {
    previouslyFocused.focus({ preventScroll: true });
  }
  findings.push(
    focusSample.length === 0
      ? {
          id: "qa-focus",
          severity: "info",
          category: "Accessibility",
          message: "No focusable controls found to sample",
        }
      : focusIssues === 0
        ? {
            id: "qa-focus",
            severity: "pass",
            category: "Accessibility",
            message: `All ${focusSample.length} sampled control(s) show a focus indicator`,
            element: sampleList(focusSample),
          }
        : {
            id: "qa-focus",
            severity: "warn",
            category: "Accessibility",
            message: `${focusIssues} of ${focusSample.length} sampled control(s) show no focus indicator`,
            element: "focus styles",
            suggestion: "Add focus:ring-2 or focus-visible:outline to every interactive control",
          }
  );

  const viewport = document.querySelector('meta[name="viewport"]')?.getAttribute("content") ?? "";
  const zoomBlocked =
    /user-scalable\s*=\s*(no|0)/i.test(viewport) ||
    (() => {
      const match = viewport.match(/maximum-scale\s*=\s*([\d.]+)/i);
      return match ? parseFloat(match[1]) < 2 : false;
    })();
  findings.push(
    zoomBlocked
      ? {
          id: "qa-zoom",
          severity: "fail",
          category: "Accessibility",
          message: "Viewport meta blocks pinch-zoom (user-scalable=no or maximum-scale < 2)",
          element: 'meta[name="viewport"]',
          suggestion: "Allow zoom — WCAG 1.4.4 requires it",
        }
      : {
          id: "qa-zoom",
          severity: "pass",
          category: "Accessibility",
          message: "Viewport allows pinch-zoom",
          element: 'meta[name="viewport"]',
        }
  );

  const hasMain = !!document.querySelector("main");
  const hasNav = !!document.querySelector("nav, [role='navigation']");
  findings.push(
    hasMain && hasNav
      ? {
          id: "qa-landmarks",
          severity: "pass",
          category: "Accessibility",
          message: "Page has both <main> and navigation landmarks",
          element: "main, nav",
        }
      : {
          id: "qa-landmarks",
          severity: "warn",
          category: "Accessibility",
          message: `Missing landmark(s): ${[!hasMain && "<main>", !hasNav && "navigation"].filter(Boolean).join(", ")}`,
          suggestion: "Wrap page content in <main> and use <nav> for link groups",
        }
  );

  return findings;
}

function consoleFinding(
  id: string,
  label: string,
  map: Map<string, number>,
  severityOnHit: Severity,
  suggestion: string
): Finding {
  if (map.size === 0) {
    return {
      id,
      severity: "pass",
      category: "Console",
      message: `No console.${label} since page load`,
      element: "console",
    };
  }
  const total = Array.from(map.values()).reduce((a, b) => a + b, 0);
  const first = Array.from(map.keys())[0];
  return {
    id,
    severity: severityOnHit,
    category: "Console",
    message: `${map.size} unique console.${label} message(s) (${total} total) — first: "${first}"`,
    element: "console",
    suggestion,
  };
}

function auditDev(): Finding[] {
  const findings: Finding[] = [];

  findings.push(
    consoleFinding(
      "dev-console-errors",
      "error",
      consoleErrors,
      "fail",
      "Fix the root cause — errors here are real failures (hydration mismatches, failed fetches, thrown exceptions)"
    )
  );
  findings.push(
    consoleFinding(
      "dev-console-warnings",
      "warn",
      consoleWarnings,
      "warn",
      "Review each warning — React/Next warnings usually indicate real issues"
    )
  );

  const allIds = Array.from(document.querySelectorAll("[id]")).map((el) => el.id);
  const counts = new Map<string, number>();
  for (const id of allIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const duplicates = Array.from(counts.entries())
    .filter(([id, count]) => id && count > 1)
    .map(([id]) => id);
  findings.push(
    duplicates.length === 0
      ? {
          id: "dev-dup-ids",
          severity: "pass",
          category: "Code Quality",
          message: `No duplicate DOM ids across ${allIds.length} element(s)`,
          element: "[id]",
        }
      : {
          id: "dev-dup-ids",
          severity: "fail",
          category: "Code Quality",
          message: `Duplicate DOM id(s): ${duplicates.slice(0, 5).join(", ")}`,
          suggestion: "Use React's useId() or unique keys — duplicate ids break label/aria wiring",
        }
  );

  const images = Array.from(document.querySelectorAll("img")).filter(visible);
  const unsized = images.filter(
    (img) => !img.hasAttribute("width") || !img.hasAttribute("height")
  );
  findings.push(
    unsized.length === 0
      ? {
          id: "dev-img-size",
          severity: "pass",
          category: "Performance",
          message: `All ${images.length} visible image(s) declare width and height (no layout shift)`,
          element: "img",
        }
      : {
          id: "dev-img-size",
          severity: "warn",
          category: "Performance",
          message: `${unsized.length} image(s) missing width/height attributes (CLS risk)`,
          element: sampleList(unsized),
          suggestion: "Add explicit width/height or use next/image which does it automatically",
        }
  );

  const blankLinks = Array.from(document.querySelectorAll("a[target='_blank']"));
  const unsafe = blankLinks.filter((a) => !/noopener|noreferrer/.test(a.getAttribute("rel") ?? ""));
  findings.push(
    blankLinks.length === 0
      ? {
          id: "dev-blank-rel",
          severity: "pass",
          category: "Security",
          message: "No target=\"_blank\" links on this page",
          element: "a[target=_blank]",
        }
      : unsafe.length === 0
        ? {
            id: "dev-blank-rel",
            severity: "pass",
            category: "Security",
            message: `All ${blankLinks.length} target="_blank" link(s) use rel="noopener"`,
            element: "a[target=_blank]",
          }
        : {
            id: "dev-blank-rel",
            severity: "fail",
            category: "Security",
            message: `${unsafe.length} target="_blank" link(s) missing rel="noopener" (tabnabbing risk)`,
            element: sampleList(unsafe),
            suggestion: 'Add rel="noopener noreferrer"',
          }
  );

  const missingMeta: string[] = [];
  if (!document.title.trim()) missingMeta.push("document title");
  if (!document.querySelector('meta[name="description"]')) missingMeta.push("meta description");
  if (!document.querySelector('meta[name="viewport"]')) missingMeta.push("meta viewport");
  findings.push(
    missingMeta.length === 0
      ? {
          id: "dev-meta",
          severity: "pass",
          category: "SEO",
          message: `Title, description, and viewport are all present ("${document.title}")`,
          element: "<head>",
        }
      : {
          id: "dev-meta",
          severity: "warn",
          category: "SEO",
          message: `Missing <head> element(s): ${missingMeta.join(", ")}`,
          suggestion: "Export a metadata object from the page's Next.js layout or page",
        }
  );

  const domSize = document.querySelectorAll("*").length;
  findings.push(
    domSize > 1500
      ? {
          id: "dev-dom-size",
          severity: "info",
          category: "Performance",
          message: `DOM contains ${domSize} elements (above 1,500 — check for over-rendered lists)`,
          element: "document",
          suggestion: "Paginate long lists and avoid rendering off-screen content",
        }
      : {
          id: "dev-dom-size",
          severity: "pass",
          category: "Performance",
          message: `DOM size is healthy (${domSize} elements)`,
          element: "document",
        }
  );

  const rawHandlers = Array.from(
    document.querySelectorAll("[onclick], [onmouseover], [onchange], [onsubmit]")
  );
  findings.push(
    rawHandlers.length === 0
      ? {
          id: "dev-raw-handlers",
          severity: "pass",
          category: "Code Quality",
          message: "No inline event handler attributes in the DOM",
          element: "onclick, onchange, ...",
        }
      : {
          id: "dev-raw-handlers",
          severity: "warn",
          category: "Code Quality",
          message: `${rawHandlers.length} element(s) use inline event handler attributes`,
          element: sampleList(rawHandlers),
          suggestion: "Move handlers into React event props instead of inline HTML attributes",
        }
  );

  return findings;
}

function auditDesigner(): Finding[] {
  const findings: Finding[] = [];

  const textSelector = "p, a, li, button, h1, h2, h3, h4, label, small, span";
  const candidates = Array.from(document.querySelectorAll<HTMLElement>(textSelector))
    .filter((el) => visible(el) && directText(el).length > 0);
  const leaves = candidates.filter(
    (el) => !candidates.some((other) => other !== el && el.contains(other))
  );
  const sample = leaves.slice(0, 120);
  const contrastFailures: { el: Element; ratio: number; need: number }[] = [];
  for (const el of sample) {
    const style = getComputedStyle(el);
    const fg = parseRgb(style.color);
    if (!fg || fg.a < 0.9) continue;
    const bg = effectiveBackground(el);
    const size = parseFloat(style.fontSize);
    const weight = parseInt(style.fontWeight, 10) || 400;
    const large = size >= 24 || (weight >= 700 && size >= 18.66);
    const need = large ? 3 : 4.5;
    const ratio = contrastRatio(fg, bg);
    if (ratio < need) contrastFailures.push({ el, ratio, need });
  }
  if (contrastFailures.length === 0) {
    findings.push({
      id: "des-contrast",
      severity: "pass",
      category: "Color",
      message: `All ${sample.length} sampled text element(s) meet WCAG AA contrast`,
      element: "text colors",
    });
  } else {
    const worst = contrastFailures.reduce((a, b) => (a.ratio < b.ratio ? a : b));
    findings.push({
      id: "des-contrast",
      severity: worst.ratio < 3 ? "fail" : "warn",
      category: "Color",
      message: `${contrastFailures.length} of ${sample.length} sampled text element(s) fail WCAG AA contrast (worst: ${worst.ratio.toFixed(2)}:1, needs ${worst.need}:1) on ${sel(worst.el)}`,
      element: sampleList(contrastFailures.map((f) => f.el)),
      suggestion: "Darken the text color or lighten the background until the ratio meets AA",
    });
  }

  const bodyText = Array.from(
    document.querySelectorAll<HTMLElement>("p, li, label, span")
  ).filter((el) => visible(el) && directText(el).length > 0);
  const sizes = bodyText.map((el) => parseFloat(getComputedStyle(el).fontSize));
  const smallest = sizes.length ? Math.min(...sizes) : 0;
  findings.push(
    smallest >= 12
      ? {
          id: "des-body-size",
          severity: "pass",
          category: "Typography",
          message: `Smallest body text is ${smallest}px (readable)`,
          element: "p, li, span",
        }
      : {
          id: "des-body-size",
          severity: "warn",
          category: "Typography",
          message: `Body text as small as ${smallest}px was found — hard to read`,
          element: "p, li, span",
          suggestion: "Keep body/meta text at 12px minimum, prefer 14px+ for paragraphs",
        }
  );

  const ctas = Array.from(
    document.querySelectorAll<HTMLElement>("main a, main button")
  ).filter((el) => {
    if (!visible(el) || !accessibleName(el)) return false;
    const rect = el.getBoundingClientRect();
    if (rect.top <= 90) return false;
    const bg = parseRgb(getComputedStyle(el).backgroundColor);
    if (!bg || bg.a < 0.5) return false;
    const { r, g, b } = bg;
    const isNeutral = Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && Math.abs(r - b) < 12;
    return !isNeutral;
  });
  const visibleCta = ctas.find((el) => el.getBoundingClientRect().top < window.innerHeight);
  findings.push(
    visibleCta
      ? {
          id: "des-cta-fold",
          severity: "pass",
          category: "Hierarchy",
          message: `Primary action is visible above the fold: "${accessibleName(visibleCta).slice(0, 40)}"`,
          element: sel(visibleCta),
        }
      : ctas.length > 0
        ? {
            id: "des-cta-fold",
            severity: "warn",
            category: "Hierarchy",
            message: `${ctas.length} call-to-action(s) exist but none are visible in the current viewport`,
            element: sampleList(ctas),
            suggestion: "Bring the primary CTA into the first viewport of every key page",
          }
        : {
            id: "des-cta-fold",
            severity: "warn",
            category: "Hierarchy",
            message: "No call-to-action button with a distinct background found in <main>",
            element: "main",
            suggestion: "Every marketplace page should offer one clear primary action",
          }
  );

  const h1 = document.querySelector<HTMLElement>("h1");
  if (!h1 || !visible(h1)) {
    findings.push({
      id: "des-h1",
      severity: "fail",
      category: "Hierarchy",
      message: "No visible page headline (h1) found",
      element: "h1",
      suggestion: "Add one clear, prominent headline per page",
    });
  } else {
    const size = parseFloat(getComputedStyle(h1).fontSize);
    findings.push(
      size >= 28
        ? {
            id: "des-h1",
            severity: "pass",
            category: "Hierarchy",
            message: `Headline reads at ${size}px and anchors the page hierarchy`,
            element: "h1",
          }
        : {
            id: "des-h1",
            severity: "warn",
            category: "Hierarchy",
            message: `Headline is only ${size}px — weak visual hierarchy`,
            element: "h1",
            suggestion: "Scale the h1 up on desktop (28px+) so the page has a clear entry point",
          }
    );
  }

  const inlineLinks = Array.from(
    document.querySelectorAll<HTMLElement>("p a, li a")
  ).filter(visible);
  const unmarked = inlineLinks.filter(
    (a) => !getComputedStyle(a).textDecorationLine.includes("underline")
  );
  findings.push(
    inlineLinks.length === 0
      ? {
          id: "des-link-underline",
          severity: "pass",
          category: "Color",
          message: "No inline text links to distinguish from body copy",
          element: "p a, li a",
        }
      : unmarked.length === 0
        ? {
            id: "des-link-underline",
            severity: "pass",
            category: "Color",
            message: `All ${inlineLinks.length} inline text link(s) are underlined (not color-only)`,
            element: "p a, li a",
          }
        : {
            id: "des-link-underline",
            severity: "warn",
            category: "Color",
            message: `${unmarked.length} inline text link(s) rely on color alone to look clickable`,
            element: sampleList(unmarked),
            suggestion: "Underline links inside paragraphs (WCAG 1.4.1)",
          }
  );

  return findings;
}

export function highlightElement(elementField?: string): boolean {
  if (!elementField || typeof document === "undefined") return false;
  const raw = elementField.split(",")[0].replace(/\(\+[^)]*\)/g, "").trim();
  if (!raw) return false;
  let target: Element | null = null;
  try {
    target = document.querySelector(raw);
  } catch {
    return false;
  }
  if (!target) return false;
  target.scrollIntoView({ block: "center", behavior: "auto" });
  const rect = target.getBoundingClientRect();
  if (rect.width === 0 && rect.height === 0) return false;
  const box = document.createElement("div");
  box.setAttribute("aria-hidden", "true");
  box.style.cssText = `position:fixed;left:${rect.left - 4}px;top:${rect.top - 4}px;width:${rect.width + 8}px;height:${rect.height + 8}px;border:3px solid #F5BD5D;border-radius:10px;box-shadow:0 0 0 4px rgba(245,189,93,.4);pointer-events:none;z-index:60;transition:opacity .45s ease;`;
  document.body.appendChild(box);
  window.setTimeout(() => {
    box.style.opacity = "0";
  }, 950);
  window.setTimeout(() => box.remove(), 1450);
  return true;
}

export function runAudits(persona: Persona): Finding[] {
  if (typeof document === "undefined") return [];
  try {
    if (persona === "qa") return auditQa();
    if (persona === "dev") return auditDev();
    return auditDesigner();
  } catch (error) {
    return [
      {
        id: `${persona}-crash`,
        severity: "fail",
        category: "Tooling",
        message: `Audit run failed: ${error instanceof Error ? error.message : String(error)}`,
        suggestion: "Report this to the dev team — the review tool itself errored",
      },
    ];
  }
}
