import { Patient, Visit, PatternAlert } from "./types";
import { getPatients, addAlert } from "./localStorageUtils";

export interface PatternDetectionConfig {
  symptomRepeatThreshold: number; // Number of times a symptom should repeat
  symptomRepeatDays: number; // Within how many days
  frequentVisitThreshold: number; // Number of visits
  frequentVisitDays: number; // Within how many days
  severeCaseThreshold: number; // Number of severe cases
  severeCaseDays: number; // Within how many days
}

const DEFAULT_CONFIG: PatternDetectionConfig = {
  symptomRepeatThreshold: 3,
  symptomRepeatDays: 30,
  frequentVisitThreshold: 5,
  frequentVisitDays: 30,
  severeCaseThreshold: 2,
  severeCaseDays: 7,
};

export const detectPatterns = (
  config: PatternDetectionConfig = DEFAULT_CONFIG
): PatternAlert[] => {
  const patients = getPatients();
  const alerts: PatternAlert[] = [];

  patients.forEach((patient) => {
    // Check for repeated symptoms
    const symptomAlerts = detectRepeatedSymptoms(patient, config);
    alerts.push(...symptomAlerts);

    // Check for frequent visits
    const visitAlerts = detectFrequentVisits(patient, config);
    alerts.push(...visitAlerts);

    // Check for severe cases
    const severeAlerts = detectSevereCases(patient, config);
    alerts.push(...severeAlerts);
  });

  return alerts;
};

