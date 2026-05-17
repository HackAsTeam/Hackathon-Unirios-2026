# Feature: Sistema de Modalidades de Resposta

## Contexto
Alunos precisam responder atividades de múltiplas formas (texto, áudio, oral com transcrição).
A UI deve comunicar liberdade, acolhimento e se adaptar às preferências do aluno.

## Requisitos

### REQ-1: Tela de Seleção de Formato
- REQ-1.1: Tela completa dedicada (não inline/scroll horizontal)
- REQ-1.2: Cards animados com Reanimated (spring ao montar, press scale)
- REQ-1.3: Cada card: cor temática do formato, ícone (Ionicons), nome, motivação
- REQ-1.4: Respeitar `reducedMotion` do store de acessibilidade
- REQ-1.5: Formatos disponíveis: text, audio, oral (escopo do hackathon)

### REQ-2: Home do Aluno
- REQ-2.1: Listar turmas em que o aluno está matriculado via GET /classrooms
- REQ-2.2: Para cada turma, listar exames via GET /exams/classroom/{id}
- REQ-2.3: Card de exame com: título, contagem de perguntas, cor de status
- REQ-2.4: Tap → navega para tela de detalhe da atividade

### REQ-3: Tela de Detalhe da Atividade
- REQ-3.1: Exibir título, descrição, perguntas do exame
- REQ-3.2: Botão "Responder" → abre seleção de formato

### REQ-4: Resposta em Áudio
- REQ-4.1: Usar expo-av para gravação real
- REQ-4.2: Permissão de microfone solicitada antes de gravar
- REQ-4.3: Botão circular grande na cor `colors.formats.audio` (#8B5CF6)
- REQ-4.4: Waveform animado com Reanimated durante gravação (barras pulsantes)
- REQ-4.5: Timer de duração visível
- REQ-4.6: Playback, regravar, enviar
- REQ-4.7: Submissão: start attempt → save answer (URI como texto) → submit

### REQ-5: Resposta Oral com Transcrição
- REQ-5.1: Gravar áudio via expo-av
- REQ-5.2: Simular transcrição progressiva com animação de texto
- REQ-5.3: Campo de texto editável com o "transcrito"
- REQ-5.4: Cor temática: `colors.formats.oral` (#06B6D4)
- REQ-5.5: Submissão via texto transcrito

### REQ-6: Resposta em Texto
- REQ-6.1: TextInput grande com contador de caracteres
- REQ-6.2: Fonte adaptada por `fontSizeScale` do store de acessibilidade
- REQ-6.3: Cor temática: `colors.formats.text` (#3B82F6)
- REQ-6.4: Submissão via save answer → submit

### REQ-7: Painel de Acessibilidade Contextual
- REQ-7.1: Botão flutuante ♿ visível em todas as telas de resposta
- REQ-7.2: Bottom sheet com toggles: alto contraste, tamanho fonte (+/-), movimento reduzido
- REQ-7.3: Reage em tempo real (Zustand, sem chamada de API)
- REQ-7.4: Posicionado no canto inferior direito, sempre acessível

## Fora do escopo (hackathon)
- Gravação de vídeo nativa (requer expo-camera)
- Transcrição real via Speech API
- Upload de arquivo de áudio para servidor (armazena URI/texto)
- Configuração de formatos permitidos por atividade no backend
