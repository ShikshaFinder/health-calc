"use client";

import { useState, useEffect } from "react";
import { Patient, Visit } from "../utils/types";
import {
  addPatient,
  updatePatient,
  addVisit,
} from "../utils/localStorageUtils";

interface PatientFormProps {
  patient?: Patient;
  onSave?: () => void;
  onCancel?: () => void;
}

export default function PatientForm({
  patient,
  onSave,
  onCancel,
}: PatientFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    age: "",
    gender: "male" as "male" | "female" | "other",
    contactInfo: "",
  });

  const [visitData, setVisitData] = useState({
    date: new Date().toISOString().split("T")[0],
    symptoms: [""],
    diagnosis: "",
    treatment: "",
    severity: "mild" as "mild" | "moderate" | "severe",
    healingDuration: "",
    notes: "",
  });

  const [isEditing, setIsEditing] = useState(false);
  const [showVisitForm, setShowVisitForm] = useState(false);

  useEffect(() => {
    if (patient) {
      setIsEditing(true);
      setFormData({
        name: patient.name,
        age: patient.age.toString(),
        gender: patient.gender,
        contactInfo: patient.contactInfo,
      });
    }
  }, [patient]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleVisitInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setVisitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSymptomChange = (index: number, value: string) => {
    const newSymptoms = [...visitData.symptoms];
    newSymptoms[index] = value;
    setVisitData((prev) => ({
      ...prev,
      symptoms: newSymptoms,
    }));
  };

  const addSymptom = () => {
    setVisitData((prev) => ({
      ...prev,
      symptoms: [...prev.symptoms, ""],
    }));
  };

  const removeSymptom = (index: number) => {
    const newSymptoms = visitData.symptoms.filter((_, i) => i !== index);
    setVisitData((prev) => ({
      ...prev,
      symptoms: newSymptoms,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.age || !formData.contactInfo) {
      alert("Please fill in all required fields");
      return;
    }

    const patientData = {
      name: formData.name,
      age: parseInt(formData.age),
      gender: formData.gender,
      contactInfo: formData.contactInfo,
      visits: [],
    };

    if (isEditing && patient) {
      updatePatient(patient.id, patientData);
    } else {
      addPatient(patientData);
    }

    onSave?.();
  };

  const handleVisitSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !visitData.diagnosis ||
      !visitData.treatment ||
      !visitData.healingDuration
    ) {
      alert("Please fill in all required visit fields");
      return;
    }

    if (!patient) {
      alert("Please save the patient first");
      return;
    }

    const visitDataToSave = {
      date: visitData.date,
      symptoms: visitData.symptoms.filter((s) => s.trim() !== ""),
      diagnosis: visitData.diagnosis,
      treatment: visitData.treatment,
      severity: visitData.severity,
      healingDuration: parseInt(visitData.healingDuration),
      notes: visitData.notes,
    };

    addVisit(patient.id, visitDataToSave);

    // Reset visit form
    setVisitData({
      date: new Date().toISOString().split("T")[0],
      symptoms: [""],
      diagnosis: "",
      treatment: "",
      severity: "mild",
      healingDuration: "",
      notes: "",
    });

    setShowVisitForm(false);
    onSave?.();
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">
        {isEditing ? "Edit Patient" : "Add New Patient"}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Age *
            </label>
            <input
              type="number"
              name="age"
              value={formData.age}
              onChange={handleInputChange}
              min="0"
              max="150"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gender
            </label>
            <select
              name="gender"
              value={formData.gender}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Info *
            </label>
            <input
              type="text"
              name="contactInfo"
              value={formData.contactInfo}
              onChange={handleInputChange}
              placeholder="Phone or Email"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="flex space-x-4">
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {isEditing ? "Update Patient" : "Save Patient"}
          </button>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {/* Visit Form */}
      {isEditing && patient && (
        <div className="mt-8 border-t pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Add Visit</h3>
            <button
              type="button"
              onClick={() => setShowVisitForm(!showVisitForm)}
              className="px-3 py-1 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
            >
              {showVisitForm ? "Cancel" : "Add Visit"}
            </button>
          </div>

          {showVisitForm && (
            <form onSubmit={handleVisitSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Visit Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={visitData.date}
                    onChange={handleVisitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={visitData.severity}
                    onChange={handleVisitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="mild">Mild</option>
                    <option value="moderate">Moderate</option>
                    <option value="severe">Severe</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Symptoms
                </label>
                {visitData.symptoms.map((symptom, index) => (
                  <div key={index} className="flex space-x-2 mb-2">
                    <input
                      type="text"
                      value={symptom}
                      onChange={(e) =>
                        handleSymptomChange(index, e.target.value)
                      }
                      placeholder="Enter symptom"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {visitData.symptoms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSymptom(index)}
                        className="px-3 py-2 text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addSymptom}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Symptom
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Diagnosis *
                  </label>
                  <input
                    type="text"
                    name="diagnosis"
                    value={visitData.diagnosis}
                    onChange={handleVisitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Treatment *
                  </label>
                  <input
                    type="text"
                    name="treatment"
                    value={visitData.treatment}
                    onChange={handleVisitInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Healing Duration (days) *
                </label>
                <input
                  type="number"
                  name="healingDuration"
                  value={visitData.healingDuration}
                  onChange={handleVisitInputChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={visitData.notes}
                  onChange={handleVisitInputChange}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Additional notes..."
                />
              </div>

              <div className="flex space-x-4">
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  Save Visit
                </button>
                <button
                  type="button"
                  onClick={() => setShowVisitForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
