import { Platform } from "react-native";

export const BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8000"
    : "http://192.168.1.100:8000"; // حط IP ديال PC ديالك هنا
