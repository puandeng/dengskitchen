// @ts-check

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Deng's Kitchen",
  tagline: 'Crafting Culinary Experiences',
  url: 'https://dengskitchen.health',
  baseUrl: '/',
  onBrokenLinks: 'warn',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

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
          blogTitle: 'Food Journal',
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
          {to: '/tasting-menu', label: '🍽️ Menu Atelier', position: 'left'},
          {to: '/blog', label: '📝 Blog', position: 'left'},
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
                label: '🍽️ Menu Atelier',
                to: '/tasting-menu',
              },
              {
                label: '📝 Blog',
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
