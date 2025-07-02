"use client";

import { useState, useEffect } from "react";
import {
  getPatients,
  getAlerts,
  getSettings,
  getPatternConfig,
  getMedicineList,
  getStorageInfo,
} from "../utils/localStorageUtils";

export default function DataValidator() {
  const [data, setData] = useState<any>(null);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    const validateData = () => {
      try {
        const patients = getPatients();
        const alerts = getAlerts();
        const settings = getSettings();
        const patternConfig = getPatternConfig();
        const medicineList = getMedicineList();
        const storageInfo = getStorageInfo();

        setData({
          patients,
          alerts,
          settings,
          patternConfig,
          medicineList,
          storageInfo,
          validation: {
            patientsValid: Array.isArray(patients),
            alertsValid: Array.isArray(alerts),
            settingsValid: typeof settings === "object",
            patternConfigValid: typeof patternConfig === "object",
            medicineListValid: Array.isArray(medicineList),
            totalPatients: patients.length,
            totalVisits: patients.reduce((sum, p) => sum + p.visits.length, 0),
            totalAlerts: alerts.length,
            storageUsed: storageInfo.storageUsed,
          },
        });
      } catch (error) {
        console.error("Data validation error:", error);
        setData({ error: error.message });
      }
    };

    validateData();
  }, []);

  if (!showDebug) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <button
          onClick={() => setShowDebug(true)}
          className="bg-gray-800 text-white px-3 py-2 rounded-md text-sm hover:bg-gray-700"
        >
          🔍 Debug Data
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">
                Data Storage Validation
              </h2>
              <button
                onClick={() => setShowDebug(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            {data?.error ? (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-red-800 font-medium">Error</h3>
                <p className="text-red-600">{data.error}</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Validation Summary */}
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="text-blue-800 font-medium mb-2">
                    Storage Validation Summary
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Patients:</span>{" "}
                      {data?.validation?.totalPatients || 0}
                    </div>
                    <div>
                      <span className="font-medium">Visits:</span>{" "}
                      {data?.validation?.totalVisits || 0}
                    </div>
                    <div>
                      <span className="font-medium">Alerts:</span>{" "}
                      {data?.validation?.totalAlerts || 0}
                    </div>
                    <div>
                      <span className="font-medium">Storage:</span>{" "}
                      {data?.validation?.storageUsed || "0 KB"}
                    </div>
                  </div>
                </div>

                {/* Data Structure Validation */}
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <h3 className="text-green-800 font-medium mb-2">
                    Data Structure Validation
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          data?.validation?.patientsValid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Patients Array
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          data?.validation?.alertsValid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Alerts Array
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          data?.validation?.settingsValid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Settings Object
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          data?.validation?.patternConfigValid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Pattern Config
                    </div>
                    <div className="flex items-center">
                      <span
                        className={`w-3 h-3 rounded-full mr-2 ${
                          data?.validation?.medicineListValid
                            ? "bg-green-500"
                            : "bg-red-500"
                        }`}
                      ></span>
                      Medicine List
                    </div>
                  </div>
                </div>

                {/* Raw Data (Collapsible) */}
                <details className="bg-gray-50 border border-gray-200 rounded-md">
                  <summary className="p-4 cursor-pointer font-medium text-gray-700">
                    Raw Data (Click to expand)
                  </summary>
                  <div className="p-4 border-t border-gray-200">
                    <pre className="text-xs overflow-x-auto bg-white p-4 rounded border">
                      {JSON.stringify(data, null, 2)}
                    </pre>
                  </div>
                </details>

                {/* LocalStorage Keys */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="text-yellow-800 font-medium mb-2">
                    LocalStorage Keys
                  </h3>
                  <div className="text-sm space-y-1">
                    {typeof window !== "undefined" &&
                      Object.keys(localStorage)
                        .filter((key) => key.startsWith("health_"))
                        .map((key) => (
                          <div key={key} className="flex justify-between">
                            <span className="font-mono">{key}</span>
                            <span className="text-gray-600">
                              {localStorage.getItem(key)?.length || 0} chars
                            </span>
                          </div>
                        ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
