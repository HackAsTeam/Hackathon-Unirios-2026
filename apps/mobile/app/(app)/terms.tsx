import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useColors } from '@/hooks/useColors';
import { useScale } from '@/hooks/useScale';

export default function TermsScreen() {
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
          Termos de Uso
        </Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 48 }}>
        <Text style={{ fontSize: scale(14), color: c.text.secondary, lineHeight: scale(22), marginBottom: 24 }}>
          Última atualização: Maio de 2026
        </Text>

        <Section title="1. Aceitação dos Termos" c={c} scale={scale}>
          Ao utilizar a plataforma Dillo, você declara que leu, entendeu e concorda com estes Termos de Uso. Caso não concorde com qualquer parte destes termos, não utilize a plataforma.
        </Section>

        <Section title="2. Cadastro e Conta" c={c} scale={scale}>
          Para utilizar a plataforma, você deve criar uma conta com informações precisas e completas. Você é responsável por:
          {'\n'}• Manter a confidencialidade de suas credenciais de acesso
          {'\n'}• Todas as atividades realizadas em sua conta
          {'\n'}• Notificar imediatamente sobre uso não autorizado
          {'\n'}• Não compartilhar sua conta com terceiros
        </Section>

        <Section title="3. Uso da Plataforma" c={c} scale={scale}>
          Você concorda em utilizar a plataforma apenas para fins educacionais legítimos. É proibido:
          {'\n'}• Utilizar a plataforma para atividades ilegais ou fraudulentas
          {'\n'}• Tentar acessar dados de outros usuários sem autorização
          {'\n'}• Interferir no funcionamento da plataforma
          {'\n'}• Reproduzir, distribuir ou modificar conteúdo protegido
          {'\n'}• Utilizar bots ou scripts automatizados
        </Section>

        <Section title="4. Papéis e Responsabilidades" c={c} scale={scale}>
          {`Professores:`}
          {'\n'}• São responsáveis pelo conteúdo das atividades que criam
          {'\n'}• Devem avaliar os alunos de forma justa e imparcial
          {'\n'}• São responsáveis por gerenciar o acesso às turmas
          {'\n'}
          {'\n'}{`Alunos:`}
          {'\n'}• Devem realizar as atividades de forma honesta e individual
          {'\n'}• São responsáveis por cumprir prazos estabelecidos
          {'\n'}• Devem utilizar a plataforma com respeito aos demais usuários
        </Section>

        <Section title="5. Propriedade Intelectual" c={c} scale={scale}>
          A plataforma Dillo e seu conteúdo (exceto materiais criados por usuários) são protegidos por direitos autorais. Você mantém os direitos sobre o conteúdo que criar na plataforma, mas concede à Dillo uma licença para armazenar e exibir este conteúdo conforme necessário para a prestação dos serviços.
        </Section>

        <Section title="6. Limitação de Responsabilidade" c={c} scale={scale}>
          A Dillo não se responsabiliza por:
          {'\n'}• Danos decorrentes de indisponibilidade temporária da plataforma
          {'\n'}• Conteúdo publicado por usuários (professores ou alunos)
          {'\n'}• Perdas decorrentes do uso inadequado da plataforma
          {'\n'}A plataforma é fornecida "como está", sem garantias de disponibilidade contínua ou ininterrupta.
        </Section>

        <Section title="7. Cancelamento e Exclusão" c={c} scale={scale}>
          Você pode encerrar sua conta a qualquer momento nas configurações do perfil. Seu dados pessoais serão anonimizados após 30 dias conforme nossa Política de Privacidade. A Dillo pode suspender ou encerrar contas que violem estes Termos de Uso.
        </Section>

        <Section title="8. Modificações" c={c} scale={scale}>
          Estes Termos de Uso podem ser atualizados periodicamente. Notificaremos sobre alterações significativas por e-mail ou na própria plataforma. O uso contínuo após as alterações constitui aceitação dos novos termos.
        </Section>

        <Section title="9. Lei Aplicável" c={c} scale={scale}>
          Estes Termos são regidos pela legislação brasileira. Qualquer disputa será resolvida no foro da comarca sede da Dillo.
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
