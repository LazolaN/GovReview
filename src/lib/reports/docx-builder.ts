import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  HeadingLevel,
  AlignmentType,
  WidthType,
  BorderStyle,
  PageBreak,
} from "docx";
import { extractSection } from "@/lib/agents/parser";
import type { MaturityScore } from "@/types/agent";

export interface ReportOptions {
  title?: string;
  clientName?: string;
  sections?: string[]; // which sections to include
}

interface AgentResultInput {
  agentId: string;
  resultText: string;
  maturityScores?: MaturityScore[];
}

const DEFAULT_SECTIONS = [
  "cover",
  "toc",
  "executive_summary",
  "current_state",
  "maturity_assessment",
  "gap_analysis",
  "standards_alignment",
  "remediation_roadmap",
  "raci_matrix",
  "appendices",
];

const FONT_BODY = "DM Sans";
const FONT_HEADING = "DM Sans";
const FONT_MONO = "JetBrains Mono";

const COLOR_PRIMARY = "0C0F14";
const COLOR_GOVERNANCE = "3B82F6";
const COLOR_TEXT = "333333";
const COLOR_HEADER_BG = "1C2028";
const COLOR_HEADER_TEXT = "E8EAED";

// ---------------------------------------------------------------------------
// Markdown to DOCX helpers
// ---------------------------------------------------------------------------

function markdownToParagraphs(text: string): Paragraph[] {
  if (!text) return [];

  const lines = text.split("\n");
  const paragraphs: Paragraph[] = [];

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed) {
      paragraphs.push(new Paragraph({ spacing: { after: 100 } }));
      continue;
    }

    // Headings
    const headingMatch = trimmed.match(/^(#{1,4})\s+(.+)$/);
    if (headingMatch) {
      const level = headingMatch[1].length;
      const headingText = headingMatch[2].replace(/\*\*/g, "");
      const headingLevel =
        level === 1
          ? HeadingLevel.HEADING_1
          : level === 2
            ? HeadingLevel.HEADING_2
            : level === 3
              ? HeadingLevel.HEADING_3
              : HeadingLevel.HEADING_4;

      paragraphs.push(
        new Paragraph({
          heading: headingLevel,
          spacing: { before: 240, after: 120 },
          children: [
            new TextRun({
              text: headingText,
              font: FONT_HEADING,
              bold: true,
              color: COLOR_PRIMARY,
            }),
          ],
        })
      );
      continue;
    }

    // Bullet points
    const bulletMatch = trimmed.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(bulletMatch[1]),
        })
      );
      continue;
    }

    // Numbered list
    const numberedMatch = trimmed.match(/^\d+\.\s+(.+)$/);
    if (numberedMatch) {
      paragraphs.push(
        new Paragraph({
          bullet: { level: 0 },
          spacing: { after: 60 },
          children: parseInlineFormatting(numberedMatch[1]),
        })
      );
      continue;
    }

    // Table row (skip, tables handled separately)
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      // Collect table rows handled by parseMarkdownTables
      continue;
    }

    // Regular paragraph
    paragraphs.push(
      new Paragraph({
        spacing: { after: 120 },
        children: parseInlineFormatting(trimmed),
      })
    );
  }

  // Also parse markdown tables
  const tableParagraphs = parseMarkdownTables(text);
  paragraphs.push(...tableParagraphs);

  return paragraphs;
}

function parseInlineFormatting(text: string): TextRun[] {
  const runs: TextRun[] = [];
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  for (const part of parts) {
    if (part.startsWith("**") && part.endsWith("**")) {
      runs.push(
        new TextRun({
          text: part.slice(2, -2),
          font: FONT_BODY,
          bold: true,
          color: COLOR_TEXT,
          size: 22,
        })
      );
    } else if (part) {
      runs.push(
        new TextRun({
          text: part,
          font: FONT_BODY,
          color: COLOR_TEXT,
          size: 22,
        })
      );
    }
  }

  return runs;
}

