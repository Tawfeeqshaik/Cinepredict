import React, { useEffect, useState } from 'react';

interface CinemaBackgroundProps {
  variant?: 'hero' | 'ambient';
}

interface PosterTile {
  title: string;
  genre: string;
  year: number;
  rating: string;
  color: string;
  image?: string;
}

const POSTER_COLLECTION_A: PosterTile[] = [
  {
    title: "Interstellar",
    genre: "Sci-Fi",
    year: 2014,
    rating: "8.7",
    color: "from-blue-900 to-indigo-950",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Blade Runner 2049",
    genre: "Cyberpunk",
    year: 2017,
    rating: "8.0",
    color: "from-amber-900 to-stone-950",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Dune: Part Two",
    genre: "Sci-Fi / Epic",
    year: 2024,
    rating: "8.6",
    color: "from-yellow-950 to-orange-950",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "The Dark Knight",
    genre: "Action / Crime",
    year: 2008,
    rating: "9.0",
    color: "from-zinc-900 to-neutral-950",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Oppenheimer",
    genre: "Biography",
    year: 2023,
    rating: "8.9",
    color: "from-amber-950 to-orange-950",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80"
  }
];

const POSTER_COLLECTION_B: PosterTile[] = [
  {
    title: "Avatar: Way of Water",
    genre: "Adventure",
    year: 2022,
    rating: "7.6",
    color: "from-teal-950 to-cyan-950",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Inception",
    genre: "Sci-Fi / Thriller",
    year: 2010,
    rating: "8.8",
    color: "from-slate-900 to-zinc-950",
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Mad Max: Fury Road",
    genre: "Action",
    year: 2015,
    rating: "8.1",
    color: "from-red-950 to-amber-950",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Arrival",
    genre: "Drama / Sci-Fi",
    year: 2016,
    rating: "7.9",
    color: "from-stone-900 to-neutral-950",
    image: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "The Matrix",
    genre: "Action / Sci-Fi",
    year: 1999,
    rating: "8.7",
    color: "from-emerald-950 to-zinc-950",
    image: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&q=80"
  }
];

const POSTER_COLLECTION_C: PosterTile[] = [
  {
    title: "Pulp Fiction",
    genre: "Crime / Drama",
    year: 1994,
    rating: "8.9",
    color: "from-yellow-900 to-amber-950",
    image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Gladiator II",
    genre: "Action / History",
    year: 2024,
    rating: "7.8",
    color: "from-red-900 to-orange-950",
    image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Parasite",
    genre: "Thriller",
    year: 2019,
    rating: "8.5",
    color: "from-stone-900 to-zinc-950",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Spider-Man: Across Spider-Verse",
    genre: "Animation",
    year: 2023,
    rating: "8.7",
    color: "from-purple-950 to-pink-950",
    image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?auto=format&fit=crop&w=400&q=80"
  },
  {
    title: "Everything Everywhere All at Once",
    genre: "Sci-Fi / Comedy",
    year: 2022,
    rating: "7.8",
    color: "from-indigo-950 to-red-950",
    image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?auto=format&fit=crop&w=400&q=80"
  }
];

