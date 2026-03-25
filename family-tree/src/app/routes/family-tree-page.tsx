import { useNavigate } from 'react-router';
import { FamilyTreeResultPage } from '../components/family-tree/pages/family-tree-result-page';
import { useGame } from '../context/GameContext';

export function FamilyTreePage() {
  const navigate = useNavigate();
  const { dataList, attrsMap } = useGame();

  const finalDataList = dataList || [];
  const finalAttrsMap = attrsMap || {};

  const handleShare = () => {
    alert('分享家族樹（功能示範）');
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <FamilyTreeResultPage
      dataList={finalDataList}
      attrsMap={finalAttrsMap}
      onShare={handleShare}
      onPlayAgain={handlePlayAgain}
    />
  );
}
