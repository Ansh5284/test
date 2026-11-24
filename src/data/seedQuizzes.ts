import type { McqQuiz } from '../types/archive';

export const SEED_QUIZZES: McqQuiz[] = [
  {
    quizId: 'fr-daily-sample-100',
    title: 'Financial Reporting — Ind AS 115, 116 & 103 Conceptual Diagnostic',
    subjectId: 'fr',
    subjectName: 'Financial Reporting',
    publishedDate: '2026-11-24',
    frequency: 'daily',
    totalMarks: 100,
    durationMinutes: 45,
    sourceLabel: 'JSON Schema Preview (100-Mark Scale)',
    questions: [
      {
        id: 'fr-q1',
        marks: 20,
        chapter: 'Chapter 1: Revenue from Contracts with Customers',
        standardRef: 'Ind AS 115, Para 56',
        question:
          'A construction entity enters a fixed-price contract of Rs. 50 crore with an early-completion bonus of Rs. 5 crore if finished within 18 months. Due to monsoon uncertainty and pending municipal clearances, management estimates only a 55% probability of achieving the deadline. How should the bonus be treated at contract inception?',
        options: [
          'Include Rs. 2.75 crore using the Expected Value method immediately',
          'Include the full Rs. 5 crore because probability exceeds 50%',
          'Exclude the Rs. 5 crore bonus until it becomes highly probable that no significant revenue reversal will occur',
          'Recognize Rs. 5 crore in Other Comprehensive Income until completion',
        ],
        correctOptionIndex: 2,
        explanation:
          'Under Ind AS 115 Para 56, variable consideration is included in the transaction price ONLY to the extent that it is highly probable that a significant reversal in cumulative revenue recognized will not occur when the uncertainty is resolved. A 55% likelihood is not "highly probable", and because the outcome is binary, Most Likely Amount is evaluated subject to the constraint—resulting in Rs. 0 included at inception.',
      },
      {
        id: 'fr-q2',
        marks: 20,
        chapter: 'Chapter 1: Revenue from Contracts with Customers',
        standardRef: 'Ind AS 115, Para 21(a)',
        question:
          'An entity modifies an existing supply contract to add 500 additional distinct units at a price that reflects a 35% standalone discount unrelated to cost savings. How must this modification be accounted for?',
        options: [
          'As a separate contract prospectively',
          'As a termination of the existing contract and creation of a new contract prospectively',
          'As a cumulative catch-up adjustment on the modification date',
          'As a retrospective restatement of prior period revenue',
        ],
        correctOptionIndex: 1,
        explanation:
          'Although the additional 500 units are distinct, the price does not reflect their standalone selling price (SSP). Per Ind AS 115 Para 21(a), when remaining goods are distinct from those already transferred but the price does not reflect SSP, the modification is accounted for as a termination of the existing contract and creation of a new contract, reallocating remaining unrecognized consideration plus new consideration prospectively.',
      },
      {
        id: 'fr-q3',
        marks: 20,
        chapter: 'Chapter 2: Leases & Right-of-Use Accounting',
        standardRef: 'Ind AS 116, Para 40 & 42',
        question:
          'During Year 3 of a 10-year office lease, rent increases automatically because the contract is linked to the Consumer Price Index (CPI). Which discount rate must the lessee apply when remeasuring the Lease Liability?',
        options: [
          'The unchanged original discount rate determined at lease commencement',
          'A revised incremental borrowing rate as of the Year 3 reset date',
          'The risk-free government bond yield on the reset date',
          'No remeasurement is required; expense the CPI increase directly in P&L',
        ],
        correctOptionIndex: 0,
        explanation:
          'Per Ind AS 116 Para 42–43, a remeasurement arising from a change in an index or rate (other than a change in floating interest rates) uses the UNCHANGED original discount rate. A revised discount rate is required only when the lease term changes, a purchase option assessment changes, or lease payments change due to floating interest rates.',
      },
      {
        id: 'fr-q4',
        marks: 20,
        chapter: 'Chapter 3: Business Combinations & Consolidation',
        standardRef: 'Ind AS 103, Para 53',
        question:
          'In acquiring 80% of Target Ltd., Acquirer Ltd. incurs Rs. 40 lakh in investment banking advisory fees and Rs. 15 lakh in share-issue stamp duty to issue equity consideration. How are these costs recognized under Ind AS 103?',
        options: [
          'Capitalize Rs. 55 lakh into Goodwill',
          'Expense Rs. 40 lakh to P&L immediately and deduct Rs. 15 lakh from Equity (Share Premium)',
          'Expense the entire Rs. 55 lakh to P&L immediately',
          'Deduct Rs. 55 lakh from Non-Controlling Interest',
        ],
        correctOptionIndex: 1,
        explanation:
          'Under Ind AS 103 Para 53, acquisition-related advisory/legal/valuation costs (Rs. 40 lakh) are expensed in profit or loss as incurred. Costs to issue equity securities (Rs. 15 lakh) are accounted for under Ind AS 32 as a direct deduction from equity.',
      },
      {
        id: 'fr-q5',
        marks: 20,
        chapter: 'Chapter 4: Financial Instruments & Hedge Accounting',
        standardRef: 'Ind AS 109, Para 5.5.5',
        question:
          'A corporate bond measured at Amortised Cost experiences a significant increase in credit risk since initial recognition, though no default event has occurred yet. How should impairment and interest revenue be computed?',
        options: [
          '12-month ECL; interest on gross carrying amount',
          'Lifetime ECL; interest on gross carrying amount',
          'Lifetime ECL; interest on net carrying amount (gross minus loss allowance)',
          'No impairment until an actual default occurs',
        ],
        correctOptionIndex: 1,
        explanation:
          'This bond has moved to Stage 2 under the 3-Stage ECL model of Ind AS 109. Stage 2 requires recognizing Lifetime Expected Credit Losses, while interest revenue continues to be calculated on the GROSS carrying amount (net carrying amount applies only in Stage 3 when credit-impaired).',
      },
    ],
  },
  {
    quizId: 'audit-weekly-sample-100',
    title: 'Advanced Audit — SQC 1, SA 315 & CARO 2020 Deep Check',
    subjectId: 'audit',
    subjectName: 'Advanced Audit',
    publishedDate: '2026-11-22',
    frequency: 'weekly',
    totalMarks: 100,
    durationMinutes: 40,
    sourceLabel: 'JSON Schema Preview (100-Mark Scale)',
    questions: [
      {
        id: 'aud-q1',
        marks: 25,
        chapter: 'Chapter 1: Quality Control & Engagement Standards',
        standardRef: 'SQC 1 & SA 230',
        question:
          'An audit report for FY 2025-26 is signed on 28 May 2026. Within how many days must the engagement team ordinarily complete assembly of the final audit file, and for what minimum period must it be retained under SQC 1?',
        options: [
          '30 days assembly; 5 years retention',
          '60 days assembly; 7 years retention',
          '90 days assembly; 8 years retention',
          '60 days assembly; 10 years retention',
        ],
        correctOptionIndex: 1,
        explanation:
          'SQC 1 and SA 230 specify that an appropriate time limit to complete assembly of the final audit file is ordinarily NOT more than 60 days after the date of the auditor’s report, and the retention period for audit engagements is ordinarily no shorter than 7 years from the date of the auditor’s report.',
      },
      {
        id: 'aud-q2',
        marks: 25,
        chapter: 'Chapter 2: Risk Assessment & Internal Control',
        standardRef: 'SA 330, Para 8(b)',
        question:
          'A digital brokerage processes 1.2 million daily trades entirely through automated IT interfaces with no paper trail. Even if the auditor initially prefers a substantive-only approach, what does SA 330 mandate?',
        options: [
          'Increase sample size of substantive vouching and skip IT controls',
          'Design and perform tests of controls because substantive procedures alone cannot provide sufficient appropriate audit evidence',
          'Issue an automatic Disclaimer of Opinion',
          'Rely solely on management written representation under SA 580',
        ],
        correctOptionIndex: 1,
        explanation:
          'Under SA 330 Para 8(b), the auditor MUST design and perform tests of controls when substantive procedures alone cannot provide sufficient appropriate audit evidence at the assertion level—commonly encountered in highly automated transaction initiation and recording environments.',
      },
      {
        id: 'aud-q3',
        marks: 25,
        chapter: 'Chapter 3: Audit Reporting, KAM & CARO 2020',
        standardRef: 'SA 705 & SA 701',
        question:
          'When an auditor expresses a Disclaimer of Opinion on the financial statements of a listed entity, how should the Key Audit Matters (KAM) section be handled?',
        options: [
          'Include a full KAM section highlighting the scope limitation',
          'Do NOT include a Key Audit Matters section unless required by law or regulation',
          'Replace KAM with an Emphasis of Matter paragraph',
          'Move KAM into the Management Responsibility section',
        ],
        correctOptionIndex: 1,
        explanation:
          'Per SA 705 Para 29 and SA 701 Para 5, an auditor is PROHIBITED from communicating Key Audit Matters when expressing a Disclaimer of Opinion, unless such reporting is explicitly required by law or regulation, because presenting KAM might imply the financial statements are more credible than a disclaimer permits.',
      },
      {
        id: 'aud-q4',
        marks: 25,
        chapter: 'Chapter 3: Audit Reporting, KAM & CARO 2020',
        standardRef: 'CARO 2020, Clause 3(ii)(b)',
        question:
          'Under CARO 2020 Clause 3(ii)(b), reporting on quarterly returns/statements filed with banks or financial institutions is triggered when sanctioned working capital limits in aggregate exceed which threshold?',
        options: [
          'Rs. 1 crore at year end',
          'Rs. 5 crore at any point of time during the year',
          'Rs. 10 crore on average during the year',
          'Rs. 25 crore from public sector banks only',
        ],
        correctOptionIndex: 1,
        explanation:
          'Clause 3(ii)(b) of CARO 2020 applies if, at ANY point of time during the year, the company has been sanctioned working capital limits in excess of Rs. 5 crore, in aggregate, from banks or financial institutions on the basis of security of current assets.',
      },
    ],
  },
];

export const GEMINI_QUIZ_JSON_TEMPLATE = `{
  "quizId": "fr-daily-2026-11-24",
  "title": "Ind AS 115 Revenue Recognition — 100 Marks Deep Diagnostic",
  "subjectId": "fr",
  "subjectName": "Financial Reporting",
  "publishedDate": "2026-11-24",
  "frequency": "daily",
  "totalMarks": 100,
  "durationMinutes": 60,
  "questions": [
    {
      "id": "q1",
      "marks": 2,
      "chapter": "Chapter 1: Revenue from Contracts with Customers",
      "standardRef": "Ind AS 115, Para 56",
      "question": "Insert deep conceptual CA Final case-based MCQ here...",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctOptionIndex": 2,
      "explanation": "Detailed ICAI standard citation and step-by-step reasoning."
    }
  ]
}`;
