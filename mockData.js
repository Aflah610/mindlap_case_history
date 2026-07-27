// Mindlap Case History Management System - Initial Mock Data
const INITIAL_MOCK_DATA = {
  currentUser: {
    id: "USER-001",
    name: "Dr. Sarah Jenkins",
    role: "psychologist", // 'admin', 'ccd', 'psychologist'
    email: "sarah.jenkins@mindlap.com",
    avatar: "SJ",
    specialization: "Clinical Psychologist (CBT, Trauma)"
  },
  
  psychologists: [
    {
      id: "PSY-001",
      name: "Dr. Sarah Jenkins",
      title: "Senior Clinical Psychologist",
      email: "sarah.jenkins@mindlap.com",
      phone: "+1 (555) 234-5678",
      specialties: ["CBT", "Trauma & PTSD", "Anxiety Disorders"],
      activeClientsCount: 4,
      status: "Active",
      avatar: "SJ"
    },
    {
      id: "PSY-002",
      name: "Dr. Alex Morgan",
      title: "Consultant Psychiatrist & Psychotherapist",
      email: "alex.morgan@mindlap.com",
      phone: "+1 (555) 345-6789",
      specialties: ["Depressive Disorders", "Bipolar Spectrum", "Adult ADHD"],
      activeClientsCount: 3,
      status: "Active",
      avatar: "AM"
    },
    {
      id: "PSY-003",
      name: "Dr. Elena Rostova",
      title: "Child & Adolescent Psychologist",
      email: "elena.rostova@mindlap.com",
      phone: "+1 (555) 456-7890",
      specialties: ["Adolescent Therapy", "Family Systems", "Behavioral Therapy"],
      activeClientsCount: 2,
      status: "Active",
      avatar: "ER"
    }
  ],

  ccdStaff: [
    {
      id: "CCD-001",
      name: "Marcus Vance",
      roleTitle: "CCD Coordinator",
      email: "marcus.vance@mindlap.com",
      phone: "+1 (555) 876-5432",
      shift: "Morning (8 AM - 4 PM)",
      status: "Active",
      avatar: "MV"
    },
    {
      id: "CCD-002",
      name: "Priya Sharma",
      roleTitle: "Intake Specialist",
      email: "priya.sharma@mindlap.com",
      phone: "+1 (555) 987-6543",
      shift: "Afternoon (12 PM - 8 PM)",
      status: "Active",
      avatar: "PS"
    }
  ],

  clients: [
    {
      id: "ML-2026-001",
      fullName: "Jonathan Reed",
      age: 34,
      gender: "Male",
      dob: "1992-04-15",
      phone: "+1 (555) 123-4567",
      email: "jonathan.reed@example.com",
      address: "742 Evergreen Terrace, Springfield, OR 97477",
      emergencyContact: "Emily Reed (Wife) - +1 (555) 999-1122",
      occupation: "Software Engineer",
      maritalStatus: "Married",
      assignedPsychologistId: "PSY-001",
      assignedPsychologistName: "Dr. Sarah Jenkins",
      status: "Active",
      registrationDate: "2026-05-10",
      caseHistoryStatus: "Completed",
      lastSessionDate: "2026-07-20",
      nextFollowUpDate: "2026-07-28"
    },
    {
      id: "ML-2026-002",
      fullName: "Sophia Martinez",
      age: 28,
      gender: "Female",
      dob: "1998-11-23",
      phone: "+1 (555) 234-9876",
      email: "sophia.m@example.com",
      address: "1208 Pine Hill Rd, Austin, TX 78701",
      emergencyContact: "Carlos Martinez (Father) - +1 (555) 888-2233",
      occupation: "Marketing Director",
      maritalStatus: "Single",
      assignedPsychologistId: "PSY-001",
      assignedPsychologistName: "Dr. Sarah Jenkins",
      status: "Active",
      registrationDate: "2026-06-01",
      caseHistoryStatus: "Completed",
      lastSessionDate: "2026-07-22",
      nextFollowUpDate: "2026-07-29"
    },
    {
      id: "ML-2026-003",
      fullName: "David Kim",
      age: 42,
      gender: "Male",
      dob: "1984-08-09",
      phone: "+1 (555) 345-1122",
      email: "david.kim@example.com",
      address: "405 Horizon Way, Seattle, WA 98101",
      emergencyContact: "Hannah Kim (Sister) - +1 (555) 777-3344",
      occupation: "Financial Analyst",
      maritalStatus: "Divorced",
      assignedPsychologistId: "PSY-002",
      assignedPsychologistName: "Dr. Alex Morgan",
      status: "Active",
      registrationDate: "2026-06-18",
      caseHistoryStatus: "Completed",
      lastSessionDate: "2026-07-21",
      nextFollowUpDate: "2026-07-30"
    },
    {
      id: "ML-2026-004",
      fullName: "Claire O'Connor",
      age: 22,
      gender: "Female",
      dob: "2004-03-30",
      phone: "+1 (555) 456-2233",
      email: "claire.oc@example.com",
      address: "89 University Ave, Boston, MA 02115",
      emergencyContact: "Patricia O'Connor (Mother) - +1 (555) 666-4455",
      occupation: "Graduate Student",
      maritalStatus: "Single",
      assignedPsychologistId: "PSY-001",
      assignedPsychologistName: "Dr. Sarah Jenkins",
      status: "Pending Intake",
      registrationDate: "2026-07-15",
      caseHistoryStatus: "In Progress",
      lastSessionDate: "2026-07-18",
      nextFollowUpDate: "2026-07-25"
    },
    {
      id: "ML-2026-005",
      fullName: "Robert Chen",
      age: 51,
      gender: "Male",
      dob: "1975-01-14",
      phone: "+1 (555) 567-3344",
      email: "r.chen@example.com",
      address: "312 Oak Crest Drive, Denver, CO 80202",
      emergencyContact: "Grace Chen (Wife) - +1 (555) 555-6677",
      occupation: "Civil Engineer",
      maritalStatus: "Married",
      assignedPsychologistId: "PSY-002",
      assignedPsychologistName: "Dr. Alex Morgan",
      status: "Active",
      registrationDate: "2026-07-02",
      caseHistoryStatus: "Pending",
      lastSessionDate: "2026-07-14",
      nextFollowUpDate: "2026-07-27"
    },
    {
      id: "ML-2026-006",
      fullName: "Maya Patel",
      age: 19,
      gender: "Female",
      dob: "2007-09-05",
      phone: "+1 (555) 678-4455",
      email: "maya.patel@example.com",
      address: "15 Maple Lane, Chicago, IL 60601",
      emergencyContact: "Sunil Patel (Father) - +1 (555) 444-8899",
      occupation: "Undergraduate Student",
      maritalStatus: "Single",
      assignedPsychologistId: "PSY-003",
      assignedPsychologistName: "Dr. Elena Rostova",
      status: "Active",
      registrationDate: "2026-07-10",
      caseHistoryStatus: "Completed",
      lastSessionDate: "2026-07-23",
      nextFollowUpDate: "2026-07-31"
    }
  ],

  caseHistories: {
    "ML-2026-001": {
      clientId: "ML-2026-001",
      lastUpdated: "2026-07-20 14:30",
      completedBy: "Dr. Sarah Jenkins",

      // Presenting Problems
      presentingProblems: "Client reports severe generalized anxiety, persistent sleep disturbance (early morning awakening), racing thoughts regarding career performance, and intermittent panic symptoms triggered by high-stakes work presentations.",
      durationOfSymptoms: "8 months, with acute worsening over the past 6 weeks.",

      // History of Present Illness
      historyOfPresentIllness: "Onset coincided with promotion to Lead Systems Architect. Symptoms began with muscle tension and somatic gastrointestinal distress before escalating to nocturnal panic attacks occurring 3-4 times weekly. Client reports feeling 'constantly on edge' with difficulty concentration.",

      // Medical & Psychiatric History
      medicalHistory: "Mild hypertension managed with Lifestyle modifications. No past surgeries or chronic illness.",
      psychiatricHistory: "One prior brief episode of situational anxiety during college (2014); resolved with short-term counseling. No past psychiatric hospitalizations.",

      // Family History
      familyHistory: "Maternal grandmother had history of clinical depression. Father has reported unmanaged high stress/type A personality traits. No family history of bipolar disorder or psychosis.",

      // Personal & Social History
      personalHistory: "Raised in supportive nuclear family. Achieved high academic success (B.S. Computer Science). Denies developmental delays.",
      socialHistory: "Currently married (5 years), describes relationship as supportive. Alcohol intake: 2-3 units/week socially. Non-smoker. Denies illicit substance use.",

      // Mental Status Examination (MSE)
      mse: {
        appearance: "Well-groomed, neatly dressed in business casual attire. Good hygiene.",
        behavior: "Cooperative, mild psychomotor agitation (frequent hand tapping).",
        speech: "Normal rate, rhythm, and volume. Coherent and goal-directed.",
        moodAndAffect: "Mood described as 'anxious and overwhelmed'. Affect congruent, anxious, restricted range.",
        thoughtProcess: "Logical, sequential, linear. No loose associations.",
        thoughtContent: "Preoccupied with fear of work failure. No suicidal or homicidal ideations. No delusions.",
        perception: "No auditory or visual hallucinations reported or observed.",
        cognition: "Alert and oriented x4. Concentration intact on digit span. Memory intact.",
        insightAndJudgment: "Good insight into anxiety triggers; sound judgment."
      },

      // Risk Assessment
      riskAssessment: {
        suicideRisk: "Low", // Low, Moderate, High
        homicideRisk: "Low",
        selfHarmRisk: "Low",
        riskNotes: "Client explicitly denies active or passive suicidal ideation, intent, or plan. Protective factors include strong family support and high career motivation."
      },

      // Clinical Diagnosis
      diagnosis: {
        primaryDiagnosis: "F41.1 - Generalized Anxiety Disorder (DSM-5 / ICD-10)",
        secondaryDiagnosis: "F51.01 - Primary Insomnia secondary to Anxiety",
        specifiers: "With panic attacks"
      },

      // Treatment Plan
      treatmentPlan: {
        shortTermGoals: "1. Reduce weekly panic attack frequency from 4x to <1x within 4 weeks.\n2. Master diaphragm breathing and progressive muscle relaxation (PMR) skills.\n3. Establish consistent sleep hygiene regimen.",
        longTermGoals: "1. Restructure cognitive distortions related to professional perfectionism.\n2. Maintain sustained anxiety reduction during team presentations.",
        modality: "Cognitive Behavioral Therapy (CBT) - Weekly 50-minute individual sessions."
      },

      // Session Notes
      sessionNotes: [
        {
          date: "2026-07-20",
          sessionNum: 4,
          summary: "Session focused on cognitive restructuring of catastrophizing thoughts before presentations. Client successfully identified 3 automatic thoughts and developed balanced alternative thoughts.",
          therapist: "Dr. Sarah Jenkins"
        },
        {
          date: "2026-07-13",
          sessionNum: 3,
          summary: "Introduced 4-7-8 breathing technique and grounding 5-4-3-2-1 exercise for acute panic symptoms. Sleep log reviewed.",
          therapist: "Dr. Sarah Jenkins"
        }
      ],

      // Homework & Recommendations
      homework: "1. Complete Thought Record Worksheet for 2 anxiety-provoking work situations.\n2. Practice PMR for 15 minutes before bedtime daily.",
      followUpDate: "2026-07-28"
    },

    "ML-2026-002": {
      clientId: "ML-2026-002",
      lastUpdated: "2026-07-22 16:15",
      completedBy: "Dr. Sarah Jenkins",

      presentingProblems: "Persistent low mood, loss of interest in hobbies (anhedonia), fatigue, feelings of worthlessness, and difficulty completing daily tasks following a recent breakup.",
      durationOfSymptoms: "3 months.",

      historyOfPresentIllness: "Symptoms initiated after dissolution of a 4-year romantic relationship. Gradual onset of sleep latency (taking >2 hours to fall asleep), decreased appetite (5 lbs weight loss), and emotional withdrawal from friends.",

      medicalHistory: "Hypothyroidism diagnosed in 2022; managed with Levothyroxine 50mcg daily.",
      psychiatricHistory: "Previous major depressive episode at age 20 following family relocation; treated with psychotherapy for 6 months.",

      familyHistory: "Mother diagnosed with Major Depressive Disorder. Paternal uncle has history of Alcohol Use Disorder.",
      personalHistory: "Born and raised in Austin, TX. Completed M.S. in Communications.",
      socialHistory: "Lives alone in apartment. Supports include 2 close college friends. Denies tobacco/drug use.",

      mse: {
        appearance: "Casual attire, slight dark circles under eyes, posture slouched.",
        behavior: "Psychomotor retardation noted; slow body movements.",
        speech: "Decreased volume, latency in response, concise answers.",
        moodAndAffect: "Mood 'depressed and hollow'. Affect blunted, sad, tearful at times.",
        thoughtProcess: "Linear but slowed. Goal-directed.",
        thoughtContent: "Themes of loss, self-blame. Denies suicidal intent.",
        perception: "Intact.",
        cognition: "Alert x4. Mildly reduced concentration.",
        insightAndJudgment: "Fair insight, good judgment."
      },

      riskAssessment: {
        suicideRisk: "Moderate",
        homicideRisk: "Low",
        selfHarmRisk: "Low",
        riskNotes: "Passive thoughts of 'wishing I wouldn't wake up' expressed during initial intake. No active plan, intent, or rehearsal. Safety contract signed. Protective factors: strong friendship network and commitment to therapy."
      },

      diagnosis: {
        primaryDiagnosis: "F32.1 - Major Depressive Disorder, Single Episode, Moderate",
        secondaryDiagnosis: "N/A",
        specifiers: "With anxious distress"
      },

      treatmentPlan: {
        shortTermGoals: "1. Engage in behavioral activation (minimum 1 pleasurable/mastery activity daily).\n2. Establish safety plan and crisis hotline resource awareness.",
        longTermGoals: "1. Remission of depressive symptoms (PHQ-9 score <5).\n2. Re-establish healthy social engagement.",
        modality: "Acceptance & Commitment Therapy (ACT) + Behavioral Activation."
      },

      sessionNotes: [
        {
          date: "2026-07-22",
          sessionNum: 3,
          summary: "Behavioral activation schedule created. Client selected daily 20-minute evening walk and cooking dinner 3x weekly as initial commitment targets.",
          therapist: "Dr. Sarah Jenkins"
        }
      ],

      homework: "Track daily activity log with mood ratings (1-10) before and after walking.",
      followUpDate: "2026-07-29"
    }
  },

  appointments: [
    {
      id: "APT-2026-101",
      clientId: "ML-2026-001",
      clientName: "Jonathan Reed",
      psychologistId: "PSY-001",
      psychologistName: "Dr. Sarah Jenkins",
      date: "2026-07-28",
      time: "10:00 AM",
      type: "Therapy Session",
      status: "Upcoming",
      notes: "Follow-up CBT session #5 - Thought record review"
    },
    {
      id: "APT-2026-102",
      clientId: "ML-2026-002",
      clientName: "Sophia Martinez",
      psychologistId: "PSY-001",
      psychologistName: "Dr. Sarah Jenkins",
      date: "2026-07-29",
      time: "02:00 PM",
      type: "Therapy Session",
      status: "Upcoming",
      notes: "ACT Session #4 - Behavioral activation review"
    },
    {
      id: "APT-2026-103",
      clientId: "ML-2026-003",
      clientName: "David Kim",
      psychologistId: "PSY-002",
      psychologistName: "Dr. Alex Morgan",
      date: "2026-07-30",
      time: "11:30 AM",
      type: "Therapy Session",
      status: "Upcoming",
      notes: "Bi-weekly psychiatric check-in"
    },
    {
      id: "APT-2026-104",
      clientId: "ML-2026-004",
      clientName: "Claire O'Connor",
      psychologistId: "PSY-001",
      psychologistName: "Dr. Sarah Jenkins",
      date: "2026-07-25",
      time: "03:30 PM",
      type: "Intake Evaluation",
      status: "Upcoming",
      notes: "Complete Case History Form & Risk Assessment"
    },
    {
      id: "APT-2026-105",
      clientId: "ML-2026-005",
      clientName: "Robert Chen",
      psychologistId: "PSY-002",
      psychologistName: "Dr. Alex Morgan",
      date: "2026-07-27",
      time: "09:00 AM",
      type: "Initial Consultation",
      status: "Upcoming",
      notes: "CCD Registration intake review"
    },
    {
      id: "APT-2026-106",
      clientId: "ML-2026-001",
      clientName: "Jonathan Reed",
      psychologistId: "PSY-001",
      psychologistName: "Dr. Sarah Jenkins",
      date: "2026-07-20",
      time: "10:00 AM",
      type: "Therapy Session",
      status: "Completed",
      notes: "CBT Session #4 completed successfully."
    }
  ],

  documents: [
    {
      id: "DOC-2026-01",
      clientId: "ML-2026-001",
      clientName: "Jonathan Reed",
      title: "Informed Consent & Confidentiality Agreement",
      category: "Consent Forms",
      uploadDate: "2026-05-10",
      fileType: "PDF",
      fileSize: "1.2 MB",
      uploadedBy: "Marcus Vance (CCD)"
    },
    {
      id: "DOC-2026-02",
      clientId: "ML-2026-001",
      clientName: "Jonathan Reed",
      title: "Previous Psychiatric Evaluation Report 2024",
      category: "Previous Psychological Reports",
      uploadDate: "2026-05-12",
      fileType: "PDF",
      fileSize: "3.4 MB",
      uploadedBy: "Dr. Sarah Jenkins"
    },
    {
      id: "DOC-2026-03",
      clientId: "ML-2026-002",
      clientName: "Sophia Martinez",
      title: "Blood Panel & Thyroid Function Lab Results",
      category: "Medical Reports",
      uploadDate: "2026-06-02",
      fileType: "PDF",
      fileSize: "2.1 MB",
      uploadedBy: "Priya Sharma (CCD)"
    },
    {
      id: "DOC-2026-04",
      clientId: "ML-2026-003",
      clientName: "David Kim",
      title: "Sleep Study Assessment",
      category: "Medical Reports",
      uploadDate: "2026-06-20",
      fileType: "PDF",
      fileSize: "4.8 MB",
      uploadedBy: "Dr. Alex Morgan"
    }
  ],

  auditLogs: [
    {
      id: "LOG-9901",
      timestamp: "2026-07-24 10:15:22",
      user: "Dr. Sarah Jenkins",
      role: "Psychologist",
      action: "CASE_HISTORY_UPDATE",
      details: "Updated Session Notes for Jonathan Reed (ML-2026-001)",
      ipAddress: "192.168.1.42"
    },
    {
      id: "LOG-9902",
      timestamp: "2026-07-23 15:40:10",
      user: "Marcus Vance",
      role: "CCD Staff",
      action: "CLIENT_REGISTER",
      details: "Registered new client Claire O'Connor (ML-2026-004)",
      ipAddress: "192.168.1.15"
    },
    {
      id: "LOG-9903",
      timestamp: "2026-07-22 14:05:00",
      user: "Dr. Sarah Jenkins",
      role: "Psychologist",
      action: "PDF_EXPORT",
      details: "Exported Case History PDF for Sophia Martinez (ML-2026-002)",
      ipAddress: "192.168.1.42"
    },
    {
      id: "LOG-9904",
      timestamp: "2026-07-21 11:20:44",
      user: "Admin Administrator",
      role: "Admin",
      action: "PSYCHOLOGIST_ASSIGN",
      details: "Assigned Client Robert Chen (ML-2026-005) to Dr. Alex Morgan",
      ipAddress: "192.168.1.2"
    }
  ]
};
