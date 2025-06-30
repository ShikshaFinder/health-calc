export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female" | "other";
  contactInfo: string;
  visits: Visit[];
  createdAt: string;
  updatedAt: string;
}

export interface Visit {
  id: string;
  date: string;
  symptoms: string[];
  diagnosis: string;
  treatment: string;
  severity: "mild" | "moderate" | "severe";
  healingDuration: number; // in days
  notes: string;
  createdAt: string;
  medicines?: string[]; // List of medicines prescribed
  repeat?: {
    enabled: boolean;
    times: number;
    intervalDays: number;
  };
}

export interface PatternAlert {
  id: string;
  type: "symptom_repeat" | "frequent_visits" | "severe_case";
  message: string;
  patientId: string;
  severity: "low" | "medium" | "high";
  createdAt: string;
  isRead: boolean;
}

export interface AnalyticsData {
  totalPatients: number;
  totalVisits: number;
  commonSymptoms: { symptom: string; count: number }[];
  commonDiagnoses: { diagnosis: string; count: number }[];
  averageHealingDuration: number;
  visitFrequency: { month: string; count: number }[];
  severityDistribution: { severity: string; count: number }[];
}
