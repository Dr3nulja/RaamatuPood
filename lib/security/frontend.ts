export function createClickGuard(minIntervalMs: number) {
  let lastClickAt = 0;

  return function canProceed() {
    const now = Date.now();
    if (now - lastClickAt < minIntervalMs) {
      return false;
    }

    lastClickAt = now;
    return true;
  };
}
