export const colors = {
  primary: "#16a34a",
  primaryLight: "#bbf7d0",
  primaryDark: "#15803d",

  background: "#FFFFFF",
  surface: "#FFFFFF",
  surfaceAlt: "#F0FDF4",

  text: {
    primary: "#1A1A2E",
    secondary: "#6B7280",
    tertiary: "#9CA3AF",
    inverse: "#FFFFFF",
    link: "#15803d",
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
    libras: "#64748B",
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
    libras: "#F1F5F9",
  },

  cardShadow: "rgba(22, 163, 74, 0.08)",
  overlay: "rgba(0, 0, 0, 0.4)",
};

export const formatLabels: Record<string, string> = {
  text: "Texto",
  audio: "Áudio",
  video: "Vídeo",
  drawing: "Desenho",
  mindmap: "Mapa Mental",
  presentation: "Apresentação",
  quiz: "Múltipla Escolha",
  podcast: "Podcast",
  oral: "Resposta Oral",
  libras: "Libras",
};

export const formatIcons: Record<string, string> = {
  text: "create-outline",
  audio: "mic-outline",
  video: "videocam-outline",
  drawing: "brush-outline",
  mindmap: "git-network-outline",
  presentation: "easel-outline",
  quiz: "help-circle-outline",
  podcast: "radio-outline",
  oral: "chatbubble-ellipses-outline",
  libras: "hand-left-outline",
};

export const formatDescriptions: Record<string, string> = {
  text: "Escreva sua resposta com texto",
  audio: "Grave um áudio explicando",
  video: "Grave um vídeo",
  drawing: "Faça um desenho ou ilustração",
  mindmap: "Crie um mapa mental",
  presentation: "Faça uma apresentação",
  quiz: "Selecione a alternativa correta",
  podcast: "Grave um podcast",
  oral: "Responda falando (com transcrição)",
  libras: "Responda em língua de sinais brasileira",
};

export const formatMotivations: Record<string, string> = {
  text: "Se você prefere organizar suas ideias escrevendo",
  audio: "Se você explica melhor falando",
  video: "Se você gosta de se expressar em vídeo",
  drawing: "Se você pensa visualmente e desenhando",
  mindmap: "Se você conecta ideias visualmente",
  presentation: "Se você gosta de estruturar conteúdos",
  quiz: "Se a atividade tem alternativas para selecionar",
  podcast: "Se você gosta de conversar e debater",
  oral: "Se você prefere falar do que escrever",
  libras: "Se você se comunica em Libras",
};

export const highContrastColors: typeof colors = {
  primary: "#4ade80",
  primaryLight: "#166534",
  primaryDark: "#86efac",

  background: "#000000",
  surface: "#111111",
  surfaceAlt: "#1a1a1a",

  text: {
    primary: "#ffffff",
    secondary: "#cccccc",
    tertiary: "#999999",
    inverse: "#000000",
    link: "#4ade80",
  },

  border: "#555555",
  borderLight: "#333333",
  divider: "#222222",

  success: "#4ade80",
  successLight: "#052e16",
  warning: "#fbbf24",
  warningLight: "#451a03",
  error: "#f87171",
  errorLight: "#450a0a",
  info: "#60a5fa",
  infoLight: "#1e3a5f",

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
    libras: "#64748B",
  },

  formatsLight: {
    text: "#1e3a5f",
    audio: "#2e1a47",
    video: "#450a0a",
    drawing: "#431407",
    mindmap: "#052e16",
    presentation: "#1e1b4b",
    quiz: "#451a03",
    podcast: "#500724",
    oral: "#083344",
    libras: "#1E293B",
  },

  cardShadow: "transparent",
  overlay: "rgba(0,0,0,0.7)",
};
