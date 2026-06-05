const KEY = 'samba_impersonate';

export function getImpersonation() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setImpersonation(organizer) {
  sessionStorage.setItem(
    KEY,
    JSON.stringify({
      organizerId: organizer.id,
      organizerName: organizer.organizationName || organizer.name,
      organizerEmail: organizer.email,
      startedAt: Date.now(),
    })
  );
}

export function clearImpersonation() {
  sessionStorage.removeItem(KEY);
}
