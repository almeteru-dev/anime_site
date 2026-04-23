import { FilterButtons } from "@/components/collections/filter-buttons"
import { FeaturedCollection } from "@/components/collections/featured-collection"
import { CollectionCard } from "@/components/collections/collection-card"

// Sample data for collections
const featuredCollection = {
  title: "Cyberpunk Nightmares",
  description: "Dive into neon-drenched dystopias where technology and humanity collide. From the streets of Neo-Tokyo to virtual reality prisons, these titles explore what it means to be human in a world dominated by machines, corporations, and digital consciousness.",
  coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&h=1000&fit=crop",
  titleCount: 18,
  curator: "AnimeVista Editors",
  previews: [
    { id: 1, title: "Cyber City Oedo", image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=200&h=300&fit=crop" },
    { id: 2, title: "Ghost Protocol", image: "https://images.unsplash.com/photo-1614624532983-4ce03382d63d?w=200&h=300&fit=crop" },
    { id: 3, title: "Neon Genesis", image: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&h=300&fit=crop" },
    { id: 4, title: "Digital Minds", image: "https://images.unsplash.com/photo-1618336753974-aae8e04506aa?w=200&h=300&fit=crop" },
    { id: 5, title: "Synth Dreams", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=200&h=300&fit=crop" },
  ],
}

const collections = [
  {
    id: 1,
    title: "Isekai Fever",
    description: "Transported to another world? These protagonists got a second chance at life in fantastical realms filled with magic, monsters, and adventure.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&h=400&fit=crop",
    titleCount: 24,
    previews: [
      { id: 1, title: "Realm Walker", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=300&fit=crop" },
      { id: 2, title: "Spirit Gate", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=300&fit=crop" },
      { id: 3, title: "New World", image: "https://images.unsplash.com/photo-1493246507139-91e8fad9978e?w=200&h=300&fit=crop" },
      { id: 4, title: "Reborn King", image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 2,
    title: "Must-Watch Classics",
    description: "The legendary titles that defined anime. From groundbreaking storytelling to revolutionary animation techniques, these are the shows every fan should experience.",
    coverImage: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600&h=400&fit=crop",
    titleCount: 32,
    previews: [
      { id: 1, title: "Legend Era", image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop" },
      { id: 2, title: "Golden Age", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop" },
      { id: 3, title: "Timeless", image: "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=200&h=300&fit=crop" },
      { id: 4, title: "Pioneer", image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 3,
    title: "Shonen Battle Royale",
    description: "Epic battles, intense training arcs, and friendships forged in fire. Experience the peak of action anime with these adrenaline-pumping series.",
    coverImage: "https://images.unsplash.com/photo-1551103782-8ab07afd45c1?w=600&h=400&fit=crop",
    titleCount: 28,
    previews: [
      { id: 1, title: "Thunder Fist", image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=200&h=300&fit=crop" },
      { id: 2, title: "Ultimate", image: "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=300&fit=crop" },
      { id: 3, title: "Rising Power", image: "https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=200&h=300&fit=crop" },
      { id: 4, title: "Last Stand", image: "https://images.unsplash.com/photo-1581009146145-b5ef050c149a?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 4,
    title: "Heartbreak Season",
    description: "Prepare your tissues. These emotionally devastating masterpieces will take you on a rollercoaster of feelings you never knew you had.",
    coverImage: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=600&h=400&fit=crop",
    titleCount: 15,
    previews: [
      { id: 1, title: "Silent Tears", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=300&fit=crop" },
      { id: 2, title: "Goodbye", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=300&fit=crop" },
      { id: 3, title: "Memories", image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=200&h=300&fit=crop" },
      { id: 4, title: "Last Letter", image: "https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 5,
    title: "Mind-Bending Thrillers",
    description: "Psychological warfare, plot twists that redefine reality, and narratives that will have you questioning everything. For viewers who love to think.",
    coverImage: "https://images.unsplash.com/photo-1509248961895-b4a6e7c97d58?w=600&h=400&fit=crop",
    titleCount: 19,
    previews: [
      { id: 1, title: "Twisted", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=200&h=300&fit=crop" },
      { id: 2, title: "Mind Game", image: "https://images.unsplash.com/photo-1559757175-5700dde675bc?w=200&h=300&fit=crop" },
      { id: 3, title: "Illusion", image: "https://images.unsplash.com/photo-1511376777868-611b54f68947?w=200&h=300&fit=crop" },
      { id: 4, title: "Paradox", image: "https://images.unsplash.com/photo-1495954484750-af469f2f9be5?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 6,
    title: "Slice of Life Comfort",
    description: "Sometimes you just need to relax. These heartwarming series celebrate the beauty in everyday moments, friendship, and personal growth.",
    coverImage: "https://images.unsplash.com/photo-1517331156700-3c241d2b4d83?w=600&h=400&fit=crop",
    titleCount: 22,
    previews: [
      { id: 1, title: "Daily Life", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200&h=300&fit=crop" },
      { id: 2, title: "Seasons", image: "https://images.unsplash.com/photo-1470252649378-9c29740c9fa8?w=200&h=300&fit=crop" },
      { id: 3, title: "Cozy Days", image: "https://images.unsplash.com/photo-1491466424936-e304919aada7?w=200&h=300&fit=crop" },
      { id: 4, title: "Friends", image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 7,
    title: "Dark Fantasy Saga",
    description: "Enter worlds where darkness reigns and heroes must face unspeakable horrors. Gothic aesthetics meet brutal storytelling in these gripping tales.",
    coverImage: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=600&h=400&fit=crop",
    titleCount: 16,
    previews: [
      { id: 1, title: "Shadow Lord", image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=200&h=300&fit=crop" },
      { id: 2, title: "Cursed", image: "https://images.unsplash.com/photo-1509248961895-b4a6e7c97d58?w=200&h=300&fit=crop" },
      { id: 3, title: "Nightmare", image: "https://images.unsplash.com/photo-1478760329108-5c3ed9d495a0?w=200&h=300&fit=crop" },
      { id: 4, title: "Abyss", image: "https://images.unsplash.com/photo-1534447677768-be436bb09401?w=200&h=300&fit=crop" },
    ],
  },
  {
    id: 8,
    title: "Romance Blooms",
    description: "Love stories that will make your heart flutter. From first crushes to destined encounters, experience the sweetest moments of connection.",
    coverImage: "https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?w=600&h=400&fit=crop",
    titleCount: 27,
    previews: [
      { id: 1, title: "First Love", image: "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=200&h=300&fit=crop" },
      { id: 2, title: "Together", image: "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=200&h=300&fit=crop" },
      { id: 3, title: "Destiny", image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=300&fit=crop" },
      { id: 4, title: "Promise", image: "https://images.unsplash.com/photo-1474552226712-ac0f0961a954?w=200&h=300&fit=crop" },
    ],
  },
]

export default function CollectionsPage() {
  return (
    <div className="pt-20">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
        {/* Page Header */}
        <div className="mb-10 lg:mb-14">
          <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight">
            Curated Collections
          </h1>
          <p className="text-lg text-[#D1D9E6] max-w-2xl">
            Hand-picked anime experiences crafted by our editors. Discover your next obsession through 
            our carefully curated thematic collections.
          </p>
        </div>

        {/* Filters */}
        <div className="mb-10 lg:mb-14">
          <FilterButtons />
        </div>

        {/* Featured Collection of the Month */}
        <div className="mb-14 lg:mb-20">
          <FeaturedCollection {...featuredCollection} />
        </div>

        {/* Section Title */}
        <div className="flex items-center gap-4 mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white">All Collections</h2>
          <div className="flex-1 h-px bg-gradient-to-r from-[rgba(163,207,255,0.3)] to-transparent" />
          <span className="text-sm text-[#8B9DC3] font-medium">{collections.length} Collections</span>
        </div>

        {/* Collections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {collections.map((collection, index) => (
            <CollectionCard
              key={collection.id}
              {...collection}
              featured={index === 0}
            />
          ))}
        </div>

        {/* Load More Button */}
        <div className="flex justify-center mt-12 lg:mt-16">
          <button className="group inline-flex items-center gap-2 px-8 py-3.5 rounded-xl 
            bg-[#0A1832] border border-[rgba(163,207,255,0.2)] text-[#D1D9E6] font-semibold
            transition-all duration-300 ease-out
            hover:border-[#00E5FF]/50 hover:text-[#00E5FF] hover:shadow-[0_0_25px_rgba(0,229,255,0.2)]">
            <span>Load More Collections</span>
            <svg 
              className="w-5 h-5 transition-transform duration-300 group-hover:translate-y-0.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </main>


    </div>
  )
}
