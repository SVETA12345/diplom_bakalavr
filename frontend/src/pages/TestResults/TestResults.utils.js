export const formatTime = (seconds) => {
  if (!seconds) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '—';
  return new Date(dateString).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

export const getAnswerForQuestion = (attempt, questionId) => {
  return attempt?.answers?.find(a => a.questionId === questionId);
};