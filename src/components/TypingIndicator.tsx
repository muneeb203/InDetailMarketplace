import { motion } from 'motion/react';

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 w-16">
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          className="w-2 h-2 bg-gray-400 rounded-full"
          animate={{
            y: [0, -6, 0],
          }}
          transition={{
            duration: 0.6,
            repeat: Infinity,
            delay: i * 0.1,
          }}
        />
      ))}
    </div>
  );
}
