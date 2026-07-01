import type { AnalysisResult } from './types';

export const sampleReportText = `LABORATORY REPORT
──────────────────────────────────────────────────
Patient: Sample Patient       DOB: 01/15/1985
Date Collected: June 15, 2026
Ordering Physician: Dr. Sarah Johnson, MD
──────────────────────────────────────────────────

COMPLETE BLOOD COUNT (CBC)
Test                  Value    Reference Range      Flag
─────────────────────────────────────────────────────────
Hemoglobin            13.8     12.0 - 17.5 g/dL
WBC Count              7.2     4.5  - 11.0 K/μL
Platelets              245     150  - 400  K/μL
RBC                    4.6     4.2  - 5.8  M/μL
Hematocrit            41.2     37.0 - 52.0 %

BASIC METABOLIC PANEL
Test                  Value    Reference Range      Flag
─────────────────────────────────────────────────────────
Glucose                108     70 - 99 mg/dL         [H]
Creatinine            0.92     0.6 - 1.2 mg/dL
BUN                     18     7 - 25 mg/dL
Sodium                 141     136 - 145 mEq/L
Potassium              4.1     3.5 - 5.0 mEq/L
CO2                     24     22 - 29 mEq/L

LIPID PANEL
Test                  Value    Reference Range      Flag
─────────────────────────────────────────────────────────
Total Cholesterol      198     < 200 mg/dL
LDL Cholesterol        118     < 130 mg/dL
HDL Cholesterol         52     > 40  mg/dL
Triglycerides          140     < 150 mg/dL

──────────────────────────────────────────────────
[H] = Above normal range
Authorized by: Dr. Sarah Johnson, MD
Report Date: June 15, 2026
──────────────────────────────────────────────────`;

