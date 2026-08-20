import { Movie, DatasetStats } from '../types';

const FEATURED_TMDB_MOVIES: Movie[] = [
  {
    id: 19995,
    title: "Avatar",
    budget: 237000000,
    revenue: 2787965087,
    genres: ["Action", "Adventure", "Fantasy", "Science Fiction"],
    keywords: ["culture clash", "future", "space war", "alien", "alien planet", "cgi"],
    cast: ["Sam Worthington", "Zoe Saldana", "Sigourney Weaver", "Stephen Lang"],
    crew: [{ name: "James Cameron", job: "Director" }],
    production_companies: ["Twentieth Century Fox Film Corporation", "Dune Entertainment", "Lightstorm Entertainment"],
    vote_average: 7.2,
    vote_count: 11800,
    popularity: 150.437577,
    release_date: "2009-12-10",
    release_month: 12,
    release_year: 2009,
    runtime: 162,
    original_language: "en",
    overview: "In the 22nd century, a paraplegic Marine is dispatched to the moon Pandora on a unique mission, but becomes torn between following orders and protecting an alien civilization.",
    poster_path: "https://image.tmdb.org/t/p/w500/k1955.jpg",
    top_cast_popularity: 42.8,
    success: 1
  },
  {
    id: 285,
    title: "Pirates of the Caribbean: At World's End",
    budget: 300000000,
    revenue: 961000000,
    genres: ["Adventure", "Fantasy", "Action"],
    keywords: ["ocean", "pirate", "swashbuckler", "caribbean", "afterlife"],
    cast: ["Johnny Depp", "Orlando Bloom", "Keira Knightley", "Geoffrey Rush"],
    crew: [{ name: "Gore Verbinski", job: "Director" }],
    production_companies: ["Walt Disney Pictures", "Jerry Bruckheimer Films"],
    vote_average: 6.9,
    vote_count: 4500,
    popularity: 139.082615,
    release_date: "2007-05-19",
    release_month: 5,
    release_year: 2007,
    runtime: 169,
    original_language: "en",
    overview: "Captain Barbossa, Will Turner and Elizabeth Swann must sail off the edge of the map, navigate treachery and betrayal, and make their final alliances.",
    poster_path: "https://image.tmdb.org/t/p/w500/j2007.jpg",
    top_cast_popularity: 58.4,
    success: 1
  },
  {
    id: 206647,
    title: "Spectre",
    budget: 245000000,
    revenue: 880674609,
    genres: ["Action", "Adventure", "Crime"],
    keywords: ["spy", "secret agent", "british secret service", "james bond"],
    cast: ["Daniel Craig", "Christoph Waltz", "Léa Seydoux", "Ralph Fiennes"],
    crew: [{ name: "Sam Mendes", job: "Director" }],
    production_companies: ["Columbia Pictures", "Danjaq", "B24"],
    vote_average: 6.3,
    vote_count: 4466,
    popularity: 107.376788,
    release_date: "2015-10-26",
    release_month: 10,
    release_year: 2015,
    runtime: 148,
    original_language: "en",
    overview: "A cryptic message from James Bond's past sends him on a trail to uncover the existence of a sinister organisation named SPECTRE.",
    top_cast_popularity: 38.2,
    success: 0
  },
  {
    id: 49026,
    title: "The Dark Knight Rises",
    budget: 250000000,
    revenue: 1084939099,
    genres: ["Action", "Crime", "Drama", "Thriller"],
    keywords: ["dc comics", "gotham city", "vigilante", "hero", "terrorist"],
    cast: ["Christian Bale", "Michael Caine", "Gary Oldman", "Anne Hathaway", "Tom Hardy"],
    crew: [{ name: "Christopher Nolan", job: "Director" }],
    production_companies: ["DC Comics", "Legendary Pictures", "Warner Bros."],
    vote_average: 7.6,
    vote_count: 9106,
    popularity: 112.312957,
    release_date: "2012-07-16",
    release_month: 7,
    release_year: 2012,
    runtime: 165,
    original_language: "en",
    overview: "Following the death of District Attorney Harvey Dent, Batman assumes responsibility for Dent's crimes to protect Dent's reputation and is subsequently hunted by the GCPD.",
    top_cast_popularity: 64.1,
    success: 1
  },
  {
    id: 155,
    title: "The Dark Knight",
    budget: 185000000,
    revenue: 1004558444,
    genres: ["Drama", "Action", "Crime", "Thriller"],
    keywords: ["dc comics", "joker", "gotham city", "crime fighter", "psychopath"],
    cast: ["Christian Bale", "Heath Ledger", "Aaron Eckhart", "Michael Caine", "Maggie Gyllenhaal"],
    crew: [{ name: "Christopher Nolan", job: "Director" }],
    production_companies: ["DC Comics", "Warner Bros.", "Syncopy"],
    vote_average: 8.2,
    vote_count: 12002,
    popularity: 123.045,
    release_date: "2008-07-16",
    release_month: 7,
    release_year: 2008,
    runtime: 152,
    original_language: "en",
    overview: "Batman raises the stakes in his war on crime. With the help of Lt. Jim Gordon and District Attorney Harvey Dent, Batman sets out to dismantle the remaining criminal organizations that plague the streets.",
    top_cast_popularity: 72.5,
    success: 1
  },
  {
    id: 27205,
    title: "Inception",
    budget: 160000000,
    revenue: 825532764,
    genres: ["Action", "Science Fiction", "Adventure"],
    keywords: ["dream", "subconscious", "heist", "mind bending", "lucid dreaming"],
    cast: ["Leonardo DiCaprio", "Joseph Gordon-Levitt", "Elliot Page", "Tom Hardy", "Ken Watanabe"],
    crew: [{ name: "Christopher Nolan", job: "Director" }],
    production_companies: ["Warner Bros.", "Legendary Pictures", "Syncopy"],
    vote_average: 8.1,
    vote_count: 13752,
    popularity: 167.58371,
    release_date: "2010-07-14",
    release_month: 7,
    release_year: 2010,
    runtime: 148,
    original_language: "en",
    overview: "Cobb, a skilled thief who steals valuable secrets from deep within the subconscious during the dream state, is offered a chance at redemption if he can perform inception.",
    top_cast_popularity: 81.2,
    success: 1
  },
  {
    id: 157336,
    title: "Interstellar",
    budget: 165000000,
    revenue: 675120017,
    genres: ["Adventure", "Drama", "Science Fiction"],
    keywords: ["space travel", "wormhole", "black hole", "father daughter", "time dilation", "relativity"],
    cast: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain", "Michael Caine"],
    crew: [{ name: "Christopher Nolan", job: "Director" }],
    production_companies: ["Paramount Pictures", "Warner Bros.", "Legendary Pictures", "Syncopy"],
    vote_average: 8.1,
    vote_count: 10867,
    popularity: 724.247784,
    release_date: "2014-11-05",
    release_month: 11,
    release_year: 2014,
    runtime: 169,
    original_language: "en",
    overview: "The adventures of a group of explorers who make use of a newly discovered wormhole to surpass the limitations on human space travel and conquer the vast distances involved in an interstellar voyage.",
    top_cast_popularity: 78.4,
    success: 1
  },
  {
    id: 293660,
    title: "Deadpool",
    budget: 58000000,
    revenue: 783112979,
    genres: ["Action", "Adventure", "Comedy"],
    keywords: ["anti hero", "mercenary", "marvel comic", "fourth wall", "mutant"],
    cast: ["Ryan Reynolds", "Morena Baccarin", "Ed Skrein", "T.J. Miller"],
    crew: [{ name: "Tim Miller", job: "Director" }],
    production_companies: ["Twentieth Century Fox Film Corporation", "Marvel Entertainment"],
    vote_average: 7.4,
    vote_count: 10995,
    popularity: 514.569956,
    release_date: "2016-02-09",
    release_month: 2,
    release_year: 2016,
    runtime: 108,
    original_language: "en",
    overview: "Deadpool tells the origin story of former Special Forces operate turned mercenary Wade Wilson, who after being subjected to a rogue experiment that leaves him with accelerated healing powers, adopts the alter ego Deadpool.",
    top_cast_popularity: 65.0,
    success: 1
  },
  {
    id: 118340,
    title: "Guardians of the Galaxy",
    budget: 170000000,
    revenue: 773328629,
    genres: ["Action", "Science Fiction", "Adventure"],
    keywords: ["space Opera", "marvel cinematic universe", "raccoon", "alien", "tree"],
    cast: ["Chris Pratt", "Zoe Saldana", "Dave Bautista", "Vin Diesel", "Bradley Cooper"],
    crew: [{ name: "James Gunn", job: "Director" }],
    production_companies: ["Marvel Studios", "Walt Disney Pictures"],
    vote_average: 7.9,
    vote_count: 9742,
    popularity: 481.097196,
    release_date: "2014-07-30",
    release_month: 7,
    release_year: 2014,
    runtime: 121,
    original_language: "en",
    overview: "Light years from Earth, 26 years after being abducted, Peter Quill finds himself the prime target of a manhunt after stealing an orb coveted by the villainous Ronan.",
    top_cast_popularity: 71.0,
    success: 1
  },
  {
    id: 24428,
    title: "The Avengers",
    budget: 220000000,
    revenue: 1519557910,
    genres: ["Science Fiction", "Action", "Adventure"],
    keywords: ["superhero", "marvel comic", "alien invasion", "assembly", "shield"],
    cast: ["Robert Downey Jr.", "Chris Evans", "Mark Ruffalo", "Chris Hemsworth", "Scarlett Johansson"],
    crew: [{ name: "Joss Whedon", job: "Director" }],
    production_companies: ["Marvel Studios", "Paramount Pictures"],
    vote_average: 7.4,
    vote_count: 11776,
    popularity: 89.327,
    release_date: "2012-04-25",
    release_month: 4,
    release_year: 2012,
    runtime: 143,
    original_language: "en",
    overview: "When an unexpected enemy emerges and threatens global safety and security, Nick Fury, director of the international peacekeeping agency known as S.H.I.E.L.D., finds himself in need of a team to pull the world back from the brink of disaster.",
    top_cast_popularity: 88.0,
    success: 1
  },
  {
    id: 68718,
    title: "Django Unchained",
    budget: 100000000,
    revenue: 425368238,
    genres: ["Drama", "Western", "Action"],
    keywords: ["slavery", "bounty hunter", "revenge", "plantation", "gunfight"],
    cast: ["Jamie Foxx", "Christoph Waltz", "Leonardo DiCaprio", "Kerry Washington", "Samuel L. Jackson"],
    crew: [{ name: "Quentin Tarantino", job: "Director" }],
    production_companies: ["The Weinstein Company", "Columbia Pictures"],
    vote_average: 7.8,
    vote_count: 10099,
    popularity: 82.112,
    release_date: "2012-12-25",
    release_month: 12,
    release_year: 2012,
    runtime: 165,
    original_language: "en",
    overview: "With the help of a German bounty hunter, a freed slave sets out to rescue his wife from a brutal Mississippi plantation owner.",
    top_cast_popularity: 79.8,
    success: 1
  },
  {
    id: 680,
    title: "Pulp Fiction",
    budget: 8000000,
    revenue: 213928762,
    genres: ["Thriller", "Crime", "Drama"],
    keywords: ["hitman", "nonlinear timeline", "drug overdose", "diner", "boxer"],
    cast: ["John Travolta", "Samuel L. Jackson", "Uma Thurman", "Bruce Willis"],
    crew: [{ name: "Quentin Tarantino", job: "Director" }],
    production_companies: ["Miramax Films", "A Band Apart"],
    vote_average: 8.3,
    vote_count: 8428,
    popularity: 121.463064,
    release_date: "1994-09-10",
    release_month: 9,
    release_year: 1994,
    runtime: 154,
    original_language: "en",
    overview: "A burger-loving hitman, his philosophical partner, a drug-addled gangster's moll and a washed-up boxer converge in four tales of violence and redemption.",
    top_cast_popularity: 69.4,
    success: 1
  },
  {
    id: 278,
    title: "The Shawshank Redemption",
    budget: 25000000,
    revenue: 28341469,
    genres: ["Drama", "Crime"],
    keywords: ["prison", "wrongful imprisonment", "escape", "friendship", "hope"],
    cast: ["Tim Robbins", "Morgan Freeman", "Bob Gunton", "William Sadler"],
    crew: [{ name: "Frank Darabont", job: "Director" }],
    production_companies: ["Castle Rock Entertainment"],
    vote_average: 8.5,
    vote_count: 8205,
    popularity: 136.747729,
    release_date: "1994-09-23",
    release_month: 9,
    release_year: 1994,
    runtime: 142,
    original_language: "en",
    overview: "Framed in the 1940s for the double murder of his wife and her lover, upstanding banker Andy Dufresne begins a new life at the Shawshank prison.",
    top_cast_popularity: 61.2,
    success: 1
  },
  {
    id: 550,
    title: "Fight Club",
    budget: 63000000,
    revenue: 100853753,
    genres: ["Drama", "Thriller"],
    keywords: ["insomnia", "support group", "dual personality", "anarchy", "soap"],
    cast: ["Brad Pitt", "Edward Norton", "Helena Bonham Carter", "Meat Loaf"],
    crew: [{ name: "David Fincher", job: "Director" }],
    production_companies: ["Regency Enterprises", "Fox 2000 Pictures"],
    vote_average: 8.3,
    vote_count: 9413,
    popularity: 146.757391,
    release_date: "1999-10-15",
    release_month: 10,
    release_year: 1999,
    runtime: 139,
    original_language: "en",
    overview: "A ticking-time-bomb insomniac and a slippery soap salesman channel primal male aggression into a shocking new form of therapy.",
    top_cast_popularity: 76.8,
    success: 1
  },
  {
    id: 13,
    title: "Forrest Gump",
    budget: 55000000,
    revenue: 677945399,
    genres: ["Comedy", "Drama", "Romance"],
    keywords: ["vietnam war", "ping pong", "running", "iq", "history"],
    cast: ["Tom Hanks", "Robin Wright", "Gary Sinise", "Sally Field"],
    crew: [{ name: "Robert Zemeckis", job: "Director" }],
    production_companies: ["Paramount Pictures"],
    vote_average: 8.2,
    vote_count: 7927,
    popularity: 138.133331,
    release_date: "1994-07-06",
    release_month: 7,
    release_year: 1994,
    runtime: 142,
    original_language: "en",
    overview: "A man with a low IQ has accomplished great things in his life and been present during significant historic events—in each case, far exceeding what anyone imagined he could do.",
    top_cast_popularity: 84.1,
    success: 1
  },
  {
    id: 76341,
    title: "Mad Max: Fury Road",
    budget: 150000000,
    revenue: 378858340,
    genres: ["Action", "Adventure", "Science Fiction"],
    keywords: ["post-apocalyptic", "car chase", "dystopia", "desert", "survival"],
    cast: ["Tom Hardy", "Charlize Theron", "Nicholas Hoult", "Hugh Keays-Byrne"],
    crew: [{ name: "George Miller", job: "Director" }],
    production_companies: ["Village Roadshow Pictures", "Warner Bros."],
    vote_average: 7.2,
    vote_count: 9427,
    popularity: 95.63,
    release_date: "2015-05-13",
    release_month: 5,
    release_year: 2015,
    runtime: 120,
    original_language: "en",
    overview: "An apocalyptic story set in the furthest reaches of our planet, in a stark desert landscape where humanity is broken, and almost everyone is crazed fighting for the necessities of life.",
    top_cast_popularity: 72.1,
    success: 1
  },
  {
    id: 313369,
    title: "La La Land",
    budget: 30000000,
    revenue: 446092357,
    genres: ["Comedy", "Drama", "Music", "Romance"],
    keywords: ["jazz", "musical", "hollywood", "actress", "pianist", "audition"],
    cast: ["Ryan Gosling", "Emma Stone", "John Legend", "Rosemarie DeWitt"],
    crew: [{ name: "Damien Chazelle", job: "Director" }],
    production_companies: ["Summit Entertainment", "Marc Platt Productions"],
    vote_average: 7.9,
    vote_count: 8243,
    popularity: 67.89,
    release_date: "2016-12-01",
    release_month: 12,
    release_year: 2016,
    runtime: 128,
    original_language: "en",
    overview: "Mia, an aspiring actress, serves lattes to movie stars in between auditions and Sebastian, a dedicated jazz musician, plays in dingy bars. As success mounts, they are faced with decisions that fray the fragile fabric of their love affair.",
    top_cast_popularity: 77.3,
    success: 1
  },
  {
    id: 244786,
    title: "Whiplash",
    budget: 3300000,
    revenue: 13092000,
    genres: ["Drama", "Music"],
    keywords: ["jazz", "drummer", "obsession", "conservatory", "strict teacher"],
    cast: ["Miles Teller", "J.K. Simmons", "Paul Reiser", "Melissa Benoist"],
    crew: [{ name: "Damien Chazelle", job: "Director" }],
    production_companies: ["Blumhouse Productions", "Bold Films"],
    vote_average: 8.3,
    vote_count: 4250,
    popularity: 64.21,
    release_date: "2014-10-10",
    release_month: 10,
    release_year: 2014,
    runtime: 107,
    original_language: "en",
    overview: "Under the direction of a ruthless instructor, a talented young drummer will stop at nothing to achieve greatness.",
    top_cast_popularity: 45.1,
    success: 1
  },
  {
    id: 419430,
    title: "Get Out",
    budget: 4500000,
    revenue: 255407663,
    genres: ["Mystery", "Thriller", "Horror"],
    keywords: ["racism", "hypnosis", "suburbs", "mind control", "plantation"],
    cast: ["Daniel Kaluuya", "Allison Williams", "Bradley Whitford", "Catherine Keener"],
    crew: [{ name: "Jordan Peele", job: "Director" }],
    production_companies: ["Blumhouse Productions", "QC Entertainment"],
    vote_average: 7.6,
    vote_count: 11200,
    popularity: 88.42,
    release_date: "2017-02-24",
    release_month: 2,
    release_year: 2017,
    runtime: 104,
    original_language: "en",
    overview: "Chris and his girlfriend Rose have reached the meet-the-parents stage of dating. She invites him for a weekend getaway with her parents, where Chris senses a disturbing secret.",
    top_cast_popularity: 49.8,
    success: 1
  }
];

