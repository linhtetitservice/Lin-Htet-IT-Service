import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Product, ProductReview } from '../types';
import { storeService } from '../services/storeService';
import { 
  Star, 
  Quote, 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Users, 
  Pause, 
  Play, 
  ExternalLink,
  ThumbsUp,
  Sparkles
} from 'lucide-react';

interface TestimonialSliderProps {
  products: Product[];
  onSelectProduct?: (product: Product, initialTab?: 'details' | 'reviews') => void;
}

export const TestimonialSlider: React.FC<TestimonialSliderProps> = ({
  products,
  onSelectProduct
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [cardsPerView, setCardsPerView] = useState(3);
  
  // Touch swipe handling
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);
  const autoPlayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Load reviews and handle updates
  const loadReviews = async () => {
    try {
      const allReviews = await storeService.getReviews();
      // Filter for testimonials: 4 and 5 stars, sorted newest or verified first
      const positiveReviews = allReviews.filter(r => r.rating >= 4);
      setReviews(positiveReviews.length > 0 ? positiveReviews : allReviews);
    } catch (err) {
      console.error('Failed to load testimonials:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();

    const handleReviewsUpdated = () => {
      loadReviews();
    };

    window.addEventListener('reviews_updated', handleReviewsUpdated);
    return () => {
      window.removeEventListener('reviews_updated', handleReviewsUpdated);
    };
  }, []);

  // Update cards per view on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsPerView(1);
      } else if (window.innerWidth < 1024) {
        setCardsPerView(2);
      } else {
        setCardsPerView(3);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const totalReviews = reviews.length;
  const maxIndex = Math.max(0, totalReviews - cardsPerView);

  // Auto-play interval
  useEffect(() => {
    if (!isAutoPlaying || isHovered || maxIndex <= 0) {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
      return;
    }

    autoPlayTimerRef.current = setInterval(() => {
      setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
    }, 4500);

    return () => {
      if (autoPlayTimerRef.current) clearInterval(autoPlayTimerRef.current);
    };
  }, [isAutoPlaying, isHovered, maxIndex]);

  const handlePrev = () => {
    setCurrentIndex(prev => (prev <= 0 ? maxIndex : prev - 1));
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev >= maxIndex ? 0 : prev + 1));
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const isLeftSwipe = distance > 45;
    const isRightSwipe = distance < -45;

    if (isLeftSwipe) {
      handleNext();
    } else if (isRightSwipe) {
      handlePrev();
    }

    touchStartX.current = null;
    touchEndX.current = null;
  };

  // Find linked product for a review
  const getProductForReview = (review: ProductReview): Product | undefined => {
    return products.find(p => p.id === review.productId || p.name === review.productName);
  };

  // Calculate overall stats
  const stats = useMemo(() => {
    if (reviews.length === 0) return { avg: 5.0, count: 0, verifiedCount: 0 };
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    const avg = (sum / reviews.length).toFixed(1);
    const verifiedCount = reviews.filter(r => r.verifiedPurchase).length;
    return { avg, count: reviews.length, verifiedCount };
  }, [reviews]);

  if (loading || reviews.length === 0) {
    return null;
  }

  return (
    <section 
      className="bg-gradient-to-b from-[#fcfaf7] via-[#f7f0e8]/60 to-[#fcfaf7] border-t border-b border-[#ebdccd] py-14 px-4 sm:px-6 lg:px-8 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Decorative ambient background accents */}
      <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#ebdccd]/50 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-100/80 border border-amber-300 text-amber-900 text-xs font-bold mb-3 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 fill-amber-500" />
              <span>Customer Feedback & Testimonials (ဝယ်ယူသူများ၏ အသံ)</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#2b1d12] tracking-tight">
              ဝယ်ယူအားပေးသူများ၏ စိတ်ကျေနပ်မှုနှင့် သုံးသပ်ချက်များ
            </h2>
            <p className="text-xs sm:text-sm text-[#735c49] mt-2 max-w-2xl leading-relaxed">
              Lin Htet IT Service မှ genuine digital subscriptions များကို စိတ်ချယုံကြည်စွာ ဝယ်ယူသုံးစွဲနေကြသော customer များ၏ တိုက်ရိုက်မှတ်ချက်များ ဖြစ်ပါသည်
            </p>
          </div>

          {/* Carousel Controls */}
          <div className="flex items-center gap-3 shrink-0 self-start md:self-end">
            {/* Auto-play toggle */}
            <button
              onClick={() => setIsAutoPlaying(prev => !prev)}
              className={`p-2.5 rounded-xl border text-xs font-bold flex items-center gap-1.5 transition-all ${
                isAutoPlaying 
                  ? 'bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100' 
                  : 'bg-white border-[#d9c4b3] text-stone-600 hover:bg-stone-50'
              }`}
              title={isAutoPlaying ? 'အလိုအလျောက် ရွေ့လျားမှုကို ရပ်မည်' : 'အလိုအလျောက် ရွေ့လျားမည်'}
              aria-label="Toggle auto-play"
            >
              {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{isAutoPlaying ? 'Auto' : 'Paused'}</span>
            </button>

            {/* Prev Button */}
            <button
              onClick={handlePrev}
              className="w-10 h-10 rounded-xl bg-white border border-[#d9c4b3] hover:border-[#6b4226] text-[#6b4226] hover:bg-[#6b4226] hover:text-white flex items-center justify-center transition-all shadow-2xs active:scale-95"
              aria-label="Previous Testimonials"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            {/* Next Button */}
            <button
              onClick={handleNext}
              className="w-10 h-10 rounded-xl bg-white border border-[#d9c4b3] hover:border-[#6b4226] text-[#6b4226] hover:bg-[#6b4226] hover:text-white flex items-center justify-center transition-all shadow-2xs active:scale-95"
              aria-label="Next Testimonials"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Trust Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#e6d8c8] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Star className="w-5 h-5 fill-amber-400 text-amber-500" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#2b1d12] leading-tight">
                {stats.avg} / 5.0
              </div>
              <div className="text-[11px] text-stone-500 font-medium">ပျမ်းမျှ စိတ်ကျေနပ်မှု</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#e6d8c8] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#2b1d12] leading-tight">100% Genuine</div>
              <div className="text-[11px] text-stone-500 font-medium">တရားဝင် Retail Licenses</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#e6d8c8] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#2b1d12] leading-tight">5-15 Min</div>
              <div className="text-[11px] text-stone-500 font-medium">ချက်ချင်း Instant Delivery</div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-xs p-3.5 rounded-2xl border border-[#e6d8c8] flex items-center gap-3 shadow-2xs">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="text-base sm:text-lg font-black text-[#2b1d12] leading-tight">
                {stats.count}+ Reviews
              </div>
              <div className="text-[11px] text-stone-500 font-medium">ဝယ်ယူပြီးသူ သုံးသပ်ချက်</div>
            </div>
          </div>
        </div>

        {/* Carousel Viewport Container */}
        <div 
          className="relative overflow-hidden cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider track with CSS transition */}
          <div 
            className="flex transition-transform duration-500 ease-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsPerView)}%)`
            }}
          >
            {reviews.map((review) => {
              const matchedProduct = getProductForReview(review);
              // Get initials for avatar
              const initials = review.customerName
                .split(' ')
                .slice(0, 2)
                .map(n => n.charAt(0))
                .join('')
                .toUpperCase() || 'KH';

              return (
                <div 
                  key={review.id}
                  className="px-2.5 sm:px-3 shrink-0"
                  style={{ width: `${100 / cardsPerView}%` }}
                >
                  <div className="h-full bg-white rounded-3xl p-6 border border-[#e6d8c8] shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between relative group hover:border-[#b89578]">
                    {/* Decorative quote mark */}
                    <Quote className="w-10 h-10 text-amber-100 absolute top-5 right-5 pointer-events-none group-hover:text-amber-200/80 transition-colors" />

                    <div>
                      {/* Customer Info Header */}
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#6b4226] to-[#a8744f] text-white flex items-center justify-center font-extrabold text-sm shadow-xs shrink-0">
                          {initials}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="font-bold text-sm text-[#2b1d12] truncate">
                            {review.customerName}
                          </h4>
                          <div className="flex items-center gap-2 mt-0.5">
                            {review.verifiedPurchase ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                                <CheckCircle className="w-3 h-3 text-emerald-600" />
                                <span>Verified Buyer</span>
                              </span>
                            ) : (
                              <span className="text-[11px] text-stone-500">
                                Customer
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Rating Stars & Date */}
                      <div className="flex items-center justify-between mb-3.5">
                        <div className="flex items-center gap-1">
                          {[1, 2, 3, 4, 5].map((s) => (
                            <Star 
                              key={s} 
                              className={`w-4 h-4 ${
                                s <= review.rating 
                                  ? 'text-amber-400 fill-amber-400' 
                                  : 'text-stone-200 fill-stone-200'
                              }`} 
                            />
                          ))}
                        </div>
                        <span className="text-[11px] text-stone-500 font-medium">
                          {new Date(review.createdAt).toLocaleDateString('my-MM', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })}
                        </span>
                      </div>

                      {/* Review Comment Body */}
                      <p className="text-xs sm:text-sm text-[#3d2b1f] leading-relaxed line-clamp-4 relative z-10 italic">
                        "{review.comment}"
                      </p>
                    </div>

                    {/* Bottom Product Info & Action */}
                    <div className="mt-5 pt-4 border-t border-[#f0e4d8] flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-stone-500 block">
                          ဝယ်ယူထားသော Product:
                        </span>
                        <div className="font-bold text-xs text-[#6b4226] truncate">
                          {review.productName}
                        </div>
                      </div>

                      {matchedProduct && onSelectProduct && (
                        <button
                          onClick={() => onSelectProduct(matchedProduct, 'details')}
                          className="shrink-0 text-xs px-2.5 py-1.5 rounded-xl bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#6b4226] font-bold transition-colors flex items-center gap-1 shadow-2xs"
                          title="Product အသေးစိတ်နှင့် သုံးသပ်ချက်များ ကြည့်ရန်"
                        >
                          <span>ကြည့်မည်</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      )}
                    </div>

                    {/* Helpful indicator */}
                    {review.helpfulCount && review.helpfulCount > 0 ? (
                      <div className="mt-2.5 flex items-center gap-1 text-[10px] text-stone-500 font-medium">
                        <ThumbsUp className="w-3 h-3 text-stone-400" />
                        <span>{review.helpfulCount} ဦးက အသုံးဝင်ကြောင်း ထောက်ခံထားပါသည်</span>
                      </div>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Pagination Dots & Progress Indicator */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Summary text */}
          <div className="text-xs text-stone-500 font-medium">
            ပြသထားသော သုံးသပ်ချက် <span className="font-bold text-[#6b4226]">{Math.min(currentIndex + cardsPerView, totalReviews)}</span> / {totalReviews} ခု
          </div>

          {/* Center: Pagination Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`transition-all duration-300 rounded-full ${
                  currentIndex === idx 
                    ? 'w-7 h-2.5 bg-[#6b4226]' 
                    : 'w-2.5 h-2.5 bg-[#d9c4b3] hover:bg-[#a88972]'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>

          {/* Right: Quick Review hint */}
          <div className="text-xs text-[#735c49]">
            Product ကတ်များပေါ်တွင် <span className="font-bold text-amber-700">★ ကြယ်ပွင့်</span> ကိုနှိပ်၍ Review ရေးသားနိုင်ပါသည်
          </div>
        </div>
      </div>
    </section>
  );
};
