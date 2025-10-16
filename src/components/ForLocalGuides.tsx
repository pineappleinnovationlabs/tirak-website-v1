import { Button } from '@/components/ui/button';
import { Calendar, MessageCircle, Star, Play, Users, DollarSign, TrendingUp } from 'lucide-react';

const features = [
  {
    icon: Calendar,
    title: 'Flexible Availability Calendar',
    description: 'Set your own schedule and availability with our easy-to-use calendar system.',
  },
  {
    icon: MessageCircle,
    title: 'Real-time Chat with Travelers',
    description: 'Connect instantly with tourists and build relationships before meeting.',
  },
  {
    icon: Star,
    title: 'Ratings & Reviews System',
    description: 'Build your reputation and showcase your expertise with verified reviews.',
  },
];

const ForLocalGuides = () => {
  return (
    <div className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-background to-muted/20" aria-labelledby="guides-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className="space-y-6 sm:space-y-8 lg:space-y-10">
            {/* Header Section */}
            <div className="space-y-3 sm:space-y-4 lg:space-y-6">
              <div className="inline-flex items-center px-3 py-1.5 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 mb-4">
                <span className="text-xs sm:text-sm font-medium text-primary">For Local Guides</span>
              </div>
              <h2 id="guides-heading" className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold font-inter text-contrast leading-tight">
                Share Your Passion,
                <span className="block text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
                  Earn Income
                </span>
              </h2>
              <p className="text-base sm:text-lg lg:text-xl text-contrast-secondary font-inter leading-relaxed max-w-xl">
                Guide travelers through authentic local experiences and build a sustainable income sharing your knowledge of Thailand.
              </p>
            </div>

            {/* Features List */}
            <div className="space-y-4 sm:space-y-6" role="list" aria-label="Guide platform features">
              {features.map((feature, index) => {
                const IconComponent = feature.icon;
                return (
                  <div 
                    key={index} 
                    className="group flex items-start space-x-3 sm:space-x-4 p-3 sm:p-4 rounded-2xl hover:bg-gradient-to-r hover:from-primary/5 hover:to-secondary/5 transition-all duration-300" 
                    role="listitem"
                  >
                    <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <IconComponent className="w-5 h-5 sm:w-6 sm:h-6 text-primary group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base sm:text-lg font-semibold text-contrast mb-1 sm:mb-2 group-hover:text-primary transition-colors duration-300">
                        {feature.title}
                      </h3>
                      <p className="text-sm sm:text-base text-contrast-secondary leading-relaxed">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Enhanced CTA Button */}
            <div className="pt-4 sm:pt-6">
              <Button 
                size="lg" 
                className="group bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl font-semibold text-base sm:text-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 will-change-transform hardware-accelerated"
                aria-label="Start earning as a local guide"
              >
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                Start Earning Today
              </Button>
            </div>
          </div>

          {/* Right Content - Enhanced Video Mockup */}
          <div className="relative order-first lg:order-last">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-3xl transform rotate-3 scale-105"></div>
            
            {/* Main Video Container */}
            <div className="relative glass-card rounded-3xl overflow-hidden shadow-2xl hover:shadow-3xl transition-all duration-500 group">
              {/* Video Background */}
              <div className="aspect-video bg-gradient-to-br from-slate-900 to-slate-800 relative overflow-hidden">
                {/* Animated Background Pattern */}
                <div className="absolute inset-0 opacity-20">
                  <div className="absolute top-4 left-4 w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <div className="absolute top-8 right-8 w-3 h-3 bg-secondary rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-6 left-8 w-2 h-2 bg-primary rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                </div>
                
                {/* Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <button 
                    className="group/play w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl hover:bg-white hover:scale-110 transition-all duration-300 focus-ring"
                    aria-label="Play guide introduction video"
                  >
                    <Play className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 text-primary ml-1 group-hover/play:scale-110 transition-transform duration-300" fill="currentColor" />
                  </button>
                </div>

                {/* Enhanced Overlay Text */}
                <div className="absolute bottom-4 left-4 right-4">
                  <div className="glass-card p-3 sm:p-4 rounded-xl">
                    <h3 className="text-white font-semibold text-sm sm:text-base mb-1">
                      Guide Success Stories
                    </h3>
                    <p className="text-white/80 text-xs sm:text-sm">
                      See how local guides are earning ฿15,000+ monthly
                    </p>
                  </div>
                </div>

                {/* Live Indicator */}
                <div className="absolute top-4 left-4">
                  <div className="flex items-center space-x-2 glass-card px-2 sm:px-3 py-1 sm:py-1.5 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-xs font-medium">LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Enhanced Floating Statistics - Repositioned Outside Video Container */}
            <div className="absolute -top-8 -right-8 sm:-top-12 sm:-right-12 z-10">
              <div className="glass p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-contrast">2.1k</div>
                    <div className="text-xs text-contrast-secondary">watching</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-8 -left-8 sm:-bottom-12 sm:-left-12 z-10">
              <div className="glass-card p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-secondary" />
                  <div>
                    <div className="text-xs sm:text-sm font-bold text-contrast">฿500+</div>
                    <div className="text-xs text-contrast-secondary">Avg. Monthly Earnings</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute top-1/2 -right-8 sm:-right-12 transform -translate-y-1/2 z-10">
              <div className="glass p-3 sm:p-4 rounded-2xl shadow-xl hover:scale-105 transition-transform duration-300">
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" />
                  <div className="text-right">
                    <div className="text-xs sm:text-sm font-bold text-contrast">4.9★</div>
                    <div className="text-xs text-contrast-secondary">Guide Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Floating Elements */}
          <div className="absolute -top-8 -left-8 w-16 h-16 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl animate-float"></div>
          <div className="absolute -bottom-8 -right-8 w-20 h-20 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full blur-xl animate-float" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Mobile-specific Bottom CTA */}
      <div className="mt-12 sm:mt-16 lg:hidden text-center">
        <div className="glass-card p-6 rounded-3xl max-w-sm mx-auto">
          <h3 className="text-lg font-bold text-contrast mb-2">Ready to Start?</h3>
          <p className="text-sm text-contrast-secondary mb-4">Join 1000+ guides earning with Tirak</p>
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-white rounded-xl font-semibold"
          >
            <TrendingUp className="w-5 h-5 mr-2" />
            Get Started
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ForLocalGuides;