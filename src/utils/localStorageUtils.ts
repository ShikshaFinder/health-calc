import { Patient, Visit, PatternAlert, AnalyticsData } from "./types";

const STORAGE_KEYS = {
  PATIENTS: "njhealth_patients",
  ALERTS: "njhealth_alerts",
  SETTINGS: "njhealth_settings",
};

// Patient Management
export const getPatients = (): Patient[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
  return data ? JSON.parse(data) : [];
};

export const savePatients = (patients: Patient[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify(patients));
};

export const addPatient = (
  patient: Omit<Patient, "id" | "createdAt" | "updatedAt">
): Patient => {
  const patients = getPatients();
  const newPatient: Patient = {
    ...patient,
    id: generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  patients.push(newPatient);
  savePatients(patients);
  return newPatient;
};

export const updatePatient = (
  id: string,
  updates: Partial<Patient>
): Patient | null => {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) return null;

  patients[index] = {
    ...patients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  savePatients(patients);
  return patients[index];
};

export const deletePatient = (id: string): boolean => {
  const patients = getPatients();
  const filtered = patients.filter((p) => p.id !== id);
  if (filtered.length === patients.length) return false;
  savePatients(filtered);
  return true;
};

export const getPatient = (id: string): Patient | null => {
  const patients = getPatients();
  return patients.find((p) => p.id === id) || null;
};

// Visit Management
export const addVisit = (
  patientId: string,
  visit: Omit<Visit, "id" | "createdAt">
): Visit => {
  const patients = getPatients();
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  if (patientIndex === -1) throw new Error("Patient not found");

  const newVisit: Visit = {
    ...visit,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };

  patients[patientIndex].visits.push(newVisit);
  patients[patientIndex].updatedAt = new Date().toISOString();
  savePatients(patients);

  return newVisit;
};

export const updateVisit = (
  patientId: string,
  visitId: string,
  updates: Partial<Visit>
): Visit | null => {
  const patients = getPatients();
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  if (patientIndex === -1) return null;

  const visitIndex = patients[patientIndex].visits.findIndex(
    (v) => v.id === visitId
  );
  if (visitIndex === -1) return null;

  patients[patientIndex].visits[visitIndex] = {
    ...patients[patientIndex].visits[visitIndex],
    ...updates,
  };
  patients[patientIndex].updatedAt = new Date().toISOString();
  savePatients(patients);

  return patients[patientIndex].visits[visitIndex];
};

export const deleteVisit = (patientId: string, visitId: string): boolean => {
  const patients = getPatients();
  const patientIndex = patients.findIndex((p) => p.id === patientId);
  if (patientIndex === -1) return false;

  const originalLength = patients[patientIndex].visits.length;
  patients[patientIndex].visits = patients[patientIndex].visits.filter(
    (v) => v.id !== visitId
  );

  if (patients[patientIndex].visits.length === originalLength) return false;

  patients[patientIndex].updatedAt = new Date().toISOString();
  savePatients(patients);
  return true;
};

// Alert Management
export const getAlerts = (): PatternAlert[] => {
  if (typeof window === "undefined") return [];
  const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
  return data ? JSON.parse(data) : [];
};

export const saveAlerts = (alerts: PatternAlert[]): void => {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(alerts));
};

export const addAlert = (
  alert: Omit<PatternAlert, "id" | "createdAt">
): PatternAlert => {
  const alerts = getAlerts();
  const newAlert: PatternAlert = {
    ...alert,
    id: generateId(),
    createdAt: new Date().toISOString(),
  };
  alerts.push(newAlert);
  saveAlerts(alerts);
  return newAlert;
};

export const markAlertAsRead = (alertId: string): boolean => {
  const alerts = getAlerts();
  const index = alerts.findIndex((a) => a.id === alertId);
  if (index === -1) return false;

  alerts[index].isRead = true;
  saveAlerts(alerts);
  return true;
};

export const deleteAlert = (alertId: string): boolean => {
  const alerts = getAlerts();
  const filtered = alerts.filter((a) => a.id !== alertId);
  if (filtered.length === alerts.length) return false;
  saveAlerts(filtered);
  return true;
};

// Analytics
export const getAnalyticsData = (): AnalyticsData => {
  const patients = getPatients();
  const allVisits = patients.flatMap((p) => p.visits);

  // Common symptoms
  const symptomCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    visit.symptoms.forEach((symptom) => {
      symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
    });
  });

  // Common diagnoses
  const diagnosisCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    diagnosisCounts[visit.diagnosis] =
      (diagnosisCounts[visit.diagnosis] || 0) + 1;
  });

  // Severity distribution
  const severityCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    severityCounts[visit.severity] = (severityCounts[visit.severity] || 0) + 1;
  });

  // Visit frequency by month
  const monthCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    const month = new Date(visit.date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
    });
    monthCounts[month] = (monthCounts[month] || 0) + 1;
  });

  return {
    totalPatients: patients.length,
    totalVisits: allVisits.length,
    commonSymptoms: Object.entries(symptomCounts)
      .map(([symptom, count]) => ({ symptom, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    commonDiagnoses: Object.entries(diagnosisCounts)
      .map(([diagnosis, count]) => ({ diagnosis, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10),
    averageHealingDuration:
      allVisits.length > 0
        ? allVisits.reduce((sum, visit) => sum + visit.healingDuration, 0) /
          allVisits.length
        : 0,
    visitFrequency: Object.entries(monthCounts)
      .map(([month, count]) => ({ month, count }))
      .sort(
        (a, b) => new Date(a.month).getTime() - new Date(b.month).getTime()
      ),
    severityDistribution: Object.entries(severityCounts).map(
      ([severity, count]) => ({ severity, count })
    ),
  };
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const exportData = (): string => {
  const data = {
    patients: getPatients(),
    alerts: getAlerts(),
    exportDate: new Date().toISOString(),
  };
  return JSON.stringify(data, null, 2);
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);
    if (data.patients) savePatients(data.patients);
    if (data.alerts) saveAlerts(data.alerts);
    return true;
  } catch (error) {
    console.error("Import failed:", error);
    return false;
  }
};
