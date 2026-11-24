import { SUBJECT_MAP } from '../config/driveConfig';
import type { ChapterGroup, RevisionArtifact, SubjectArchive } from '../types/archive';
import auditDiagramUrl from '../assets/images/infographic_audit_risk_preview_1795518302438.jpg';
import afmDiagramUrl from '../assets/images/infographic_afm_forex_preview_1795518304537.jpg';

function buildChapter(
  subjectId: ChapterGroup['subjectId'],
  chapterNumber: number,
  title: string,
  standards: string[],
  artifacts: Omit<RevisionArtifact, 'subjectId' | 'chapterKey' | 'chapterNumber' | 'chapterTitle' | 'source' | 'drivePreviewUrl'>[],
): ChapterGroup {
  const chapterKey = `ch-${chapterNumber}`;
  const fullArtifacts: RevisionArtifact[] = artifacts.map((item) => ({
    ...item,
    subjectId,
    chapterKey,
    chapterNumber,
    chapterTitle: title,
    source: 'demo',
    drivePreviewUrl: null,
  }));

  return {
    chapterKey,
    chapterNumber,
    title,
    subjectId,
    standards,
    modules: fullArtifacts.filter((a) => a.category === 'module'),
    revisionVisuals: fullArtifacts.filter(
      (a) => a.category === 'slides' || a.category === 'infographic',
    ),
    otherFiles: fullArtifacts.filter(
      (a) => a.category !== 'module' && a.category !== 'slides' && a.category !== 'infographic',
    ),
    allArtifacts: fullArtifacts,
  };
}

/**
 * Deterministic CA Final seed catalog reflecting the user's exact status:
 * - 3 completed subjects in ample quantity: Financial Reporting, Advanced Audit, Advanced Financial Management
 * - 1 partially populated subject: Indirect Taxes
 * - 1 ready/empty subject folder: Direct Taxes (demonstrates zero-breakage empty folder handling)
 */
