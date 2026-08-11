let on = false;
const listeners = new Set<() => void>();

export const cameraStore = {
  isOn: () => on,
  setOn: (value: boolean) => {
    if (on === value) return;
    on = value;
    listeners.forEach((l) => l());
  },
  turnOff: () => cameraStore.setOn(false),
  turnOn: () => cameraStore.setOn(true),
  subscribe: (listener: () => void) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
};
