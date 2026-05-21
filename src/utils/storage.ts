export const getHighScore = (gameId: string): number => {
  const score = localStorage.getItem(`high_score_${gameId}`);
  return score ? parseInt(score, 10) : 0;
};

export const setHighScore = (gameId: string, score: number): void => {
  const current = getHighScore(gameId);
  if (score > current) {
    localStorage.setItem(`high_score_${gameId}`, score.toString());
  }
};

export const getUserName = (): string => {
  return localStorage.getItem('user_name') || 'Player 1';
};

export const setUserName = (name: string): void => {
  localStorage.setItem('user_name', name);
};