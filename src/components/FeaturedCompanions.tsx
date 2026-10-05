import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import guide1 from '@/assets/guide-1.jpg';
import guide2 from '@/assets/guide-2.jpg';
import guide3 from '@/assets/guide-3.jpg';

const discoveryPreviews = [
  {
    id: 1,
    title: 'Food neighborhoods',
    label: 'Bangkok',
    summary: 'Explore street food, neighborhood markets, and local flavors.',
    image: guide1,
  },
  {
    id: 2,
    title: 'Cultural routes',
    label: 'Chiang Mai',
    summary: 'Discover temples, traditions, and the stories behind each place.',
    image: guide2,
  },
  {
    id: 3,
    title: 'Coastal getaways',
    label: 'Phuket',
    summary: 'Plan island visits, coastal walks, and time by the sea.',
    image: guide3,
  },
];

const FeaturedCompanions = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-responsive-xl font-bold font-inter text-contrast mb-4">
            Discovery
            <span className="gradient-text ml-4">
              Preview
            </span>
          </h2>
          <p className="text-lg md:text-xl text-contrast-secondary font-inter leading-relaxed">
            Explore the kinds of local experiences you can discover with Tirak.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {discoveryPreviews.map((preview) => (
            <div key={preview.id} className="group relative">
              <div className="aspect-[3/4] rounded-2xl overflow-hidden mb-4 bg-gradient-to-br from-primary/5 to-primary/10">
                <img
                  src={preview.image}
                  alt={`${preview.title} artwork from ${preview.label}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="absolute bottom-4 left-4 right-4 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                   <p className="text-sm font-medium uppercase tracking-[0.2em] text-white/80">Experience inspiration</p>
                   <p className="text-sm mt-2">Find available guides and experiences in the Tirak app.</p>
                 </div>
              </div>

              <div className="space-y-2">
                 <h3 className="font-semibold text-lg">{preview.title}</h3>
                 <p className="text-muted-foreground flex items-center gap-1">
                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                   </svg>
                   {preview.label}
                 </p>
                 <p className="text-sm text-muted-foreground leading-relaxed">{preview.summary}</p>
               </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild className="bg-button hover:shadow-glow text-white font-semibold px-8 py-4 rounded-full transition-all duration-300 hover:scale-105">
            <Link to="/download">Get the App</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedCompanions;
