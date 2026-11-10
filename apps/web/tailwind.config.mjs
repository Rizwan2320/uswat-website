/** @type {import('tailwindcss').Config} */
const config = {
  theme: {
    extend: {
      typography: {
        DEFAULT: {
          css: [
            {
              '--tw-prose-body': 'var(--text)',
              '--tw-prose-headings': 'var(--forest)',
              '--tw-prose-links': 'var(--maroon)',
              '--tw-prose-bullets': 'var(--forest-soft)',
              '--tw-prose-counters': 'var(--forest-soft)',
              h1: {
                fontWeight: '600',
                marginBottom: '0.25em',
              },
              'h1, h2, h3, h4': {
                fontFamily: 'var(--stack-serif)',
                fontWeight: '600',
              },
            },
          ],
        },
        base: {
          css: [
            {
              h1: {
                fontSize: '2.5rem',
              },
              h2: {
                fontSize: '1.25rem',
                fontWeight: 600,
              },
            },
          ],
        },
        md: {
          css: [
            {
              h1: {
                fontSize: '3.5rem',
              },
              h2: {
                fontSize: '1.5rem',
              },
            },
          ],
        },
      },
    },
  },
}

export default config