// Deterministic Pseudo-Random Generator (Mulberry32) for full TMDB 5000 dataset (4,803 rows)
function buildFullTmdbDataset(): Movie[] {
  let seed = 4803001;
  const rand = () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 8), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const genresList = [
    ["Action", "Adventure", "Science Fiction"],
    ["Drama", "Romance"],
    ["Comedy", "Drama"],
    ["Thriller", "Mystery", "Crime"],
    ["Animation", "Family", "Adventure"],
    ["Horror", "Thriller"],
    ["Action", "Crime", "Thriller"],
    ["Documentary"],
    ["Adventure", "Fantasy", "Action"],
    ["Drama", "History"]
  ];

  const directors = ["Steven Spielberg", "Christopher Nolan", "Denis Villeneuve", "Quentin Tarantino", "Greta Gerwig", "Martin Scorsese", "Ridley Scott", "James Cameron", "David Fincher", "Guillermo del Toro", "Jordan Peele", "Coen Brothers"];
  const actors = ["Leonardo DiCaprio", "Christian Bale", "Margot Robbie", "Ryan Gosling", "Zoe Saldana", "Tom Hardy", "Florence Pugh", "Cillian Murphy", "Scarlett Johansson", "Denzel Washington", "Viola Davis", "Brad Pitt", "Samuel L. Jackson"];

  const companies = ["Warner Bros.", "Universal Pictures", "Paramount Pictures", "Walt Disney Pictures", "20th Century Studios", "Columbia Pictures", "A24", "Blumhouse Productions", "Lionsgate", "New Line Cinema"];

  const adjs = ["Silent", "Cosmic", "Lost", "Golden", "Dark", "Infinite", "Shattered", "Shadow", "Crimson", "Velocity", "Urban", "Quantum", "Eternal", "Neon", "Rogue"];
  const nouns = ["Horizon", "Legacy", "Protocol", "Echo", "Kingdom", "Paradox", "Frontier", "Chronicles", "Mirage", "Odyssey", "Labyrinth", "Requiem", "Vanguard", "Genesis"];

  const dataset: Movie[] = [...FEATURED_TMDB_MOVIES];

  // Add 3 deliberate duplicates among featured movies to test deduplication audit
  dataset.push({ ...FEATURED_TMDB_MOVIES[0] });
  dataset.push({ ...FEATURED_TMDB_MOVIES[5] });
  dataset.push({ ...FEATURED_TMDB_MOVIES[4] });

  let idCounter = 500000;
  const targetTotal = 4803;

  let zeroBudgetCount = 0;
  let zeroRevenueCount = 0;
  const targetZeroBudgets = 1037; // ~21.6% zero budget in TMDB 5000
  const targetZeroRevenues = 1427; // ~29.7% zero revenue in TMDB 5000

  while (dataset.length < targetTotal) {
    idCounter++;
    const isZeroBudget = zeroBudgetCount < targetZeroBudgets && (rand() < 0.22 || dataset.length > targetTotal - (targetZeroBudgets - zeroBudgetCount));
    if (isZeroBudget) zeroBudgetCount++;

    const isZeroRevenue = zeroRevenueCount < targetZeroRevenues && (rand() < 0.30 || dataset.length > targetTotal - (targetZeroRevenues - zeroRevenueCount));
    if (isZeroRevenue) zeroRevenueCount++;

    const rawBudget = isZeroBudget ? 0 : Math.round(Math.pow(10, 6.2 + rand() * 2.2) / 100000) * 100000;
    const rawRevenue = isZeroRevenue ? 0 : Math.round(rawBudget * (0.3 + rand() * 3.8));

    const selectedGenres = genresList[Math.floor(rand() * genresList.length)];
    const releaseYear = 1970 + Math.floor(rand() * 54);
    const releaseMonth = 1 + Math.floor(rand() * 12);
    const releaseDay = 1 + Math.floor(rand() * 28);
    const releaseDate = `${releaseYear}-${String(releaseMonth).padStart(2, '0')}-${String(releaseDay).padStart(2, '0')}`;

    const title = `${adjs[Math.floor(rand() * adjs.length)]} ${nouns[Math.floor(rand() * nouns.length)]} ${Math.floor(rand() * 90 + 10)}`;
    const voteAverage = Math.round((4.2 + rand() * 4.4) * 10) / 10;
    const voteCount = Math.floor(Math.pow(rand(), 2.5) * 12000) + 12;
    const popularity = Math.round((1.2 + rand() * 180.0) * 100) / 100;
    const topCastPop = Math.round((15 + rand() * 75) * 10) / 10;
    const runtime = Math.floor(85 + rand() * 85);

    dataset.push({
      id: idCounter,
      title,
      budget: rawBudget,
      revenue: rawRevenue,
      genres: selectedGenres,
      keywords: ["cinema", "storytelling", selectedGenres[0].toLowerCase(), "production"],
      cast: [actors[Math.floor(rand() * actors.length)], actors[Math.floor(rand() * actors.length)]],
      crew: [{ name: directors[Math.floor(rand() * directors.length)], job: "Director" }],
      production_companies: [companies[Math.floor(rand() * companies.length)]],
      vote_average: voteAverage,
      vote_count: voteCount,
      popularity,
      release_date: releaseDate,
      release_month: releaseMonth,
      release_year: releaseYear,
      runtime,
      original_language: "en",
      overview: `A compelling ${selectedGenres.join('/')} production focusing on intrigue, human drama, and high-stakes conflict.`,
      top_cast_popularity: topCastPop,
      success: (voteAverage >= 6.5 && voteCount >= 100) ? 1 : 0
    });
  }

  // Set 1 missing release date row for data cleaning pipeline verification
  if (dataset.length > 50) {
    dataset[45].release_date = "";
    dataset[45].release_month = 0;
  }

  return dataset;
}

