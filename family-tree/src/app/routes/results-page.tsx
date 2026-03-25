import { useNavigate } from 'react-router';
import { ScoreboardPage } from '../components/family-tree/pages/scoreboard-page';
import { useGame } from '../context/GameContext';

interface Player {
  name: string;
  score: number;
  badge?: string;
}

export function ResultsPage() {
  const navigate = useNavigate();
  const { dataList, members } = useGame();

  // Calculate simple scores: 10 points per answer submitted
  const scores: Record<string, number> = {};
  members.forEach(m => scores[m.name] = 0);
  dataList.forEach(d => {
    if (d.answerer && d.answerer !== 'system') {
      scores[d.answerer] = (scores[d.answerer] || 0) + 10;
    }
  });

  const topPlayers: Player[] = Object.entries(scores)
    .map(([name, score]) => ({ name, score }))
    .sort((a, b) => b.score - a.score);

  if (topPlayers.length > 0) {
    topPlayers[0].badge = '家族百科王';
  }

  const handleViewFamilyTree = () => {
    navigate('/family-tree');
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <ScoreboardPage
      topPlayers={topPlayers}
      onViewFamilyTree={handleViewFamilyTree}
      onPlayAgain={handlePlayAgain}
    />
  );
}
