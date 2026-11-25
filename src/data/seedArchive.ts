import { SUBJECT_MAP } from '../config/driveConfig';
import type {
  ChapterGroup,
  ChapterSectionKind,
  RevisionArtifact,
  SubjectArchive,
} from '../types/archive';
import auditDiagramUrl from '../assets/images/infographic_audit_risk_preview_1795518302438.jpg';
import afmDiagramUrl from '../assets/images/infographic_afm_forex_preview_1795518304537.jpg';

function buildChapter(
  subjectId: ChapterGroup['subjectId'],
  chapterNumber: number | null,
  title: string,
  standards: string[],
  artifacts: Omit<
    RevisionArtifact,
    'subjectId' | 'chapterKey' | 'chapterNumber' | 'chapterTitle' | 'source' | 'drivePreviewUrl'
  >[],
  options: {
    chapterKey?: string;
    sectionKind?: ChapterSectionKind;
    partLabel?: string | null;
  } = {},
): ChapterGroup {
  const sectionKind = options.sectionKind ?? 'chapter';
  const chapterKey =
    options.chapterKey ??
    (chapterNumber !== null
      ? `ch-${chapterNumber}`
      : `sec-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`);

  const fullArtifacts: RevisionArtifact[] = artifacts.map((item) => ({
    ...item,
    subjectId,
    chapterKey,
    chapterNumber,
    chapterTitle: title,
    source: 'demo',
    drivePreviewUrl: null,
  }));

  const modules = fullArtifacts.filter(
    (a) => a.category === 'module' || a.category === 'suggested_answers',
  );
  const slides = fullArtifacts.filter((a) => a.category === 'slides');
  const infographics = fullArtifacts.filter((a) => a.category === 'infographic');
  const practiceQa = fullArtifacts.filter((a) => a.category === 'practice_qa');
  const otherFiles = fullArtifacts.filter(
    (a) =>
      a.category !== 'module' &&
      a.category !== 'suggested_answers' &&
      a.category !== 'slides' &&
      a.category !== 'infographic' &&
      a.category !== 'practice_qa',
  );

  return {
    chapterKey,
    chapterNumber,
    title,
    subjectId,
    sectionKind,
    partLabel: options.partLabel ?? null,
    standards,
    modules,
    slides,
    infographics,
    practiceQa,
    revisionVisuals: [...slides, ...infographics],
    otherFiles,
    allArtifacts: fullArtifacts,
  };
}

/**
 * Deterministic CA Final seed catalog mirroring the exact chapter-unified structure
 * across all 5 subjects (used when no public Drive API key or OAuth session is active).
 */