const detectRepeatedSymptoms = (
  patient: Patient,
  config: PatternDetectionConfig
): PatternAlert[] => {
  const alerts: PatternAlert[] = [];
  const now = new Date();
  const cutoffDate = new Date(
    now.getTime() - config.symptomRepeatDays * 24 * 60 * 60 * 1000
  );

  // Get recent visits
  const recentVisits = patient.visits.filter(
    (visit) => new Date(visit.date) >= cutoffDate
  );

  // Count symptoms across recent visits
  const symptomCounts: { [symptom: string]: number } = {};
  recentVisits.forEach((visit) => {
    visit.symptoms.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  // Check for repeated symptoms
  Object.entries(symptomCounts).forEach(([symptom, count]) => {
    if (count >= config.symptomRepeatThreshold) {
      alerts.push({
        id: "",
        type: "symptom_repeat",
        message: `Patient ${patient.name} has reported "${symptom}" ${count} times in the last ${config.symptomRepeatDays} days`,
        patientId: patient.id,
        severity:
          count >= config.symptomRepeatThreshold * 2
            ? "high"
            : count >= config.symptomRepeatThreshold * 1.5
            ? "medium"
            : "low",
        createdAt: "",
        isRead: false,
      });
    }
  });

  return alerts;
};

const detectFrequentVisits = (
  patient: Patient,
  config: PatternDetectionConfig
): PatternAlert[] => {
  const alerts: PatternAlert[] = [];
  const now = new Date();
  const cutoffDate = new Date(
    now.getTime() - config.frequentVisitDays * 24 * 60 * 60 * 1000
  );

  // Count recent visits
  const recentVisits = patient.visits.filter(
    (visit) => new Date(visit.date) >= cutoffDate
  );

  if (recentVisits.length >= config.frequentVisitThreshold) {
    alerts.push({
      id: "",
      type: "frequent_visits",
      message: `Patient ${patient.name} has visited ${recentVisits.length} times in the last ${config.frequentVisitDays} days`,
      patientId: patient.id,
      severity:
        recentVisits.length >= config.frequentVisitThreshold * 2
          ? "high"
          : recentVisits.length >= config.frequentVisitThreshold * 1.5
          ? "medium"
          : "low",
      createdAt: "",
      isRead: false,
    });
  }

  return alerts;
};

const detectSevereCases = (
  patient: Patient,
  config: PatternDetectionConfig
): PatternAlert[] => {
  const alerts: PatternAlert[] = [];
  const now = new Date();
  const cutoffDate = new Date(
    now.getTime() - config.severeCaseDays * 24 * 60 * 60 * 1000
  );

  // Count severe cases
  const severeVisits = patient.visits.filter(
    (visit) => visit.severity === "severe" && new Date(visit.date) >= cutoffDate
  );

  if (severeVisits.length >= config.severeCaseThreshold) {
    alerts.push({
      id: "",
      type: "severe_case",
      message: `Patient ${patient.name} has had ${severeVisits.length} severe cases in the last ${config.severeCaseDays} days`,
      patientId: patient.id,
      severity:
        severeVisits.length >= config.severeCaseThreshold * 2
          ? "high"
          : severeVisits.length >= config.severeCaseThreshold * 1.5
          ? "medium"
          : "low",
      createdAt: "",
      isRead: false,
    });
  }

  return alerts;
};

export const runPatternDetection = (config?: PatternDetectionConfig): void => {
  const alerts = detectPatterns(config);

  // Add new alerts to storage
  alerts.forEach((alert) => {
    addAlert(alert);
  });
};

export const getPatternInsights = (
  patient: Patient
): {
  mostCommonSymptoms: { symptom: string; count: number }[];
  averageHealingDuration: number;
  severityTrend: { severity: string; count: number }[];
  visitFrequency: number;
} => {
  const allVisits = patient.visits;

  // Most common symptoms
  const symptomCounts: { [symptom: string]: number } = {};
  allVisits.forEach((visit) => {
    visit.symptoms.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  // Severity trend
  const severityCounts: { [severity: string]: number } = {};
  allVisits.forEach((visit) => {
    severityCounts[visit.severity] = (severityCounts[visit.severity] || 0) + 1;
  });

  // Visit frequency (visits per month)
  const firstVisit =
    allVisits.length > 0 ? new Date(allVisits[0].date) : new Date();
  const lastVisit =
    allVisits.length > 0
      ? new Date(allVisits[allVisits.length - 1].date)
      : new Date();
  const monthsDiff =
    (lastVisit.getTime() - firstVisit.getTime()) / (1000 * 60 * 60 * 24 * 30);
  const visitFrequency = monthsDiff > 0 ? allVisits.length / monthsDiff : 0;

  return {
    mostCommonSymptoms: Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5),
    averageHealingDuration:
      allVisits.length > 0
        ? allVisits.reduce((sum, visit) => sum + visit.healingDuration, 0) /
          allVisits.length
        : 0,
    severityTrend: Object.entries(severityCounts).map(([severity, count]) => ({
      severity,
      count,
    })),
    visitFrequency,
  };
};

export const getHealthTrends = (
  patient: Patient
): {
  improving: boolean;
  worsening: boolean;
  stable: boolean;
  trend: string;
} => {
  if (patient.visits.length < 2) {
    return {
      improving: false,
      worsening: false,
      stable: true,
      trend: "Insufficient data",
    };
  }

  // Sort visits by date
  const sortedVisits = [...patient.visits].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  // Analyze severity trend
  const severityValues = { mild: 1, moderate: 2, severe: 3 };
  const severityTrend = sortedVisits.map(
    (visit) => severityValues[visit.severity]
  );

  // Calculate trend using simple linear regression
  const n = severityTrend.length;
  const x = Array.from({ length: n }, (_, i) => i);
  const y = severityTrend;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

  // Analyze healing duration trend
  const healingTrend = sortedVisits.map((visit) => visit.healingDuration);
  const avgHealingDuration =
    healingTrend.reduce((a, b) => a + b, 0) / healingTrend.length;

  let trend = "";
  if (slope < -0.1) {
    trend = "Improving - Severity decreasing";
  } else if (slope > 0.1) {
    trend = "Worsening - Severity increasing";
  } else {
    trend = "Stable - No significant change";
  }

  return {
    improving: slope < -0.1,
    worsening: slope > 0.1,
    stable: Math.abs(slope) <= 0.1,
    trend,
  };
};
