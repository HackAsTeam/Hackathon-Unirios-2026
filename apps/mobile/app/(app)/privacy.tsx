import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';

export default function PrivacyScreen() {
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
          Política de Privacidade
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: scale(22), marginBottom: 24 }}>
          Última atualização: Maio de 2026
        </Text>

        <Section title="1. Coleta de Dados" c={c} scale={scale}>
          Coletamos os seguintes dados pessoais para proporcionar a melhor experiência educacional:
          {'\n'}• Nome completo e endereço de e-mail (fornecidos no cadastro)
          {'\n'}• Foto do perfil (opcional)
          {'\n'}• Dados acadêmicos: respostas a atividades, notas, turmas matriculadas
          {'\n'}• Preferências de acessibilidade (tamanho de fonte, contraste, formato de resposta)
          {'\n'}• Gravações de áudio e comandos de voz quando você utiliza o assistente "Hey Dillo"
        </Section>

        <Section title="2. Finalidade do Tratamento" c={c} scale={scale}>
          Seus dados são utilizados para:
          {'\n'}• Criar e gerenciar sua conta na plataforma
          {'\n'}• Permitir que professores criem turmas e avaliem atividades
          {'\n'}• Permitir que alunos participem de turmas e acompanhem resultados
          {'\n'}• Personalizar a experiência com base nas suas preferências de acessibilidade
          {'\n'}• Melhorar a plataforma com base em métricas de uso agregadas
        </Section>

        <Section title="3. Compartilhamento de Dados" c={c} scale={scale}>
          Seus dados são compartilhados apenas quando necessário:
          {'\n'}• Professores têm acesso aos dados acadêmicos dos alunos matriculados em suas turmas
          {'\n'}• Não vendemos seus dados pessoais para terceiros
          {'\n'}• Não compartilhamos dados com anunciantes
          {'\n'}• Podemos compartilhar dados por obrigação legal ou ordem judicial
        </Section>

        <Section title="4. Seus Direitos (LGPD)" c={c} scale={scale}>
          Conforme a Lei Geral de Proteção de Dados (Lei 13.709/2018), você tem direito a:
          {'\n'}• Confirmar a existência de tratamento de seus dados
          {'\n'}• Acessar seus dados pessoais
          {'\n'}• Corrigir dados incompletos, inexatos ou desatualizados
          {'\n'}• Solicitar a anonimização, bloqueio ou eliminação de dados desnecessários
          {'\n'}• Solicitar a portabilidade dos dados a outro fornecedor
          {'\n'}• Eliminar dados tratados com seu consentimento
          {'\n'}• Revogar o consentimento a qualquer momento
        </Section>

        <Section title="5. Retenção de Dados" c={c} scale={scale}>
          Mantemos seus dados enquanto sua conta estiver ativa. Ao solicitar a exclusão da conta:
          {'\n'}• Seus dados entram em período de carência de 30 dias
          {'\n'}• Durante esse período, você pode restaurar sua conta ao fazer login
          {'\n'}• Após 30 dias, seus dados pessoais são anonimizados permanentemente
          {'\n'}• Registros acadêmicos (notas, respostas) são mantidos de forma pseudonimizada
        </Section>

        <Section title="6. Segurança" c={c} scale={scale}>
          Adotamos medidas técnicas e organizacionais para proteger seus dados:
          {'\n'}• Criptografia em trânsito (TLS/SSL)
          {'\n'}• Armazenamento seguro com criptografia
          {'\n'}• Controle de acesso baseado em papéis (professor/aluno)
          {'\n'}• Auditoria periódica de segurança
        </Section>

        <Section title="7. Contato" c={c} scale={scale}>
          Para exercer seus direitos LGPD ou esclarecer dúvidas sobre privacidade, entre em contato:
          {'\n'}• E-mail: privacidade@dillo.app
          {'\n'}• Encarregado de Dados (DPO): dpo@dillo.app
        </Section>
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
