// src/services/ai.ts
import { Platform } from "react-native";
import Constants from "expo-constants";

export type DetectResult = {
  species?: string;
  sizeCm?: number;
  weightG?: number;
  legal?: boolean;
  rule?: string;
  confidence?: number;
};

// حاول نلقاو host ديال Metro تلقائياً
function getDevHost() {
  // hostUri مثال: "192.168.0.110:8081"
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ??
    (Constants as any).manifest?.hostUri;

  const host = typeof hostUri === "string" ? hostUri.split(":")[0] : null;
  return host;
}

function getApiBaseUrl() {
  // 1) إذا كاين env استعملو
  const envUrl = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (envUrl && envUrl.startsWith("http")) return envUrl;

  // 2) web => localhost
  if (Platform.OS === "web") return "http://localhost:8000";

  // 3) Expo Go على هاتف => نفس IP ديال dev host
  const host = getDevHost();
  if (host) return `http://${host}:8000`;

  // fallback
  return "http://127.0.0.1:8000";
}

const API_BASE_URL = getApiBaseUrl();

export async function detectFish(photoUri: string): Promise<DetectResult> {
  const url = `${API_BASE_URL}/ai/detect`;

  const form = new FormData();
  form.append("file", {
    uri: photoUri,
    name: "photo.jpg",
    type: "image/jpeg",
  } as any);

  const res = await fetch(url, {
    method: "POST",
    body: form,
    // ⚠️ مهم فـ RN: ما تحطّش Content-Type هنا، fetch كيزيد boundary بوحدو
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`AI error ${res.status}: ${txt}`);
  }

  const data = (await res.json()) as DetectResult;
  return data;
}