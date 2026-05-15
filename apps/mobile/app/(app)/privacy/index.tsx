import { useState } from 'react';
import { View, Text, Switch, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { colors } from '../../../lib/colors';
import { Header } from '../../../components/ui/Header';
import { ScreenWrapper } from '../../../components/layout/ScreenWrapper';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { MOCK_STUDENT } from '../../../lib/mock-data';

export default function PrivacyScreen() {
  const router = useRouter();
  const [dataConsent, setDataConsent] = useState(MOCK_STUDENT.privacy.dataConsent);
  const [shareProgress, setShareProgress] = useState(MOCK_STUDENT.privacy.shareProgressWithPeers);
  const [teacherContact, setTeacherContact] = useState(MOCK_STUDENT.privacy.allowTeacherContact);

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Header title="Privacidade e LGPD" subtitle="Seus dados, seu controle" showBack />

      <ScreenWrapper scroll paddingHorizontal={0}>
        <View style={{ paddingHorizontal: 24, gap: 20, paddingBottom: 100 }}>
          <View style={{
            backgroundColor: colors.primary + '0D',
            borderRadius: 16,
            padding: 20,
            borderLeftWidth: 4,
            borderLeftColor: colors.primary,
            gap: 8,
          }}>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
              Seus dados importam para nos
            </Text>
            <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 22 }}>
              A plataforma foi construida pensando na sua privacidade desde o inicio.
              Aqui voce entende quais dados coletamos e como voce pode controlar tudo.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              SEUS CONTROLES
            </Text>

            <Card variant="outlined" color={colors.border}>
              <View style={{ gap: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                      Consentimento de Dados
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2, lineHeight: 18 }}>
                      Permite que usemos seus dados para personalizar sua experiencia de aprendizagem
                    </Text>
                  </View>
                  <Switch
                    value={dataConsent}
                    onValueChange={setDataConsent}
                    trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                    thumbColor={dataConsent ? colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={{ height: 1, backgroundColor: colors.borderLight }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                      Compartilhar Progresso
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2, lineHeight: 18 }}>
                      Permite que colegas vejam seu progresso nas atividades (apenas status)
                    </Text>
                  </View>
                  <Switch
                    value={shareProgress}
                    onValueChange={setShareProgress}
                    trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                    thumbColor={shareProgress ? colors.primary : '#f4f3f4'}
                  />
                </View>

                <View style={{ height: 1, backgroundColor: colors.borderLight }} />

                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text.primary }}>
                      Contato do Professor
                    </Text>
                    <Text style={{ fontSize: 13, color: colors.text.secondary, marginTop: 2, lineHeight: 18 }}>
                      Permite que seu professor entre em contato sobre suas atividades
                    </Text>
                  </View>
                  <Switch
                    value={teacherContact}
                    onValueChange={setTeacherContact}
                    trackColor={{ false: colors.borderLight, true: colors.primary + '60' }}
                    thumbColor={teacherContact ? colors.primary : '#f4f3f4'}
                  />
                </View>
              </View>
            </Card>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              DADOS COLETADOS
            </Text>

            <Card variant="outlined" color={colors.border}>
              <View style={{ gap: 14 }}>
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 18 }}>Perfil</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>Dados de perfil</Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary }}>Nome, email, turma</Text>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: colors.borderLight }} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 18 }}>Respostas</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>Respostas das atividades</Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary }}>Conteudo que voce produz para demonstrar aprendizado</Text>
                  </View>
                </View>
                <View style={{ height: 1, backgroundColor: colors.borderLight }} />
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Text style={{ fontSize: 18 }}>Preferencias</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14, fontWeight: '600', color: colors.text.primary }}>Preferencias</Text>
                    <Text style={{ fontSize: 13, color: colors.text.tertiary }}>Configuracoes de acessibilidade e privacidade</Text>
                  </View>
                </View>
              </View>
            </Card>

            <Text style={{
              fontSize: 13,
              color: colors.text.tertiary,
              lineHeight: 18,
              paddingHorizontal: 4,
            }}>
              Seus dados sao armazenados de forma segura e nunca compartilhados com terceiros
              sem seu consentimento explicito. Voce pode solicitar a exportacao ou remocao
              dos seus dados a qualquer momento.
            </Text>
          </View>

          <View style={{ gap: 12 }}>
            <Text style={{
              fontSize: 13,
              fontWeight: '700',
              color: colors.text.secondary,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
            }}>
              SEUS DIREITOS (LGPD)
            </Text>

            <Card variant="colored" colorLight={colors.surfaceAlt}>
              <View style={{ gap: 12 }}>
                {[
                  { right: 'Acessar', desc: 'Saber quais dados temos sobre voce' },
                  { right: 'Corrigir', desc: 'Atualizar dados incorretos ou desatualizados' },
                  { right: 'Excluir', desc: 'Solicitar remocao dos seus dados' },
                  { right: 'Exportar', desc: 'Receber seus dados em formato digital' },
                  { right: 'Revogar', desc: 'Retirar seu consentimento a qualquer momento' },
                ].map((item, i) => (
                  <View key={i} style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-start' }}>
                    <Text style={{ fontSize: 14, color: colors.primary, fontWeight: '700' }}>
                      {item.right}
                    </Text>
                    <Text style={{ fontSize: 14, color: colors.text.secondary, flex: 1 }}>
                      {item.desc}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </View>

          <View style={{ gap: 8, paddingTop: 8 }}>
            <Button
              title="Exportar meus dados"
              onPress={() => {}}
              variant="outline"
              fullWidth
            />
            <Button
              title="Solicitar remocao de dados"
              onPress={() => {}}
              variant="ghost"
              fullWidth
            />
          </View>
        </View>
      </ScreenWrapper>
    </View>
  );
}