function parseMarkdownTables(text: string): Paragraph[] {
  const results: Paragraph[] = [];
  const tableRegex =
    /(?:^|\n)((?:\|[^\n]+\|\n)+)/g;
  let match: RegExpExecArray | null;

  while ((match = tableRegex.exec(text)) !== null) {
    const tableBlock = match[1].trim();
    const rows = tableBlock.split("\n").filter((r) => r.trim());

    // Filter out separator rows (---|---|---)
    const dataRows = rows.filter(
      (r) => !r.replace(/\|/g, "").trim().match(/^[-:\s]+$/)
    );

    if (dataRows.length < 1) continue;

    const parsedRows = dataRows.map((row) =>
      row
        .split("|")
        .filter((_, i, arr) => i > 0 && i < arr.length - 1)
        .map((cell) => cell.trim())
    );

    if (parsedRows.length === 0) continue;

    const colCount = parsedRows[0].length;

    const tableRows = parsedRows.map((cells, rowIdx) => {
      const isHeader = rowIdx === 0;
      return new TableRow({
        children: cells.map(
          (cell) =>
            new TableCell({
              shading: isHeader
                ? { fill: COLOR_HEADER_BG, type: "clear" as const, color: "auto" }
                : undefined,
              children: [
                new Paragraph({
                  alignment: AlignmentType.LEFT,
                  children: [
                    new TextRun({
                      text: cell.replace(/\*\*/g, ""),
                      font: isHeader ? FONT_HEADING : FONT_BODY,
                      bold: isHeader,
                      color: isHeader ? COLOR_HEADER_TEXT : COLOR_TEXT,
                      size: 20,
                    }),
                  ],
                }),
              ],
            })
        ),
      });
    });

    results.push(
      new Paragraph({ spacing: { before: 120 } }),
    );

    // We can't push a Table into Paragraph array directly;
    // we need to return the table as part of the document sections.
    // For simplicity, we skip inline table rendering here; tables are
    // handled in the main section builders where they matter most.
    void tableRows;
    void colCount;
  }

  return results;
}

// ---------------------------------------------------------------------------
// Section builders
// ---------------------------------------------------------------------------

