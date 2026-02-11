import { BASE_URL } from "./config";
export type CapturePayload = {
  species: string;
  weightKg: number;
  sizeCm?: number | null;
  city: string;
  zone: string;
  dateISO: string;
  timeStr: string;
  photoUri?: string | null;
};

export async function apiAddCapture(payload: CapturePayload) {
  const res = await fetch(`${BASE_URL}/logbook/add`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return res.json();
}

export async function apiListCaptures() {
  const res = await fetch(`${BASE_URL}/logbook/list`);
  return res.json();
}
