import { useNavigate } from 'react-router';
import { FamilyTreeResultPage } from '../components/family-tree/pages/family-tree-result-page';

export function FamilyTreePage() {
  const navigate = useNavigate();

  const mockFamilyMembers = [
    { id: '1', name: '你', relation: '本人', x: 200, y: 400, connections: ['2', '3'] },
    { id: '2', name: '王爸爸', relation: '你的爸爸', birthYear: '1970', x: 100, y: 250, connections: ['4', '5'] },
    { id: '3', name: '王媽媽', relation: '你的媽媽', birthYear: '1972', x: 300, y: 250, connections: ['6', '7'] },
    { id: '4', name: '王阿公', relation: '你的爺爺', birthYear: '1945', x: 50, y: 100 },
    { id: '5', name: '王阿嬤', relation: '你的奶奶', birthYear: '1948', x: 150, y: 100 },
    { id: '6', name: '外公', relation: '你的外公', birthYear: '1943', x: 250, y: 100 },
    { id: '7', name: '外婆', relation: '你的外婆', birthYear: '1947', x: 350, y: 100 }
  ];

  const handleShare = () => {
    alert('分享家族樹（功能示範）');
  };

  const handlePlayAgain = () => {
    navigate('/');
  };

  return (
    <FamilyTreeResultPage
      members={mockFamilyMembers}
      onShare={handleShare}
      onPlayAgain={handlePlayAgain}
    />
  );
}