function buildCoverPage(
  title: string,
  clientName: string
): Paragraph[] {
  const today = new Date();
  const dateStr = today.toLocaleDateString("en-ZA", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return [
    new Paragraph({ spacing: { before: 3000 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: title,
          font: FONT_HEADING,
          bold: true,
          size: 56,
          color: COLOR_GOVERNANCE,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
      children: [
        new TextRun({
          text: clientName || "[Client Name]",
          font: FONT_BODY,
          size: 32,
          color: COLOR_TEXT,
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: dateStr,
          font: FONT_BODY,
          size: 24,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({ spacing: { after: 600 } }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "CONFIDENTIAL",
          font: FONT_MONO,
          bold: true,
          size: 28,
          color: "EF4444",
        }),
      ],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "Prepared by Ubuntu Data Solutions (Pty) Ltd",
          font: FONT_BODY,
          size: 22,
          color: "666666",
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildTableOfContents(): Paragraph[] {
  return [
    new Paragraph({
      heading: HeadingLevel.HEADING_1,
      spacing: { after: 200 },
      children: [
        new TextRun({
          text: "Table of Contents",
          font: FONT_HEADING,
          bold: true,
          color: COLOR_PRIMARY,
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: "[Table of contents will be generated when opened in Word. Right-click and select 'Update Field'.]",
          font: FONT_BODY,
          italics: true,
          color: "999999",
          size: 20,
        }),
      ],
    }),
    new Paragraph({
      children: [new PageBreak()],
    }),
  ];
}

function buildMaturityTable(scores: MaturityScore[]): (Paragraph | Table)[] {
  if (scores.length === 0) {
    return [
      new Paragraph({
        spacing: { after: 120 },
        children: [
          new TextRun({
            text: "No maturity scores available.",
            font: FONT_BODY,
            italics: true,
            color: "999999",
            size: 22,
          }),
        ],
      }),
    ];
  }

  const noBorder = {
    style: BorderStyle.NONE,
    size: 0,
    color: "FFFFFF",
  };

  const thinBorder = {
    style: BorderStyle.SINGLE,
    size: 1,
    color: "CCCCCC",
  };

  const headerRow = new TableRow({
    children: ["Dimension", "Score", "Max", "Commentary"].map(
      (label) =>
        new TableCell({
          shading: { fill: COLOR_HEADER_BG, type: "clear" as const, color: "auto" },
          borders: {
            top: thinBorder,
            bottom: thinBorder,
            left: noBorder,
            right: noBorder,
          },
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: label,
                  font: FONT_HEADING,
                  bold: true,
                  color: COLOR_HEADER_TEXT,
                  size: 20,
                }),
              ],
            }),
          ],
        })
    ),
  });

  const dataRows = scores.map(
    (s) =>
      new TableRow({
        children: [
          new TableCell({
            borders: {
              top: noBorder,
              bottom: thinBorder,
              left: noBorder,
              right: noBorder,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: s.dimension,
                    font: FONT_BODY,
                    bold: true,
                    color: COLOR_TEXT,
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: noBorder,
              bottom: thinBorder,
              left: noBorder,
              right: noBorder,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: String(s.score),
                    font: FONT_MONO,
                    bold: true,
                    color: COLOR_GOVERNANCE,
                    size: 22,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: noBorder,
              bottom: thinBorder,
              left: noBorder,
              right: noBorder,
            },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({
                    text: String(s.maxScore),
                    font: FONT_MONO,
                    color: "999999",
                    size: 20,
                  }),
                ],
              }),
            ],
          }),
          new TableCell({
            borders: {
              top: noBorder,
              bottom: thinBorder,
              left: noBorder,
              right: noBorder,
            },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: s.commentary,
                    font: FONT_BODY,
                    color: COLOR_TEXT,
                    size: 18,
                  }),
                ],
              }),
            ],
          }),
        ],
      })
  );

  return [
    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: [headerRow, ...dataRows],
    }),
  ];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

