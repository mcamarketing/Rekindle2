import { ButtonHTMLAttributes, useState, MouseEvent } from 'react';
import { motion } from 'framer-motion';

interface RippleButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

interface Ripple {
  x: number;
  y: number;
  id: number;
}

export function RippleButton({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  onClick,
  disabled,
  ...props
}: RippleButtonProps) {
  const [ripples, setRipples] = useState<Ripple[]>([]);

  const handleClick = (e: MouseEvent<HTMLButtonElement>) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newRipple = {
      x,
      y,
      id: Date.now(),
    };

    setRipples((prev) => [...prev, newRipple]);

    setTimeout(() => {
      setRipples((prev) => prev.filter((r) => r.id !== newRipple.id));
    }, 600);

    if (onClick) {
      onClick(e);
    }
  };

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#FF6B35] to-[#F7931E] text-white hover:shadow-lg',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    outline: 'border-2 border-[#FF6B35] text-[#FF6B35] hover:bg-orange-50',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };

  const sizeClasses = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`
        relative overflow-hidden rounded-lg font-semibold
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        focus:outline-none focus:ring-4 focus:ring-orange-200
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${className}
      `}
      onClick={handleClick}
      disabled={disabled}
      {...props}
    >
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-white rounded-full opacity-30"
          initial={{
            width: 0,
            height: 0,
            x: ripple.x,
            y: ripple.y,
          }}
          animate={{
            width: 400,
            height: 400,
            x: ripple.x - 200,
            y: ripple.y - 200,
            opacity: 0,
          }}
          transition={{ duration: 0.6 }}
        />
      ))}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
}
