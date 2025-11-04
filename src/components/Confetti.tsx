import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface ConfettiPiece {
  id: number;
  x: number;
  y: number;
  rotation: number;
  color: string;
  size: number;
  velocityX: number;
  velocityY: number;
}

interface ConfettiProps {
  trigger: boolean;
  onComplete?: () => void;
}

export function Confetti({ trigger, onComplete }: ConfettiProps) {
  const [pieces, setPieces] = useState<ConfettiPiece[]>([]);

  useEffect(() => {
    if (!trigger) return;

    const colors = ['#FF6B35', '#F7931E', '#4ECDC4', '#45B7D1', '#FFA07A'];
    const newPieces: ConfettiPiece[] = [];

    for (let i = 0; i < 50; i++) {
      newPieces.push({
        id: i,
        x: Math.random() * window.innerWidth,
        y: -20,
        rotation: Math.random() * 360,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 10 + 5,
        velocityX: (Math.random() - 0.5) * 4,
        velocityY: Math.random() * 2 + 2,
      });
    }

    setPieces(newPieces);

    const timeout = setTimeout(() => {
      setPieces([]);
      if (onComplete) onComplete();
    }, 3000);

    return () => clearTimeout(timeout);
  }, [trigger, onComplete]);

  if (pieces.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {pieces.map((piece) => (
        <motion.div
          key={piece.id}
          className="absolute"
          initial={{
            x: piece.x,
            y: piece.y,
            rotate: piece.rotation,
          }}
          animate={{
            y: window.innerHeight + 100,
            x: piece.x + piece.velocityX * 100,
            rotate: piece.rotation + 720,
          }}
          transition={{
            duration: 3,
            ease: 'easeIn',
          }}
          style={{
            width: piece.size,
            height: piece.size,
            backgroundColor: piece.color,
            borderRadius: Math.random() > 0.5 ? '50%' : '0',
          }}
        />
      ))}
    </div>
  );
}
