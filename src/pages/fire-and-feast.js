import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './fire-and-feast.module.css';

// ─── Sample video data (replace with your actual videos) ─────────────────────

const VIDEOS = [
  {
    id: 'placeholder',
    title: 'Your First Video',
    youtubeId: 'dQw4w9WgXcQ', // Replace with your actual YouTube video ID
    description: 'Add your first cooking video here! Replace the youtubeId with your actual YouTube video ID.',
    recipe: {
      servings: '4',
      time: '45 min',
      ingredients: [
        '2 cups flour',
        '1 tsp salt',
        '1 cup warm water',
      ],
      steps: [
        'Combine dry ingredients in a large bowl.',
        'Slowly add warm water while mixing.',
        'Knead for 10 minutes until smooth.',
        'Rest for 30 minutes, then shape and cook.',
      ],
    },
  },
];

// ─── Components ──────────────────────────────────────────────────────────────

function VideoCard({ video, isSelected, onClick }) {
  return (
    <button
      className={`${styles.videoCard} ${isSelected ? styles.videoCardActive : ''}`}
      onClick={onClick}
    >
      <div className={styles.videoThumb}>
        <img
          src={`https://img.youtube.com/vi/${video.youtubeId}/mqdefault.jpg`}
          alt={video.title}
        />
        <div className={styles.playOverlay}>▶</div>
      </div>
      <div className={styles.videoCardInfo}>
        <h4 className={styles.videoCardTitle}>{video.title}</h4>
        <p className={styles.videoCardDesc}>{video.description}</p>
      </div>
    </button>
  );
}

function VideoPlayer({ video }) {
  return (
    <div className={styles.playerSection}>
      <div className={styles.playerWrapper}>
        <iframe
          className={styles.playerIframe}
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
      <h2 className={styles.videoTitle}>{video.title}</h2>
      <p className={styles.videoDescription}>{video.description}</p>
    </div>
  );
}

function RecipePanel({ recipe }) {
  if (!recipe) return null;
  return (
    <aside className={styles.recipePanel}>
      <h3 className={styles.recipeHeading}>Recipe</h3>
      <div className={styles.recipeMeta}>
        {recipe.servings && <span>🍽️ {recipe.servings} servings</span>}
        {recipe.time && <span>⏱️ {recipe.time}</span>}
      </div>

      <h4 className={styles.recipeSubheading}>Ingredients</h4>
      <ul className={styles.ingredientList}>
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      <h4 className={styles.recipeSubheading}>Steps</h4>
      <ol className={styles.stepList}>
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>
    </aside>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FireAndFeast() {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selectedVideo = VIDEOS[selectedIndex];

  return (
    <Layout
      title="Fire & Feast"
      description="Cooking videos and recipes from Deng's Kitchen"
    >
      <div className={styles.page}>
        <header className={styles.header}>
          <h1 className={styles.pageTitle}>Fire & Feast</h1>
          <p className={styles.pageSubtitle}>
            Watch, cook, and feast — video recipes from the kitchen
          </p>
        </header>

        <div className={styles.content}>
          <div className={styles.mainColumn}>
            <VideoPlayer video={selectedVideo} />
          </div>
          <div className={styles.sideColumn}>
            <RecipePanel recipe={selectedVideo.recipe} />
          </div>
        </div>

        {VIDEOS.length > 1 && (
          <section className={styles.videoList}>
            <h3 className={styles.videoListTitle}>More Videos</h3>
            <div className={styles.videoGrid}>
              {VIDEOS.map((video, i) => (
                <VideoCard
                  key={video.id}
                  video={video}
                  isSelected={i === selectedIndex}
                  onClick={() => setSelectedIndex(i)}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </Layout>
  );
}
