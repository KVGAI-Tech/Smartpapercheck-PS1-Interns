import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	extend: {
		transitionProperty: {
			'chakra-common': 'var(--chakra-transition-property-common)',
		  },
		  transitionDuration: {
			'chakra-normal': 'var(--chakra-transition-duration-normal)',
		  },
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))' , 
				600:'#6938EF'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			} ,
			  whiteAlpha: {
				50: 'rgba(255, 255, 255, 0.04)',
				100: '#FFFFFF',
				200: '#FFFFFF',
				300: '#FFFFFF',
				400: '#FFFFFF',
				500: '#FFFFFF',
				600: '#FFFFFF',
				700: '#FFFFFF',
				800: '#FFFFFF',
				900: '#FFFFFF',
			  },
			  blackAlpha: {
				50: 'rgba(0, 0, 0, 0.04)',
				100: 'rgba(0, 0, 0, 0.06)',
				200: 'rgba(0, 0, 0, 0.08)',
				300: 'rgba(0, 0, 0, 0.16)',
				400: 'rgba(0, 0, 0, 0.24)',
				500: 'rgba(0, 0, 0, 0.36)',
				600: 'rgba(0, 0, 0, 0.48)',
				700: 'rgba(0, 0, 0, 0.64)',
				800: 'rgba(0, 0, 0, 0.80)',
				900: 'rgba(0, 0, 0, 0.92)',
			  },
			  gray: {
				25: '#FCFCFD',
				50: '#F9FAFB',
				100: '#F2F4F7',
				200: '#EAECF0',
				300: '#D0D5DD',
				400: '#98A2B3',
				500: '#667085',
				600: '#475467',
				700: '#344054',
				800: '#1D2939',
				900: '#101828',
			  },
			  red: {
				25: '#FFFBFA',
				50: '#FEF3F2',
				100: '#FEE4E2',
				200: '#FECDCA',
				300: '#FDA29B',
				400: '#F97066',
				500: '#F04438',
				600: '#D92D20',
				700: '#B42318',
				800: '#912018',
				900: '#7A271A',
			  }, orange: {
				25: '#FFFAF5',
				50: '#FFF6ED',
				100: '#FFEAD5',
				200: '#FDDCAB',
				300: '#FEB273',
				400: '#FD853A',
				500: '#FB6514',
				600: '#EC4A0A',
				700: '#C4320A',
				800: '#9C2A10',
				900: '#7E2410',
			  },
			  yellow: {
				25: '#FFFCF5',
				50: '#FFFAEB',
				100: '#FEF0C7',
				200: '#FEDF89',
				300: '#FEC84B',
				400: '#FDB022',
				500: '#F79009',
				600: '#DC6803',
				700: '#B54708',
				800: '#93370D',
				900: '#7A2E0E',
			  }  , 
			  green: {
				25: '#F6FEF9',
				50: '#ECFDF3',
				100: '#D1FADF',
				200: '#A6F4C5',
				300: '#6CE9A6',
				400: '#32D583',
				500: '#12B76A',
				600: '#039855',
				700: '#027A48',
				800: '#05603A',
				900: '#054F31',
			  },
			  teal: {
				50: '#E6FFFA',
				100: '#B2F5EA',
				200: '#81E6D9',
				300: '#4FD1C5',
				400: '#38B2AC',
				500: '#319795',
				600: '#2C7A7B',
				700: '#285E61',
				800: '#234E52',
				900: '#1D4044',
			  },

			  blue: {
          25: '#F5FAFF',
          50: '#EFF8FF',
          100: '#D1E9FF',
          200: '#B2DDFF',
          300: '#84CAFF',
          400: '#53B1FD',
          500: '#2E90FA',
          600: '#1570EF',
          700: '#175CD3',
          800: '#1849A9',
          900: '#194185',
        },
        cyan: {
          50: '#EDFDFD',
          100: '#C4F1F9',
          200: '#9DECF9',
          300: '#76E4F7',
          400: '#0BC5EA',
          500: '#00B5D8',
          600: '#00A3C4',
          700: '#0987A0',
          800: '#086F83',
          900: '#065666',
        },
		purple: {
			50: '#FAF5FF',
			100: '#E9D8FD',
			200: '#D6BCFA',
			300: '#B794F4',
			400: '#9F7AEA',
			500: '#805AD5',
			600: '#6B46C1',
			700: '#553C9A',
			800: '#44337A',
			900: '#322659',
		  },
		  pink: {
			25: '#FEF6FB',
			50: '#FDF2FA',
			100: '#FCE7F6',
			200: '#FCCEEE',
			300: '#FAA7E0',
			400: '#F670C7',
			500: '#EE46BC',
			600: '#DD2590',
			700: '#C11574',
			800: '#9E165F',
			900: '#851651',
		  },
			

  	} , 
	  fontFamily: {
        sans: ['var(--font-dm-sans)', 'sans-serif'],
      },
  },

  plugins: [require("tailwindcss-animate")],
}
};
export default config;
