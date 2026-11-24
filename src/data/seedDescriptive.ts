import type { DescriptiveQuestion, DescriptiveSubmission } from '../types/archive';

export const SEED_DESCRIPTIVE_QUESTIONS: DescriptiveQuestion[] = [
  {
    id: 'desc-fr-116',
    subjectId: 'fr',
    subjectName: 'Financial Reporting',
    chapter: 'Chapter 2: Leases & Right-of-Use Accounting',
    standardRef: 'Ind AS 116 (Sale & Leaseback)',
    marks: 8,
    recommendedMinutes: 14,
    title: 'Sale & Leaseback Below Fair Value — ROU & Gain Computation',
    prompt:
      'Zenith Manufacturing Ltd. sells a warehouse (carrying amount Rs. 60 lakh, fair value Rs. 100 lakh) to Horizon Capital for Rs. 90 lakh and immediately leases it back for 10 years at an annual lease payment of Rs. 9 lakh payable at year-end. The interest rate implicit in the lease is 8% (PVAF for 10 years at 8% = 6.710). Assuming the transfer satisfies Ind AS 115 sale requirements, explain the accounting treatment for the below-market sale price and compute the Right-of-Use Asset and Gain on Rights Transferred.',
    expectedKeyPoints: [
      'Recognize Rs. 10 lakh below-market terms (FV 100 - Sale Price 90) as prepayment of lease payments.',
      'PV of lease payments = 9 * 6.710 = Rs. 60.39 lakh; total lease consideration retained = 60.39 + 10 = Rs. 70.39 lakh.',
      'ROU Asset = Carrying Amount (60) * (70.39 / 100) = Rs. 42.23 lakh.',
      'Total economic gain = 100 - 60 = Rs. 40 lakh; Gain recognized on rights transferred = 40 * ((100 - 70.39) / 100) = Rs. 11.84 lakh.',
    ],
  },
  {
    id: 'desc-aud-570',
    subjectId: 'audit',
    subjectName: 'Advanced Audit',
    chapter: 'Chapter 3: Audit Reporting, KAM & CARO 2020',
    standardRef: 'SA 570 & SA 705',
    marks: 6,
    recommendedMinutes: 10,
    title: 'Material Uncertainty Related to Going Concern — Inadequate Disclosure',
    prompt:
      'During the statutory audit of Apex Textiles Ltd., you discover that the company has defaulted on principal repayments to consortium lenders and its net worth has eroded by 75%. Management prepares the financial statements on a going concern basis and refuses to add any footnote disclosure regarding the material uncertainty. Draft your audit reporting conclusion citing the relevant Standards on Auditing.',
    expectedKeyPoints: [
      'Cite SA 570 (Revised) Para 23: Material uncertainty exists and adequate disclosure is NOT made.',
      'Express either a Qualified Opinion or an Adverse Opinion in accordance with SA 705 (Revised) depending on pervasiveness.',
      'In the Basis for Qualified/Adverse Opinion section, explicitly state that a material uncertainty exists that may cast significant doubt on the entity’s ability to continue as a going concern and that the financial statements do not adequately disclose this matter.',
    ],
  },
  {
    id: 'desc-afm-forex',
    subjectId: 'afm',
    subjectName: 'Advanced Financial Management',
    chapter: 'Chapter 2: Foreign Exchange Exposure & Risk Management',
    standardRef: 'Money Market Hedge vs Forward Cover',
    marks: 8,
    recommendedMinutes: 14,
    title: 'Exporter Hedging Evaluation: Forward Cover vs Money Market Hedge',
    prompt:
      'An Indian IT exporter expects to receive USD 500,000 in 3 months. Spot USD/INR is 84.10 / 84.20 and 3-month forward is 84.65 / 84.80. Annualized 3-month interest rates are USD 4.80% / 5.20% and INR 7.20% / 8.00%. Advise the exporter on whether to lock a Forward Cover or execute a Money Market Hedge, detailing each cash flow step.',
    expectedKeyPoints: [
      'Forward Cover uses Bid rate (84.65) -> Assured inflow = USD 500,000 * 84.65 = Rs. 4,23,25,000.',
      'Money Market Hedge: Borrow PV of USD 500,000 at USD borrowing rate 5.20% p.a. (1.30% for 3m) = USD 493,583.42.',
      'Convert at Spot Bid (84.10) = Rs. 4,15,10,365; invest at INR deposit rate 7.20% p.a. (1.80% for 3m) = Rs. 4,22,57,552.',
      'Recommendation: Choose Forward Cover as it yields Rs. 67,448 higher net INR inflow.',
    ],
  },
];

export const SAMPLE_EVALUATED_SUBMISSION: DescriptiveSubmission = {
  id: 'eval-sample-1',
  questionId: 'desc-fr-116',
  questionTitle: 'Sale & Leaseback Below Fair Value — ROU & Gain Computation',
  subjectName: 'Financial Reporting',
  studentName: 'Sample Evaluated Script (Gemini Evaluation Preview)',
  mode: 'typed',
  typedAnswer:
    'Under Ind AS 116 Para 101, since sale price (Rs. 90 lakh) is below fair value (Rs. 100 lakh), the shortfall of Rs. 10 lakh is accounted for as a prepayment of lease payments. PV of lease payments = 9 * 6.710 = Rs. 60.39 lakh. Adding prepayment of Rs. 10 lakh gives Rs. 70.39 lakh retained interest. ROU Asset = 60 * (70.39 / 100) = Rs. 42.23 lakh. Gain recognized = (100 - 60) * (29.61 / 100) = Rs. 11.84 lakh.',
  submittedAt: '2026-11-23T17:45:00Z',
  status: 'evaluated_sample',
  evaluation: {
    totalMarks: 8,
    awardedMarks: 6.5,
    overallSummary:
      'Strong mathematical accuracy on ROU measurement and partial gain recognition. To score full 8/8 marks in CA Final FR, explicitly state the Ind AS 115 control-transfer precondition and show the complete Day-1 journal entry.',
    rubric: [
      {
        criterion: 'Ind AS 116 Para 101 Below-Market Prepayment Treatment',
        maxMarks: 2,
        awardedMarks: 2,
        status: 'met',
        comment: 'Correctly identified the Rs. 10 lakh shortfall as a lease prepayment.',
      },
      {
        criterion: 'Lease Liability & Proportionate ROU Asset Computation',
        maxMarks: 3,
        awardedMarks: 3,
        status: 'met',
        comment: 'Accurate PVAF computation (Rs. 60.39L) and retained carrying proportion (Rs. 42.23L).',
      },
      {
        criterion: 'Gain on Rights Transferred to Buyer-Lessor',
        maxMarks: 2,
        awardedMarks: 1.5,
        status: 'partial',
        comment: 'Numeric gain (Rs. 11.84L) is right; add one line explaining why the remaining Rs. 28.16L gain is deferred via lower ROU carrying amount.',
      },
      {
        criterion: 'Complete Day-1 Journal Entry Presentation',
        maxMarks: 1,
        awardedMarks: 0,
        status: 'missed',
        comment: 'Include the balanced journal entry (Dr Cash 90, Dr ROU 42.23; Cr Warehouse 60, Cr Lease Liability 60.39, Cr Gain 11.84).',
      },
    ],
  },
};
