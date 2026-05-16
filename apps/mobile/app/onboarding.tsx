import { useEffect } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useOnboardingStore } from '../store/onboarding';

export default function OnboardingScreen() {
  const router = useRouter();
  const { completed, setRole } = useOnboardingStore();

  useEffect(() => {
    if (completed) {
      router.replace('/(app)/(tabs)');
    }
  }, [completed]);

  if (completed) return null;

  async function handleRoleSelect(role: 'teacher' | 'student') {
    await setRole(role);
    router.replace('/(app)/(tabs)');
  }

  return (
    <ScrollView className="flex-1 bg-white">
      <View className="px-6 pt-20 pb-8">
        <View className="items-center mb-12">
          <Text className="text-5xl font-bold text-black mb-2">Placeholder</Text>
          <Text className="text-base text-gray-400 text-center">
            A plataforma que transforma a maneira de avaliar
          </Text>
        </View>

        {/* <View className="gap-3 mb-10">
          <ValuePropCard
            title="O que isso tem de diferente?"
            description="IA que personaliza avaliações e dá feedback instantâneo para cada aluno, tornando o aprendizado mais eficiente."
          />
          <ValuePropCard
            title="Qual é a melhor forma de usar isso?"
            description="Crie turmas, monte matérias, elabore atividades e acompanhe o desempenho da sua turma em tempo real."
          />
          <ValuePropCard
            title="Isso vale meu tempo?"
            description="Economize horas corrigindo provas manualmente. A correção automatizada libera seu tempo para o que importa: ensinar."
          />
        </View> */}
      </View>

      <View className="h-full justify-center px-6 pb-12 gap-3">
        <TouchableOpacity
          className="bg-black rounded-2xl py-5 items-center"
          onPress={() => handleRoleSelect('teacher')}
        >
          <Text className="text-white font-bold text-lg">Sou Professor</Text>
          <Text className="text-gray-400 text-sm mt-1">
            Criar e gerenciar turmas
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="border-2 border-black rounded-2xl py-5 items-center"
          onPress={() => handleRoleSelect('student')}
        >
          <Text className="text-black font-bold text-lg">Sou Aluno</Text>
          <Text className="text-gray-500 text-sm mt-1">
            Participar de turmas
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

// function ValuePropCard({
//   title,
//   description,
// }: {
//   title: string;
//   description: string;
// }) {
//   return (
//     <View className="bg-gray-50 rounded-xl p-5 gap-2">
//       <Text className="font-semibold text-base text-black">{title}</Text>
//       <Text className="text-gray-500 text-sm leading-5">{description}</Text>
//     </View>
//   );
// }
