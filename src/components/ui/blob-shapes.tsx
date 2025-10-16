import { HTMLAttributes } from 'react';

interface BlobProps extends HTMLAttributes<SVGElement> {
  variant?: 'culture' | 'adventure' | 'wellness' | 'nightlife' | 'lifestyle' | 'private' | 'cinema' | 'events' | 'fooddrink';
  size?: number;
}

export const CultureBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,15 C145,18 172,45 185,85 C188,125 165,155 135,175 C105,185 75,178 45,160 C25,135 18,105 25,75 C35,45 65,12 100,15 Z"
      fill="currentColor"
    />
  </svg>
);

export const AdventureBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,12 C155,22 178,58 175,95 C185,135 158,168 125,182 C85,188 52,172 28,145 C15,115 22,82 38,55 C58,25 78,8 100,12 Z"
      fill="currentColor"
    />
  </svg>
);

export const WellnessBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,18 C142,25 168,52 178,88 C182,128 162,158 138,175 C108,188 78,185 52,168 C28,148 15,118 22,88 C32,58 62,15 100,18 Z"
      fill="currentColor"
    />
  </svg>
);

export const NightlifeBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,10 C148,15 175,48 188,82 C192,122 178,155 152,175 C122,192 88,188 58,172 C32,152 12,122 18,88 C28,52 62,8 100,10 Z"
      fill="currentColor"
    />
  </svg>
);

export const LifestyleBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,20 C138,15 165,42 182,75 C188,115 172,148 148,168 C118,185 88,182 62,165 C38,145 22,115 28,85 C38,55 68,25 100,20 Z"
      fill="currentColor"
    />
  </svg>
);

export const PrivateBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,14 C152,20 172,55 185,92 C188,132 168,162 142,178 C112,192 82,185 55,168 C28,148 15,118 22,88 C32,52 65,8 100,14 Z"
      fill="currentColor"
    />
  </svg>
);

export const CinemaBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,16 C145,12 175,38 188,72 C195,112 182,145 158,168 C128,188 98,185 68,172 C42,155 18,125 25,92 C35,58 68,20 100,16 Z"
      fill="currentColor"
    />
  </svg>
);

export const EventsBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,8 C158,18 182,48 188,88 C185,128 165,162 135,182 C105,195 75,188 45,172 C18,152 8,122 15,88 C25,48 62,2 100,8 Z"
      fill="currentColor"
    />
  </svg>
);

export const FoodDrinkBlob = ({ size = 200, className, ...props }: BlobProps) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 200 200" 
    className={className}
    {...props}
  >
    <path
      d="M100,22 C148,18 178,45 185,82 C192,122 175,155 152,172 C122,188 92,185 65,168 C38,148 22,118 28,85 C38,48 68,25 100,22 Z"
      fill="currentColor"
    />
  </svg>
);

const BlobComponents = {
  culture: CultureBlob,
  adventure: AdventureBlob,
  wellness: WellnessBlob,
  nightlife: NightlifeBlob,
  lifestyle: LifestyleBlob,
  private: PrivateBlob,
  cinema: CinemaBlob,
  events: EventsBlob,
  fooddrink: FoodDrinkBlob,
};

export const BlobShape = ({ variant = 'culture', ...props }: BlobProps) => {
  const Component = BlobComponents[variant];
  return <Component {...props} />;
};