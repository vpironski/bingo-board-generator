/**
 * Difficulty spread weights by board difficulty setting.
 *
 * Keys are board difficulty (1–4). Values map entry difficulty → target
 * fraction of board cells to fill from that level. Rows sum to 1.0.
 *
 * Easy   → lots of Easy, some Medium for variety
 * Medium → balanced across Easy / Medium / Hard
 * Hard   → mostly Hard with Medium warm-up and Insane spice
 * Insane → mostly Insane / Hard, tiny Medium minority
 *
 * The builder fills cells according to these weights, pulling from each
 * difficulty bucket in proportion. If a bucket runs dry, the deficit is
 * distributed to the nearest neighbouring bucket(s).
 */
export const DIFFICULTY_SPREAD = {
  1: { 1: 0.70, 2: 0.30, 3: 0.00, 4: 0.00 }, // Easy board
  2: { 1: 0.20, 2: 0.55, 3: 0.25, 4: 0.00 }, // Medium board
  3: { 1: 0.00, 2: 0.20, 3: 0.50, 4: 0.30 }, // Hard board
  4: { 1: 0.00, 2: 0.05, 3: 0.30, 4: 0.65 }, // Insane board
}

export const DIFFICULTY_LABELS = {
  1: 'Easy',
  2: 'Medium',
  3: 'Hard',
  4: 'Insane',
}

// Full board generation algorithm implemented in Feature 4
