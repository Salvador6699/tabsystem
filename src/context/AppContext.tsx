import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  WorkEntry,
  BrickType,
  Period,
  Multiplier,
  GlobalMeasurement,
  StorageConfig,
} from "../types";
import { getFromStorage, saveToStorage } from "../lib/utils";

const API_BASE = `${window.location.origin}/php`;

const DEFAULT_BRICK_TYPES: BrickType[] = [
  { id: "1", name: "Ladrillo hueco 7", pricePerSquareMeter: 8.5, type: "regular" },
  { id: "2", name: "Ladrillo hueco 11", pricePerSquareMeter: 9.2, type: "regular" },
];

async function parsePhpError(res: Response): Promise<string> {
  try {
    const body = await res.json();
    return body?.error || `Error HTTP ${res.status}`;
  } catch {
    return `Error de red (${res.status})`;
  }
}

import { useAuth } from "./AuthContext";

type AppContextType = {
  storageConfig: StorageConfig;
  updateStorageConfig: (config: StorageConfig) => void;
  isConnecting: boolean;
  connectionError: string | null;
  isLoading: boolean;
  isSyncing: boolean;
  isInitializing: boolean;

  workEntries: WorkEntry[];
  setWorkEntries: React.Dispatch<React.SetStateAction<WorkEntry[]>>;
  brickTypes: BrickType[];
  setBrickTypes: React.Dispatch<React.SetStateAction<BrickType[]>>;
  periods: Period[];
  setPeriods: React.Dispatch<React.SetStateAction<Period[]>>;
  multipliers: Multiplier[];
  setMultipliers: React.Dispatch<React.SetStateAction<Multiplier[]>>;
  globalMeasurements: GlobalMeasurement[];
  setGlobalMeasurements: React.Dispatch<React.SetStateAction<GlobalMeasurement[]>>;

  syncToDatabase: () => Promise<void>;
  syncFromDatabase: () => Promise<void>;
};

const AppContext = createContext<AppContextType | null>(null);

export const useAppContext = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useAppContext must be used within AppProvider");
  return ctx;
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [storageConfig, setStorageConfig] = useState<StorageConfig>(() =>
    getFromStorage("storageConfig", { type: "local" })
  );
  const { isAuthenticated } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de datos (se cargan de LocalStorage al iniciar)
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>(() => getFromStorage("workEntries", []));
  const [brickTypes, setBrickTypes] = useState<BrickType[]>(() => getFromStorage("brickTypes", DEFAULT_BRICK_TYPES));
  const [periods, setPeriods] = useState<Period[]>(() => getFromStorage("periods", []));
  const [multipliers, setMultipliers] = useState<Multiplier[]>(() => getFromStorage("multipliers", []));
  const [globalMeasurements, setGlobalMeasurements] = useState<GlobalMeasurement[]>(() => getFromStorage("globalMeasurements", []));

  const hasLocalData = workEntries.length > 0 || brickTypes.length > DEFAULT_BRICK_TYPES.length || periods.length > 0;

  // ─── PERSISTENCIA LOCAL AUTOMÁTICA ───────────────────────────────────────────
  useEffect(() => {
    saveToStorage("workEntries", workEntries);
    saveToStorage("brickTypes", brickTypes);
    saveToStorage("periods", periods);
    saveToStorage("multipliers", multipliers);
    saveToStorage("globalMeasurements", globalMeasurements);
  }, [workEntries, brickTypes, periods, multipliers, globalMeasurements]);

  // ─── SINCRONIZACIÓN AUTOMÁTICA ──────────────────────────────────────────────

  const performSync = useCallback(async (isInitial = false) => {
    if (!isAuthenticated) return;

    if (isInitial) setIsInitializing(true);
    else setIsSyncing(true);

    try {
      const payload = { workEntries, brickTypes, periods, multipliers, globalMeasurements };
      const res = await fetch(`${API_BASE}/save_all.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) throw new Error("Sin conexión");
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (isInitial && hasLocalData) {
        alert("✅ Datos actualizados en la base de datos");
      }
      setConnectionError(null);
    } catch (err: any) {
      setConnectionError(err.message);
      if (isInitial && hasLocalData) {
        alert("ℹ️ Sin conexión a internet. Los datos se guardarán en local hasta tener conexión.");
      }
    } finally {
      setIsInitializing(false);
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, workEntries, brickTypes, periods, multipliers, globalMeasurements, hasLocalData]);

  // Efecto de inicialización
  useEffect(() => {
    if (isAuthenticated) {
      performSync(true);
    } else {
      setIsLoading(false);
      setIsInitializing(false);
    }
  }, [isAuthenticated]);

  // Auto-save a la nube tras cambios (debounced)
  useEffect(() => {
    if (isLoading || isInitializing || !isAuthenticated) return;

    const timer = setTimeout(() => {
      performSync(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [workEntries, brickTypes, periods, multipliers, globalMeasurements, isAuthenticated, isLoading, isInitializing, performSync]);

  const syncToDatabase = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const payload = { workEntries, brickTypes, periods, multipliers, globalMeasurements };
      const res = await fetch(`${API_BASE}/save_all.php`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        credentials: "include",
      });
      if (!res.ok) throw new Error(await parsePhpError(res));
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      alert("✅ Datos guardados en la nube con éxito");
    } catch (err: any) {
      setConnectionError(err.message);
      alert("❌ Error al guardar: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  }, [workEntries, brickTypes, periods, multipliers, globalMeasurements]);

  const syncFromDatabase = useCallback(async () => {
    if (!confirm("⚠️ ¿Estás seguro? Esto reemplazará tus datos actuales por los guardados en la nube.")) return;

    setIsConnecting(true);
    setConnectionError(null);
    try {
      const res = await fetch(`${API_BASE}/get_all.php`, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error(await parsePhpError(res));
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Reemplazar estado actual
      setWorkEntries(data.workEntries ?? []);
      setBrickTypes(data.brickTypes?.length ? data.brickTypes : DEFAULT_BRICK_TYPES);
      setPeriods(data.periods ?? []);
      setMultipliers(data.multipliers ?? []);
      setGlobalMeasurements(data.globalMeasurements ?? []);

      alert("✅ Datos descargados de la nube con éxito");
    } catch (err: any) {
      setConnectionError(err.message);
      alert("❌ Error al descargar: " + err.message);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const updateStorageConfig = (config: StorageConfig) => {
    setStorageConfig(config);
    saveToStorage("storageConfig", config);
  };

  return (
    <AppContext.Provider
      value={{
        storageConfig,
        updateStorageConfig,
        isConnecting,
        connectionError,
        isLoading,
        isSyncing,
        isInitializing,
        workEntries,
        setWorkEntries,
        brickTypes,
        setBrickTypes,
        periods,
        setPeriods,
        multipliers,
        setMultipliers,
        globalMeasurements,
        setGlobalMeasurements,
        syncToDatabase,
        syncFromDatabase,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