export async function generateReport(
  agentResults: AgentResultInput[],
  options?: ReportOptions
): Promise<Buffer> {
  const title = options?.title || "ICT Governance Review Report";
  const clientName = options?.clientName || "[Client Name]";
  const sections = options?.sections || DEFAULT_SECTIONS;

  const findAgent = (id: string) =>
    agentResults.find((r) => r.agentId === id);

  const pmResult = findAgent("project_manager");
  const leadResult = findAgent("lead_consultant");
  const analystResult = findAgent("data_ai_analyst");

  const children: (Paragraph | Table)[] = [];

  // Cover page
  if (sections.includes("cover")) {
    children.push(...buildCoverPage(title, clientName));
  }

  // Table of Contents
  if (sections.includes("toc")) {
    children.push(...buildTableOfContents());
  }

  // Executive Summary
  if (sections.includes("executive_summary") && pmResult) {
    const summaryText =
      extractSection(pmResult.resultText, "Executive Summary") ||
      pmResult.resultText.slice(0, 2000);

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Executive Summary",
            font: FONT_HEADING,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
      ...markdownToParagraphs(summaryText),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Current State Assessment
  if (sections.includes("current_state") && leadResult) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Current State Assessment",
            font: FONT_HEADING,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
      ...markdownToParagraphs(leadResult.resultText),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Maturity Assessment
  if (sections.includes("maturity_assessment") && leadResult) {
    const scores = leadResult.maturityScores || [];

    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Maturity Assessment",
            font: FONT_HEADING,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
      ...buildMaturityTable(scores),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Gap Analysis & Risk Register
  if (sections.includes("gap_analysis") && analystResult) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Gap Analysis & Risk Register",
            font: FONT_HEADING,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      }),
      ...markdownToParagraphs(analystResult.resultText),
      new Paragraph({ children: [new PageBreak()] })
    );
  }

  // Standards Alignment Matrix
  if (sections.includes("standards_alignment") && analystResult) {
    const alignmentText =
      extractSection(analystResult.resultText, "Standards Alignment") ||
      extractSection(analystResult.resultText, "Alignment Matrix");

    if (alignmentText) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: "Standards Alignment Matrix",
              font: FONT_HEADING,
              bold: true,
              color: COLOR_PRIMARY,
            }),
          ],
        }),
        ...markdownToParagraphs(alignmentText),
        new Paragraph({ children: [new PageBreak()] })
      );
    }
  }

  // Remediation Roadmap
  if (sections.includes("remediation_roadmap") && pmResult) {
    const roadmapText =
      extractSection(pmResult.resultText, "Remediation Roadmap") ||
      extractSection(pmResult.resultText, "Implementation Roadmap") ||
      extractSection(pmResult.resultText, "Roadmap");

    if (roadmapText) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: "Remediation Roadmap",
              font: FONT_HEADING,
              bold: true,
              color: COLOR_PRIMARY,
            }),
          ],
        }),
        ...markdownToParagraphs(roadmapText),
        new Paragraph({ children: [new PageBreak()] })
      );
    }
  }

  // RACI Matrix
  if (sections.includes("raci_matrix") && pmResult) {
    const raciText =
      extractSection(pmResult.resultText, "RACI Matrix") ||
      extractSection(pmResult.resultText, "RACI");

    if (raciText) {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 200, after: 200 },
          children: [
            new TextRun({
              text: "RACI Matrix",
              font: FONT_HEADING,
              bold: true,
              color: COLOR_PRIMARY,
            }),
          ],
        }),
        ...markdownToParagraphs(raciText),
        new Paragraph({ children: [new PageBreak()] })
      );
    }
  }

  // Appendices
  if (sections.includes("appendices")) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 200, after: 200 },
        children: [
          new TextRun({
            text: "Appendices",
            font: FONT_HEADING,
            bold: true,
            color: COLOR_PRIMARY,
          }),
        ],
      })
    );

    for (const result of agentResults) {
      const agentLabel =
        result.agentId === "lead_consultant"
          ? "Lead Consultant"
          : result.agentId === "data_ai_analyst"
            ? "Data & AI Analyst"
            : result.agentId === "project_manager"
              ? "Project Manager"
              : result.agentId;

      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 120 },
          children: [
            new TextRun({
              text: `Appendix: ${agentLabel} Full Output`,
              font: FONT_HEADING,
              bold: true,
              color: COLOR_PRIMARY,
            }),
          ],
        }),
        ...markdownToParagraphs(result.resultText)
      );
    }
  }

  // Fallback if no content
  if (children.length === 0) {
    children.push(
      new Paragraph({
        children: [
          new TextRun({
            text: "No report content available. Please run the governance review agents first.",
            font: FONT_BODY,
            color: COLOR_TEXT,
            size: 22,
          }),
        ],
      })
    );
  }

  const doc = new Document({
    creator: "Ubuntu Data Solutions (Pty) Ltd",
    title,
    description: "ICT Governance Review Report",
    styles: {
      default: {
        document: {
          run: {
            font: FONT_BODY,
            size: 22,
            color: COLOR_TEXT,
          },
        },
        heading1: {
          run: {
            font: FONT_HEADING,
            size: 36,
            bold: true,
            color: COLOR_PRIMARY,
          },
          paragraph: {
            spacing: { before: 360, after: 200 },
          },
        },
        heading2: {
          run: {
            font: FONT_HEADING,
            size: 28,
            bold: true,
            color: COLOR_GOVERNANCE,
          },
          paragraph: {
            spacing: { before: 240, after: 120 },
          },
        },
        heading3: {
          run: {
            font: FONT_HEADING,
            size: 24,
            bold: true,
            color: COLOR_TEXT,
          },
          paragraph: {
            spacing: { before: 200, after: 100 },
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: 1440,
              right: 1440,
              bottom: 1440,
              left: 1440,
            },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  return Buffer.from(buffer);
}