export function buildDemoArchives(): SubjectArchive[] {
  // 1. Financial Reporting (Ind AS chapters + ICAI Suggested Answers + Practice Q&A)
  const frChapters: ChapterGroup[] = [
    buildChapter('fr', null, 'Ind AS 103 — Business Combinations', ['Ind AS 103', 'Ind AS 110'], [
      {
        id: 'fr-103-mod',
        title: 'Ind AS 103 Business Combinations',
        rawFileName: 'Ind AS 103 Business Combinations.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 103', 'Ind AS 110'],
        folderBreadcrumb: ['1. Modules'],
        sizeBytes: 2_840_000,
        modifiedTime: '2026-10-25T16:10:00Z',
        demoContent: {
          summary:
            'Acquisition accounting, NCI measurement alternatives (Fair Value vs PSNA), Step Acquisitions, Reverse Acquisitions, and Common Control Appendix C.',
          keyFormulaOrProvision:
            'Goodwill = Consideration Transferred + NCI + Fair Value of Previously Held Equity - Fair Value of Net Identifiable Assets',
          sections: [
            {
              heading: 'Measurement Period Adjustments (Para 45)',
              points: [
                'Up to 12 months from acquisition date for facts and circumstances existing as of acquisition date.',
                'Retrospectively adjusts Goodwill or Capital Reserve (Bargain Purchase Gain).',
              ],
            },
            {
              heading: 'Appendix C — Common Control Business Combinations',
              points: [
                'Accounted using Pooling of Interests Method at carrying values; no new goodwill created.',
                'Difference between consideration and share capital recorded in Capital Reserve.',
              ],
            },
          ],
        },
      },
      {
        id: 'fr-103-slide',
        title: 'Business Combinations Revision Slide Deck',
        rawFileName: 'Business Combinations Revision Slide Deck.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Ind AS 103'],
        folderBreadcrumb: ['3. Revisions', 'Business Combinations'],
        sizeBytes: 4_120_000,
        modifiedTime: '2026-10-26T10:15:00Z',
        demoContent: {
          summary:
            'Concise exam slide deck covering Acquisition-Date Identification, Contingent Consideration remeasurement, and Replacement Share-Based Payment Awards.',
          keyFormulaOrProvision:
            'Acquisition-related transaction costs -> Expensed immediately to P&L (except debt/equity issue costs under Ind AS 32/109).',
        },
      },
      {
        id: 'fr-103-chart',
        title: 'Ind AS 103 Goodwill vs Capital Reserve Flow Chart',
        rawFileName: 'Ind AS 103 Goodwill vs Capital Reserve Flow Chart.png',
        category: 'infographic',
        mimeType: 'image/png',
        standards: ['Ind AS 103'],
        folderBreadcrumb: ['3. Revisions', 'Business Combinations'],
        sizeBytes: 1_890_000,
        modifiedTime: '2026-10-26T12:20:00Z',
        demoContent: {
          summary:
            'Visual comparison of NCI valuation choices, bargain purchase gain routing through OCI to Capital Reserve, and acquisition-related cost expensing.',
          keyFormulaOrProvision:
            'Bargain Purchase Gain -> Recognized in OCI and accumulated in Equity as Capital Reserve (or directly in Capital Reserve if no clear evidence).',
        },
      },
    ], { chapterKey: 'std-ind-as-103' }),

    buildChapter('fr', null, 'Ind AS 109 — Financial Instruments', ['Ind AS 109', 'Ind AS 32'], [
      {
        id: 'fr-109-mod',
        title: 'Ind AS 109 Classification, ECL & Compound Instruments',
        rawFileName: 'Ind AS 109 Financial Instruments.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 109', 'Ind AS 32'],
        folderBreadcrumb: ['1. Modules'],
        sizeBytes: 3_420_000,
        modifiedTime: '2026-10-28T09:00:00Z',
        demoContent: {
          summary:
            'Business Model + SPPI classification matrix, 3-Stage Expected Credit Loss impairment, Derecognition, and Convertible Debenture split accounting.',
          keyFormulaOrProvision:
            'Amortised Cost requires BOTH: Hold-to-Collect Business Model AND SPPI Cash Flow Characteristics',
          sections: [
            {
              heading: '3-Stage Expected Credit Loss (ECL) Impairment',
              points: [
                'Stage 1 (Performing): 12-month ECL; interest on gross carrying amount.',
                'Stage 2 (Significant Increase in Credit Risk): Lifetime ECL; interest on gross carrying amount.',
                'Stage 3 (Credit-Impaired): Lifetime ECL; interest on net carrying amount (gross less allowance).',
              ],
            },
          ],
        },
      },
      {
        id: 'fr-109-slide',
        title: 'Ind AS 109 SPPI & Reclassification Revision Slides',
        rawFileName: 'Ind AS 109 SPPI & Reclassification Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Ind AS 109'],
        folderBreadcrumb: ['3. Revisions', 'Financial Instruments'],
        sizeBytes: 2_760_000,
        modifiedTime: '2026-10-29T18:05:00Z',
        demoContent: {
          summary:
            'Quick-revision slides covering financial asset reclassification rules (prospective from first day of next reporting period) and 10% debt modification test.',
          keyFormulaOrProvision:
            '10% Debt Modification Test: PV of new cash flows discounted at ORIGINAL EIR differs by >= 10% -> Extinguishment.',
        },
      },
    ], { chapterKey: 'std-ind-as-109' }),

    buildChapter('fr', null, 'Ind AS 115 — Revenue from Contracts with Customers', ['Ind AS 115'], [
      {
        id: 'fr-ch1-mod',
        title: 'Ind AS 115 Revenue from Contracts with Customers',
        rawFileName: 'Ind AS 115 Revenue from Contracts with Customers.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 115'],
        folderBreadcrumb: ['1. Modules'],
        sizeBytes: 2_650_000,
        modifiedTime: '2026-10-18T09:15:00Z',
        demoContent: {
          summary:
            'Core principles governing recognition of revenue depicting transfer of promised goods or services to customers in an amount reflecting expected consideration.',
          keyFormulaOrProvision:
            'Step 1: Identify Contract -> Step 2: Performance Obligations -> Step 3: Transaction Price -> Step 4: Allocate SSP -> Step 5: Recognize on Control Transfer',
          sections: [
            {
              heading: 'Contract Enforceability & Combination (Paras 9–17)',
              points: [
                'All five criteria must be met: approval & commitment, identifiable rights, payment terms, commercial substance, and probable collectability.',
                'Combine two or more contracts entered at or near the same time with the same customer if negotiated as a single commercial package.',
              ],
              standardNote: 'Ind AS 115, Para 9 & Para 17',
            },
            {
              heading: 'Variable Consideration & Constraint (Paras 50–59)',
              points: [
                'Estimate using Expected Value (large population of similar contracts) or Most Likely Amount (binary outcome such as performance bonus).',
                'Include in transaction price only to the extent it is highly probable that a significant reversal in cumulative revenue will not occur.',
              ],
              standardNote: 'Ind AS 115, Para 56 (High-yield exam adjustment)',
            },
          ],
        },
      },
      {
        id: 'fr-ch1-slide',
        title: 'Five-Step Revenue Model Revision Slides',
        rawFileName: 'Five-Step Revenue Model Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Ind AS 115'],
        folderBreadcrumb: ['3. Revisions', 'Revenue from Contracts with Customers'],
        sizeBytes: 3_240_000,
        modifiedTime: '2026-10-21T14:30:00Z',
        demoContent: {
          summary:
            'Rapid 15-minute pre-exam slide deck distilling Principal vs Agent indicators, Significant Financing Component, and Contract Modifications.',
          keyFormulaOrProvision:
            'Modification = Separate Contract ONLY when Distinct Goods + Standalone Selling Price',
          sections: [
            {
              heading: 'Slide 1 — Contract Modification Decision Matrix',
              points: [
                'Distinct + SSP -> Separate contract prospectively.',
                'Distinct + Non-SSP -> Termination of old contract & creation of new contract (prospective reallocation).',
                'Not Distinct -> Cumulative catch-up adjustment on modification date.',
              ],
            },
          ],
        },
      },
      {
        id: 'fr-ch1-chart',
        title: 'Ind AS 115 Five-Step Decision Infographic',
        rawFileName: 'Ind AS 115 Five-Step Decision Infographic.png',
        category: 'infographic',
        mimeType: 'image/png',
        standards: ['Ind AS 115'],
        folderBreadcrumb: ['3. Revisions', 'Revenue from Contracts with Customers'],
        sizeBytes: 1_920_000,
        modifiedTime: '2026-10-22T11:00:00Z',
        demoContent: {
          summary:
            'Single-glance visual map of the Five-Step Revenue Model with critical exam checkpoints for variable consideration, warranties, and contract costs.',
          svgDiagramId: 'indas115_five_step',
        },
      },
    ], { chapterKey: 'std-ind-as-115' }),

    buildChapter('fr', null, 'Ind AS 116 — Leases', ['Ind AS 116'], [
      {
        id: 'fr-ch2-mod',
        title: 'Ind AS 116 Lessee & Lessor Accounting Module',
        rawFileName: 'Ind AS 116 Leases.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 116'],
        folderBreadcrumb: ['1. Modules'],
        sizeBytes: 2_350_000,
        modifiedTime: '2026-10-19T10:00:00Z',
        demoContent: {
          summary:
            'Comprehensive module covering lease identification, ROU Asset initial measurement, Lease Liability remeasurement, and Sale & Leaseback transactions.',
          keyFormulaOrProvision:
            'ROU Asset = Initial Lease Liability + Prepaid Payments + Initial Direct Costs + Dismantling PV - Lease Incentives',
          sections: [
            {
              heading: 'Exemptions Available to Lessees (Para 5)',
              points: [
                'Short-term leases (12 months or less with no purchase option) — applied class-by-class.',
                'Low-value underlying assets (assessed when new, irrespective of materiality to lessee) — applied lease-by-lease.',
              ],
            },
          ],
        },
      },
      {
        id: 'fr-ch2-slide',
        title: 'Lease Remeasurement & Modification Revision Slides',
        rawFileName: 'Lease Remeasurement & Modification Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Ind AS 116'],
        folderBreadcrumb: ['3. Revisions', 'Leases'],
        sizeBytes: 2_180_000,
        modifiedTime: '2026-10-24T08:40:00Z',
        demoContent: {
          summary:
            'Discount rate decision table for lease remeasurement (Original IBR vs Revised IBR) and partial scope-reduction gain/loss calculation.',
          keyFormulaOrProvision:
            'Use Revised Discount Rate for: Change in Lease Term, Purchase Option, or Floating Rate Reset',
        },
      },
    ], { chapterKey: 'std-ind-as-116' }),

    buildChapter(
      'fr',
      null,
      'ICAI Suggested Answers',
      [],
      [
        {
          id: 'fr-sa-jan26',
          title: 'Jan 2026 Suggested Answers',
          rawFileName: 'Jan 2026 Suggested Answers.pdf',
          category: 'suggested_answers',
          mimeType: 'application/pdf',
          standards: [],
          folderBreadcrumb: ['2. ICAI Suggested Answers'],
          sizeBytes: 1_640_000,
          modifiedTime: '2026-03-10T09:00:00Z',
          demoContent: {
            summary:
              'Official ICAI CA Final Paper 1 Financial Reporting examination questions with detailed step-by-step suggested answers and working notes.',
          },
        },
      ],
      { chapterKey: 'section-suggested-answers', sectionKind: 'suggested_answers' },
    ),

    buildChapter(
      'fr',
      null,
      'Practice Questions & Tests',
      ['Ind AS 115', 'Ind AS 116'],
      [
        {
          id: 'fr-pq-1',
          title: 'CA Final FR Practice Test — Revenue & Leases',
          rawFileName: 'CA Final FR Practice Test.pdf',
          category: 'practice_qa',
          mimeType: 'application/pdf',
          standards: ['Ind AS 115', 'Ind AS 116'],
          folderBreadcrumb: ['4. Practice Questions', '04-10-2026'],
          subTopic: '04-10-2026',
          sizeBytes: 980_000,
          modifiedTime: '2026-10-04T09:00:00Z',
          demoContent: {
            summary:
              'Timed case-study practice test covering Ind AS 115 contract modifications and Ind AS 116 sale-and-leaseback adjustments.',
          },
        },
      ],
      { chapterKey: 'section-practice-questions', sectionKind: 'practice_questions' },
    ),
  ];

  // 2. Advanced Financial Management
  const afmChapters: ChapterGroup[] = [
    buildChapter('afm', 1, 'Derivatives Analysis & Valuation', ['Black-Scholes', 'Binomial Model'], [
      {
        id: 'afm-ch1-mod',
        title: 'Futures, Options & Greeks Comprehensive Module',
        rawFileName: 'Chapter 1 Derivatives Analysis and Valuation.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Black-Scholes', 'Binomial Model'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 2_600_000,
        modifiedTime: '2026-10-20T10:30:00Z',
        demoContent: {
          summary:
            'Fair value of futures, index arbitrage, portfolio beta adjustment using index futures, Put-Call Parity, Binomial trees, and Black-Scholes-Merton valuation.',
          keyFormulaOrProvision:
            'Put-Call Parity: C + PV(X) = P + S0   |   Futures Contracts = [V_p * (Beta_target - Beta_current)] / (F * Lot Size)',
        },
      },
      {
        id: 'afm-ch1-chart',
        title: 'Option Payoff & Hedged Portfolio Infographic',
        rawFileName: 'Option Payoff & Hedged Portfolio Infographic.jpg',
        category: 'infographic',
        mimeType: 'image/jpeg',
        standards: ['Black-Scholes'],
        folderBreadcrumb: ['Revisions', 'Derivatives'],
        sizeBytes: 1_940_000,
        modifiedTime: '2026-10-23T15:10:00Z',
        demoContent: {
          summary:
            'Visual payoff diagram comparing Long Call Option payoff, Short Underlying Hedge position, breakeven point, and net hedged portfolio risk curve.',
          imageUrl: afmDiagramUrl,
        },
      },
      {
        id: 'afm-ch1-slide',
        title: 'Interest Rate Swaps & FRAs Revision Slides',
        rawFileName: 'Interest Rate Swaps & FRAs Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Black-Scholes'],
        folderBreadcrumb: ['Revisions', 'Derivatives'],
        sizeBytes: 2_310_000,
        modifiedTime: '2026-10-24T13:00:00Z',
        demoContent: {
          summary:
            'Comparative advantage swap structuring, swap bank spread allocation, and Forward Rate Agreement (FRA) settlement discounting formula.',
          keyFormulaOrProvision:
            'FRA Settlement = [Notional * (R_ref - R_fra) * (d / 360)] / [1 + R_ref * (d / 360)]',
        },
      },
    ]),
    buildChapter('afm', 2, 'Foreign Exchange Exposure & Risk Management', ['IRP', 'PPP'], [
      {
        id: 'afm-ch2-mod',
        title: 'Forex Quotations, Money Market Hedge & Cancellation Module',
        rawFileName: 'Chapter 2 Foreign Exchange Exposure and Risk Management.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['IRP', 'PPP'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 2_410_000,
        modifiedTime: '2026-10-25T11:20:00Z',
        demoContent: {
          summary:
            'Bid-Ask rule ("Bank buys low, sells high"), Forward contract early delivery/extension/cancellation, Leading & Lagging, and Money Market Hedge steps.',
          keyFormulaOrProvision:
            'Interest Rate Parity: (1 + r_home) / (1 + r_foreign) = Forward Rate / Spot Rate',
        },
      },
      {
        id: 'afm-ch2-slide',
        title: 'Forward Contract Cancellation & Rollover Slides',
        rawFileName: 'Forward Contract Cancellation & Rollover Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['IRP'],
        folderBreadcrumb: ['Revisions', 'Forex Risk'],
        sizeBytes: 1_620_000,
        modifiedTime: '2026-10-27T09:15:00Z',
        demoContent: {
          summary:
            'Step-by-step FEDAI rules for cancellation on due date, before due date, and automatic cancellation after due date including swap loss & outlay interest.',
        },
      },
    ]),
  ];

  // 3. Advanced Audit
  const auditChapters: ChapterGroup[] = [
    buildChapter('audit', 1, 'Quality Control', ['SQC 1', 'SA 220'], [
      {
        id: 'aud-ch1-mod',
        title: 'Chapter 1 Quality Control',
        rawFileName: 'Chapter 1 Quality Control.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SQC 1', 'SA 220'],
        folderBreadcrumb: ['0. Modules'],
        sizeBytes: 1_470_000,
        modifiedTime: '2026-10-16T11:00:00Z',
        demoContent: {
          summary:
            'Firm-level vs engagement-level quality control elements, Engagement Quality Control Review (EQCR) mandatory triggers, and audit file assembly timelines.',
          keyFormulaOrProvision:
            'Audit File Assembly: <= 60 days from Auditor Report date   |   Retention under SQC 1: Minimum 7 years',
        },
      },
      {
        id: 'aud-ch1-slide',
        title: 'SQC 1 vs SA 220 Comparative Revision Slides',
        rawFileName: 'SQC 1 vs SA 220 Comparative Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['SQC 1', 'SA 220'],
        folderBreadcrumb: ['Chapter 1. Quality Control'],
        sizeBytes: 2_420_000,
        modifiedTime: '2026-10-18T16:20:00Z',
        demoContent: {
          summary:
            'Side-by-side comparison of SQC 1 (all assurance & related services engagements at firm level) vs SA 220 (audit of historical financial information).',
        },
      },
    ]),
    buildChapter('audit', 4, 'Materiality, Risk Assessment and Internal Controls', ['SA 315', 'SA 330', 'SA 320'], [
      {
        id: 'aud-ch4-mod',
        title: 'Chapter 4 Materiality, Risk Assessment and Internal Controls',
        rawFileName: 'Chapter 4 Materiality Risk Assessment and Internal Controls.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SA 315', 'SA 330', 'SA 320'],
        folderBreadcrumb: ['0. Modules'],
        sizeBytes: 1_920_000,
        modifiedTime: '2026-10-21T09:40:00Z',
        demoContent: {
          summary:
            'Identifying and assessing ROMM through understanding the entity & internal control components, significant risks, and designing responsive audit procedures.',
          keyFormulaOrProvision:
            'Audit Risk = Inherent Risk × Control Risk × Detection Risk   (RMM = IR × CR)',
        },
      },
      {
        id: 'aud-ch4-chart',
        title: 'SA 315 Assurance & Risk Pillars Infographic',
        rawFileName: 'SA 315 Assurance & Risk Pillars Infographic.jpg',
        category: 'infographic',
        mimeType: 'image/jpeg',
        standards: ['SA 315', 'SA 330'],
        folderBreadcrumb: [
          'Chapter 4 Materiality Risk Assessment and Internal Controls',
          'Risk Assessment and Risk Based Audit',
        ],
        subTopic: 'Risk Assessment and Risk Based Audit',
        sizeBytes: 2_110_000,
        modifiedTime: '2026-10-22T15:00:00Z',
        demoContent: {
          summary:
            'Architectural diagram mapping the concentric layers of Entity Environment, Internal Control Pillars, and Responsive Substantive Testing under SA 315 & SA 330.',
          imageUrl: auditDiagramUrl,
        },
      },
    ]),
    buildChapter('audit', 7, 'Reporting & CARO 2020', ['SA 700', 'SA 701', 'SA 705', 'CARO 2020'], [
      {
        id: 'aud-ch7-mod',
        title: 'SA 700–706 Reporting & CARO 2020 Clauses',
        rawFileName: 'Chapter 7 Reporting.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SA 700', 'SA 701', 'SA 705', 'CARO 2020'],
        folderBreadcrumb: ['0. Modules'],
        sizeBytes: 2_560_000,
        modifiedTime: '2026-10-28T13:30:00Z',
        demoContent: {
          summary:
            'Modified opinion decision matrix (Qualified, Adverse, Disclaimer), Key Audit Matters under SA 701, Emphasis of Matter vs Other Matter (SA 706), and all 21 CARO 2020 clauses.',
          keyFormulaOrProvision:
            'Material + Not Pervasive -> Qualified   |   Material + Pervasive -> Adverse (Misstatement) / Disclaimer (Scope Limitation)',
        },
      },
      {
        id: 'aud-ch7-slide',
        title: 'CARO 2020 Clause-by-Clause Memory Slides',
        rawFileName: 'CARO 2020 Clause-by-Clause Memory Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['CARO 2020'],
        folderBreadcrumb: ['Chapter 7 Reporting', 'Notes'],
        subTopic: 'Notes',
        sizeBytes: 1_820_000,
        modifiedTime: '2026-11-02T11:10:00Z',
        demoContent: {
          summary:
            'High-retention clause index covering PPE & Intangibles (i), Inventory & Working Capital > Rs. 5 Cr (ii), Loans/Guarantees (iii), Fraud Reporting (xi), and Resignation of Statutory Auditor (xviii).',
        },
      },
    ]),
  ];

  // 4. Direct Taxes
  const dtChapters: ChapterGroup[] = [
    buildChapter('dt', 5, 'Income from Other Sources', ['Sec 56(2)(x)'], [
      {
        id: 'dt-ch5-mod',
        title: 'Chapter 5 Income from Other Sources',
        rawFileName: 'Chapter 5 Income from Other Sources.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Sec 56(2)(x)'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 1_840_000,
        modifiedTime: '2026-10-15T10:00:00Z',
        demoContent: {
          summary:
            'Taxability of gifts under Section 56(2)(x), deemed dividend under Section 2(22)(e), and allowable deductions under Section 57.',
        },
      },
      {
        id: 'dt-ch5-slide',
        title: 'Other Sources Quick Revision Slides',
        rawFileName: 'Other Sources Quick Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Sec 56(2)(x)'],
        folderBreadcrumb: ['Revisions', 'Other Sources'],
        sizeBytes: 1_120_000,
        modifiedTime: '2026-10-20T12:00:00Z',
        demoContent: {
          summary:
            'Gift threshold summary (Rs. 50,000 aggregate vs per-property stamp duty value rules) and exempted relatives list.',
        },
      },
    ]),
  ];

  // 5. Indirect Taxes (Part A GST + Part B Customs cleanly separated)
  const idtChapters: ChapterGroup[] = [
    buildChapter(
      'idt',
      1,
      'Supply Under GST',
      ['Sec 7', 'Sec 8', 'Schedule I'],
      [
        {
          id: 'idt-ch1-mod',
          title: 'Chapter 1 Supply Under GST',
          rawFileName: 'Chapter 1 Supply Under GST.pdf',
          category: 'module',
          mimeType: 'application/pdf',
          standards: ['Sec 7', 'Sec 8', 'Schedule I'],
          folderBreadcrumb: ['0. Modules Part A'],
          sizeBytes: 1_930_000,
          modifiedTime: '2026-11-04T09:00:00Z',
          demoContent: {
            summary:
              'Scope of Supply under Section 7(1), activities without consideration under Schedule I, Composite vs Mixed Supply taxability under Section 8.',
            keyFormulaOrProvision:
              'Composite Supply (Sec 8(a)) -> Rate of Principal Supply   |   Mixed Supply (Sec 8(b)) -> Highest Rate of Tax',
          },
        },
      ],
      { chapterKey: 'part-a-ch-1', partLabel: 'Part A · GST' },
    ),
    buildChapter(
      'idt',
      1,
      'Levy of and Exemptions from Customs Duty',
      ['Sec 12'],
      [
        {
          id: 'idt-b-ch1-mod',
          title: 'Chapter 1 Levy of and Exemptions from Customs Duty',
          rawFileName: 'Chapter 1 Levy of and Exemptions from Customs Duty.pdf',
          category: 'module',
          mimeType: 'application/pdf',
          standards: ['Sec 12'],
          folderBreadcrumb: ['0. Modules Part B'],
          sizeBytes: 1_450_000,
          modifiedTime: '2026-11-05T09:00:00Z',
          demoContent: {
            summary:
              'Charging section under Customs Act, territorial waters vs Indian Customs Waters, pilfered goods (Sec 13), and remission (Sec 23).',
          },
        },
      ],
      { chapterKey: 'part-b-ch-1', partLabel: 'Part B · Customs' },
    ),
  ];

  return [
    {
      meta: SUBJECT_MAP.fr,
      folderId: null,
      chapters: frChapters,
      quizFiles: [],
      totalArtifacts: frChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'complete',
      source: 'demo',
      lastSyncedAt: null,
    },
    {
      meta: SUBJECT_MAP.afm,
      folderId: null,
      chapters: afmChapters,
      quizFiles: [],
      totalArtifacts: afmChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'complete',
      source: 'demo',
      lastSyncedAt: null,
    },
    {
      meta: SUBJECT_MAP.audit,
      folderId: null,
      chapters: auditChapters,
      quizFiles: [],
      totalArtifacts: auditChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'complete',
      source: 'demo',
      lastSyncedAt: null,
    },
    {
      meta: SUBJECT_MAP.dt,
      folderId: null,
      chapters: dtChapters,
      quizFiles: [],
      totalArtifacts: dtChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'in_progress',
      source: 'demo',
      lastSyncedAt: null,
    },
    {
      meta: SUBJECT_MAP.idt,
      folderId: null,
      chapters: idtChapters,
      quizFiles: [],
      totalArtifacts: idtChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'complete',
      source: 'demo',
      lastSyncedAt: null,
    },
  ];
}
