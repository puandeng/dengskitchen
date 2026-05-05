import React from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import styles from './index.module.css';

const features = [
  {
    icon: '/img/icon-pepper-palate.svg',
    title: 'Pepper & Palate',
    description: 'Design tasting menus collaboratively in real time. Brainstorm recipes with AI and generate beautiful dish images.',
    link: '/tasting-menu',
    linkText: 'Start Creating',
  },
  {
    icon: '/img/icon-salt-story.svg',
    title: 'Salt & Story',
    description: 'Thoughts on cooking, ingredients, techniques, and the stories behind every dish throughout the year.',
    link: '/blog',
    linkText: 'Read the Blog',
  },
  {
    icon: '/img/icon-fire-feast.svg',
    title: 'Fire & Feast',
    description: 'Video recipes straight from the kitchen — watch, cook along, and feast on homemade creations.',
    link: '/fire-and-feast',
    linkText: 'Watch Videos',
  },
];

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={styles.hero}>
      <div className={styles.heroInner}>
        <img src="/img/pineapple-bun.svg" alt="Pineapple Bun" className={styles.heroEmoji} />
        <h1 className={styles.heroTitle}>{siteConfig.title}</h1>
        <p className={styles.heroSubtitle}>{siteConfig.tagline}</p>
      </div>
    </header>
  );
}

function FeatureCard({icon, emoji, title, description, link, linkText}) {
  return (
    <div className={styles.featureCard}>
      {icon ? (
        <img src={icon} alt={title} className={styles.featureIcon} />
      ) : (
        <div className={styles.featureEmoji}>{emoji}</div>
      )}
      <h3 className={styles.featureTitle}>{title}</h3>
      <p className={styles.featureDesc}>{description}</p>
      <Link className={styles.featureLink} to={link}>{linkText} →</Link>
    </div>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="Home"
      description={siteConfig.tagline}>
      <HomepageHeader />
      <main className={styles.main}>
        <section className={styles.features}>
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </section>
      </main>
    </Layout>
  );
}
