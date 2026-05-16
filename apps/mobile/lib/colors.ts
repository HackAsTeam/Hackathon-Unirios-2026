export const colors = {
  primary: "#6C5CE7",
  primaryLight: "#A29BFE",
  primaryDark: "#5A4BD1",

  background: "#FAFAFE",
  surface: "#FFFFFF",
  surfaceAlt: "#F4F3FF",

  text: {
    primary: "#1A1A2E",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
    link: "#6C5CE7",
  },

  border: "#E5E7EB",
  borderLight: "#F3F4F6",
  divider: "#F0F0F5",

  success: "#22C55E",
  successLight: "#DCFCE7",
  warning: "#EAB308",
  warningLight: "#FEF9C3",
  error: "#EF4444",
  errorLight: "#FEE2E2",
  info: "#3B82F6",
  infoLight: "#DBEAFE",

  formats: {
    text: "#3B82F6",
    audio: "#8B5CF6",
    video: "#EF4444",
    drawing: "#F97316",
    mindmap: "#22C55E",
    presentation: "#6366F1",
    quiz: "#EAB308",
    podcast: "#EC4899",
    oral: "#06B6D4",
  },

  formatsLight: {
    text: "#DBEAFE",
    audio: "#F3E8FF",
    video: "#FEE2E2",
    drawing: "#FFF7ED",
    mindmap: "#DCFCE7",
    presentation: "#E0E7FF",
    quiz: "#FEF9C3",
    podcast: "#FCE7F3",
    oral: "#CFFAFE",
  },

  cardShadow: "rgba(108, 92, 231, 0.08)",
  overlay: "rgba(0, 0, 0, 0.4)",
};

export const formatLabels: Record<string, string> = {
  text: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  drawing: "Desenho",
  mindmap: "Mapa Mental",
  presentation: "Apresentação",
  quiz: "Quiz",
  podcast: "Podcast",
  oral: "Resposta Oral",
};

export const formatIcons: Record<string, string> = {
  text: "✍️",
  audio: "🎤",
  video: "🎬",
  drawing: "🎨",
  mindmap: "🧠",
  presentation: "📽️",
  quiz: "❓",
  podcast: "🎙️",
  oral: "🗣️",
};

export const formatDescriptions: Record<string, string> = {
  text: "Escreva sua resposta com texto",
  audio: "Grave um áudio explicando",
  video: "Grave um vídeo",
  drawing: "Faça um desenho ou ilustração",
  mindmap: "Crie um mapa mental",
  presentation: "Faça uma apresentação",
  quiz: "Responda a um quiz",
  podcast: "Grave um podcast",
  oral: "Responda falando (com transcrição)",
};

export const formatMotivations: Record<string, string> = {
  text: "Se você prefere organizar suas ideias escrevendo",
  audio: "Se você explica melhor falando",
  video: "Se você gosta de se expressar em vídeo",
  drawing: "Se você pensa visualmente e desenhando",
  mindmap: "Se você conecta ideias visualmente",
  presentation: "Se você gosta de estruturar conteúdos",
  quiz: "Se você aprende respondendo perguntas",
  podcast: "Se você gosta de conversar e debater",
  oral: "Se você prefere falar do que escrever",
};
