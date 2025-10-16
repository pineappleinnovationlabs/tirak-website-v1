import { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Smartphone, Download as DownloadIcon } from "lucide-react";
import SEO from "@/components/SEO";
import Footer from "@/components/Footer";

// Update these URLs to your real store listings
const APP_STORE_URL = "https://testflight.apple.com/join/hCR6HDud";
const PLAY_STORE_URL = "https://expo.dev/accounts/thoughtseedlabs/projects/tirak-companion-marketplace/builds/0030f11b-ba99-4bd7-a642-f7d369808b8e";

type Platform = "ios" | "android" | "other";

const detectPlatform = (): Platform => {
  const ua = navigator.userAgent || (navigator as any).vendor || (window as any).opera || "";
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform === "MacIntel" && (navigator as any).maxTouchPoints > 1);
  if (isIOS) return "ios";
  if (isAndroid) return "android";
  return "other";
};

const Download = () => {
  const location = useLocation();
  const [redirected, setRedirected] = useState(false);

  const params = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const overridePlatform = useMemo<Platform>(() => {
    const p = params.get("platform");
    if (p === "ios" || p === "android" || p === "other") return p;
    return "other";
  }, [params]);

  const platform = useMemo<Platform>(() => {
    return overridePlatform !== "other" ? overridePlatform : detectPlatform();
  }, [overridePlatform]);

  useEffect(() => {
    const iosUrl = APP_STORE_URL;
    const androidUrl = PLAY_STORE_URL;
    let target: string | null = null;

    if (platform === "ios" && iosUrl) target = iosUrl;
    if (platform === "android" && androidUrl) target = androidUrl;

    // Auto-redirect after a short delay; always show the page UI for fallback
    const t = setTimeout(() => {
      if (target && !redirected) {
        setRedirected(true);
        window.location.href = target;
      }
    }, 800);

    return () => clearTimeout(t);
  }, [platform, redirected]);

  const platformLabel = platform === "ios" ? "iOS" : platform === "android" ? "Android" : "your device";

  return (
    <>
      <SEO 
        title="Download Tirak - Dream Journal & Lucid Dreaming App"
        description="Download Tirak for iOS and Android. Start your lucid dreaming journey with our comprehensive dream journal and reality check features."
      />
      
      <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-secondary-900" style={{ marginTop: 'clamp(5em, 10vh, 9em)' }}>
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="glass-card p-8 md:p-12">
              {/* Header Section */}
              <div className="text-center mb-12">
                <div className="inline-block bg-gradient-to-r from-accent-400 to-secondary-400 bg-clip-text text-transparent mb-4">
                  <h1 className="text-4xl md:text-5xl font-inter font-bold">
                    Download Tirak
                  </h1>
                </div>
                <p className="text-xl text-text-secondary max-w-2xl mx-auto leading-relaxed">
                  Start your tirak journey today. Available on iOS and Android.
                </p>
                <p className="text-lg text-text-secondary/80 mt-2">
                  We detected {platformLabel}. If supported, you will be redirected automatically.
                </p>
              </div>

              {/* Download Links Section */}
              <div className="space-y-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
                  <a
                    href={APP_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass-card hover-lift hover-glow transition-all duration-300 hover:scale-105 p-4 rounded-2xl focus-ring will-change-transform hardware-accelerated"
                  >
                    <img
                      src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                      alt="Download on App Store"
                      className="h-14 w-auto rounded-xl"
                    />
                  </a>

                  <a
                    href={PLAY_STORE_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group glass-card hover-lift hover-glow transition-all duration-300 hover:scale-105 p-4 rounded-2xl focus-ring will-change-transform hardware-accelerated"
                  >
                    <img
                      src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                      alt="Get it on Google Play"
                      className="h-14 w-auto rounded-xl"
                    />
                  </a>
                </div>

              

                {/* Call to Action */}
                <div className="text-center mt-8">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="rounded-xl group inline-flex items-center gap-2 transition-all duration-300 hover:scale-[1.02] hover:shadow-elevated focus-ring"
                  >
                    <Link to="/" aria-label="Explore Trial">
                      Explore Trial
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transition-transform duration-300 group-hover:translate-x-0.5"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <Footer />
      </div>
    </>
  );
};

export default Download;