export function buildDemoArchives(): SubjectArchive[] {
  // 1. Financial Reporting (Completed — ample chapters)
  const frChapters: ChapterGroup[] = [
    buildChapter('fr', 1, 'Revenue from Contracts with Customers', ['Ind AS 115'], [
      {
        id: 'fr-ch1-mod',
        title: 'Ind AS 115 Comprehensive Study Module',
        rawFileName: 'Ch 01 - Ind AS 115 Comprehensive Study Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 115'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 18_420_000,
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
            {
              heading: 'Over-Time vs Point-in-Time Recognition (Paras 35–38)',
              points: [
                'Recognize over time if customer simultaneously receives & consumes benefits, entity creates/enhances customer-controlled asset, OR asset has no alternative use with enforceable right to payment.',
              ],
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
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 1 - Ind AS 115'],
        sizeBytes: 6_240_000,
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
            {
              heading: 'Slide 2 — Principal vs Agent Control Indicators',
              points: [
                'Primary responsibility for fulfilling the promise to provide the specified good or service.',
                'Inventory risk before transfer or upon customer return.',
                'Discretion in establishing prices for the specified good or service.',
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
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 1 - Ind AS 115'],
        sizeBytes: 4_120_000,
        modifiedTime: '2026-10-22T11:00:00Z',
        demoContent: {
          summary:
            'Single-glance visual map of the Five-Step Revenue Model with critical exam checkpoints for variable consideration, warranties, and contract costs.',
          svgDiagramId: 'indas115_five_step',
        },
      },
    ]),
    buildChapter('fr', 2, 'Leases & Right-of-Use Accounting', ['Ind AS 116'], [
      {
        id: 'fr-ch2-mod',
        title: 'Ind AS 116 Lessee & Lessor Accounting Module',
        rawFileName: 'Ch 02 - Ind AS 116 Lessee & Lessor Accounting Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 116'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 22_850_000,
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
            {
              heading: 'Sale and Leaseback Accounting (Paras 98–103)',
              points: [
                'If transfer satisfies Ind AS 115 sale criteria: seller-lessee measures ROU at proportion of previous carrying amount retained and recognizes gain/loss only on rights transferred.',
                'If transfer is NOT a sale: continue recognizing transferred asset and recognize financial liability under Ind AS 109.',
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
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 2 - Ind AS 116'],
        sizeBytes: 5_180_000,
        modifiedTime: '2026-10-24T08:40:00Z',
        demoContent: {
          summary:
            'Discount rate decision table for lease remeasurement (Original IBR vs Revised IBR) and partial scope-reduction gain/loss calculation.',
          keyFormulaOrProvision:
            'Use Revised Discount Rate for: Change in Lease Term, Purchase Option, or Floating Rate Reset',
          sections: [
            {
              heading: 'Discount Rate Quick Check',
              points: [
                'Unchanged Discount Rate: Change in residual value guarantee or index/rate-linked lease payments (CPI).',
                'Revised Discount Rate: Change in lease term, reassessment of purchase option, or change in floating interest rate.',
              ],
            },
          ],
        },
      },
    ]),
    buildChapter('fr', 3, 'Business Combinations & Consolidation', ['Ind AS 103', 'Ind AS 110'], [
      {
        id: 'fr-ch3-mod',
        title: 'Ind AS 103 Acquisition Method & Goodwill Module',
        rawFileName: 'Ch 03 - Ind AS 103 Acquisition Method & Goodwill Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 103', 'Ind AS 110'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 31_400_000,
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
        id: 'fr-ch3-chart',
        title: 'Ind AS 103 Goodwill vs Capital Reserve Flow Chart',
        rawFileName: 'Ind AS 103 Goodwill vs Capital Reserve Flow Chart.png',
        category: 'infographic',
        mimeType: 'image/png',
        standards: ['Ind AS 103'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 3 - Business Combinations'],
        sizeBytes: 3_890_000,
        modifiedTime: '2026-10-26T12:20:00Z',
        demoContent: {
          summary:
            'Visual comparison of NCI valuation choices, bargain purchase gain routing through OCI to Capital Reserve, and acquisition-related cost expensing.',
          keyFormulaOrProvision:
            'Acquisition-related transaction costs -> Expensed immediately to P&L (except debt/equity issue costs under Ind AS 32/109).',
        },
      },
    ]),
    buildChapter('fr', 4, 'Financial Instruments & Hedge Accounting', ['Ind AS 109', 'Ind AS 32'], [
      {
        id: 'fr-ch4-mod',
        title: 'Ind AS 109 Classification, ECL & Compound Instruments Module',
        rawFileName: 'Ch 04 - Ind AS 109 Classification, ECL & Compound Instruments Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Ind AS 109', 'Ind AS 32'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 27_900_000,
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
        id: 'fr-ch4-slide',
        title: 'Ind AS 109 SPPI & Reclassification Revision Slides',
        rawFileName: 'Ind AS 109 SPPI & Reclassification Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Ind AS 109'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 4 - Financial Instruments'],
        sizeBytes: 4_760_000,
        modifiedTime: '2026-10-29T18:05:00Z',
        demoContent: {
          summary:
            'Quick-revision slides covering financial asset reclassification rules (prospective from first day of next reporting period) and 10% debt modification test.',
          keyFormulaOrProvision:
            '10% Debt Modification Test: PV of new cash flows discounted at ORIGINAL EIR differs by >= 10% -> Extinguishment.',
        },
      },
    ]),
  ];

  // 2. Advanced Financial Management (Completed — ample chapters)
  const afmChapters: ChapterGroup[] = [
    buildChapter('afm', 1, 'Derivatives Analysis & Valuation', ['Black-Scholes', 'Binomial Model'], [
      {
        id: 'afm-ch1-mod',
        title: 'Futures, Options & Greeks Comprehensive Module',
        rawFileName: 'Ch 01 - Futures, Options & Greeks Comprehensive Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Black-Scholes', 'Binomial Model'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 19_600_000,
        modifiedTime: '2026-10-20T10:30:00Z',
        demoContent: {
          summary:
            'Fair value of futures, index arbitrage, portfolio beta adjustment using index futures, Put-Call Parity, Binomial trees, and Black-Scholes-Merton valuation.',
          keyFormulaOrProvision:
            'Put-Call Parity: C + PV(X) = P + S0   |   Futures Contracts = [V_p * (Beta_target - Beta_current)] / (F * Lot Size)',
          sections: [
            {
              heading: 'Cost of Carry Model for Futures Pricing',
              points: [
                'Discrete compounding: F = S0 * (1 + r)^t - FV(Dividend).',
                'Continuous compounding with dividend yield y: F = S0 * e^((r - y) * t).',
              ],
            },
            {
              heading: 'Option Greeks Summary for Risk Management',
              points: [
                'Delta: Sensitivity of option price to underlying spot change (hedge ratio).',
                'Gamma: Rate of change of Delta with respect to underlying price.',
                'Vega: Sensitivity to implied volatility; Theta: Time decay.',
              ],
            },
          ],
        },
      },
      {
        id: 'afm-ch1-chart',
        title: 'Option Payoff & Hedged Portfolio Infographic',
        rawFileName: 'Option Payoff & Hedged Portfolio Infographic.jpg',
        category: 'infographic',
        mimeType: 'image/jpeg',
        standards: ['Black-Scholes'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 1 - Derivatives'],
        sizeBytes: 2_940_000,
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
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 1 - Derivatives'],
        sizeBytes: 4_310_000,
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
        rawFileName: 'Ch 02 - Forex Quotations, Money Market Hedge & Cancellation Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['IRP', 'PPP'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 24_100_000,
        modifiedTime: '2026-10-25T11:20:00Z',
        demoContent: {
          summary:
            'Bid-Ask rule ("Bank buys low, sells high"), Forward contract early delivery/extension/cancellation, Leading & Lagging, and Money Market Hedge steps.',
          keyFormulaOrProvision:
            'Interest Rate Parity: (1 + r_home) / (1 + r_foreign) = Forward Rate / Spot Rate',
          sections: [
            {
              heading: 'Money Market Hedge — Exporter (Foreign Receivable)',
              points: [
                'Step 1: Borrow PV of foreign receivable in foreign currency.',
                'Step 2: Convert borrowed foreign currency to home currency at Spot Bid rate.',
                'Step 3: Invest home currency locally until maturity; settle foreign loan from export proceeds.',
              ],
            },
          ],
        },
      },
      {
        id: 'afm-ch2-slide',
        title: 'Forward Contract Cancellation & Rollover Slides',
        rawFileName: 'Forward Contract Cancellation & Rollover Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['IRP'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 2 - Forex Risk'],
        sizeBytes: 3_620_000,
        modifiedTime: '2026-10-27T09:15:00Z',
        demoContent: {
          summary:
            'Step-by-step FEDAI rules for cancellation on due date, before due date, and automatic cancellation after due date including swap loss & outlay interest.',
        },
      },
    ]),
    buildChapter('afm', 3, 'Mergers, Acquisitions & Corporate Restructuring', ['EPS Accretion', 'Exchange Ratio'], [
      {
        id: 'afm-ch3-mod',
        title: 'Merger Valuation, Swap Ratio & Synergy Sharing Module',
        rawFileName: 'Ch 03 - Merger Valuation, Swap Ratio & Synergy Sharing Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['EPS Accretion', 'Exchange Ratio'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 16_900_000,
        modifiedTime: '2026-10-30T14:45:00Z',
        demoContent: {
          summary:
            'Maximum & Minimum exchange ratio bounds, Post-merger EPS & MPS calculation, Free Cash Flow to Firm (FCFF), and True Cost of Merger.',
          keyFormulaOrProvision:
            'True Cost of Merger (Stock Deal) = (Alpha * V_combined) - V_target   |   NPV_acquirer = Synergy - True Cost',
        },
      },
      {
        id: 'afm-ch3-slide',
        title: 'Swap Ratio Negotiation Bounds Revision Slides',
        rawFileName: 'Swap Ratio Negotiation Bounds Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['Exchange Ratio'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 3 - Mergers & Acquisitions'],
        sizeBytes: 3_150_000,
        modifiedTime: '2026-11-01T10:15:00Z',
        demoContent: {
          summary:
            'Rapid checklist for computing maximum exchange ratio acceptable to Acquirer shareholders and minimum ratio acceptable to Target shareholders.',
        },
      },
    ]),
  ];

  // 3. Advanced Audit (Completed — ample chapters)
  const auditChapters: ChapterGroup[] = [
    buildChapter('audit', 1, 'Quality Control & Engagement Standards', ['SQC 1', 'SA 220'], [
      {
        id: 'aud-ch1-mod',
        title: 'SQC 1 & SA 220 Quality Control Framework Module',
        rawFileName: 'Ch 01 - SQC 1 & SA 220 Quality Control Framework Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SQC 1', 'SA 220'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 14_700_000,
        modifiedTime: '2026-10-16T11:00:00Z',
        demoContent: {
          summary:
            'Firm-level vs engagement-level quality control elements, Engagement Quality Control Review (EQCR) mandatory triggers, and audit file assembly timelines.',
          keyFormulaOrProvision:
            'Audit File Assembly: <= 60 days from Auditor Report date   |   Retention under SQC 1: Minimum 7 years',
          sections: [
            {
              heading: 'Six Elements of Quality Control (SQC 1)',
              points: [
                'Leadership responsibilities for quality within the firm.',
                'Ethical requirements (Independence confirmation annually in writing).',
                'Acceptance and continuance of client relationships and specific engagements.',
                'Human resources, Engagement performance (including EQCR), and Monitoring.',
              ],
            },
          ],
        },
      },
      {
        id: 'aud-ch1-slide',
        title: 'SQC 1 vs SA 220 Comparative Revision Slides',
        rawFileName: 'SQC 1 vs SA 220 Comparative Revision Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['SQC 1', 'SA 220'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 1 - Quality Control'],
        sizeBytes: 3_420_000,
        modifiedTime: '2026-10-18T16:20:00Z',
        demoContent: {
          summary:
            'Side-by-side comparison of SQC 1 (all assurance & related services engagements at firm level) vs SA 220 (audit of historical financial information).',
        },
      },
    ]),
    buildChapter('audit', 2, 'Risk Assessment & Internal Control', ['SA 315', 'SA 330', 'SA 320'], [
      {
        id: 'aud-ch2-mod',
        title: 'SA 315 & SA 330 Risk of Material Misstatement Module',
        rawFileName: 'Ch 02 - SA 315 & SA 330 Risk of Material Misstatement Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SA 315', 'SA 330', 'SA 320'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 19_200_000,
        modifiedTime: '2026-10-21T09:40:00Z',
        demoContent: {
          summary:
            'Identifying and assessing ROMM through understanding the entity & internal control components, significant risks, and designing responsive audit procedures.',
          keyFormulaOrProvision:
            'Audit Risk = Inherent Risk × Control Risk × Detection Risk   (RMM = IR × CR)',
          sections: [
            {
              heading: 'Five Components of Internal Control (SA 315)',
              points: [
                'Control Environment, Entity Risk Assessment Process, Information System & Communication, Control Activities, and Monitoring of Controls.',
              ],
            },
            {
              heading: 'Mandatory Tests of Controls (SA 330 Para 8)',
              points: [
                'When auditor expects controls to operate effectively in determining Nature, Timing, and Extent of substantive procedures.',
                'When substantive procedures alone cannot provide sufficient appropriate audit evidence (highly automated IT processing).',
              ],
            },
          ],
        },
      },
      {
        id: 'aud-ch2-chart',
        title: 'SA 315 Assurance & Risk Pillars Infographic',
        rawFileName: 'SA 315 Assurance & Risk Pillars Infographic.jpg',
        category: 'infographic',
        mimeType: 'image/jpeg',
        standards: ['SA 315', 'SA 330'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 2 - Risk Assessment'],
        sizeBytes: 3_110_000,
        modifiedTime: '2026-10-22T15:00:00Z',
        demoContent: {
          summary:
            'Architectural diagram mapping the concentric layers of Entity Environment, Internal Control Pillars, and Responsive Substantive Testing under SA 315 & SA 330.',
          imageUrl: auditDiagramUrl,
        },
      },
    ]),
    buildChapter('audit', 3, 'Audit Reporting, KAM & CARO 2020', ['SA 700', 'SA 701', 'SA 705', 'CARO 2020'], [
      {
        id: 'aud-ch3-mod',
        title: 'SA 700–706 Reporting & CARO 2020 Clauses Module',
        rawFileName: 'Ch 03 - SA 700-706 Reporting & CARO 2020 Clauses Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['SA 700', 'SA 701', 'SA 705', 'CARO 2020'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 25_600_000,
        modifiedTime: '2026-10-28T13:30:00Z',
        demoContent: {
          summary:
            'Modified opinion decision matrix (Qualified, Adverse, Disclaimer), Key Audit Matters under SA 701, Emphasis of Matter vs Other Matter (SA 706), and all 21 CARO 2020 clauses.',
          keyFormulaOrProvision:
            'Material + Not Pervasive -> Qualified   |   Material + Pervasive -> Adverse (Misstatement) / Disclaimer (Scope Limitation)',
        },
      },
      {
        id: 'aud-ch3-slide',
        title: 'CARO 2020 Clause-by-Clause Memory Slides',
        rawFileName: 'CARO 2020 Clause-by-Clause Memory Slides.pdf',
        category: 'slides',
        mimeType: 'application/pdf',
        standards: ['CARO 2020'],
        folderBreadcrumb: ['Revision Slides & Infographics', 'Chapter 3 - Audit Reporting'],
        sizeBytes: 4_820_000,
        modifiedTime: '2026-11-02T11:10:00Z',
        demoContent: {
          summary:
            'High-retention clause index covering PPE & Intangibles (i), Inventory & Working Capital > Rs. 5 Cr (ii), Loans/Guarantees (iii), Fraud Reporting (xi), and Resignation of Statutory Auditor (xviii).',
        },
      },
    ]),
  ];

  // 4. Indirect Taxes (In Progress — starter chapter)
  const idtChapters: ChapterGroup[] = [
    buildChapter('idt', 1, 'Supply under GST & Charge of Tax', ['Sec 7', 'Sec 8', 'Schedule I'], [
      {
        id: 'idt-ch1-mod',
        title: 'Section 7 Supply & Schedules I–III Starter Module',
        rawFileName: 'Ch 01 - Section 7 Supply & Schedules I-III Starter Module.pdf',
        category: 'module',
        mimeType: 'application/pdf',
        standards: ['Sec 7', 'Sec 8', 'Schedule I'],
        folderBreadcrumb: ['Modules'],
        sizeBytes: 11_300_000,
        modifiedTime: '2026-11-04T09:00:00Z',
        demoContent: {
          summary:
            'Scope of Supply under Section 7(1), activities without consideration under Schedule I, Composite vs Mixed Supply taxability under Section 8.',
          keyFormulaOrProvision:
            'Composite Supply (Sec 8(a)) -> Rate of Principal Supply   |   Mixed Supply (Sec 8(b)) -> Highest Rate of Tax',
        },
      },
    ]),
  ];

  // 5. Direct Taxes (Folder Created — Ready for uploads; tests empty folder resilience)
  const dtChapters: ChapterGroup[] = [];

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
      totalArtifacts: 0,
      readiness: 'upcoming',
      source: 'demo',
      lastSyncedAt: null,
    },
    {
      meta: SUBJECT_MAP.idt,
      folderId: null,
      chapters: idtChapters,
      quizFiles: [],
      totalArtifacts: idtChapters.reduce((s, c) => s + c.allArtifacts.length, 0),
      readiness: 'in_progress',
      source: 'demo',
      lastSyncedAt: null,
    },
  ];
}
