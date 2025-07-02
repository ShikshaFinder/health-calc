import { Patient, Visit, PatternAlert, AnalyticsData } from "./types";

const STORAGE_KEYS = {
  PATIENTS: "health_patients",
  ALERTS: "health_alerts",
  SETTINGS: "health_settings",
  PATTERN_CONFIG: "health_pattern_config",
  MEDICINE_LIST: "health_medicine_list",
  BACKUP_DATA: "health_backup_data",
};

// Default medicine list
const DEFAULT_MEDICINE_LIST = [
  "Paracetamol",
  "Ibuprofen",
  "Amoxicillin",
  "Azithromycin",
  "Cetirizine",
  "Metformin",
  "Atorvastatin",
  "Omeprazole",
  "Amlodipine",
  "Losartan",
  "Aspirin",
  "Diclofenac",
  "Omeprazole",
  "Pantoprazole",
  "Ranitidine",
  "Cetirizine",
  "Loratadine",
  "Montelukast",
  "Salbutamol",
  "Budesonide",
];

// Default pattern detection configuration
const DEFAULT_PATTERN_CONFIG = {
  symptomRepeatThreshold: 3,
  symptomRepeatDays: 30,
  frequentVisitThreshold: 5,
  frequentVisitDays: 30,
  severeCaseThreshold: 2,
  severeCaseDays: 7,
};

// Settings interface
export interface AppSettings {
  theme: "light" | "dark";
  language: string;
  dateFormat: string;
  timeFormat: "12h" | "24h";
  autoBackup: boolean;
  backupInterval: number; // in days
  lastBackup: string;
}

// Complete data structure for export/import
export interface CompleteDataExport {
  patients: Patient[];
  alerts: PatternAlert[];
  settings: AppSettings;
  patternConfig: any;
  medicineList: string[];
  exportDate: string;
  version: string;
  totalRecords: number;
}

// Initialize storage with default values
export const initializeStorage = (): void => {
  if (typeof window === "undefined") return;

  try {
    // Initialize settings if not exists
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      const defaultSettings: AppSettings = {
        theme: "light",
        language: "en",
        dateFormat: "MM/DD/YYYY",
        timeFormat: "12h",
        autoBackup: true,
        backupInterval: 7,
        lastBackup: new Date().toISOString(),
      };
      localStorage.setItem(
        STORAGE_KEYS.SETTINGS,
        JSON.stringify(defaultSettings)
      );
    }

    // Initialize pattern config if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PATTERN_CONFIG)) {
      localStorage.setItem(
        STORAGE_KEYS.PATTERN_CONFIG,
        JSON.stringify(DEFAULT_PATTERN_CONFIG)
      );
    }

    // Initialize medicine list if not exists
    if (!localStorage.getItem(STORAGE_KEYS.MEDICINE_LIST)) {
      localStorage.setItem(
        STORAGE_KEYS.MEDICINE_LIST,
        JSON.stringify(DEFAULT_MEDICINE_LIST)
      );
    }

    // Initialize other storage keys if not exists
    if (!localStorage.getItem(STORAGE_KEYS.PATIENTS)) {
      localStorage.setItem(STORAGE_KEYS.PATIENTS, JSON.stringify([]));
    }

    if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
      localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
  }
};

// Settings Management
export const getSettings = (): AppSettings => {
  if (typeof window === "undefined") {
    return {
      theme: "light",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      autoBackup: true,
      backupInterval: 7,
      lastBackup: new Date().toISOString(),
    };
  }

  try {
    const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return data
      ? JSON.parse(data)
      : {
          theme: "light",
          language: "en",
          dateFormat: "MM/DD/YYYY",
          timeFormat: "12h",
          autoBackup: true,
          backupInterval: 7,
          lastBackup: new Date().toISOString(),
        };
  } catch (error) {
    console.error("Failed to get settings:", error);
    return {
      theme: "light",
      language: "en",
      dateFormat: "MM/DD/YYYY",
      timeFormat: "12h",
      autoBackup: true,
      backupInterval: 7,
      lastBackup: new Date().toISOString(),
    };
  }
};

export const saveSettings = (settings: AppSettings): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (error) {
    console.error("Failed to save settings:", error);
  }
};

