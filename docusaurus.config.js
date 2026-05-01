// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Crash Landing on K-Drama',
  tagline: 'Weekly Dose of Rom-Com',
  url: 'http://crashlandingonkdrama.com',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'puandeng', // Usually your GitHub org/user name.
  projectName: 'puandeng.github.io', // Usually your repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,  

  // Even if you don't use internalization, you can use this field to set useful
  // metadata like html lang. For example, if your site is Chinese, you may want
  // to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
        },
        blog: {
          showReadingTime: true,
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
        title: 'Dramas',
        logo: {
          alt: 'My Site Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'watched_dramas2023',
            position: 'left',
            label: 'Tutorial',
          },
          {to: '/blog', label: 'Blog', position: 'left'},
          {to: '/tasting-menu', label: '🍽️ Menu Atelier', position: 'left'},
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
            title: 'Watched',
            items: [
              {
                label: '2023',
                to: '/docs/watched_dramas2023/',
              },
            ],
          },
          {
            title: 'Follow me :)',
            items: [
              {
                label: 'MyDramaList',
                href: 'https://mydramalist.com/profile/swimmathster/',
              },
              {
                label: 'Discord',
                href: 'https://discordapp.com/invite/docusaurus/',
              },
              {
                label: 'Twitter',
                href: 'https://twitter.com/docusaurus/',
              },
            ],
          },
          {
            title: 'Weekly Blog',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Aaron Deng. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
