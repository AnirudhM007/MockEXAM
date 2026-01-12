import { HTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'neon';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
    ({ className, variant = 'default', ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    "card-glass rounded-xl p-6 transition-all duration-300 text-gray-200",
                    variant === 'neon' && "hover:shadow-[var(--shadow-neon-blue)] hover:border-[var(--color-cyber-blue)] border border-transparent",
                    className
                )}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export { Card };
