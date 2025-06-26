"use client";

import { useState, useEffect } from "react";
import { Patient, Visit } from "../utils/types";
import {
  getPatients,
  deletePatient,
  getPatient,
} from "../utils/localStorageUtils";
import { getPatternInsights, getHealthTrends } from "../utils/patternDetection";

interface PatientTableProps {
  onEditPatient: (patient: Patient) => void;
  onViewPatient: (patient: Patient) => void;
  refreshTrigger: number;
}

export default function PatientTable({
  onEditPatient,
  onViewPatient,
  refreshTrigger,
}: PatientTableProps) {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState<"name" | "age" | "visits" | "lastVisit">(
    "name"
  );
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    loadPatients();
  }, [refreshTrigger]);

  const loadPatients = () => {
    const patientsData = getPatients();
    setPatients(patientsData);
  };

  const handleDelete = (patientId: string) => {
    if (
      confirm(
        "Are you sure you want to delete this patient? This action cannot be undone."
      )
    ) {
      deletePatient(patientId);
      loadPatients();
    }
  };

  const handleSort = (field: "name" | "age" | "visits" | "lastVisit") => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const getSortedPatients = () => {
    let filtered = patients.filter(
      (patient) =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.contactInfo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      let aValue: any, bValue: any;

      switch (sortBy) {
        case "name":
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
        case "age":
          aValue = a.age;
          bValue = b.age;
          break;
        case "visits":
          aValue = a.visits.length;
          bValue = b.visits.length;
          break;
        case "lastVisit":
          const aLastVisit =
            a.visits.length > 0
              ? new Date(
                  Math.max(...a.visits.map((v) => new Date(v.date).getTime()))
                )
              : new Date(0);
          const bLastVisit =
            b.visits.length > 0
              ? new Date(
                  Math.max(...b.visits.map((v) => new Date(v.date).getTime()))
                )
              : new Date(0);
          aValue = aLastVisit.getTime();
          bValue = bLastVisit.getTime();
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === "asc" ? -1 : 1;
      if (aValue > bValue) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const getLastVisitDate = (patient: Patient) => {
    if (patient.visits.length === 0) return "No visits";
    const lastVisit = patient.visits.reduce((latest, visit) =>
      new Date(visit.date) > new Date(latest.date) ? visit : latest
    );
    return new Date(lastVisit.date).toLocaleDateString();
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "severe":
        return "text-red-600 bg-red-100";
      case "moderate":
        return "text-yellow-600 bg-yellow-100";
      case "mild":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getHealthStatus = (patient: Patient) => {
    if (patient.visits.length === 0)
      return { status: "No Data", color: "text-gray-500" };

    const trends = getHealthTrends(patient);
    if (trends.improving)
      return { status: "Improving", color: "text-green-600" };
    if (trends.worsening) return { status: "Worsening", color: "text-red-600" };
    return { status: "Stable", color: "text-blue-600" };
  };

  const sortedPatients = getSortedPatients();

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Search and Filters */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search patients by name or contact..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="text-sm text-gray-500">
            {sortedPatients.length} of {patients.length} patients
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("name")}
              >
                <div className="flex items-center space-x-1">
                  <span>Patient</span>
                  {sortBy === "name" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("age")}
              >
                <div className="flex items-center space-x-1">
                  <span>Age/Gender</span>
                  {sortBy === "age" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("visits")}
              >
                <div className="flex items-center space-x-1">
                  <span>Visits</span>
                  {sortBy === "visits" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort("lastVisit")}
              >
                <div className="flex items-center space-x-1">
                  <span>Last Visit</span>
                  {sortBy === "lastVisit" && (
                    <span>{sortOrder === "asc" ? "↑" : "↓"}</span>
                  )}
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Health Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedPatients.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-12 text-center text-gray-500"
                >
                  {searchTerm
                    ? "No patients found matching your search."
                    : "No patients yet. Add your first patient to get started."}
                </td>
              </tr>
            ) : (
              sortedPatients.map((patient) => {
                const healthStatus = getHealthStatus(patient);
                const lastVisit =
                  patient.visits.length > 0
                    ? patient.visits.reduce((latest, visit) =>
                        new Date(visit.date) > new Date(latest.date)
                          ? visit
                          : latest
                      )
                    : null;

                return (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {patient.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {patient.contactInfo}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.age} years
                      </div>
                      <div className="text-sm text-gray-500 capitalize">
                        {patient.gender}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {patient.visits.length}
                      </div>
                      {lastVisit && (
                        <div className="text-sm text-gray-500">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(
                              lastVisit.severity
                            )}`}
                          >
                            {lastVisit.severity}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getLastVisitDate(patient)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-medium ${healthStatus.color}`}
                      >
                        {healthStatus.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => onViewPatient(patient)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={() => onEditPatient(patient)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(patient.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
