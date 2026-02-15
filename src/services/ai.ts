// src/services/ai.ts
import { API_BASE_URL } from "./config";
export type DetectResult = {
  species: string;
  sizeCm: number;
  weightG: number;
  legal: boolean;
  rule: string;
  confidence: number;
};

export async function detectFish(photoUri: string): Promise<DetectResult> {
  const form = new FormData();

  form.append("file", {
    uri: photoUri,
    name: "fish.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(`${API_BASE_URL}/ai/detect`, {
    method: "POST",
    body: form,
  });

  if (!res.ok) {
    const txt = await res.text();
    throw new Error(txt || "AI detect failed");
  }

  return res.json();
}
