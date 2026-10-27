
import type { Config } from "tailwindcss";
import tailwindcssAnimate from "tailwindcss-animate";

export default {
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				sidebar: {
					DEFAULT: 'hsl(var(--sidebar-background))',
					foreground: 'hsl(var(--sidebar-foreground))',
					primary: 'hsl(var(--sidebar-primary))',
					'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
					accent: 'hsl(var(--sidebar-accent))',
					'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
					border: 'hsl(var(--sidebar-border))',
					ring: 'hsl(var(--sidebar-ring))'
				},
				medask: {
					primary: '#9b87f5',
					secondary: '#7E69AB',
					tertiary: '#6E59A5',
					light: '#D6BCFA',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
        'accordion-down': {
          from: { maxHeight: '0', opacity: '0' },
          to: { maxHeight: 'var(--radix-accordion-content-height)', opacity: '1' },
        },
        'accordion-up': {
          from: { maxHeight: 'var(--radix-accordion-content-height)', opacity: '1' },
          to: { maxHeight: '0', opacity: '0' },
        },
				'fade-in': {
					'0%': { opacity: '0' }, // Removed transform: translateY(10px)
					'100%': { opacity: '1' }  // Removed transform: translateY(0)
				},
				'pulse-glow': {
					'0%, 100%': {
						opacity: '1'
					},
					'50%': {
					opacity: '0.5'
					}
				},
        'opacity-fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'opacity-fade-out': {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' },
        },
			},
			animation: {
				'accordion-down': 'accordion-down 0.3s ease-out',
				'accordion-up': 'accordion-up 0.3s ease-out',
				'fade-in': 'fade-in 0.5s ease-out',
				'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'opacity-fade-in': 'opacity-fade-in 0.3s ease-out',
        'opacity-fade-out': 'opacity-fade-out 0.3s ease-out',
			},
			backgroundImage: {
				'gradient-violet': 'linear-gradient(135deg, #9b87f5 0%, #7E69AB 100%)',
				'gradient-violet-light': 'linear-gradient(135deg, #D6BCFA 0%, #9b87f5 100%)',
				'gradient-galaxy': 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
			}
		}
	},
	plugins: [tailwindcssAnimate],
} satisfies Config;
