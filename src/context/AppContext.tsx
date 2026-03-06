import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import {
  WorkEntry,
  BrickType,
  Period,
  Multiplier,
  Supplement,
  GlobalMeasurement,
  StorageConfig,
} from "../types";
import { getFromStorage, saveToStorage } from "../lib/utils";

const isLocal = window.location.hostname === "localhost" ||
  window.location.hostname === "127.0.0.1" ||
  window.location.hostname.startsWith("192.168.") ||
  window.location.hostname.startsWith("10.") ||
  window.location.hostname.endsWith(".local");

const AUTH_CREDENTIALS = "plantr753:zGTk9J8N";

// Intentamos detectar la ruta base del proyecto (ej: /TabSystem/dist/)
const pathParts = window.location.pathname.split('/');
const projectPath = pathParts.slice(0, pathParts.length - 2).join('/');

// Usamos el protocolo actual (http/https) para evitar bloqueos por seguridad
const API_BASE = isLocal
  ? `${window.location.origin.replace(":5173", "")}${projectPath}/php`
  : `${window.location.protocol}//www.plantrabajo.com.mialias.net/php`;

// Generar cabeceras de autenticación básica para CDMon
const getAuthHeaders = (): Record<string, string> => {
  if (isLocal) return {};
  return {
    "Authorization": `Basic ${btoa(AUTH_CREDENTIALS)}`
  };
};