export const mockAnalysisResult: AnalysisResult = {
  reportType: 'Complete Blood Count & Metabolic Panel',
  date: 'June 15, 2026',
  overallStatus: 'mostly-normal',
  overallMessage:
    'Your results are mostly within normal ranges. One marker — fasting glucose — is slightly elevated and worth monitoring.',

  explanation: {
    summary:
      "We reviewed your Complete Blood Count and Metabolic Panel. The great news: the vast majority of your results are normal. Your blood cells are healthy, your kidneys are functioning well, and your electrolytes are balanced. The one area to keep an eye on is your blood sugar (glucose), which came in slightly above the normal fasting range — a common early finding that's very manageable with simple lifestyle adjustments.",

    sections: [
      {
        title: 'Blood Cell Health',
        icon: '🩸',
        finding: 'Your blood cells look healthy across the board.',
        detail:
          'Your hemoglobin (the protein that carries oxygen), white blood cell count (your immune defenders), and platelet levels (which help blood clot) are all within normal ranges. This means your blood is doing its job well — transporting oxygen efficiently and maintaining a strong immune response.',
        status: 'normal',
      },
      {
        title: 'Blood Sugar (Glucose)',
        icon: '🍬',
        finding: 'Your fasting glucose is slightly elevated at 108 mg/dL.',
        detail:
          "The normal fasting range is 70–99 mg/dL, and a level of 100–125 mg/dL is considered 'pre-diabetic.' Your result of 108 falls in this range. This doesn't mean you have diabetes — it's an early signal that your body may be processing sugar less efficiently. The great news is that lifestyle changes like reducing refined carbs, adding 30 minutes of walking daily, and maintaining a healthy weight can often bring this back to normal.",
        status: 'elevated',
      },
      {
        title: 'Kidney Function',
        icon: '🫘',
        finding: 'Your kidneys are working well.',
        detail:
          'Your creatinine (a waste product filtered by kidneys) and BUN (blood urea nitrogen) are both within normal limits. This indicates your kidneys are filtering your blood effectively and maintaining the right chemical balance in your body.',
        status: 'normal',
      },
      {
        title: 'Electrolytes & Minerals',
        icon: '⚡',
        finding: 'Your electrolyte balance is excellent.',
        detail:
          "Sodium, potassium, and other key electrolytes are all within normal ranges. Electrolytes regulate everything from your heartbeat to muscle contractions to fluid balance — having them in the right range means your body's electrical system is running smoothly.",
        status: 'normal',
      },
      {
        title: 'Cholesterol & Heart Health',
        icon: '❤️',
        finding: 'Your cholesterol levels are in a healthy range.',
        detail:
          'Total cholesterol at 198 mg/dL is just under the 200 mg/dL threshold, with a healthy HDL ("good cholesterol") of 52 and LDL ("bad cholesterol") at 118. Triglycerides are also normal at 140. Keeping your diet balanced and staying active will help maintain these levels.',
        status: 'normal',
      },
    ],
  },

  metrics: [
    {
      name: 'Hemoglobin',
      shortName: 'HGB',
      value: 13.8,
      normalMin: 12.0,
      normalMax: 17.5,
      unit: 'g/dL',
      status: 'normal',
      description: 'Oxygen-carrying protein in red blood cells',
    },
    {
      name: 'White Blood Cells',
      shortName: 'WBC',
      value: 7.2,
      normalMin: 4.5,
      normalMax: 11.0,
      unit: 'K/μL',
      status: 'normal',
      description: 'Immune system cells',
    },
    {
      name: 'Platelets',
      shortName: 'PLT',
      value: 245,
      normalMin: 150,
      normalMax: 400,
      unit: 'K/μL',
      status: 'normal',
      description: 'Blood clotting cells',
    },
    {
      name: 'Fasting Glucose',
      shortName: 'GLU',
      value: 108,
      normalMin: 70,
      normalMax: 99,
      unit: 'mg/dL',
      status: 'elevated',
      description: 'Blood sugar level (fasting)',
    },
    {
      name: 'Creatinine',
      shortName: 'CREAT',
      value: 0.92,
      normalMin: 0.6,
      normalMax: 1.2,
      unit: 'mg/dL',
      status: 'normal',
      description: 'Kidney function marker',
    },
    {
      name: 'Sodium',
      shortName: 'NA',
      value: 141,
      normalMin: 136,
      normalMax: 145,
      unit: 'mEq/L',
      status: 'normal',
      description: 'Electrolyte & fluid balance',
    },
    {
      name: 'Potassium',
      shortName: 'K',
      value: 4.1,
      normalMin: 3.5,
      normalMax: 5.0,
      unit: 'mEq/L',
      status: 'normal',
      description: 'Heart & muscle function',
    },
    {
      name: 'Total Cholesterol',
      shortName: 'CHOL',
      value: 198,
      normalMin: 0,
      normalMax: 200,
      unit: 'mg/dL',
      status: 'normal',
      description: 'Cardiovascular health indicator',
    },
  ],

  healthCategories: [
    { category: 'Blood Health', score: 90, fullMark: 100 },
    { category: 'Metabolic', score: 70, fullMark: 100 },
    { category: 'Kidney', score: 93, fullMark: 100 },
    { category: 'Electrolytes', score: 96, fullMark: 100 },
    { category: 'Cardiovascular', score: 82, fullMark: 100 },
    { category: 'Immunity', score: 88, fullMark: 100 },
  ],

  steps: [
    {
      priority: 'high',
      title: 'Discuss Your Glucose with Your Doctor',
      description:
        'Your fasting glucose of 108 mg/dL is in the pre-diabetic range. Schedule a follow-up appointment to discuss monitoring options and potentially a glucose tolerance test.',
      timeframe: 'Within 2–4 weeks',
      icon: '🏥',
    },
    {
      priority: 'high',
      title: 'Reduce Added Sugars & Refined Carbs',
      description:
        'Cut back on sugary drinks, white bread, and processed snacks. Focus on whole grains, vegetables, lean proteins, and healthy fats to help lower your glucose naturally.',
      timeframe: 'Start now',
      icon: '🥗',
    },
    {
      priority: 'medium',
      title: 'Aim for 30 Minutes of Daily Movement',
      description:
        'Regular physical activity — even a daily walk — can significantly improve insulin sensitivity and help bring blood sugar levels into the normal range.',
      timeframe: 'This week',
      icon: '🚶',
    },
    {
      priority: 'medium',
      title: 'Monitor Your Cholesterol Trend',
      description:
        'Your cholesterol is borderline at 198 mg/dL. Continue heart-healthy habits and recheck in 6–12 months to ensure it stays below 200.',
      timeframe: '6–12 months',
      icon: '📊',
    },
    {
      priority: 'low',
      title: 'Schedule Annual Blood Work',
      description:
        'Keep up with annual lab work to track trends over time. Early detection of changes makes management much easier.',
      timeframe: 'In 12 months',
      icon: '📅',
    },
    {
      priority: 'low',
      title: 'Stay Well Hydrated',
      description:
        'Your electrolytes are well-balanced. Continue drinking adequate water (aim for 6–8 glasses daily) to maintain this balance and support kidney function.',
      timeframe: 'Ongoing',
      icon: '💧',
    },
  ],
};
