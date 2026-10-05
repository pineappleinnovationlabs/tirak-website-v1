import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import SEO from '@/components/SEO';
import Footer from '@/components/Footer';

export default function Companions() {
  return (
    <main className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Tirak Companion Access"
        description="Discover local guides and experiences through the Tirak app. App testing is currently by invitation."
        canonical="/companions"
      />

      <section className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-2xl mx-auto text-center space-y-6 glass-card rounded-3xl p-8 sm:p-12">
          <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium">
            Explore with Tirak
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-contrast">
            Discover local guides in the app
          </h1>

          <p className="text-contrast-secondary text-base sm:text-lg leading-relaxed">
            App testing is currently by invitation. Join early access, or apply to share your local knowledge as a guide.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
            <Button asChild size="lg">
              <Link to="/download">Get the App</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link to="/apply">Apply as a Guide</Link>
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
