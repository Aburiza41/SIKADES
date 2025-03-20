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
                sans: ['Figtree', ...defaultTheme.fontFamily.sans],
            },
            colors: {
                primary: "#1B5E20", // Deep Forest Green
                secondary: "#D32F2F", // Rich Palm Oil Red
                accent: "#FFB300", // Golden Yellow
                dark: "#212121", // Charcoal Black
                chocolate: '#D2691E',
            },
        },
    },

    plugins: [forms],
};
