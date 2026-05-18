import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';

export default function ConsentScreen() {
  const router = useRouter();
  const c = useColors();
  const scale = useScale();

  return (
    <View style={{ flex: 1, backgroundColor: c.background }}>
      <View style={{ paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16, flexDirection: 'row', alignItems: 'center' }}>
        <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 12, padding: 4 }}>
          <Text style={{ fontSize: scale(24), color: c.text.primary }}>‹</Text>
        </TouchableOpacity>
        <Text style={{ fontSize: scale(20), fontWeight: '700', color: c.text.primary, flex: 1 }}>
          Consentimento de Dados
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: scale(22), marginBottom: 24 }}>
          De acordo com a Lei Geral de Proteção de Dados (LGPD), solicitamos seu consentimento para o tratamento dos seus dados pessoais. Você pode revogar este consentimento a qualquer momento.
        </Text>

        <Section title="Dados Coletados" c={c} scale={scale}>
          Para o funcionamento da plataforma, tratamos os seguintes dados:
          {'\n'}• Nome e e-mail (identificação)
          {'\n'}• Respostas a atividades e notas (desempenho acadêmico)
          {'\n'}• Preferências de acessibilidade e configurações
          {'\n'}• Gravações de áudio (quando utilizado o recurso de resposta por áudio)
        </Section>

        <Section title="Finalidade do Tratamento" c={c} scale={scale}>
          Seus dados são tratados exclusivamente para:
          {'\n'}• Operar a plataforma e fornecer os serviços educacionais
          {'\n'}• Personalizar sua experiência de aprendizado
          {'\n'}• Permitir a comunicação entre professores e alunos
          {'\n'}• Melhorar a plataforma com base em análises agregadas
        </Section>

        <Section title="Compartilhamento" c={c} scale={scale}>
          Seus dados não são compartilhados com terceiros para fins comerciais. Apenas professores têm acesso aos dados acadêmicos dos alunos matriculados em suas turmas.
        </Section>

        <Section title="Seus Direitos" c={c} scale={scale}>
          Você pode a qualquer momento:
          {'\n'}• Solicitar acesso aos seus dados
          {'\n'}• Solicitar correção de dados incorretos
          {'\n'}• Solicitar exclusão da conta (com carência de 30 dias)
          {'\n'}• Revogar este consentimento
          {'\n'}• Solicitar portabilidade dos dados
        </Section>

        <Text style={{ fontSize: scale(12), color: c.text.tertiary, textAlign: 'center', lineHeight: scale(18), marginTop: 8 }}>
          Você pode revogar seu consentimento a qualquer momento nas configurações ou entrando em contato pelo e-mail privacidade@dillo.app
        </Text>
      </ScrollView>
    </View>
  );
}

function Section({ title, children, c, scale }: { title: string; children: React.ReactNode; c: ReturnType<typeof useColors>; scale: ReturnType<typeof useScale> }) {
  return (
    <View style={{ marginBottom: 24 }}>
      <Text style={{ fontSize: scale(17), fontWeight: '600', color: c.text.primary, marginBottom: 8 }}>
        {title}
      </Text>
      <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: scale(22) }}>
        {children}
      </Text>
    </View>
  );
}
