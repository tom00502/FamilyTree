import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { QuestionRelationshipPage } from '../components/family-tree/pages/question-relationship-page';
import { QuestionFamilySidePage } from '../components/family-tree/pages/question-family-side-page';
import { OpenQuestionPage } from '../components/family-tree/pages/open-question-page';

export function GamePage() {
  const navigate = useNavigate();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [gameDuration] = useState<number>(120);
  const [timeRemaining, setTimeRemaining] = useState<number>(120);

  const mockQuestions = [
    { type: 'relationship', person: '王小明' },
    { type: 'family-side', person: '王小華' },
    { type: 'open', question: '你的阿公（爸爸的爸爸）叫什麼名字？' }
  ];

  // Timer countdown effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleNextQuestion();
          return gameDuration;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, gameDuration]);

  const handleNextQuestion = () => {
    const nextIndex = currentQuestionIndex + 1;
    
    if (nextIndex >= mockQuestions.length) {
      // Game finished, navigate to results
      navigate('/results');
      return;
    }

    setCurrentQuestionIndex(nextIndex);
    setTimeRemaining(gameDuration);
  };

  const handleAnswer = (answer: string) => {
    console.log('Answer:', answer);
    handleNextQuestion();
  };

  const handleSkip = () => {
    handleNextQuestion();
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setTimeRemaining(gameDuration);
    }
  };

  const currentQuestion = mockQuestions[currentQuestionIndex];

  // Render current question type
  if (currentQuestion.type === 'relationship') {
    return (
      <QuestionRelationshipPage
        personName={currentQuestion.person || '王小明'}
        timeRemaining={timeRemaining}
        totalTime={gameDuration}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
      />
    );
  }

  if (currentQuestion.type === 'family-side') {
    return (
      <QuestionFamilySidePage
        personName={currentQuestion.person || '王小華'}
        timeRemaining={timeRemaining}
        totalTime={gameDuration}
        onAnswer={handleAnswer}
        onSkip={handleSkip}
      />
    );
  }

  if (currentQuestion.type === 'open') {
    return (
      <OpenQuestionPage
        question={currentQuestion.question || '你的阿公叫什麼名字？'}
        timeRemaining={timeRemaining}
        totalTime={gameDuration}
        onNext={handleAnswer}
        onPrevious={handlePrevious}
        showPrevious={currentQuestionIndex > 0}
      />
    );
  }

  return null;
}
