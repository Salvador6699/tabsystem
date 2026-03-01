import React from "react";
import { Plus, LayoutDashboard, History, Ruler, Settings } from "lucide-react";

type View = "dashboard" | "history" | "global-measurements" | "settings" | "add-entry" | "edit-entry" | "user-guide";

type NavItem = {
  id: View;
  label: string;
  icon: React.FC<{ className?: string }>;
};

export const FloatingButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <button
    onClick={onClick}
    className="fixed bottom-24 right-5 md:hidden z-50 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-lg flex items-center justify-center hover:bg-primary/90 transition-colors"
    aria-label="Añadir Registro"
  >
    <Plus className="w-6 h-6" />
  </button>
);

export const BottomNav: React.FC<{
  navigationItems: NavItem[];
  currentView: View;
  onNavigate: (v: View) => void;
}> = ({ navigationItems, currentView, onNavigate }) => (
  <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t border-border z-40">
    <div className="flex justify-around py-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const active = currentView === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
              active ? "text-primary" : "text-muted-foreground"
            }`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        );
      })}
    </div>
  </nav>
);

export const DarkModeToggle: React.FC<{ isDark: boolean; toggle: () => void }> = ({
  isDark,
  toggle,
}) => (
  <button
    onClick={toggle}
    className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
    aria-label="Toggle dark mode"
  >
    {isDark ? "☀️" : "🌙"}
  </button>
);
