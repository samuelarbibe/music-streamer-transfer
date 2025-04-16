"use client";
import { PropsWithChildren } from "react";
import { motion } from "motion/react";

export type Card = {
  id: number;
  content: React.ReactNode;
};

export interface CardStackProps extends PropsWithChildren {
  items: Card[];
  offset?: number;
  scaleFactor?: number;
}

export const CardStack = ({
  items,
  offset,
  scaleFactor,
}: CardStackProps) => {
  const CARD_OFFSET = offset || 10;
  const SCALE_FACTOR = scaleFactor || 0.06;

  return (
    <div className="relative  h-60 w-60 md:h-60 md:w-96">
      {items.map((card, index) => {
        return (
          <motion.div
            key={card.id}
            className="absolute dark:bg-black bg-white h-60 w-60 md:h-60 md:w-96 rounded-3xl p-4 shadow-xl border border-neutral-200 dark:border-white/[0.1]  shadow-black/[0.1] dark:shadow-white/[0.05] flex flex-col justify-between"
            style={{
              transformOrigin: "top center",
            }}
            animate={{
              top: index * -CARD_OFFSET,
              scale: 1 - index * SCALE_FACTOR,
              zIndex: items.length - index,
            }}
          >
            {card.content}
          </motion.div>
        );
      })}
    </div>
  );
};
