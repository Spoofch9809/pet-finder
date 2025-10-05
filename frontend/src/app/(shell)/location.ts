export function resolveLatLng(p: any): { lat?: number; lng?: number } {
  const lat =
    p?.locationLat ??
    p?.lat ??
    p?.coords?.lat ??
    p?.location?.lat ??
    undefined;
  const lng =
    p?.locationLng ??
    p?.lng ??
    p?.coords?.lng ??
    p?.location?.lng ??
    undefined;
  return { lat, lng };
}

export function formatLocationLabel(p: any): string {
  const label =
    typeof p?.location === "string"
      ? p.location.trim()
      : typeof p?.location?.label === "string"
      ? p.location.label.trim()
      : "";

  if (label) return label;

  const { lat, lng } = resolveLatLng(p);
  if (typeof lat === "number" && typeof lng === "number") {
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
  }

  return "Unknown location";
}
