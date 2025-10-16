import { useState, useEffect } from 'react';

const stories = [
  {
    id: 1,
    quote: "Pim was the best local companion – she showed me hidden temples I'd never find on my own!",
    author: "Maria",
    country: "Spain",
    flag: "🇪🇸",
  },
  {
    id: 2,
    quote: "Kamon took me to the most incredible street food spots. Every meal was an adventure!",
    author: "James",
    country: "Australia",
    flag: "🇦🇺",
  },
  {
    id: 3,
    quote: "Thanks to Malee, I discovered parts of Phuket that felt like paradise. Unforgettable experience!",
    author: "Sophie",
    country: "France",
    flag: "🇫🇷",
  },
  {
    id: 4,
    quote: "Somchai's knowledge of Thai culture opened my eyes to so many beautiful traditions.",
    author: "Alex",
    country: "Germany",
    flag: "🇩🇪",
  },
];

const CompanionStories = () => {
  const [currentStory, setCurrentStory] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentStory((prev) => (prev + 1) % stories.length);
    }, 4000);

    return () => clearInterval(timer);
  }, []);

  return (
    <section className="py-16 sm:py-20 lg:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Enhanced Header Section with Better Mobile Spacing */}
        <div className="text-center mb-12 sm:mb-16 lg:mb-20 space-y-4 sm:space-y-6">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold font-inter text-contrast leading-tight">
            Companion
            <span className="block sm:inline gradient-text sm:ml-4">
              Stories
            </span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-contrast-secondary font-inter leading-relaxed max-w-2xl mx-auto px-4">
            Real experiences from travelers like you
          </p>
        </div>

        {/* Enhanced Story Carousel with Better Mobile Layout */}
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-6 sm:p-8 md:p-12 lg:p-16 text-center relative overflow-hidden">
            {/* Enhanced Background Gradient */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-secondary/3 to-accent/5 rounded-2xl sm:rounded-3xl" />
            
            {/* Subtle Pattern Overlay */}
            <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[length:20px_20px]" />
            
            <div className="relative z-10">
              {/* Enhanced Quote Section with Better Mobile Typography */}
              <div className="mb-6 sm:mb-8 lg:mb-12">
                {/* Quote Icon */}
                <div className="text-4xl sm:text-5xl lg:text-6xl text-primary/20 mb-4 sm:mb-6">
                  "
                </div>
                
                <p className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-inter text-contrast leading-relaxed mb-6 sm:mb-8 lg:mb-12 italic font-light px-2 sm:px-4">
                  {stories[currentStory].quote}
                </p>
                
                {/* Enhanced Author Section with Better Mobile Layout */}
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4">
                  <span className="text-3xl sm:text-4xl">{stories[currentStory].flag}</span>
                  <div className="text-center sm:text-left">
                    <p className="text-base sm:text-lg lg:text-xl font-semibold text-contrast">
                      {stories[currentStory].author}
                    </p>
                    <p className="text-sm sm:text-base text-contrast-secondary">
                      {stories[currentStory].country}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Story Indicators with Better Mobile Spacing */}
              <div className="flex justify-center space-x-3 sm:space-x-4 mt-8 sm:mt-12">
                {stories.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentStory(index)}
                    className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full transition-all duration-500 focus-ring transform hover:scale-125 ${
                      index === currentStory
                        ? 'bg-primary shadow-glow scale-125'
                        : 'bg-muted-foreground/30 hover:bg-muted-foreground/50'
                    }`}
                    aria-label={`View story ${index + 1}`}
                  />
                ))}
              </div>

              {/* Enhanced Progress Bar */}
              <div className="mt-6 sm:mt-8 max-w-xs mx-auto">
                <div className="h-1 bg-muted-foreground/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-secondary rounded-full transition-all duration-4000 ease-linear"
                    style={{
                      width: `${((currentStory + 1) / stories.length) * 100}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Floating Elements for Visual Interest */}
            <div className="absolute top-4 left-4 w-2 h-2 bg-primary/20 rounded-full animate-pulse" />
            <div className="absolute bottom-6 right-6 w-3 h-3 bg-secondary/20 rounded-full animate-pulse" style={{ animationDelay: '1s' }} />
            <div className="absolute top-1/3 right-4 w-1 h-1 bg-accent/30 rounded-full animate-pulse" style={{ animationDelay: '2s' }} />
          </div>
        </div>

        {/* Enhanced Call-to-Action Section */}
        <div className="text-center mt-12 sm:mt-16 lg:mt-20">
          <p className="text-sm sm:text-base text-contrast-secondary mb-4 sm:mb-6 max-w-md mx-auto">
            Ready to create your own unforgettable story in Thailand?
          </p>
          <button className="btn-primary px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-medium transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl">
            Find Your Companion
          </button>
        </div>
      </div>
    </section>
  );
};

export default CompanionStories;