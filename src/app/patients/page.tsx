"use client";

import { useState, useEffect } from "react";
import { Patient } from "../../utils/types";
import { getPatients } from "../../utils/localStorageUtils";
import PatientForm from "../../components/PatientForm";
import PatientTable from "../../components/PatientTable";

export default function PatientsPage() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState<Patient | undefined>();
  const [viewingPatient, setViewingPatient] = useState<Patient | undefined>();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = () => {
    const patientsData = getPatients();
    setPatients(patientsData);
    setRefreshTrigger((prev) => prev + 1);
  };

  const handleSave = () => {
    loadPatients();
    setShowForm(false);
    setEditingPatient(undefined);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPatient(undefined);
  };

  const handleEditPatient = (patient: Patient) => {
    setEditingPatient(patient);
    setShowForm(true);
  };

  const handleViewPatient = (patient: Patient) => {
    setViewingPatient(patient);
  };

  const closePatientView = () => {
    setViewingPatient(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Patient Records
            </h1>
            <p className="mt-2 text-gray-600">
              Manage your patient records and medical history
            </p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add New Patient
          </button>
        </div>
      </div>

      {/* Patient Form */}
      {showForm && (
        <PatientForm
          patient={editingPatient}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}

      {/* Patient Table */}
      <PatientTable
        onEditPatient={handleEditPatient}
        onViewPatient={handleViewPatient}
        refreshTrigger={refreshTrigger}
      />

      {/* Patient Detail View */}
      {viewingPatient && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-gray-900">
                  {viewingPatient.name}
                </h3>
                <button
                  onClick={closePatientView}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {/* Patient Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Patient Information
                  </h4>
                  <div className="space-y-2">
                    <p>
                      <span className="font-medium">Age:</span>{" "}
                      {viewingPatient.age} years
                    </p>
                    <p>
                      <span className="font-medium">Gender:</span>{" "}
                      {viewingPatient.gender}
                    </p>
                    <p>
                      <span className="font-medium">Contact:</span>{" "}
                      {viewingPatient.contactInfo}
                    </p>
                    <p>
                      <span className="font-medium">Total Visits:</span>{" "}
                      {viewingPatient.visits.length}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="text-lg font-medium text-gray-900 mb-2">
                    Quick Actions
                  </h4>
                  <div className="space-y-2">
                    <button
                      onClick={() => {
                        closePatientView();
                        handleEditPatient(viewingPatient);
                      }}
                      className="w-full px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
                    >
                      Edit Patient
                    </button>
                    <button
                      onClick={() => {
                        closePatientView();
                        setEditingPatient(viewingPatient);
                        setShowForm(true);
                      }}
                      className="w-full px-3 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm"
                    >
                      Add Visit
                    </button>
                  </div>
                </div>
              </div>

              {/* Visit History */}
              <div>
                <h4 className="text-lg font-medium text-gray-900 mb-4">
                  Visit History
                </h4>
                {viewingPatient.visits.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    No visits recorded yet
                  </p>
                ) : (
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {viewingPatient.visits
                      .sort(
                        (a, b) =>
                          new Date(b.date).getTime() -
                          new Date(a.date).getTime()
                      )
                      .map((visit) => (
                        <div key={visit.id} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">
                              {new Date(visit.date).toLocaleDateString()}
                            </h5>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                visit.severity === "severe"
                                  ? "text-red-600 bg-red-100"
                                  : visit.severity === "moderate"
                                  ? "text-yellow-600 bg-yellow-100"
                                  : "text-green-600 bg-green-100"
                              }`}
                            >
                              {visit.severity}
                            </span>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p>
                                <span className="font-medium">Diagnosis:</span>{" "}
                                {visit.diagnosis}
                              </p>
                              <p>
                                <span className="font-medium">Treatment:</span>{" "}
                                {visit.treatment}
                              </p>
                              <p>
                                <span className="font-medium">
                                  Healing Duration:
                                </span>{" "}
                                {visit.healingDuration} days
                              </p>
                            </div>
                            <div>
                              <p>
                                <span className="font-medium">Symptoms:</span>
                              </p>
                              <ul className="list-disc list-inside">
                                {visit.symptoms.map((symptom, index) => (
                                  <li key={index}>{symptom}</li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          {visit.notes && (
                            <div className="mt-2">
                              <p>
                                <span className="font-medium">Notes:</span>{" "}
                                {visit.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
