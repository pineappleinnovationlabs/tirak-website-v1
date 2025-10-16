# Travel Companion Platform

A modern, interactive web application for connecting travelers with local companions and discovering unique experiences around the world.

## 🌟 Features

- **Interactive Hero Section** with dynamic animations and engaging call-to-actions
- **Organic Category System** featuring playful blob shapes with smooth animations
- **Companion Stories** showcasing real experiences from travelers
- **Featured Companions** highlighting top-rated local guides
- **Local Guide Registration** with dedicated onboarding flow
- **Responsive Design** optimized for all devices
- **Glassmorphism UI** with beautiful backdrop effects and modern aesthetics
- **Smooth Animations** throughout the user interface

## 🛠 Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS with custom design system
- **UI Components**: Shadcn/ui
- **Icons**: Lucide React + Custom SVG icons
- **Routing**: React Router DOM
- **State Management**: React Hooks
- **Animation**: CSS animations with custom keyframes

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/travel-companion-platform.git
   cd travel-companion-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── ui/              # Base UI components (buttons, cards, etc.)
│   ├── HeroSection.tsx  # Main hero component (Index page)
│   ├── CategoriesGrid.tsx # Organic blob category system
│   ├── CompanionStories.tsx
│   ├── FeaturedCompanions.tsx
│   └── ...
├── pages/               # Page components
│   ├── Index.tsx        # Marketing home with classic header
│   └── TirakLanding.tsx # Landing variant with streamlined hero
├── hooks/               # Custom React hooks
├── lib/                 # Utility functions and centralized UI variants/icons
├── assets/              # Static assets (images, icons)
└── index.css           # Global styles and design system
```

## 🎨 Design System

The application uses a custom design system built on Tailwind CSS with:

- **Color Palette**: HSL-based semantic color tokens
- **Typography**: Inter font family with responsive sizing
- **Spacing**: Consistent spacing scale
- **Shadows**: Layered shadow system for depth
- **Gradients**: Beautiful gradient combinations
- **Glassmorphism**: Backdrop blur effects with transparency

### Key Design Components

- **Blob Shapes**: Organic SVG shapes for category visualization
- **Glass Cards**: Translucent cards with backdrop blur
- **Gradient Buttons**: Interactive buttons with hover effects
- **Responsive Grid**: Adaptive layouts for all screen sizes
 - **Texture Noise Utility**: `texture-noise-dark` for subtle grain over dark surfaces

## 🔎 SEO & Accessibility

- Enhanced `index.html` meta tags (title, description, robots, OG/Twitter, canonical, theme-color)
- Reusable `SEO.tsx` component for dynamic title/description/canonical per page
- Semantic landmarks: `main`, `section` with `aria-label`/`aria-labelledby`
- Clean heading hierarchy with a single `h1` per page hero
- Alt text on all images where applicable

## 🎯 Key Components

### CategoriesGrid
Interactive organic blob system showcasing different travel categories:
- Culture, Adventure, Wellness, Nightlife, Lifestyle, Private, Cinema, Events
- Custom SVG blob shapes with unique morphing animations
- Hover effects with scaling and rotation
- Responsive grid layout

### HeroSection
Dynamic hero area with:
- Animated background gradients
- Interactive call-to-action buttons
- Responsive typography
- Smooth scroll animations

### CompanionStories
Carousel-style component featuring:
- User testimonials and experiences
- Image galleries
- Smooth transitions
- Touch-friendly mobile navigation

## 🔧 Customization

### Adding New Categories

1. Add category data to `src/components/CategoriesGrid.tsx`
2. Create corresponding icon in `src/lib/category-icons.tsx`
3. Add blob shape variant in `src/components/ui/blob-shapes.tsx`
4. If needed, add/reuse a button/toggle/badge/etc variant in `src/lib/ui-variants.ts`

### Modifying Colors

Update the design system in `src/index.css`:
```css
:root {
  --primary: [your-hsl-values];
  --secondary: [your-hsl-values];
  /* ... */
}
```

### Custom Animations

Add new keyframes in `tailwind.config.ts`:
```js
keyframes: {
  'your-animation': {
    '0%': { /* start state */ },
    '100%': { /* end state */ }
  }
}
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 640px
- **Tablet**: 640px - 1024px  
- **Desktop**: > 1024px

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels for interactive elements
- Keyboard navigation support
- High contrast color combinations
- Reduced motion support for users with vestibular disorders

## 🚀 Deployment

### Lovable Platform (Recommended)

1. Connect your GitHub repository to Lovable
2. Click "Publish" in the Lovable editor
3. Your app will be deployed automatically

### Other Platforms

The build output is compatible with:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront
- Any static hosting service

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Use TypeScript for type safety
- Write meaningful commit messages
- Test your changes across different screen sizes
- Ensure accessibility standards are maintained

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Shadcn/ui** for the excellent component library
- **Lucide** for beautiful icon system
- **Tailwind CSS** for the utility-first CSS framework
- **React Team** for the amazing framework

## 📞 Contact

For questions, suggestions, or support:

- **GitHub Issues**: [Create an issue](https://github.com/yourusername/travel-companion-platform/issues)
- **Email**: your.email@example.com
- **Website**: [your-website.com](https://your-website.com)

---

**Built with ❤️ using [Lovable](https://lovable.dev)**

## 🧰 Development Scripts

```bash
npm run dev       # Start Vite dev server
npm run build     # Build for production
npm run preview   # Preview built site
npm run lint      # Run ESLint across the project
npm run lint:fix  # Auto-fix lint issues where possible

## 🧩 UI Variants & Icons

- All `cva`-based component variants are centralized in `src/lib/ui-variants.ts` (buttons, toggles, badges, labels, sheets, toast, navigation menu, sidebar menu buttons, etc.).
- Category icons are centralized in `src/lib/category-icons.tsx` and imported where needed (e.g., `CategoriesGrid`).
- Component files may import and re-export variants to keep usage ergonomic; this improves hot-reload fidelity and avoids duplicating variant definitions.
```

## 📑 Documentation Notes

- Use `SEO.tsx` to set per-page `title`, `description`, and `canonical`.
- Prefer semantic `section` with `aria-*` attributes for accessible content grouping.
- Keep hero backgrounds legible; avoid floating elements that obstruct text.