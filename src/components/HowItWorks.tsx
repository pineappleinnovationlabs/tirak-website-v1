import { useEffect, useRef, useState } from 'react';

const steps = [
  {
    number: '01',
    title: 'Pick a Companion',
    description: 'Browse verified local guides and find the perfect match for your adventure.',
    icon: '👥',
  },
  {
    number: '02',
    title: 'Choose a Category',
    description: 'Select from culture, adventure, wellness, nightlife, and more experiences.',
    icon: '🎯',
  },
  {
    number: '03',
    title: 'Set Time & Meeting Point',
    description: 'Coordinate your schedule and choose a convenient meeting location.',
    icon: '📍',
  },
  {
    number: '04',
    title: 'Enjoy Your Experience!',
    description: 'Discover authentic Thailand with your personal local guide.',
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
            Start your authentic Thai adventure in just 4 simple steps
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