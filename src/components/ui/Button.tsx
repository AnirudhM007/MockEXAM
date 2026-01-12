import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const baseStyles = "inline-flex items-center justify-center rounded-md font-bold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none uppercase tracking-wider";

        const variants = {
            primary: "bg-[var(--color-cyber-blue)] text-black hover:bg-white hover:shadow-[var(--shadow-neon-blue)] border border-[var(--color-cyber-blue)] font-bold",
            secondary: "bg-transparent border border-[var(--color-cyber-green)] text-[var(--color-cyber-green)] hover:bg-[var(--color-cyber-green)] hover:text-black hover:shadow-[var(--shadow-neon-green)]",
            danger: "bg-transparent border border-[var(--color-cyber-danger)] text-[var(--color-cyber-danger)] hover:bg-[var(--color-cyber-danger)] hover:text-white hover:shadow-[0_0_10px_#ff0055]",
            ghost: "bg-transparent text-gray-400 hover:text-white hover:bg-[var(--color-cyber-highlight)]"
        };

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-11 px-6 text-sm",
            lg: "h-14 px-8 text-lg"
        };

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizes[size], className)}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

export { Button };
