"use client";

import { useEffect, useState } from "react";
import {
  getPatients,
  getAlerts,
  getAnalyticsData,
} from "../utils/localStorageUtils";
import { Patient, PatternAlert } from "../utils/types";
import { runPatternDetection } from "../utils/patternDetection";

export default function Dashboard() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [alerts, setAlerts] = useState<PatternAlert[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    const patientsData = getPatients();
    const alertsData = getAlerts();
    const analyticsData = getAnalyticsData();

    setPatients(patientsData);
    setAlerts(alertsData);
    setAnalytics(analyticsData);
    setLoading(false);

    // Run pattern detection
    runPatternDetection();
  };

  const getUnreadAlertsCount = () =>
    alerts.filter((alert) => !alert.isRead).length;
  const getRecentPatients = () => patients.slice(-5).reverse();
  const getRecentVisits = () => {
    const allVisits = patients.flatMap((p) =>
      p.visits.map((v) => ({ ...v, patientName: p.name }))
    );
    return allVisits
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">Patient Record Management System</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">👥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Total Patients
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalPatients || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">🏥</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Visits</p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.totalVisits || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">⚠️</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Active Alerts</p>
              <p className="text-2xl font-semibold text-gray-900">
                {getUnreadAlertsCount()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                <span className="text-white text-sm font-medium">📊</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">
                Avg Healing Days
              </p>
              <p className="text-2xl font-semibold text-gray-900">
                {analytics?.averageHealingDuration
                  ? Math.round(analytics.averageHealingDuration)
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Patients */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">
              Recent Patients
            </h3>
          </div>
          <div className="p-6">
            {getRecentPatients().length === 0 ? (
              <p className="text-gray-500 text-center py-4">No patients yet</p>
            ) : (
              <div className="space-y-4">
                {getRecentPatients().map((patient) => (
                  <div
                    key={patient.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {patient.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {patient.age} years • {patient.gender}
                      </p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {patient.visits.length} visits
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Visits */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Recent Visits</h3>
          </div>
          <div className="p-6">
            {getRecentVisits().length === 0 ? (
              <p className="text-gray-500 text-center py-4">No visits yet</p>
            ) : (
              <div className="space-y-4">
                {getRecentVisits().map((visit) => (
                  <div
                    key={visit.id}
                    className="flex items-center justify-between"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {visit.patientName}
                      </p>
                      <p className="text-sm text-gray-500">{visit.diagnosis}</p>
                    </div>
                    <div className="text-sm text-gray-500">
                      {new Date(visit.date).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/patients"
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Add New Patient
          </a>
          <a
            href="/analytics"
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            View Analytics
          </a>
          <button
            onClick={loadData}
            className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Refresh Data
          </button>
        </div>
      </div>
    </div>
  );
}