const DEFAULT_BRICK_TYPES: BrickType[] = [];

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
  supplements: Supplement[];
  setSupplements: React.Dispatch<React.SetStateAction<Supplement[]>>;
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
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Estados de datos
  const [workEntries, setWorkEntries] = useState<WorkEntry[]>([]);
  const [brickTypes, setBrickTypes] = useState<BrickType[]>(DEFAULT_BRICK_TYPES);
  const [periods, setPeriods] = useState<Period[]>([]);
  const [multipliers, setMultipliers] = useState<Multiplier[]>([]);
  const [supplements, setSupplements] = useState<Supplement[]>([]);
  const [globalMeasurements, setGlobalMeasurements] = useState<GlobalMeasurement[]>([]);

  // Helper para claves de almacenamiento por usuario
  const getUserKey = useCallback((key: string) => {
    return user ? `user_${user.id}_${key}` : key;
  }, [user]);

  // ─── CARGA DE DATOS POR USUARIO ──────────────────────────────────────────────
  useEffect(() => {
    if (authLoading) return; // Esperar a que AuthContext verifique la sesión

    if (isAuthenticated && user) {
      setWorkEntries(getFromStorage(getUserKey("workEntries"), []));
      setBrickTypes(getFromStorage(getUserKey("brickTypes"), DEFAULT_BRICK_TYPES));
      setPeriods(getFromStorage(getUserKey("periods"), []));
      setMultipliers(getFromStorage(getUserKey("multipliers"), []));
      setSupplements(getFromStorage(getUserKey("supplements"), []));
      setGlobalMeasurements(getFromStorage(getUserKey("globalMeasurements"), []));
    } else {
      // Solo resetear si de verdad no hay sesión (y no está cargando)
      setWorkEntries([]);
      setBrickTypes(DEFAULT_BRICK_TYPES);
      setPeriods([]);
      setMultipliers([]);
      setSupplements([]);
      setGlobalMeasurements([]);
    }
  }, [isAuthenticated, user, authLoading, getUserKey]);

  // ─── PERSISTENCIA LOCAL AUTOMÁTICA ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user) return;
    saveToStorage(getUserKey("workEntries"), workEntries);
    saveToStorage(getUserKey("brickTypes"), brickTypes);
    saveToStorage(getUserKey("periods"), periods);
    saveToStorage(getUserKey("multipliers"), multipliers);
    saveToStorage(getUserKey("supplements"), supplements);
    saveToStorage(getUserKey("globalMeasurements"), globalMeasurements);
  }, [workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements, isAuthenticated, user, getUserKey]);

  const hasLocalData = workEntries.length > 0 || brickTypes.length > DEFAULT_BRICK_TYPES.length || periods.length > 0;

  // ─── SINCRONIZACIÓN AUTOMÁTICA ──────────────────────────────────────────────

  const performSync = useCallback(async (isInitial = false) => {
    if (!isAuthenticated) return;

    // IMPORTANTE: Evitar borrar la nube si abrimos la app en un dispositivo nuevo (datos locales vacíos)
    if (isInitial && !hasLocalData) {
      console.log("No hay datos locales para sincronizar al inicio. Saltando guardado.");
      setIsInitializing(false);
      setIsLoading(false);
      return;
    }

    if (isInitial) setIsInitializing(true);
    else setIsSyncing(true);

    try {
      const payload = { workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements };
      const res = await fetch(`${API_BASE}/save_all.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
        body: JSON.stringify(payload),
        credentials: "include",
      });

      if (!res.ok) {
        const msg = await parsePhpError(res);
        throw new Error(msg);
      }

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (isInitial && hasLocalData) {
        alert("✅ Datos locales sincronizados con la nube");
      }
      setConnectionError(null);
    } catch (err: any) {
      console.error("Error en sincronización:", err, "URL intentada:", `${API_BASE}/save_all.php`);
      setConnectionError(err.message);
      if (isInitial && hasLocalData) {
        alert("ℹ️ Error de conexión: " + err.message + "\nURL: " + API_BASE);
      }
    } finally {
      setIsInitializing(false);
      setIsSyncing(false);
      setIsLoading(false);
    }
  }, [isAuthenticated, workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements, hasLocalData]);

  const updateStorageConfig = (config: StorageConfig) => {
    setStorageConfig(config);
    saveToStorage("storageConfig", config);
  };

  const syncToDatabase = useCallback(async () => {
    setIsConnecting(true);
    setConnectionError(null);
    try {
      const payload = { workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements };
      const res = await fetch(`${API_BASE}/save_all.php`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders()
        },
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
  }, [workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements]);

  const syncFromDatabase = useCallback(async (confirmNeeded = true) => {
    if (confirmNeeded && !confirm("⚠️ ¿Estás seguro? Esto reemplazará tus datos actuales por los guardados en la nube.")) return;

    setIsConnecting(true);
    setConnectionError(null);
    try {
      const res = await fetch(`${API_BASE}/get_all.php`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include"
      });
      if (!res.ok) throw new Error(await parsePhpError(res));
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      // Reemplazar estado actual
      setWorkEntries(data.workEntries ?? []);
      setBrickTypes(data.brickTypes ?? []);
      setPeriods(data.periods ?? []);
      setMultipliers(data.multipliers ?? []);
      setSupplements(data.supplements ?? []);
      setGlobalMeasurements(data.globalMeasurements ?? []);

      if (confirmNeeded) alert("✅ Datos descargados de la nube con éxito");
    } catch (err: any) {
      setConnectionError(err.message);
      if (confirmNeeded) alert("❌ Error al descargar: " + err.message);
    } finally {
      setIsConnecting(false);
      setIsInitializing(false);
      setIsLoading(false);
    }
  }, []);

  // ─── EFFECTS ────────────────────────────────────────────────────────────────

  // Efecto de inicialización: Intentar descargar si el dispositivo está vacío
  useEffect(() => {
    if (isAuthenticated) {
      if (!hasLocalData) {
        // En un dispositivo nuevo, preferimos descargar lo que hay en la nube
        syncFromDatabase(false);
      } else {
        performSync(true);
      }
    } else {
      setIsLoading(false);
      setIsInitializing(false);
    }
  }, [isAuthenticated, hasLocalData, syncFromDatabase, performSync]);

  // Auto-save a la nube tras cambios (debounced)
  useEffect(() => {
    if (isLoading || isInitializing || !isAuthenticated) return;

    const timer = setTimeout(() => {
      performSync(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, [workEntries, brickTypes, periods, multipliers, supplements, globalMeasurements, isAuthenticated, isLoading, isInitializing, performSync]);

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
        supplements,
        setSupplements,
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
