import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router';
import { OpenQuestionPage } from '../components/family-tree/pages/open-question-page';
import { useGame } from '../context/GameContext';
import { convertAnswerToRelation } from '../../Utilities/answerConverter';

export function GamePage() {
  const navigate = useNavigate();
  const { question, remainingTime, duration, sendMsg, roomCode, gameStarted, userName } = useGame();

  // Track whether the game has ever been started so we only
  // navigate to /results when the game *ends* (true → false),
  // not when the page first mounts with gameStarted still false.
  const hasStartedRef = useRef(false);
  useEffect(() => {
    if (gameStarted) {
      hasStartedRef.current = true;
    } else if (hasStartedRef.current) {
      // Game was running and just ended → go to results
      navigate('/results');
    }
  }, [gameStarted, navigate]);

  const isPhase1 = question && typeof question === 'object' && (question.slots?.length === 0);

  const handleAnswer = (answer: string) => {
    if (!question) return;

    if (typeof question === 'object' && 'text' in question) {
      if (isPhase1) {
        // Phase 1: no [] slots — just send the raw answer; backend parses the relation
        sendMsg({
          action: "answer",
          roomCode,
          answer: { type: question.type ?? 'fill', value: answer },
        });
      } else {
        // Phase 2: slot-based — derive relations from the answer
        const persons = question.slots || [];
        const { relations, attrs } = convertAnswerToRelation(question, answer, persons);
        sendMsg({
          action: "answer",
          roomCode,
          answer: { type: question.type ?? 'fill', value: answer },
          relations,
          attrs,
        });
      }
    } else {
      sendMsg({ action: "answer", roomCode, answer });
    }
  };

  // Compose display question text
  let displayQuestion = '等待題目...';
  let subjectHint: string | null = null;

  if (question) {
    if (typeof question === 'string') {
      displayQuestion = question;
    } else if (question.text) {
      let text = question.text;
      const slots: string[] = question.slots || [];

      if (slots.length > 0) {
        // Phase 2: fill [] with slot names
        for (const slot of slots) {
          text = text.replace('[]', `【${slot}】`);
        }
      } else if (question.subject) {
        // Phase 1: show who this question is addressed to
        const targetName = question.subject;
        if (targetName !== userName) {
          // The question is aimed at another player — show as context
          subjectHint = `（${targetName} 的問題）`;
        }
      }
      displayQuestion = text;
    }
  }

  return (
    <OpenQuestionPage
      question={displayQuestion}
      questionObj={question}
      subjectHint={subjectHint}
      timeRemaining={remainingTime}
      totalTime={duration}
      onNext={handleAnswer}
      onPrevious={() => { }}
      showPrevious={false}
    />
  );
}
