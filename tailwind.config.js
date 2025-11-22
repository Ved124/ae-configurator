module.exports = {
	darkMode: 'class',
	content: [
		"./pages/**/*.{js,jsx,ts,tsx}",
		"./components/**/*.{js,jsx,ts,tsx}",
		"./src/**/*.{js,jsx,ts,tsx}"
	],
	theme: {
		extend: {
			boxShadow: {
				'soft': '0 2px 4px -1px rgb(0 0 0 / 0.1), 0 4px 6px -1px rgb(0 0 0 / 0.05)'
			},
			animation: {
				'pulse-slow': 'pulse 2s cubic-bezier(0.4,0,0.6,1) infinite'
			},
			backgroundImage: {
				'gradient-soft': 'linear-gradient(135deg, rgba(59,130,246,0.15), rgba(147,51,234,0.15))'
			}
		}
	},
	plugins: [],
};
	// Custom color palette extension for trust / brand feel
	module.exports.theme.extend.colors = Object.assign(module.exports.theme.extend.colors || {}, {
		brand: {
			50: '#eff6ff',
			100: '#dbeafe',
			200: '#bfdbfe',
			300: '#93c5fd',
			400: '#60a5fa',
			500: '#3b82f6', // primary blue
			600: '#2563eb',
			700: '#1d4ed8',
			800: '#1e3a8a',
			900: '#1e3a8a'
		},
		accent: {
			500: '#6366f1',
			600: '#4f46e5'
		},
		grayn: {
			50: '#f8fafc',
			100: '#f1f5f9',
			200: '#e2e8f0',
			300: '#cbd5e1',
			400: '#94a3b8',
			500: '#64748b',
			600: '#475569',
			700: '#334155',
			800: '#1e293b',
			900: '#0f172a'
		}
	});