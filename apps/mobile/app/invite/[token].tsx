import { useEffect, useState } from "react";
import { View, Text, ActivityIndicator, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useAuthStore } from "../../store/auth";
import { useOnboardingStore } from "../../store/onboarding";
import { apiFetch } from "../../lib/api";
import { landingRouteForRole } from "../../lib/routes";

type EnrollmentResponse = {
  id: string;
  classroomId: string;
  classroomTitle: string;
  studentId: string;
  joinedAt: string;
};

type Status = "idle" | "joining" | "success" | "error";

export default function InviteScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const router = useRouter();
  const isSignedIn = useAuthStore((s) => s.isSignedIn);
  const hydrated = useAuthStore((s) => s.hydrated);
  const authToken = useAuthStore((s) => s.token);
  const setPendingInviteToken = useAuthStore((s) => s.setPendingInviteToken);
  const onboardingRole = useOnboardingStore((s) => s.role);
  const authRole = useAuthStore((s) => s.role);

  const [status, setStatus] = useState<Status>("idle");
  const [classroomTitle, setClassroomTitle] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!hydrated) return;

    if (!isSignedIn) {
      setPendingInviteToken(token);
      router.replace("/(auth)/sign-in");
      return;
    }

    setStatus("joining");
    apiFetch<EnrollmentResponse>("/invitations/join", {
      method: "POST",
      body: { token },
      token: authToken!,
    })
      .then((data) => {
        setClassroomTitle(data.classroomTitle);
        setStatus("success");
      })
      .catch((err: unknown) => {
        const msg = err instanceof Error ? err.message : "Erro ao entrar na sala";
        setErrorMsg(msg);
        setStatus("error");
      });
  }, [hydrated, isSignedIn]); // eslint-disable-line react-hooks/exhaustive-deps

  if (status === "idle" || status === "joining") {
    return (
      <View className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#000" />
        <Text className="mt-4 text-gray-500">Entrando na sala...</Text>
      </View>
    );
  }

  if (status === "success") {
    return (
      <View className="flex-1 justify-center items-center px-6 bg-white">
        <Text className="text-2xl font-bold mb-2">Bem-vindo!</Text>
        <Text className="text-gray-600 mb-8 text-center">
          Você entrou em "{classroomTitle}"
        </Text>
        <TouchableOpacity
          className="bg-black rounded-lg py-4 px-8 items-center"
          onPress={() => router.replace(landingRouteForRole(onboardingRole ?? authRole))}
        >
          <Text className="text-white font-semibold text-base">Continuar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 justify-center items-center px-6 bg-white">
      <Text className="text-2xl font-bold mb-2">Ops!</Text>
      <Text className="text-red-500 mb-8 text-center">{errorMsg}</Text>
      <TouchableOpacity
        className="bg-black rounded-lg py-4 px-8 items-center"
        onPress={() => router.replace(landingRouteForRole(onboardingRole ?? authRole))}
      >
        <Text className="text-white font-semibold text-base">Ir para início</Text>
      </TouchableOpacity>
    </View>
  );
}
