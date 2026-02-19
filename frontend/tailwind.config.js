/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                dark: {
                    900: '#06060e', // Deeper black as requested
                    800: '#0d0d15',
                    700: '#1c1c24',
                    600: '#2a2a35',
                },
                risk: {
                    low: '#10b981',    // Green
                    medium: '#f59e0b', // Yellow
                    high: '#ef4444',   // Red
                }
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            }
        },
    },
    plugins: [],
}
