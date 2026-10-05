import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    title: 'Download the App',
    description: 'Get Tirak to explore local guides and experiences when app access is available.',
    icon: '👥',
  },
  {
    number: '02',
    title: 'Join the Waitlist',
    description: 'Share your contact details so Tirak can notify you when your access window opens.',
    icon: '🎯',
  },
  {
    number: '03',
    title: 'Plan Your Experience',
    description: 'Choose an experience, date, and meeting point that work for you.',
    icon: '📍',
  },
  {
    number: '04',
    title: 'Explore Together',
    description: 'Discover Thailand together with your local guide.',
    icon: '✨',
  },
];

const HowItWorks = () => {
  const [visibleSteps, setVisibleSteps] = useState<boolean[]>([]);
  const stepRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const observers = stepRefs.current.map((ref, index) => {
      if (!ref) return null;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setVisibleSteps(prev => {
              const newVisible = [...prev];
              newVisible[index] = true;
              return newVisible;
            });
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(ref);
      return observer;
    });

    return () => {
      observers.forEach(observer => observer?.disconnect());
    };
  }, []);

  return (
    <section className="py-20">
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl lg:text-6xl font-bold font-inter text-foreground mb-4">
            How It
            <span className="text-transparent bg-gradient-to-r from-primary to-secondary bg-clip-text ml-4">
              Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground font-inter">
            Plan your local experience with Tirak
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">{step.icon}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
