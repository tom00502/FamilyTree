import { useNavigate } from 'react-router';
import { ScoreboardPage } from '../components/family-tree/pages/scoreboard-page';

interface Player {
  name: string;
  score: number;
  badge?: string;
}

export function ResultsPage() {
  const navigate = useNavigate();

  const topPlayers: Player[] = [
    { name: '王小明', score: 98, badge: '家族百科王' },
    { name: '王小華', score: 92 },
    { name: '王大明', score: 88 }
  ];

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