// Pattern Configuration Management
export const getPatternConfig = (): any => {
  if (typeof window === "undefined") return DEFAULT_PATTERN_CONFIG;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PATTERN_CONFIG);
    return data ? JSON.parse(data) : DEFAULT_PATTERN_CONFIG;
  } catch (error) {
    console.error("Failed to get pattern config:", error);
    return DEFAULT_PATTERN_CONFIG;
  }
};

export const savePatternConfig = (config: any): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.PATTERN_CONFIG, JSON.stringify(config));
  } catch (error) {
    console.error("Failed to save pattern config:", error);
  }
};

// Medicine List Management
export const getMedicineList = (): string[] => {
  if (typeof window === "undefined") return DEFAULT_MEDICINE_LIST;

  try {
    const data = localStorage.getItem(STORAGE_KEYS.MEDICINE_LIST);
    return data ? JSON.parse(data) : DEFAULT_MEDICINE_LIST;
  } catch (error) {
    console.error("Failed to get medicine list:", error);
    return DEFAULT_MEDICINE_LIST;
  }
};

export const saveMedicineList = (medicines: string[]): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(STORAGE_KEYS.MEDICINE_LIST, JSON.stringify(medicines));
  } catch (error) {
    console.error("Failed to save medicine list:", error);
  }
};

export const addMedicine = (medicine: string): void => {
  const medicines = getMedicineList();
  if (!medicines.includes(medicine)) {
    medicines.push(medicine);
    saveMedicineList(medicines);
  }
};

