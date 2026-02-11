import React, { useEffect } from "react";
import { Stack, useRouter, useSegments } from "expo-router";
import { AuthProvider, useAuth } from "../src/auth/AuthContext";

function RootNav() {
  const { logged, ready } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    if (!ready) return;

    const inTabs = segments[0] === "(tabs)";

    // إلى ماشي logged وراه داخل tabs -> رجّعو للّوغين
    if (!logged && inTabs) router.replace("/");

    // إلى logged وراه فـ root (login/register) -> دخّلو للـ tabs/home
    if (logged && !inTabs) router.replace("/(tabs)/home");
  }, [logged, ready, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="register" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNav />
    </AuthProvider>
  );
}
