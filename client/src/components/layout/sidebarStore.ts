const STORAGE_KEY = "atmik-sidebar-collapsed";

let collapsed = false;
try {
  collapsed = localStorage.getItem(STORAGE_KEY) === "1";
} catch {
  collapsed = false;
}

const listeners = new Set<() => void>();

export const sidebarStore = {
  isCollapsed: () => collapsed,
  setCollapsed: (value: boolean) => {
    if (collapsed === value) return;
    collapsed = value;
    try {
      localStorage.setItem(STORAGE_KEY, collapsed ? "1" : "0");
    } catch {
      /* private mode */
    }
    listeners.forEach((l) => l());
  },
  toggle: () => sidebarStore.setCollapsed(!collapsed),
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