// Patient Management with validation
export const getPatients = (): Patient[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.PATIENTS);
    const patients = data ? JSON.parse(data) : [];

    // Validate and fix patient data
    return patients.map((patient: any) => ({
      id: patient.id || generateId(),
      name: patient.name || "",
      age:
        typeof patient.age === "number"
          ? patient.age
          : parseInt(patient.age) || 0,
      gender: ["male", "female", "other"].includes(patient.gender)
        ? patient.gender
        : "male",
      contactInfo: patient.contactInfo || "",
      visits: Array.isArray(patient.visits)
        ? patient.visits.map(validateVisit)
        : [],
      createdAt: patient.createdAt || new Date().toISOString(),
      updatedAt: patient.updatedAt || new Date().toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get patients:", error);
    return [];
  }
};

export const savePatients = (patients: Patient[]): void => {
  if (typeof window === "undefined") return;

  try {
    // Validate all patients before saving
    const validatedPatients = patients.map(validatePatient);
    localStorage.setItem(
      STORAGE_KEYS.PATIENTS,
      JSON.stringify(validatedPatients)
    );
  } catch (error) {
    console.error("Failed to save patients:", error);
  }
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

  const validatedPatient = validatePatient(newPatient);
  patients.push(validatedPatient);
  savePatients(patients);
  return validatedPatient;
};

export const updatePatient = (
  id: string,
  updates: Partial<Patient>
): Patient | null => {
  const patients = getPatients();
  const index = patients.findIndex((p) => p.id === id);
  if (index === -1) return null;

  patients[index] = validatePatient({
    ...patients[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  });
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

// Visit Management with validation
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

  const validatedVisit = validateVisit(newVisit);
  patients[patientIndex].visits.push(validatedVisit);
  patients[patientIndex].updatedAt = new Date().toISOString();
  savePatients(patients);

  return validatedVisit;
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

  patients[patientIndex].visits[visitIndex] = validateVisit({
    ...patients[patientIndex].visits[visitIndex],
    ...updates,
  });
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

// Alert Management with validation
export const getAlerts = (): PatternAlert[] => {
  if (typeof window === "undefined") return [];

  try {
    const data = localStorage.getItem(STORAGE_KEYS.ALERTS);
    const alerts = data ? JSON.parse(data) : [];

    // Validate and fix alert data
    return alerts.map((alert: any) => ({
      id: alert.id || generateId(),
      type: ["symptom_repeat", "frequent_visits", "severe_case"].includes(
        alert.type
      )
        ? alert.type
        : "symptom_repeat",
      message: alert.message || "",
      patientId: alert.patientId || "",
      severity: ["low", "medium", "high"].includes(alert.severity)
        ? alert.severity
        : "low",
      createdAt: alert.createdAt || new Date().toISOString(),
      isRead: typeof alert.isRead === "boolean" ? alert.isRead : false,
    }));
  } catch (error) {
    console.error("Failed to get alerts:", error);
    return [];
  }
};

export const saveAlerts = (alerts: PatternAlert[]): void => {
  if (typeof window === "undefined") return;

  try {
    const validatedAlerts = alerts.map(validateAlert);
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify(validatedAlerts));
  } catch (error) {
    console.error("Failed to save alerts:", error);
  }
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

  const validatedAlert = validateAlert(newAlert);
  alerts.push(validatedAlert);
  saveAlerts(alerts);
  return validatedAlert;
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

// Analytics with improved data processing
export const getAnalyticsData = (): AnalyticsData => {
  const patients = getPatients();
  const allVisits = patients.flatMap((p) => p.visits);

  // Common symptoms
  const symptomCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    if (Array.isArray(visit.symptoms)) {
      visit.symptoms.forEach((symptom) => {
        if (symptom && symptom.trim()) {
          symptomCounts[symptom] = (symptomCounts[symptom] || 0) + 1;
        }
      });
    }
  });

  // Common diagnoses
  const diagnosisCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    if (visit.diagnosis && visit.diagnosis.trim()) {
      diagnosisCounts[visit.diagnosis] =
        (diagnosisCounts[visit.diagnosis] || 0) + 1;
    }
  });

  // Severity distribution
  const severityCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    severityCounts[visit.severity] = (severityCounts[visit.severity] || 0) + 1;
  });

  // Visit frequency by month
  const monthCounts: { [key: string]: number } = {};
  allVisits.forEach((visit) => {
    try {
      const month = new Date(visit.date).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
      monthCounts[month] = (monthCounts[month] || 0) + 1;
    } catch (error) {
      console.error("Invalid date in visit:", visit.date);
    }
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
        ? allVisits.reduce(
            (sum, visit) => sum + (visit.healingDuration || 0),
            0
          ) / allVisits.length
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

// Data validation functions
const validatePatient = (patient: any): Patient => {
  return {
    id: patient.id || generateId(),
    name: patient.name || "",
    age:
      typeof patient.age === "number"
        ? patient.age
        : parseInt(patient.age) || 0,
    gender: ["male", "female", "other"].includes(patient.gender)
      ? patient.gender
      : "male",
    contactInfo: patient.contactInfo || "",
    visits: Array.isArray(patient.visits)
      ? patient.visits.map(validateVisit)
      : [],
    createdAt: patient.createdAt || new Date().toISOString(),
    updatedAt: patient.updatedAt || new Date().toISOString(),
  };
};

const validateVisit = (visit: any): Visit => {
  return {
    id: visit.id || generateId(),
    date: visit.date || new Date().toISOString().split("T")[0],
    symptoms: Array.isArray(visit.symptoms)
      ? visit.symptoms.filter((s: string) => s && s.trim())
      : [],
    diagnosis: visit.diagnosis || "",
    treatment: visit.treatment || "",
    severity: ["mild", "moderate", "severe"].includes(visit.severity)
      ? visit.severity
      : "mild",
    healingDuration:
      typeof visit.healingDuration === "number"
        ? visit.healingDuration
        : parseInt(visit.healingDuration) || 1,
    notes: visit.notes || "",
    createdAt: visit.createdAt || new Date().toISOString(),
    medicines: Array.isArray(visit.medicines) ? visit.medicines : [],
    repeat: visit.repeat
      ? {
          enabled:
            typeof visit.repeat.enabled === "boolean"
              ? visit.repeat.enabled
              : false,
          times:
            typeof visit.repeat.times === "number"
              ? visit.repeat.times
              : parseInt(visit.repeat.times) || 1,
          intervalDays:
            typeof visit.repeat.intervalDays === "number"
              ? visit.repeat.intervalDays
              : parseInt(visit.repeat.intervalDays) || 1,
        }
      : undefined,
  };
};

const validateAlert = (alert: any): PatternAlert => {
  return {
    id: alert.id || generateId(),
    type: ["symptom_repeat", "frequent_visits", "severe_case"].includes(
      alert.type
    )
      ? alert.type
      : "symptom_repeat",
    message: alert.message || "",
    patientId: alert.patientId || "",
    severity: ["low", "medium", "high"].includes(alert.severity)
      ? alert.severity
      : "low",
    createdAt: alert.createdAt || new Date().toISOString(),
    isRead: typeof alert.isRead === "boolean" ? alert.isRead : false,
  };
};

// Utility functions
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Enhanced export/import functions
export const exportData = (): CompleteDataExport => {
  const patients = getPatients();
  const alerts = getAlerts();
  const settings = getSettings();
  const patternConfig = getPatternConfig();
  const medicineList = getMedicineList();

  const totalRecords = patients.length + alerts.length;

  return {
    patients,
    alerts,
    settings,
    patternConfig,
    medicineList,
    exportDate: new Date().toISOString(),
    version: "1.0.0",
    totalRecords,
  };
};

export const exportDataAsJSON = (): string => {
  const data = exportData();
  return JSON.stringify(data, null, 2);
};

export const downloadDataAsJSON = (): void => {
  if (typeof window === "undefined") return;

  try {
    const data = exportDataAsJSON();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health_data_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download JSON:", error);
  }
};

export const importData = (jsonData: string): boolean => {
  try {
    const data = JSON.parse(jsonData);

    // Import all data types
    if (data.patients) savePatients(data.patients);
    if (data.alerts) saveAlerts(data.alerts);
    if (data.settings) saveSettings(data.settings);
    if (data.patternConfig) savePatternConfig(data.patternConfig);
    if (data.medicineList) saveMedicineList(data.medicineList);

    return true;
  } catch (error) {
    console.error("Import failed:", error);
    return false;
  }
};

export const importDataFromFile = (file: File): Promise<boolean> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const success = importData(content);
        resolve(success);
      } catch (error) {
        console.error("File import failed:", error);
        resolve(false);
      }
    };
    reader.onerror = () => resolve(false);
    reader.readAsText(file);
  });
};

