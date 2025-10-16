import { Button } from '@/components/ui/button';
import guide1 from '@/assets/guide-1.jpg';
import guide2 from '@/assets/guide-2.jpg';
import guide3 from '@/assets/guide-3.jpg';

const companions = [
  {
    id: 1,
    name: 'Niran',
    location: 'Bangkok',
    tag: 'Foodie',
    rating: 4.9,
    reviews: 127,
    verified: true,
    image: guide1,
  },
  {
    id: 2,
    name: 'Kamon',
    location: 'Chiang Mai',
    tag: 'Culture Expert',
    rating: 5.0,
    reviews: 89,
    verified: true,
    image: guide2,
  },
  {
    id: 3,
    name: 'Malee',
    location: 'Phuket',
    tag: 'Adventure Guide',
    rating: 4.8,
    reviews: 156,
    verified: true,
    image: guide3,
  },
  {
    id: 4,
    name: 'Somchai',
    location: 'Krabi',
    tag: 'Nature Lover',
    rating: 4.9,
    reviews: 92,
    verified: true,
    image: guide1, // Reusing for demo
  },
];

const FeaturedCompanions = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-responsive-xl font-bold font-inter text-contrast mb-4">
            Featured
            <span className="gradient-text ml-4">
              Companions
            </span>
          </h2>
          <p className="text-lg md:text-xl text-contrast-secondary font-inter leading-relaxed">
            Meet our top-rated local guides ready to show you the real Thailand
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {companions.map((companion, index) => (
            <div key={index} className="group relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary/5 to-primary/10">
                <img 
                  src={companion.image} 
                  alt={`${companion.name} - Local guide in ${companion.location}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <div className="flex items-center gap-2 mb-2">
                     <div className="flex text-yellow-400">
                       {[...Array(5)].map((_, i) => (
                         <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                           <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                         </svg>
                       ))}
                     </div>
                     <span className="text-sm font-medium">{companion.rating}</span>
                   </div>
                   <p className="text-sm">{companion.tag} • {companion.reviews} reviews</p>
                 </div>
              </div>
              
              <div className="space-y-2">
                 <h3 className="font-semibold text-lg">{companion.name}</h3>
                 <p className="text-muted-foreground flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   {companion.location}
                 </p>
                 <div className="flex items-center gap-2">
                   <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                     {companion.tag}
                   </span>
                   {companion.verified && (
                     <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                       Verified
                     </span>
                   )}
                 </div>
               </div>
            </div>
          ))}
        </div>

        {/* View All Button */}
        <div className="text-center mt-12">
          <Button className="bg-button hover:shadow-glow text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105">
            View All Companions
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanions;