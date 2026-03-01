import React, { useState, useEffect } from "react";
import { useAppContext } from "./context/AppContext";
import { useAuth } from "./context/AuthContext";
import { Dashboard } from "./components/Dashboard";
import { WorkEntryForm } from "./components/WorkEntryForm";
import { WorkHistory } from "./components/WorkHistory";
import { GlobalMeasurements } from "./components/GlobalMeasurements";
import { Settings } from "./components/Settings";
import { UserGuide } from "./components/UserGuide";
import { FloatingButton, BottomNav, DarkModeToggle } from "./components/Navigation";
import { LoginView } from "./components/auth/LoginView";
import { RegisterView } from "./components/auth/RegisterView";
import { WorkEntry } from "./types";
import { generateId } from "./lib/utils";
import { useDarkMode } from "./hooks/useDarkMode";
import { LayoutDashboard, History, Ruler, Settings as SettingsIcon, BookOpen, Blocks, Menu, X, LogOut } from "lucide-react";

type View = "dashboard" | "history" | "global-measurements" | "settings" | "add-entry" | "edit-entry" | "user-guide";

const navItems = [
  { id: "dashboard" as View, label: "Dashboard", icon: LayoutDashboard },
  { id: "history" as View, label: "Historial", icon: History },
  { id: "global-measurements" as View, label: "Mediciones", icon: Ruler },
  { id: "settings" as View, label: "Configuración", icon: SettingsIcon },
];

const bottomNavItems = navItems.filter((n) => n.id !== "settings");

export default function App() {
  const {
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
    storageConfig,
    updateStorageConfig,
    isConnecting,
    connectionError,
    isLoading,
    syncToDatabase,
    syncFromDatabase,
  } = useAppContext();

  const { isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [authView, setAuthView] = useState<"login" | "register">("login");

  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [editingEntry, setEditingEntry] = useState<WorkEntry | null>(null);
  const [displayEntries, setDisplayEntries] = useState<WorkEntry[]>([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggle: toggleDark } = useDarkMode();

  useEffect(() => {
    setDisplayEntries(workEntries);
  }, [workEntries]);

  const handleAddEntry = (entry: WorkEntry) => {
    const newEntry = { ...entry, id: generateId() };
    setWorkEntries((prev) => [...prev, newEntry]);
    setCurrentView("dashboard");
  };

  const handleEditEntry = (entry: WorkEntry) => {
    setEditingEntry(entry);
    setCurrentView("edit-entry");
  };

  const handleUpdateEntry = (entry: WorkEntry) => {
    setWorkEntries((prev) => prev.map((e) => (e.id === entry.id ? entry : e)));
    setEditingEntry(null);
    setCurrentView("dashboard");
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este registro?")) {
      setWorkEntries((prev) => prev.filter((e) => e.id !== id));
    }
  };

  if (authLoading || isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background text-center p-6">
        <div className="space-y-4">
          <Blocks className="w-12 h-12 text-primary animate-pulse mx-auto" />
          <p className="text-muted-foreground animate-pulse font-medium">Cargando TabSystem...</p>
        </div>
      </div>
    );
  }

  // Vistas de Autenticación
  if (!isAuthenticated) {
    if (authView === "login") return <LoginView onSwitchToRegister={() => setAuthView("register")} />;
    if (authView === "register") return <RegisterView onSwitchToLogin={() => setAuthView("login")} />;
    return <LoginView onSwitchToRegister={() => setAuthView("register")} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop nav */}
      <nav className="hidden md:block bg-card shadow-sm border-b border-border sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <Blocks className="w-6 h-6 text-primary" />
              <h1 className="text-xl font-bold text-foreground">TabSystem</h1>
            </div>
            <div className="flex items-center space-x-1">
              <DarkModeToggle isDark={isDark} toggle={toggleDark} />
              <button
                onClick={() => setCurrentView("user-guide")}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                title="Guía de Usuario"
              >
                <BookOpen className="w-4 h-4" />
              </button>
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentView(item.id)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${currentView === item.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:text-foreground hover:bg-accent"
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="hidden sm:inline">{item.label}</span>
                  </button>
                );
              })}
              <div className="w-px h-6 bg-border mx-2" />
              <button
                onClick={() => { if (confirm("¿Cerrar sesión?")) logout(); }}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-destructive hover:bg-destructive/10 transition-colors"
                title="Cerrar Sesión"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden lg:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile header */}
      <header className="md:hidden sticky top-0 bg-background/95 backdrop-blur-sm z-30 border-b border-border">
        <div className="flex justify-between items-center h-16 px-4">
          <div className="flex items-center gap-2">
            <Blocks className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">TabSystem</h1>
          </div>
          <div className="flex items-center gap-1">
            <DarkModeToggle isDark={isDark} toggle={toggleDark} />
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-border bg-background p-4 space-y-2">
            <button
              onClick={() => { setCurrentView("settings"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <SettingsIcon className="w-5 h-5" />
              Configuración
            </button>
            <button
              onClick={() => { setCurrentView("user-guide"); setMobileMenuOpen(false); }}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <BookOpen className="w-5 h-5" />
              Guía de Usuario
            </button>
            <div className="pt-2 mt-2 border-t border-border">
              <button
                onClick={() => { if (confirm("¿Cerrar sesión?")) { logout(); setMobileMenuOpen(false); } }}
                className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-5 h-5" />
                Cerrar Sesión
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Bottom nav (mobile) */}
      <BottomNav
        navigationItems={bottomNavItems}
        currentView={currentView}
        onNavigate={setCurrentView}
      />

      {/* FAB */}
      <FloatingButton onClick={() => setCurrentView("add-entry")} />

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-4 py-8 pb-24 md:pb-8">
        {currentView === "dashboard" && (
          <Dashboard
            entries={displayEntries}
            brickTypes={brickTypes}
            periods={periods}
            multipliers={multipliers}
            onAddEntry={() => setCurrentView("add-entry")}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {currentView === "add-entry" && (
          <div className="max-w-2xl mx-auto">
            <WorkEntryForm
              brickTypes={brickTypes}
              multipliers={multipliers}
              onSave={handleAddEntry}
              onCancel={() => setCurrentView("dashboard")}
            />
          </div>
        )}

        {currentView === "edit-entry" && editingEntry && (
          <div className="max-w-2xl mx-auto">
            <WorkEntryForm
              brickTypes={brickTypes}
              multipliers={multipliers}
              initialData={editingEntry}
              onSave={handleUpdateEntry}
              onCancel={() => { setEditingEntry(null); setCurrentView("dashboard"); }}
            />
          </div>
        )}

        {currentView === "history" && (
          <WorkHistory
            entries={displayEntries}
            brickTypes={brickTypes}
            periods={periods}
            multipliers={multipliers}
            onEditEntry={handleEditEntry}
            onDeleteEntry={handleDeleteEntry}
          />
        )}

        {currentView === "global-measurements" && (
          <GlobalMeasurements
            globalMeasurements={globalMeasurements}
            setGlobalMeasurements={setGlobalMeasurements}
            workEntries={displayEntries}
            brickTypes={brickTypes}
            periods={periods}
            multipliers={multipliers}
          />
        )}

        {currentView === "settings" && (
          <Settings
            brickTypes={brickTypes}
            setBrickTypes={setBrickTypes}
            periods={periods}
            setPeriods={setPeriods}
            multipliers={multipliers}
            setMultipliers={setMultipliers}
            workEntries={workEntries}
            setWorkEntries={setWorkEntries}
            globalMeasurements={globalMeasurements}
            setGlobalMeasurements={setGlobalMeasurements}
            storageConfig={storageConfig}
            updateStorageConfig={updateStorageConfig}
            isConnecting={isConnecting}
            connectionError={connectionError}
            syncToDatabase={syncToDatabase}
            syncFromDatabase={syncFromDatabase}
          />
        )}

        {currentView === "user-guide" && (
          <UserGuide onClose={() => setCurrentView("dashboard")} />
        )}
      </main>
    </div>
  );
}
