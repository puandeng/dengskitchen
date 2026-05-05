// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Deng's Kitchen",
  tagline: 'Passion Project of a Home Cook',
  url: 'https://dengskitchen.health',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/pineapple-bun.svg',

  organizationName: 'puandeng',
  projectName: 'dengskitchen',
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false,
        blog: {
          showReadingTime: true,
          blogTitle: 'Salt & Story',
          blogDescription: "Thoughts on food, cooking, and dining",
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: "Deng's Kitchen",
        items: [
          {to: '/tasting-menu', label: '🍽️ Pepper & Palate', position: 'left'},
          {to: '/blog', label: '📖 Salt & Story', position: 'left'},
          {
            href: 'https://github.com/puandeng',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Explore',
            items: [
              {
                label: '🍽️ Pepper & Palate',
                to: '/tasting-menu',
              },
              {
                label: '📖 Salt & Story',
                to: '/blog',
              },
            ],
          },
          {
            title: 'Follow My Cooking',
            items: [
              {
                label: '📸 Instagram',
                href: 'https://instagram.com/aarondeng',
              },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'GitHub',
                href: 'https://github.com/puandeng',
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} Aaron Deng. Crafted with Food and Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
