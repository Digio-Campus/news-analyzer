import { Comment } from '../types';

// Función optimizada para generar estadísticas con análisis de sentimiento
export function generateStats(comments: Comment[]) {
  console.log('\n📊 Generando estadísticas avanzadas...');

  const totalComments = comments.length;

  if (totalComments === 0) {
    console.log('❌ No hay comentarios para analizar');
    return;
  }

  // Análisis de sentimientos
  const sentimentStats = {
    positivos: comments.filter((c) => c.sentiment === 'positivo').length,
    negativos: comments.filter((c) => c.sentiment === 'negativo').length,
    neutrales: comments.filter((c) => c.sentiment === 'neutral').length,
  };

  // Análisis de emociones
  const emotionStats = {
    alegría: comments.filter((c) => c.emotion === 'alegría').length,
    enfado: comments.filter((c) => c.emotion === 'enfado').length,
    tristeza: comments.filter((c) => c.emotion === 'tristeza').length,
    neutral: comments.filter((c) => c.emotion === 'neutral').length,
  };

  // Comentarios por sentimiento más popular
  const mostCommonSentiment = Object.entries(sentimentStats).reduce((a, b) =>
    sentimentStats[a[0] as keyof typeof sentimentStats] >
    sentimentStats[b[0] as keyof typeof sentimentStats]
      ? a
      : b
  )[0];

  const mostCommonEmotion = Object.entries(emotionStats).reduce((a, b) =>
    emotionStats[a[0] as keyof typeof emotionStats] >
    emotionStats[b[0] as keyof typeof emotionStats]
      ? a
      : b
  )[0];

  // Mostrar estadísticas completas
  console.log('📈 === ESTADÍSTICAS GENERALES ===');
  console.log(`   📝 Total comentarios: ${totalComments}`);

  console.log('\n🎭 === ANÁLISIS DE SENTIMIENTO ===');
  console.log(
    `   😊 Positivos: ${sentimentStats.positivos} (${Math.round((sentimentStats.positivos / totalComments) * 100)}%)`
  );
  console.log(
    `   😞 Negativos: ${sentimentStats.negativos} (${Math.round((sentimentStats.negativos / totalComments) * 100)}%)`
  );
  console.log(
    `   😐 Neutrales: ${sentimentStats.neutrales} (${Math.round((sentimentStats.neutrales / totalComments) * 100)}%)`
  );
  console.log(`   🎯 Sentimiento predominante: ${mostCommonSentiment}`);

  console.log('\n💭 === ANÁLISIS DE EMOCIONES ===');
  console.log(
    `   😄 Alegría: ${emotionStats.alegría} (${Math.round((emotionStats.alegría / totalComments) * 100)}%)`
  );
  console.log(
    `   😡 Enfado: ${emotionStats.enfado} (${Math.round((emotionStats.enfado / totalComments) * 100)}%)`
  );
  console.log(
    `   😢 Tristeza: ${emotionStats.tristeza} (${Math.round((emotionStats.tristeza / totalComments) * 100)}%)`
  );
  console.log(
    `   😶 Neutral: ${emotionStats.neutral} (${Math.round((emotionStats.neutral / totalComments) * 100)}%)`
  );
  console.log(`   🎯 Emoción predominante: ${mostCommonEmotion}`);

  return {
    totalComments,
    sentimentStats,
    emotionStats,
    mostCommonSentiment,
    mostCommonEmotion,
  };
}