// Backup and restore functions
export const createBackup = (): void => {
  if (typeof window === "undefined") return;

  try {
    const data = exportData();
    localStorage.setItem(STORAGE_KEYS.BACKUP_DATA, JSON.stringify(data));

    // Update last backup time
    const settings = getSettings();
    settings.lastBackup = new Date().toISOString();
    saveSettings(settings);
  } catch (error) {
    console.error("Failed to create backup:", error);
  }
};

export const restoreFromBackup = (): boolean => {
  if (typeof window === "undefined") return false;

  try {
    const backupData = localStorage.getItem(STORAGE_KEYS.BACKUP_DATA);
    if (!backupData) return false;

    return importData(backupData);
  } catch (error) {
    console.error("Failed to restore from backup:", error);
    return false;
  }
};

export const clearAllData = (): void => {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(STORAGE_KEYS.PATIENTS);
    localStorage.removeItem(STORAGE_KEYS.ALERTS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.PATTERN_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.MEDICINE_LIST);
    localStorage.removeItem(STORAGE_KEYS.BACKUP_DATA);

    // Reinitialize with defaults
    initializeStorage();
  } catch (error) {
    console.error("Failed to clear data:", error);
  }
};

// Storage information
export const getStorageInfo = (): {
  totalSize: number;
  patientsCount: number;
  alertsCount: number;
  lastBackup: string;
  storageUsed: string;
} => {
  if (typeof window === "undefined") {
    return {
      totalSize: 0,
      patientsCount: 0,
      alertsCount: 0,
      lastBackup: "",
      storageUsed: "0 KB",
    };
  }

  try {
    const patients = getPatients();
    const alerts = getAlerts();
    const settings = getSettings();

    const totalSize =
      JSON.stringify(patients).length +
      JSON.stringify(alerts).length +
      JSON.stringify(settings).length;

    const storageUsed =
      totalSize > 1024
        ? `${(totalSize / 1024).toFixed(2)} KB`
        : `${totalSize} bytes`;

    return {
      totalSize,
      patientsCount: patients.length,
      alertsCount: alerts.length,
      lastBackup: settings.lastBackup,
      storageUsed,
    };
  } catch (error) {
    console.error("Failed to get storage info:", error);
    return {
      totalSize: 0,
      patientsCount: 0,
      alertsCount: 0,
      lastBackup: "",
      storageUsed: "0 KB",
    };
  }
};

