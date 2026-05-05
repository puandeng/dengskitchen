import React, { useState } from 'react';
import Layout from '@theme/Layout';
import styles from './fire-and-feast.module.css';

// ─── Video & Recipe Data ─────────────────────────────────────────────────────
// Add new videos here — each entry gets its own sidebar link and sub-page.

const VIDEOS = [
  {
    id: 'first-video',
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

// ─── Sidebar ─────────────────────────────────────────────────────────────────

function Sidebar({ videos, selectedId, onSelect }) {
  return (
    <nav className={styles.sidebar}>
      <div className={styles.sidebarHeader}>
        <h2 className={styles.sidebarTitle}>Fire & Feast</h2>
        <p className={styles.sidebarSubtitle}>Video Recipes</p>
      </div>
      <ul className={styles.sidebarList}>
        {videos.map((video) => (
          <li key={video.id}>
            <button
              className={`${styles.sidebarItem} ${video.id === selectedId ? styles.sidebarItemActive : ''}`}
              onClick={() => onSelect(video.id)}
            >
              <img
                className={styles.sidebarThumb}
                src={`https://img.youtube.com/vi/${video.youtubeId}/default.jpg`}
                alt={video.title}
              />
              <span className={styles.sidebarItemText}>{video.title}</span>
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}

// ─── Video + Recipe Content ──────────────────────────────────────────────────

function VideoContent({ video }) {
  return (
    <div className={styles.videoContent}>
      {/* Video Player */}
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

      {/* Title & Description */}
      <h1 className={styles.videoTitle}>{video.title}</h1>
      <p className={styles.videoDescription}>{video.description}</p>

      {/* Recipe Section */}
      {video.recipe && (
        <div className={styles.recipeSection}>
          <div className={styles.recipeHeader}>
            <h2 className={styles.recipeHeading}>Recipe</h2>
            <div className={styles.recipeMeta}>
              {video.recipe.servings && <span>🍽️ {video.recipe.servings} servings</span>}
              {video.recipe.time && <span>⏱️ {video.recipe.time}</span>}
            </div>
          </div>

          <div className={styles.recipeColumns}>
            <div className={styles.ingredientsCol}>
              <h3 className={styles.recipeSubheading}>Ingredients</h3>
              <ul className={styles.ingredientList}>
                {video.recipe.ingredients.map((ing, i) => (
                  <li key={i}>{ing}</li>
                ))}
              </ul>
            </div>

            <div className={styles.stepsCol}>
              <h3 className={styles.recipeSubheading}>Steps</h3>
              <ol className={styles.stepList}>
                {video.recipe.steps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function FireAndFeast() {
  const [selectedId, setSelectedId] = useState(VIDEOS[0]?.id);
  const selectedVideo = VIDEOS.find(v => v.id === selectedId) || VIDEOS[0];

  return (
    <Layout
      title="Fire & Feast"
      description="Cooking videos and recipes from Deng's Kitchen"
    >
      <div className={styles.pageLayout}>
        <Sidebar
          videos={VIDEOS}
          selectedId={selectedId}
          onSelect={setSelectedId}
        />
        <main className={styles.mainContent}>
          <VideoContent video={selectedVideo} />
        </main>
      </div>
    </Layout>
  );
}
