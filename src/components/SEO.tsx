import { useEffect } from 'react';

type SEOProps = {
  title?: string;
  description?: string;
  canonical?: string;
  noindex?: boolean;
};

const setMeta = (name: string, content: string, attr: 'name' | 'property' = 'name') => {
  let el = document.head.querySelector(`meta[${attr}='${name}']`) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, name);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
};

export default function SEO({ title, description, canonical, noindex }: SEOProps) {
  useEffect(() => {
    if (title) document.title = title;
    if (description) setMeta('description', description);
    if (noindex) setMeta('robots', 'noindex, nofollow');
    if (canonical) {
      let link = document.head.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
      if (!link) {
        link = document.createElement('link');
        link.setAttribute('rel', 'canonical');
        document.head.appendChild(link);
      }
      link.setAttribute('href', canonical);
    }
  }, [title, description, canonical, noindex]);

  return null;
}