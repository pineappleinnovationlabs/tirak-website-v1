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
  const nav = typeof navigator !== "undefined" ? navigator : null;
  const win = typeof window !== "undefined" ? (window as unknown as { opera?: string }) : null;
  const ua = (nav?.userAgent || nav?.vendor || win?.opera || "");
  const isAndroid = /Android/i.test(ua);
  const isIOS = /iPhone|iPad|iPod/i.test(ua) || (nav?.platform === "MacIntel" && (nav?.maxTouchPoints ?? 0) > 1);
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
    if (p === "ios" || p === "android") return p;
    return "other";
  }, [params]);

  const platform = useMemo<Platform>(() => {
    if (overridePlatform !== "other") return overridePlatform;
    return detectPlatform();
  }, [overridePlatform]);

  useEffect(() => {
    const auto = params.get("auto");
    if (auto === "0" || auto === "false" || redirected) return;

    if (platform === "ios") {
      setRedirected(true);
      window.location.href = APP_STORE_URL;
    } else if (platform === "android") {
      setRedirected(true);
      window.location.href = PLAY_STORE_URL;
    }
  }, [platform, params, redirected]);

  return (
    <main className="min-h-screen bg-background flex flex-col">
      <SEO
        title="Download Tirak App — Available on iOS & Android"
        description="Download the Tirak mobile app to discover authentic local experiences in Thailand and connect with trusted companions."
      />

      <section className="flex-1 flex items-center justify-center py-16 px-4">
        <div className="w-full max-w-xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 text-primary mb-2">
            <Smartphone className="w-8 h-8" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-contrast">
            Get the Tirak App
          </h1>

          <p className="text-contrast-secondary text-base sm:text-lg">
            Experience the best of Thailand with curated local companions. Browse verified profiles, book experiences, and travel with confidence.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
            <Button
              asChild
              size="lg"
              className="w-full justify-center"
              variant={platform === "ios" ? "default" : "outline"}
            >
              <a href={APP_STORE_URL} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download for iOS (TestFlight)
              </a>
            </Button>

            <Button
              asChild
              size="lg"
              className="w-full justify-center"
              variant={platform === "android" ? "default" : "outline"}
            >
              <a href={PLAY_STORE_URL} target="_blank" rel="noopener noreferrer">
                <DownloadIcon className="w-4 h-4 mr-2" />
                Download for Android (APK)
              </a>
            </Button>
          </div>

          <div className="pt-4 text-xs text-contrast-secondary space-y-1">
            <p>
              Direct install link not opening? Choose your platform above or view our{" "}
              <Link to="/#faq" className="underline underline-offset-4 hover:text-foreground">
                installation guide
              </Link>
              .
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
};

export default Download;
