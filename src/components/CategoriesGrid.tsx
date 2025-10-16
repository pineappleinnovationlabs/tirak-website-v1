import { BlobShape } from '@/components/ui/blob-shapes';
import { CategoryIcons } from '@/lib/category-icons';

const categories = [
  { 
    id: 'culture' as const, 
    name: 'Culture', 
    color: 'hsl(270, 65%, 55%)', 
    bgColor: 'hsl(270, 75%, 85%)',
    variant: 'culture' as const 
  },
  { 
    id: 'adventure', 
    name: 'Adventure', 
    color: 'hsl(210, 70%, 50%)', 
    bgColor: 'hsl(210, 80%, 85%)',
    variant: 'adventure' as const 
  },
  { 
    id: 'wellness', 
    name: 'Wellness', 
    color: 'hsl(155, 65%, 45%)', 
    bgColor: 'hsl(155, 75%, 80%)',
    variant: 'wellness' as const 
  },
  { 
    id: 'nightlife', 
    name: 'Nightlife', 
    color: 'hsl(340, 70%, 55%)', 
    bgColor: 'hsl(340, 80%, 85%)',
    variant: 'nightlife' as const 
  },
  { 
    id: 'lifestyle', 
    name: 'Lifestyle', 
    color: 'hsl(35, 75%, 50%)', 
    bgColor: 'hsl(35, 85%, 80%)',
    variant: 'lifestyle' as const 
  },
  { 
    id: 'private', 
    name: 'Private', 
    color: 'hsl(210, 15%, 45%)', 
    bgColor: 'hsl(210, 25%, 75%)',
    variant: 'private' as const 
  },
  { 
    id: 'cinema', 
    name: 'Cinema', 
    color: 'hsl(250, 65%, 55%)', 
    bgColor: 'hsl(250, 75%, 85%)',
    variant: 'cinema' as const 
  },
  { 
    id: 'events', 
    name: 'Events', 
    color: 'hsl(15, 75%, 55%)', 
    bgColor: 'hsl(15, 85%, 80%)',
    variant: 'events' as const 
  },
  { 
    id: 'fooddrink', 
    name: 'Food & Drink', 
    color: 'hsl(45, 85%, 55%)', 
    bgColor: 'hsl(45, 90%, 80%)',
    variant: 'fooddrink' as const
  }
];

const CategoriesGrid = () => {
  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section with Better Spacing */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-inter text-contrast leading-tight">
            Explore By
            <span className="block sm:inline gradient-text sm:ml-4">
              Vibe
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-contrast-secondary font-inter leading-relaxed max-w-2xl mx-auto px-4">
            Discover experiences that match your mood and interests
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category, index) => {
            const IconComponent = CategoryIcons[category.id as keyof typeof CategoryIcons] || CategoryIcons.culture;
            
            return (
              <div
                key={category.name}
                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-sm border border-white/20 hover:border-white/40 transition-all duration-300 hover:scale-105 cursor-pointer"
              >
                <div className="aspect-square p-6 flex flex-col items-center justify-center text-center">
                  <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={32} style={{ color: category.color }} />
                  </div>
                  <h3 className="font-semibold text-white text-sm">
                    {category.name}
                  </h3>
                </div>
              </div>
            );
          })}
        </div>

        {/* Enhanced Call-to-Action with Better Mobile Spacing */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <p className="text-sm sm:text-base text-contrast-secondary mb-4 sm:mb-6">
            Can't find what you're looking for?
          </p>
          <button className="btn-secondary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105">
            Browse All Categories
          </button>
        </div>
      </div>
    </section>
  );
};

export default CategoriesGrid;