// CSV Export and Import functions (improved)
export const exportDataAsCSV = (): string => {
  const patients = getPatients();

  // Create CSV header with all fields
  const headers = [
    "Patient ID",
    "Patient Name",
    "Age",
    "Gender",
    "Contact Info",
    "Patient Created At",
    "Patient Updated At",
    "Visit ID",
    "Visit Date",
    "Symptoms",
    "Diagnosis",
    "Treatment",
    "Severity",
    "Healing Duration (days)",
    "Notes",
    "Medicines",
    "Repeat Enabled",
    "Repeat Times",
    "Repeat Interval Days",
    "Visit Created At",
  ].join(",");

  // Create CSV rows with all data
  const rows = patients.flatMap((patient) =>
    patient.visits.map((visit) =>
      [
        patient.id,
        `"${patient.name.replace(/"/g, '""')}"`,
        patient.age,
        patient.gender,
        `"${patient.contactInfo.replace(/"/g, '""')}"`,
        patient.createdAt,
        patient.updatedAt,
        visit.id,
        visit.date,
        `"${visit.symptoms.join("; ").replace(/"/g, '""')}"`,
        `"${visit.diagnosis.replace(/"/g, '""')}"`,
        `"${visit.treatment.replace(/"/g, '""')}"`,
        visit.severity,
        visit.healingDuration,
        `"${visit.notes.replace(/"/g, '""')}"`,
        `"${(visit.medicines || []).join("; ").replace(/"/g, '""')}"`,
        visit.repeat?.enabled ? "true" : "false",
        visit.repeat?.times || "",
        visit.repeat?.intervalDays || "",
        visit.createdAt,
      ].join(",")
    )
  );

  return [headers, ...rows].join("\n");
};

export const downloadDataAsCSV = (): void => {
  if (typeof window === "undefined") return;

  try {
    const data = exportDataAsCSV();
    const blob = new Blob([data], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `health_data_${new Date().toISOString().split("T")[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Failed to download CSV:", error);
  }
};

export const importDataFromCSV = (csvData: string): boolean => {
  try {
    const lines = csvData.trim().split("\n");
    if (lines.length < 2) return false; // Need at least header and one data row

    const headers = lines[0].split(",").map((h) => h.trim());
    const dataRows = lines.slice(1);

    // Group data by patient
    const patientMap = new Map<string, any>();

    dataRows.forEach((row) => {
      const values = parseCSVRow(row);
      if (values.length < headers.length) return; // Skip invalid rows

      const patientId = values[0];
      const visitId = values[7];

      if (!patientMap.has(patientId)) {
        patientMap.set(patientId, {
          id: patientId,
          name: values[1].replace(/^"|"$/g, ""),
          age: parseInt(values[2]) || 0,
          gender: values[3] as "male" | "female" | "other",
          contactInfo: values[4].replace(/^"|"$/g, ""),
          visits: [],
          createdAt: values[5],
          updatedAt: values[6],
        });
      }

      const patient = patientMap.get(patientId);
      const visit = {
        id: visitId,
        date: values[8],
        symptoms: values[9]
          .replace(/^"|"$/g, "")
          .split("; ")
          .filter((s) => s.trim()),
        diagnosis: values[10].replace(/^"|"$/g, ""),
        treatment: values[11].replace(/^"|"$/g, ""),
        severity: values[12] as "mild" | "moderate" | "severe",
        healingDuration: parseInt(values[13]) || 0,
        notes: values[14].replace(/^"|"$/g, ""),
        medicines: values[15]
          .replace(/^"|"$/g, "")
          .split("; ")
          .filter((s) => s.trim()),
        repeat:
          values[16] === "true"
            ? {
                enabled: true,
                times: parseInt(values[17]) || 1,
                intervalDays: parseInt(values[18]) || 1,
              }
            : undefined,
        createdAt: values[19],
      };

      // Check if visit already exists
      const existingVisitIndex = patient.visits.findIndex(
        (v: any) => v.id === visitId
      );
      if (existingVisitIndex === -1) {
        patient.visits.push(visit);
      }
    });

    // Convert map to array and save
    const patients = Array.from(patientMap.values());
    savePatients(patients);
    return true;
  } catch (error) {
    console.error("CSV import failed:", error);
    return false;
  }
};

// Helper function to parse CSV row with proper quote handling
const parseCSVRow = (row: string): string[] => {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < row.length; i++) {
    const char = row[i];

    if (char === '"') {
      if (inQuotes && row[i + 1] === '"') {
        // Escaped quote
        current += '"';
        i++; // Skip next quote
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // End of field
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }

  // Add the last field
  result.push(current);
  return result;
};

// Initialize storage when module is loaded
if (typeof window !== "undefined") {
  initializeStorage();
}
