import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],
    theme: {
        extend: {
            fontFamily: {
                sans: ['Inter', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                app: {
                    bg: '#F6F8FC',
                    surface: '#FFFFFF',
                    navy: '#172554',
                    primary: '#2563EB',
                    accent: '#0F766E',
                    warn: '#F59E0B',
                    text: '#0F172A',
                    muted: '#64748B',
                    border: '#E2E8F0',
                    danger: '#DC2626',
                    success: '#15803D',
                },
                terminal: {
                    bg: '#0B1220',
                    surface: '#111A2E',
                    border: '#1F2A44',
                    text: '#F8FAFC',
                    muted: '#94A3B8',
                    accent: '#3B82F6',
                },
            },
            borderRadius: {
                control: '8px',
                card: '14px',
                hero: '24px',
            },
            spacing: {
                '4.5': '18px',
            },
            boxShadow: {
                floating: '0 4px 16px -4px rgba(15, 23, 42, 0.12), 0 2px 4px -2px rgba(15, 23, 42, 0.08)',
            },
        },
    },
    plugins: [forms],
};
