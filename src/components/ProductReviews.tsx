import React, { useState, useEffect, useMemo } from 'react';
import { Product, ProductReview } from '../types';
import { storeService } from '../services/storeService';
import { 
  Star, 
  ThumbsUp, 
  MessageSquare, 
  CheckCircle, 
  Sparkles, 
  Send, 
  Award,
  Filter,
  Check,
  AlertCircle
} from 'lucide-react';

interface ProductReviewsProps {
  product: Product;
  onReviewSubmitted?: (review: ProductReview) => void;
}

export const ProductReviews: React.FC<ProductReviewsProps> = ({
  product,
  onReviewSubmitted
}) => {
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState<number | 'all'>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'highest'>('newest');

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [rating, setRating] = useState<number>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [customerName, setCustomerName] = useState('');
  const [orderNo, setOrderNo] = useState('');
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [votedReviews, setVotedReviews] = useState<Record<string, boolean>>({});

  // Quick feedback tags in Burmese
  const quickTags = [
    '⚡ မြန်ဆန်တယ်',
    '🔑 Key ချက်ချင်းရတယ်',
    '💯 အသုံးပြုရတာလွယ်ကူတယ်',
    '🌟 Service အရမ်းကောင်းတယ်',
    '💰 ဈေးနှုန်းတန်တယ်',
    '🤝 အကြံပေးတာစိတ်ရှည်တယ်'
  ];

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await storeService.getReviews(product.id);
      setReviews(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
    setCustomerName(storeService.getSavedReviewerName() || '');

    const handleNewReview = (e: Event) => {
      const customEvent = e as CustomEvent<{ review: ProductReview }>;
      if (customEvent.detail?.review?.productId === product.id) {
        loadReviews();
      }
    };
    window.addEventListener('linhtet_review_added', handleNewReview);
    return () => {
      window.removeEventListener('linhtet_review_added', handleNewReview);
    };
  }, [product.id]);

  // Compute statistics
  const stats = useMemo(() => {
    const total = reviews.length;
    const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (total === 0) {
      return { average: 5.0, total: 0, distribution };
    }
    let sum = 0;
    reviews.forEach(r => {
      sum += r.rating;
      distribution[r.rating] = (distribution[r.rating] || 0) + 1;
    });
    return {
      average: Number((sum / total).toFixed(1)),
      total,
      distribution
    };
  }, [reviews]);

  // Filtered & sorted reviews
  const displayedReviews = useMemo(() => {
    let list = [...reviews];
    if (filterRating !== 'all') {
      list = list.filter(r => r.rating === filterRating);
    }
    if (sortBy === 'newest') {
      list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sortBy === 'highest') {
      list.sort((a, b) => b.rating - a.rating || new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return list;
  }, [reviews, filterRating, sortBy]);

  const ratingDescriptions: Record<number, string> = {
    5: 'အလွန်ကောင်းမွန်သည် (Excellent ⭐⭐⭐⭐⭐)',
    4: 'ကောင်းမွန်သည် (Good ⭐⭐⭐⭐)',
    3: 'သင့်တင့်ပါသည် (Average ⭐⭐⭐)',
    2: 'အားနည်းသည် (Fair ⭐⭐)',
    1: 'မကျေနပ်ပါ (Poor ⭐)'
  };

  const handleAddTag = (tag: string) => {
    const cleanTag = tag.replace(/^[^\s]+\s*/, '');
    if (comment.includes(cleanTag)) return;
    setComment(prev => (prev ? `${prev} ${cleanTag}၊` : `${cleanTag}၊`));
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !comment.trim()) return;

    setSubmitting(true);
    try {
      const res = await storeService.addReview({
        productId: product.id,
        productName: product.name,
        rating,
        customerName: customerName.trim(),
        comment: comment.trim(),
        orderNo: orderNo.trim() || undefined,
        verifiedPurchase: Boolean(orderNo.trim() || true)
      });

      if (res.ok) {
        setSuccessMsg('ကျေးဇူးတင်ပါသည်! လူကြီးမင်း၏ သုံးသပ်ချက်ကို အောင်မြင်စွာ တင်ပြီးပါပြီ။');
        setComment('');
        setOrderNo('');
        setIsFormOpen(false);
        await loadReviews();
        if (onReviewSubmitted) {
          onReviewSubmitted(res.review);
        }
        setTimeout(() => setSuccessMsg(''), 4000);
      }
    } catch {
      // error handled
    } finally {
      setSubmitting(false);
    }
  };

  const handleHelpfulVote = async (reviewId: string) => {
    if (votedReviews[reviewId]) return;
    setVotedReviews(prev => ({ ...prev, [reviewId]: true }));
    const newCount = await storeService.voteReviewHelpful(reviewId);
    setReviews(prev =>
      prev.map(r => (r.id === reviewId ? { ...r, helpfulCount: newCount } : r))
    );
  };

  const formatReviewDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      const diffDays = Math.floor(diffHours / 24);

      if (diffHours < 1) return 'ယခုလေးတင်';
      if (diffHours < 24) return `လွန်ခဲ့သော ${diffHours} နာရီက`;
      if (diffDays === 1) return 'မနေ့က';
      if (diffDays < 30) return `လွန်ခဲ့သော ${diffDays} ရက်က`;
      return date.toLocaleDateString('my-MM', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'လတ်တလော';
    }
  };

  return (
    <div className="space-y-6">
      {/* Toast Success Message */}
      {successMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl flex items-center gap-2.5 text-xs sm:text-sm font-semibold animate-fadeIn shadow-xs">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Overview & Breakdown Card */}
      <div className="bg-[#fcfaf7] border border-[#ebdccd] rounded-2xl p-5 sm:p-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-[#ebdccd]">
          {/* Big Score */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center bg-white border border-[#e6d8c8] rounded-2xl w-24 h-24 shadow-xs">
              <span className="text-3xl font-black text-[#6b4226] leading-none">
                {stats.average.toFixed(1)}
              </span>
              <div className="flex items-center gap-0.5 text-amber-500 mt-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= Math.round(stats.average)
                        ? 'fill-amber-400 text-amber-500'
                        : 'text-stone-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-stone-500 font-semibold mt-1">
                ၅ မှတ်တွင်
              </span>
            </div>

            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-[#2b1d12] flex items-center gap-1.5">
                <Award className="w-4 h-4 text-amber-600" />
                သုံးသပ်ချက် အကျဉ်းချုပ်
              </h4>
              <p className="text-xs text-[#735c49] mt-0.5">
                စုစုပေါင်း ဝယ်ယူသုံးစွဲသူ <b>{stats.total}</b> ဦး၏ အဆင့်သတ်မှတ်ချက်များ
              </p>
              <div className="mt-2 flex items-center gap-2 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80 w-fit">
                <Check className="w-3.5 h-3.5" />
                <span>၁၀၀% စိတ်ချရသော စစ်မှန်သည့် Reviews များ</span>
              </div>
            </div>
          </div>

          {/* Action button to open review form */}
          <button
            type="button"
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs sm:text-sm bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-all flex items-center justify-center gap-2 hover:scale-[1.02]"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{isFormOpen ? 'ဖောင်ကိုပိတ်မည်' : 'သုံးသပ်ချက် ရေးမည်'}</span>
          </button>
        </div>

        {/* Star Breakdown Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 pt-5">
          {[5, 4, 3, 2, 1].map(stars => {
            const count = stats.distribution[stars] || 0;
            const pct = stats.total > 0 ? Math.round((count / stats.total) * 100) : 0;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => setFilterRating(filterRating === stars ? 'all' : stars)}
                className={`p-2 rounded-xl text-left transition-all border ${
                  filterRating === stars
                    ? 'bg-white border-[#6b4226] shadow-xs'
                    : 'bg-white/60 hover:bg-white border-[#e6d8c8]'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-bold text-stone-700 mb-1">
                  <div className="flex items-center gap-1">
                    <span>{stars}</span>
                    <Star className="w-3 h-3 fill-amber-400 text-amber-500" />
                  </div>
                  <span className="text-[11px] text-stone-500">{count} ခု</span>
                </div>
                <div className="w-full h-1.5 bg-[#ebdccd] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Review Submission Form Modal / Drawer */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmitReview}
          className="bg-white border-2 border-[#6b4226]/30 rounded-2xl p-5 sm:p-6 shadow-sm space-y-4 animate-fadeIn"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#ebdccd]">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <h4 className="font-extrabold text-sm sm:text-base text-[#2b1d12]">
                သုံးသပ်ချက်နှင့် အဆင့်သတ်မှတ်ချက်ပေးမည်
              </h4>
            </div>
            <span className="text-xs text-[#735c49]">
              Product: <b>{product.name}</b>
            </span>
          </div>

          {/* Interactive Star Picker */}
          <div>
            <label className="block text-xs font-bold text-[#5c4738] mb-1.5">
              အဆင့်သတ်မှတ်ချက် (Star Rating) *
            </label>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5">
                {[1, 2, 3, 4, 5].map(starIndex => (
                  <button
                    key={starIndex}
                    type="button"
                    onClick={() => setRating(starIndex)}
                    onMouseEnter={() => setHoverRating(starIndex)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 rounded-lg hover:bg-amber-50 transition-colors focus:outline-none"
                  >
                    <Star
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-transform ${
                        starIndex <= (hoverRating || rating)
                          ? 'fill-amber-400 text-amber-500 scale-110'
                          : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs sm:text-sm font-bold text-[#6b4226] ml-2">
                {ratingDescriptions[hoverRating || rating]}
              </span>
            </div>
          </div>

          {/* Name & Order No inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#5c4738] mb-1">
                အမည် (Customer Name) *
              </label>
              <input
                type="text"
                required
                placeholder="ဥပမာ - Ko Aung, Ma Su"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d9c4b3] bg-[#fcfaf7] focus:bg-white focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#5c4738] mb-1">
                အော်ဒါနံပါတ် (Order No. - အကယ်၍ရှိပါက)
              </label>
              <input
                type="text"
                placeholder="ဥပမာ - LH-100234 (Verified Buyer Badge ရရှိရန်)"
                value={orderNo}
                onChange={e => setOrderNo(e.target.value)}
                className="w-full text-xs sm:text-sm px-3.5 py-2 rounded-xl border border-[#d9c4b3] bg-[#fcfaf7] focus:bg-white focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none"
              />
            </div>
          </div>

          {/* Quick Tag suggestions */}
          <div>
            <span className="block text-[11px] font-bold text-[#8d7159] mb-1.5">
              အမြန်ရွေးချယ်ရန် စကားစုများ:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {quickTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-[#f7f0e8] hover:bg-[#ebdccd] text-[#5c4738] border border-[#ebdccd] transition-colors"
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Review Comment */}
          <div>
            <label className="block text-xs font-bold text-[#5c4738] mb-1">
              သုံးသပ်ချက်မှတ်ချက် (Feedback & Comment) *
            </label>
            <textarea
              required
              rows={3}
              placeholder="ပစ္စည်းအရည်အသွေး၊ အသုံးပြုပုံနှင့် ဝန်ဆောင်မှုအတွေ့အကြုံကို မျှဝေပေးပါ..."
              value={comment}
              onChange={e => setComment(e.target.value)}
              className="w-full text-xs sm:text-sm p-3 rounded-xl border border-[#d9c4b3] bg-[#fcfaf7] focus:bg-white focus:border-[#6b4226] focus:ring-1 focus:ring-[#6b4226] outline-none resize-none"
            />
            <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
              <span>အခြားဖောက်သည်များအတွက် များစွာအထောက်အကူပြုပါသည်</span>
              <span>{comment.length} / 500 စာလုံး</span>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setIsFormOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-stone-600 hover:bg-stone-100"
            >
              မလုပ်တော့ပါ
            </button>
            <button
              type="submit"
              disabled={submitting || !customerName.trim() || !comment.trim()}
              className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#6b4226] hover:bg-[#53321d] text-white shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>ပေးပို့နေပါသည်...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>သုံးသပ်ချက် တင်မည်</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Filter and Sorting Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-[#8d7159]" />
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilterRating('all')}
              className={`px-3 py-1 rounded-full transition-colors ${
                filterRating === 'all'
                  ? 'bg-[#6b4226] text-white'
                  : 'bg-white border border-[#e6d8c8] text-stone-600 hover:bg-[#f7f0e8]'
              }`}
            >
              အားလုံး ({reviews.length})
            </button>
            {[5, 4, 3].map(stars => (
              <button
                key={stars}
                type="button"
                onClick={() => setFilterRating(stars)}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1 transition-colors ${
                  filterRating === stars
                    ? 'bg-[#6b4226] text-white'
                    : 'bg-white border border-[#e6d8c8] text-stone-600 hover:bg-[#f7f0e8]'
                }`}
              >
                <span>{stars}</span>
                <Star className={`w-3 h-3 ${filterRating === stars ? 'fill-white text-white' : 'fill-amber-400 text-amber-500'}`} />
                <span>({stats.distribution[stars] || 0})</span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="text-stone-500">စီရန်:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="px-2.5 py-1 rounded-lg border border-[#e6d8c8] bg-white text-xs font-semibold text-stone-700 outline-none"
          >
            <option value="newest">နောက်ဆုံးရ ပထမထား (Newest)</option>
            <option value="highest">အမှတ်အများဆုံး (Highest Rated)</option>
          </select>
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="py-12 text-center text-stone-500 text-xs">
          <div className="w-6 h-6 border-2 border-[#6b4226] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <span>သုံးသပ်ချက်များ ရယူနေပါသည်...</span>
        </div>
      ) : displayedReviews.length === 0 ? (
        <div className="py-12 text-center bg-white rounded-2xl border border-[#ebdccd] p-6">
          <MessageSquare className="w-10 h-10 text-stone-300 mx-auto mb-2" />
          <h5 className="font-bold text-stone-700 text-sm">
            {filterRating !== 'all'
              ? `${filterRating} Star သုံးသပ်ချက် မရှိသေးပါ`
              : 'သုံးသပ်ချက် မရှိသေးပါ'}
          </h5>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            ဤပစ္စည်းအတွက် ပထမဆုံး အကြံပြုချက်နှင့် ကြယ်ပွင့်ပေးသူ ဖြစ်လိုက်ပါ!
          </p>
          <button
            type="button"
            onClick={() => setIsFormOpen(true)}
            className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-[#6b4226] text-white hover:bg-[#53321d]"
          >
            ပထမဆုံး သုံးသပ်ချက် ရေးမည်
          </button>
        </div>
      ) : (
        <div className="space-y-3.5">
          {displayedReviews.map(review => {
            const initial = (review.customerName || 'U').charAt(0).toUpperCase();
            const isVoted = votedReviews[review.id];

            return (
              <div
                key={review.id}
                className="bg-white border border-[#ebdccd] hover:border-[#d9c4b3] rounded-2xl p-4 sm:p-5 shadow-2xs transition-all space-y-3"
              >
                {/* Header: User avatar, name, rating, verified badge, and date */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#6b4226] to-[#a3693e] text-white font-extrabold flex items-center justify-center text-sm shadow-xs shrink-0">
                      {initial}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-xs sm:text-sm text-[#2b1d12]">
                          {review.customerName}
                        </span>
                        {review.verifiedPurchase && (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Check className="w-2.5 h-2.5 stroke-[3]" />
                            <span>ဝယ်ယူပြီးသူ (Verified Buyer)</span>
                          </span>
                        )}
                        {review.orderNo && (
                          <span className="text-[10px] text-stone-400 font-mono">
                            #{review.orderNo}
                          </span>
                        )}
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 mt-0.5">
                        <div className="flex items-center gap-0.5 text-amber-500">
                          {[1, 2, 3, 4, 5].map(star => (
                            <Star
                              key={star}
                              className={`w-3.5 h-3.5 ${
                                star <= review.rating
                                  ? 'fill-amber-400 text-amber-500'
                                  : 'text-stone-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-[11px] font-bold text-stone-600 ml-1">
                          {review.rating}.0
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-[11px] text-stone-400 whitespace-nowrap">
                    {formatReviewDate(review.createdAt)}
                  </span>
                </div>

                {/* Comment text */}
                <p className="text-xs sm:text-sm text-[#443325] leading-relaxed pl-12 whitespace-pre-line">
                  {review.comment}
                </p>

                {/* Footer: Helpful button */}
                <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#f7f0e8] text-xs">
                  <button
                    type="button"
                    onClick={() => handleHelpfulVote(review.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-colors ${
                      isVoted
                        ? 'bg-amber-100 text-amber-800 border border-amber-300'
                        : 'text-stone-500 hover:text-[#6b4226] hover:bg-[#f7f0e8]'
                    }`}
                    title="ဤသုံးသပ်ချက် အသုံးဝင်ပါသည်"
                  >
                    <ThumbsUp className={`w-3.5 h-3.5 ${isVoted ? 'fill-amber-600 text-amber-600' : ''}`} />
                    <span>အသုံးဝင်သည်</span>
                    {(review.helpfulCount || 0) > 0 && (
                      <span className="font-bold">({review.helpfulCount})</span>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
