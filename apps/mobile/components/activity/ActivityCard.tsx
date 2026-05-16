import { TouchableOpacity, View, Text } from 'react-native';
import { Activity, ResponseFormat } from '../../types/activity';
import { colors } from '../../lib/colors';
import { Chip } from '../ui/Chip';

interface ActivityCardProps {
  activity: Activity;
  onPress: (id: string) => void;
  compact?: boolean;
  daysUntilDue?: number;
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short' });
}

function getFormatColor(format: ResponseFormat): string {
  return colors.formats[format] || colors.primary;
}

function getFormatLight(format: ResponseFormat): string {
  return colors.formatsLight[format] || colors.surfaceAlt;
}

function getStatusColor(status: Activity['status']): string {
  switch (status) {
    case 'open': return colors.success;
    case 'in_progress': return colors.warning;
    case 'submitted': return colors.info;
    case 'graded': return colors.primary;
    case 'closed': return colors.text.tertiary;
  }
}

function getStatusLabel(status: Activity['status']): string {
  switch (status) {
    case 'open': return 'Aberta';
    case 'in_progress': return 'Em andamento';
    case 'submitted': return 'Enviada';
    case 'graded': return 'Avaliada';
    case 'closed': return 'Fechada';
  }
}

export function ActivityCard({ activity, onPress, compact = false }: ActivityCardProps) {
  const statusColor = getStatusColor(activity.status);
  const dueDate = new Date(activity.dueDate);
  const today = new Date();
  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (compact) {
    return (
      <TouchableOpacity
        onPress={() => onPress(activity.id)}
        activeOpacity={0.8}
        accessibilityLabel={`Atividade: ${activity.title}. ${activity.subject}. ${getStatusLabel(activity.status)}`}
        accessibilityRole="button"
        style={{
          backgroundColor: colors.surface,
          borderRadius: 16,
          padding: 16,
          width: 200,
          borderWidth: 1,
          borderColor: colors.borderLight,
          gap: 8,
        }}
      >
        <Text style={{ fontSize: 13, fontWeight: '600', color: statusColor }}>
          {activity.subject}
        </Text>
        <Text
          style={{ fontSize: 16, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}
          numberOfLines={2}
        >
          {activity.title}
        </Text>
        <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
          {activity.allowedFormats.slice(0, 3).map((f) => (
            <Chip
              key={f}
              label=""
              color={getFormatColor(f)}
              lightColor={getFormatLight(f)}
              icon={f === 'text' ? '✍️' : f === 'audio' ? '🎤' : f === 'video' ? '🎬' : f === 'drawing' ? '🎨' : f === 'mindmap' ? '🧠' : f === 'presentation' ? '📽️' : f === 'quiz' ? '❓' : f === 'podcast' ? '🎙️' : '🗣️'}
              size="sm"
            />
          ))}
          {activity.allowedFormats.length > 3 && (
            <Text style={{ fontSize: 11, color: colors.text.tertiary, alignSelf: 'center' }}>
              +{activity.allowedFormats.length - 3}
            </Text>
          )}
        </View>
        <Text style={{ fontSize: 12, color: daysUntilDue <= 2 ? colors.error : colors.text.tertiary }}>
          {daysUntilDue <= 0 ? 'Prazo encerrado' : daysUntilDue === 1 ? 'Último dia!' : `${daysUntilDue} dias restantes`}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={() => onPress(activity.id)}
      activeOpacity={0.8}
      accessibilityLabel={`Atividade: ${activity.title}. Objetivo: ${activity.learningObjective}`}
      accessibilityRole="button"
      style={{
        backgroundColor: colors.surface,
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: colors.borderLight,
        gap: 12,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: statusColor, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {activity.subject}
          </Text>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colors.text.primary, letterSpacing: -0.3 }}>
            {activity.title}
          </Text>
        </View>
        <View
          style={{
            backgroundColor: statusColor + '18',
            borderRadius: 100,
            paddingHorizontal: 10,
            paddingVertical: 4,
          }}
        >
          <Text style={{ fontSize: 12, fontWeight: '600', color: statusColor }}>
            {getStatusLabel(activity.status)}
          </Text>
        </View>
      </View>

      <Text style={{ fontSize: 14, color: colors.text.secondary, lineHeight: 20 }} numberOfLines={2}>
        {activity.learningObjective}
      </Text>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {activity.allowedFormats.map((f) => (
          <Chip
            key={f}
            label={f === 'text' ? 'Texto' : f === 'audio' ? 'Áudio' : f === 'video' ? 'Vídeo' : f === 'drawing' ? 'Desenho' : f === 'mindmap' ? 'Mapa Mental' : f === 'presentation' ? 'Apresentação' : f === 'quiz' ? 'Quiz' : f === 'podcast' ? 'Podcast' : 'Oral'}
            color={getFormatColor(f)}
            lightColor={getFormatLight(f)}
            size="sm"
          />
        ))}
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ fontSize: 13, color: colors.text.tertiary }}>
          {activity.teacherName} · {formatDate(activity.createdAt)}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: daysUntilDue <= 2 ? colors.error : colors.text.secondary }}>
          {daysUntilDue <= 0 ? 'Encerrado' : daysUntilDue === 1 ? 'Último dia!' : `Entrega: ${formatDate(activity.dueDate)}`}
        </Text>
      </View>
    </TouchableOpacity>
  );
}