export const CinemaBackground: React.FC<CinemaBackgroundProps> = ({ variant = 'hero' }) => {
  const [isTabVisible, setIsTabVisible] = useState(true);

  useEffect(() => {
    const handleVisibility = () => {
      setIsTabVisible(!document.hidden);
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, []);

  const pauseClass = !isTabVisible ? 'pause-animation' : '';

  if (variant === 'ambient') {
    return (
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
        {/* Soft Ambient Cinema Light Blooms */}
        <div className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full bg-red-600/10 blur-[130px] bloom-drift-a ${pauseClass}`} />
        <div className={`absolute -bottom-32 -right-32 w-[600px] h-[600px] rounded-full bg-red-800/10 blur-[140px] bloom-drift-b ${pauseClass}`} />
        <div className="absolute top-1/2 left-1/3 w-[450px] h-[450px] rounded-full bg-cyan-950/15 blur-[120px]" />
        
        {/* Subtle Scanlines & Film Grain Overlay */}
        <div className={`film-grain opacity-20 ${pauseClass}`} />
        
        {/* Vignette Gradients */}
        <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050505]/40 to-[#050505]" />
      </div>
    );
  }

  // Hero Variant (Full-Bleed Marquee Poster Wall for Auth/Landing)
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none bg-[#050505]">
      
      {/* 1. THREE SLOW-DRIFTING POSTER COLUMNS */}
      <div className="absolute inset-0 flex justify-between gap-4 sm:gap-8 px-4 opacity-25 filter blur-[1px] transform -rotate-3 scale-110">
        
        {/* Column 1: Upwards */}
        <div className="w-1/3 flex flex-col gap-5">
          <div className={`poster-marquee-up flex flex-col gap-5 ${pauseClass}`}>
            {[...POSTER_COLLECTION_A, ...POSTER_COLLECTION_A].map((poster, idx) => (
              <div
                key={idx}
                className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-[#262626] bg-[#141414] shadow-2xl relative group"
              >
                {poster.image ? (
                  <img
                    src={poster.image}
                    alt={poster.title}
                    className="w-full h-full object-cover grayscale opacity-75"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${poster.color}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">{poster.genre}</span>
                  <p className="text-xs font-extrabold text-white truncate font-display">{poster.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 2: Downwards */}
        <div className="w-1/3 flex flex-col gap-5">
          <div className={`poster-marquee-down flex flex-col gap-5 ${pauseClass}`}>
            {[...POSTER_COLLECTION_B, ...POSTER_COLLECTION_B].map((poster, idx) => (
              <div
                key={idx}
                className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-[#262626] bg-[#141414] shadow-2xl relative"
              >
                {poster.image ? (
                  <img
                    src={poster.image}
                    alt={poster.title}
                    className="w-full h-full object-cover grayscale opacity-75"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${poster.color}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">{poster.genre}</span>
                  <p className="text-xs font-extrabold text-white truncate font-display">{poster.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Column 3: Upwards Slow */}
        <div className="w-1/3 flex flex-col gap-5">
          <div className={`poster-marquee-up-slow flex flex-col gap-5 ${pauseClass}`}>
            {[...POSTER_COLLECTION_C, ...POSTER_COLLECTION_C].map((poster, idx) => (
              <div
                key={idx}
                className="w-full aspect-[2/3] rounded-2xl overflow-hidden border border-[#262626] bg-[#141414] shadow-2xl relative"
              >
                {poster.image ? (
                  <img
                    src={poster.image}
                    alt={poster.title}
                    className="w-full h-full object-cover grayscale opacity-75"
                    loading="lazy"
                  />
                ) : (
                  <div className={`w-full h-full bg-gradient-to-br ${poster.color}`} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent p-3 flex flex-col justify-end">
                  <span className="text-[9px] font-mono text-red-400 font-bold uppercase tracking-wider">{poster.genre}</span>
                  <p className="text-xs font-extrabold text-white truncate font-display">{poster.title}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* 2. CINEMA SPROCKET STRIPS (FILM REEL MOTIF ON EDGES) */}
      <div className={`absolute top-0 bottom-0 left-0 w-4 sprocket-strip-left opacity-30 ${pauseClass}`} />
      <div className={`absolute top-0 bottom-0 right-0 w-4 sprocket-strip-right opacity-30 ${pauseClass}`} />

      {/* 3. AMBIENT DRIFTING LIGHT BLOOMS */}
      <div className={`absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full bg-[#E50914]/20 blur-[140px] bloom-drift-a ${pauseClass}`} />
      <div className={`absolute bottom-1/4 right-1/4 w-[550px] h-[550px] rounded-full bg-cyan-950/25 blur-[150px] bloom-drift-b ${pauseClass}`} />

      {/* 4. CINEMATIC GRADIENT SCRIM (DEEP NAVY/BLACK) */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/85 via-[#050505]/70 to-[#050505] backdrop-blur-[2px]" />
      <div className="absolute inset-0 bg-radial-gradient from-transparent via-[#050505]/60 to-[#050505]" />

      {/* 5. VINTAGE SCANLINE / FILM GRAIN */}
      <div className={`film-grain opacity-30 ${pauseClass}`} />

    </div>
  );
};
