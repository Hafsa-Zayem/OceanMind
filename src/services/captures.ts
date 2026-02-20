// src/services/captures.ts
import { supabase } from "../lib/supabaseClient";
import * as FileSystem from "expo-file-system/legacy";

function extFromUri(uri: string) {
  const clean = uri.split("?")[0];
  const parts = clean.split(".");
  const ext = parts.length > 1 ? parts.pop()!.toLowerCase() : "jpg";
  return ext || "jpg";
}

// base64 -> Uint8Array
function base64ToUint8Array(base64: string) {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

export async function uploadCapturePhoto(userId: string, uri: string) {
  const ext = extFromUri(uri);
  const filePath = `${userId}/${Date.now()}.${ext}`;

  const base64 = await FileSystem.readAsStringAsync(uri, {
    encoding: "base64" as any,
  });

  const bytes = base64ToUint8Array(base64);

  const { error: uploadError, data } = await supabase.storage
    .from("captures")
    .upload(filePath, bytes, {
      contentType: `image/${ext}`,
      upsert: true,
    });

  if (uploadError) throw new Error(uploadError.message);

  const { data: pub } = supabase.storage.from("captures").getPublicUrl(data.path);

  return { filePath: data.path, publicUrl: pub.publicUrl };
}

export async function createCapture(payload: {
  user_id: string;
  species: string;
  weight_kg: number;
  size_cm?: number | null;
  city: string;
  zone: string;
  captured_at: string; // ISO
  photo_path?: string | null;
  photo_url?: string | null;
  ai_confidence?: number | null;
  ai_legal?: boolean | null;
  ai_rule?: string | null;
}) {
  const { error } = await supabase.from("captures").insert(payload);
  if (error) throw new Error(error.message);
}
