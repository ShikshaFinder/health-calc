"use client";

import { useEffect } from "react";
import { initializeStorage } from "../utils/localStorageUtils";

export default function StorageInitializer() {
  useEffect(() => {
    initializeStorage();
  }, []);

  return null; // This component doesn't render anything
}
