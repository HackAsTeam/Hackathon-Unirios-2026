import { Activity, ActivityResponse, User } from '../types/activity';

export const MOCK_STUDENT: User = {
  id: 'student-1',
  name: 'Luiza Martins',
  email: 'luiza.martins@escola.edu',
  role: 'student',
  createdAt: 'Março 2025',
  accessibility: {
    highContrast: false,
    fontSizeScale: 1,
    reducedMotion: false,
    prefersAudio: false,
    prefersVisual: true,
    screenReader: false,
  },
  privacy: {
    dataConsent: true,
    shareProgressWithPeers: false,
    allowTeacherContact: true,
    dataRetentionMonths: 12,
  },
};

export const MOCK_TEACHER: User = {
  id: 'teacher-1',
  name: 'Profa. Ana Clara',
  email: 'ana.clara@escola.edu',
  role: 'teacher',
  createdAt: 'Janeiro 2020',
  accessibility: {
    highContrast: false,
    fontSizeScale: 1,
    reducedMotion: false,
    prefersAudio: false,
    prefersVisual: false,
    screenReader: false,
  },
  privacy: {
    dataConsent: true,
    shareProgressWithPeers: true,
    allowTeacherContact: true,
    dataRetentionMonths: 24,
  },
};

export const MOCK_ACTIVITIES: Activity[] = [
  {
    id: 'act-1',
    title: 'Ciclo da Água na Natureza',
    learningObjective:
      'Compreender e explicar as etapas do ciclo da água e sua importância para os ecossistemas.',
    description:
      'Explore como a água se movimenta na natureza: evaporação, condensação, precipitação e infiltração. Demonstre seu entendimento sobre como esse ciclo sustenta a vida no planeta.',
    teacherId: 'teacher-1',
    teacherName: 'Profa. Ana Clara',
    subject: 'Ciências',
    allowedFormats: ['text', 'drawing', 'mindmap', 'oral', 'audio'],
    dueDate: '2026-05-22',
    status: 'open',
    createdAt: '2026-05-14',
    instructions:
      'Escolha o formato que mais combina com você para mostrar o que aprendeu sobre o ciclo da água. Capriche nos detalhes!',
    supportMaterials: [
      'https://escola.edu/materiais/ciclo-agua.pdf',
      'https://escola.edu/videos/ciclo-agua',
    ],
    rubric: [
      { criterion: 'Compreensão do conceito', description: 'Demonstra entendimento do ciclo completo', weight: 3 },
      { criterion: 'Detalhamento das etapas', description: 'Explica cada etapa com clareza', weight: 3 },
      { criterion: 'Criatividade', description: 'Forma original de demonstrar o aprendizado', weight: 2 },
      { criterion: 'Conexão com o mundo real', description: 'Relaciona o ciclo com exemplos práticos', weight: 2 },
    ],
  },
  {
    id: 'act-2',
    title: 'Grandezas e Medidas no Dia a Dia',
    learningObjective:
      'Identificar e aplicar diferentes unidades de medida em situações cotidianas.',
    description:
      'Vamos explorar como usamos medidas no nosso dia a dia: comprimento, massa, capacidade e tempo. Mostre como você enxerga as grandezas ao seu redor.',
    teacherId: 'teacher-1',
    teacherName: 'Profa. Ana Clara',
    subject: 'Matemática',
    allowedFormats: ['text', 'video', 'presentation', 'quiz', 'podcast'],
    dueDate: '2026-05-28',
    status: 'open',
    createdAt: '2026-05-14',
    instructions:
      'Observe as situações do seu cotidiano que envolvem medidas. Use fotos, exemplos reais ou crie problemas para demonstrar seu aprendizado.',
    rubric: [
      { criterion: 'Identificação de medidas', description: 'Reconhece diferentes tipos de medida', weight: 3 },
      { criterion: 'Aplicação prática', description: 'Relaciona medidas ao cotidiano', weight: 3 },
      { criterion: 'Precisão', description: 'Usa as unidades corretamente', weight: 2 },
      { criterion: 'Comunicação', description: 'Explica o raciocínio com clareza', weight: 2 },
    ],
  },
  {
    id: 'act-3',
    title: 'Contos Populares Brasileiros',
    learningObjective:
      'Analisar elementos da cultura popular brasileira através de contos tradicionais e criar uma releitura criativa.',
    description:
      'Conheça contos como "O Saci", "Curupira" e "Iara". Depois de explorar essas histórias, crie sua própria versão ou releitura de um conto popular.',
    teacherId: 'teacher-1',
    teacherName: 'Profa. Ana Clara',
    subject: 'Língua Portuguesa',
    allowedFormats: ['text', 'audio', 'drawing', 'podcast', 'oral', 'video'],
    dueDate: '2026-06-05',
    status: 'open',
    createdAt: '2026-05-12',
    instructions:
      'Leia os contos disponíveis na biblioteca da turma. Depois, escolha um formato para recontar ou reinventar uma história do folclore brasileiro.',
    rubric: [
      { criterion: 'Compreensão do gênero', description: 'Entende as características dos contos populares', weight: 3 },
      { criterion: 'Criatividade na releitura', description: 'Traz elementos originais para a história', weight: 3 },
      { criterion: 'Elementos culturais', description: 'Incorpora aspectos da cultura brasileira', weight: 2 },
      { criterion: 'Estrutura narrativa', description: 'Organiza a história com começo, meio e fim', weight: 2 },
    ],
  },
  {
    id: 'act-4',
    title: 'Meu Ambiente Sustentável',
    learningObjective:
      'Propor soluções sustentáveis para problemas ambientais identificados no entorno da escola.',
    description:
      'Observe o ambiente ao redor da escola. Identifique um problema ambiental e proponha uma solução criativa e sustentável.',
    teacherId: 'teacher-1',
    teacherName: 'Profa. Ana Clara',
    subject: 'Ciências / Geografia',
    allowedFormats: ['text', 'drawing', 'mindmap', 'presentation', 'video'],
    dueDate: '2026-06-12',
    status: 'in_progress',
    createdAt: '2026-05-10',
    instructions:
      'Caminhe pelo entorno da escola, fotografe ou anote situações que precisam de melhoria. Depois, escolha o melhor formato para apresentar sua proposta.',
    rubric: [
      { criterion: 'Identificação do problema', description: 'Reconhece um problema real no ambiente', weight: 3 },
      { criterion: 'Proposta de solução', description: 'Apresenta solução viável e criativa', weight: 3 },
      { criterion: 'Sustentabilidade', description: 'Considera aspectos ambientais e sociais', weight: 2 },
      { criterion: 'Clareza na comunicação', description: 'Transmite a ideia de forma compreensível', weight: 2 },
    ],
  },
  {
    id: 'act-5',
    title: 'Frações na Cozinha',
    learningObjective:
      'Compreender o conceito de frações a partir de situações práticas de medição de ingredientes.',
    description:
      'Vamos usar a cozinha como laboratório de matemática! Explore como as frações aparecem em receitas, medidas e porções.',
    teacherId: 'teacher-1',
    teacherName: 'Profa. Ana Clara',
    subject: 'Matemática',
    allowedFormats: ['text', 'video', 'drawing', 'quiz', 'podcast'],
    dueDate: '2026-05-30',
    status: 'open',
    createdAt: '2026-05-08',
    instructions:
      'Escolha uma receita simples e identifique as frações nos ingredientes. Mostre como você entendeu o conceito na prática!',
    rubric: [
      { criterion: 'Compreensão de frações', description: 'Entende o conceito de frações', weight: 3 },
      { criterion: 'Aplicação prática', description: 'Usa exemplos concretos do cotidiano', weight: 3 },
      { criterion: 'Raciocínio matemático', description: 'Demonstra o pensamento matemático', weight: 2 },
      { criterion: 'Criatividade', description: 'Aborda o tema de forma original', weight: 2 },
    ],
  },
];

export const MOCK_RESPONSES: ActivityResponse[] = [
  {
    id: 'resp-1',
    activityId: 'act-4',
    studentId: 'student-1',
    studentName: 'Luiza Martins',
    format: 'drawing',
    content: { imageUrl: '', description: 'Desenho mostrando horta vertical na escola' },
    submittedAt: '2026-05-15T10:30:00',
    status: 'submitted',
  },
];

export function getActivityById(id: string): Activity | undefined {
  return MOCK_ACTIVITIES.find((a) => a.id === id);
}

export function getUserById(id: string): User | undefined {
  if (id === 'student-1') return MOCK_STUDENT;
  if (id === 'teacher-1') return MOCK_TEACHER;
  return undefined;
}
