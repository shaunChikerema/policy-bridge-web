import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost' | 'link' | 'insurance';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'default', size = 'default', asChild = false, ...props }, ref) => {
    const Comp = asChild ? 'span' : 'button';
    
    return (
      <Comp
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
          
          // Variant styles
          {
            // Default - Primary brand color
            'bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 active:bg-primary/80': 
              variant === 'default',
            
            // Secondary - Muted background
            'bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80 active:bg-secondary/70': 
              variant === 'secondary',
            
            // Destructive - Error/danger actions
            'bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90 active:bg-destructive/80': 
              variant === 'destructive',
            
            // Outline - Border with transparent background
            'border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground active:bg-accent/80': 
              variant === 'outline',
            
            // Ghost - Minimal styling
            'hover:bg-accent hover:text-accent-foreground active:bg-accent/80': 
              variant === 'ghost',
            
            // Link - Text-only button
            'text-primary underline-offset-4 hover:underline active:text-primary/80': 
              variant === 'link',
            
            // Insurance - Special gradient variant
            'insurance-gradient text-white shadow-lg hover:shadow-xl active:shadow-md transform hover:-translate-y-0.5 active:translate-y-0': 
              variant === 'insurance',
          },
          
          // Size styles
          {
            'h-9 px-4 py-2': size === 'default',
            'h-8 rounded-md px-3 text-xs': size === 'sm',
            'h-10 rounded-md px-8': size === 'lg',
            'h-9 w-9': size === 'icon',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = 'Button';

export { Button };