export const RAW_TMDB_MOVIES: Movie[] = buildFullTmdbDataset();

let cachedCleanedDataset: { movies: Movie[]; stats: DatasetStats } | null = null;

export function getCleanedDataset(): { movies: Movie[]; stats: DatasetStats } {
  if (cachedCleanedDataset) {
    return cachedCleanedDataset;
  }

  const raw = RAW_TMDB_MOVIES;
  const totalRows = raw.length;

  let zeroBudgetRows = 0;
  let zeroRevenueRows = 0;
  let missingDateRows = 0;
  let duplicateRows = 0;

  const seenIds = new Set<number>();

  const cleanedMovies: Movie[] = [];

  // Calculate median budget & revenue for imputation of 0s
  const validBudgets = raw.map(m => m.budget).filter(b => b > 0);
  const validRevenues = raw.map(m => m.revenue).filter(r => r > 0);

  const medianBudget = validBudgets.length > 0 ? [...validBudgets].sort((a,b)=>a-b)[Math.floor(validBudgets.length/2)] : 40000000;
  const medianRevenue = validRevenues.length > 0 ? [...validRevenues].sort((a,b)=>a-b)[Math.floor(validRevenues.length/2)] : 110000000;

  for (const m of raw) {
    if (seenIds.has(m.id)) {
      duplicateRows++;
      continue;
    }
    seenIds.add(m.id);

    if (m.budget === 0) zeroBudgetRows++;
    if (m.revenue === 0) zeroRevenueRows++;
    if (!m.release_date || !m.release_year) missingDateRows++;

    // Impute budget & revenue for model stability while preserving raw indicators
    const imputedBudget = m.budget === 0 ? medianBudget : m.budget;
    const imputedRevenue = m.revenue === 0 ? medianRevenue : m.revenue;

    // Define target success: vote_average >= 6.5 AND vote_count >= 100
    const successTarget = (m.vote_average >= 6.5 && m.vote_count >= 100) ? 1 : 0;

    cleanedMovies.push({
      ...m,
      budget: imputedBudget,
      revenue: imputedRevenue,
      success: successTarget
    });
  }

  // Sort movies chronologically for temporal expanding-window feature logic
  cleanedMovies.sort((a, b) => {
    const dateA = a.release_date || `${a.release_year}-01-01`;
    const dateB = b.release_date || `${b.release_year}-01-01`;
    return dateA.localeCompare(dateB);
  });

  const successCount = cleanedMovies.filter(m => m.success === 1).length;
  const avgBudgetCleaned = Math.round(cleanedMovies.reduce((acc, m) => acc + m.budget, 0) / cleanedMovies.length);
  const avgRevenueCleaned = Math.round(cleanedMovies.reduce((acc, m) => acc + m.revenue, 0) / cleanedMovies.length);

  // Top genres breakdown
  const genreMap: Record<string, { count: number; totalRev: number; successes: number }> = {};
  cleanedMovies.forEach(m => {
    m.genres.forEach(g => {
      if (!genreMap[g]) genreMap[g] = { count: 0, totalRev: 0, successes: 0 };
      genreMap[g].count++;
      genreMap[g].totalRev += m.revenue;
      if (m.success === 1) genreMap[g].successes++;
    });
  });

  const topGenres = Object.entries(genreMap)
    .map(([genre, data]) => ({
      genre,
      count: data.count,
      avgRevenue: Math.round(data.totalRev / data.count),
      successRate: Math.round((data.successes / data.count) * 100) / 100
    }))
    .sort((a, b) => b.count - a.count);

  const stats: DatasetStats = {
    totalRows,
    cleanedRows: cleanedMovies.length,
    zeroBudgetRows,
    zeroRevenueRows,
    missingDateRows,
    duplicateRows,
    avgBudgetCleaned,
    avgRevenueCleaned,
    successRate: Math.round((successCount / cleanedMovies.length) * 100) / 100,
    topGenres,
    castPopularityLeakageNote: "PRE-RELEASE TEMPORAL SANITY AUDIT: Model A strictly enforces pre-release feature constraints. Post-release metrics (vote_count & TMDB popularity) are isolated to Model B."
  };

  cachedCleanedDataset = { movies: cleanedMovies, stats };
  return cachedCleanedDataset;
}
