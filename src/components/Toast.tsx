import React from 'react';
import { CheckCircle2, Clock, X, ExternalLink, Sparkles } from 'lucide-react';
import { OrderStatus } from '../types';

export interface ToastNotification {
  id: string;
  orderNo: string;
  contact?: string;
  status: OrderStatus | 'processing' | 'completed';
  title: string;
  message: string;
  timestamp: number;
}

interface ToastContainerProps {
  toasts: ToastNotification[];
  onDismiss: (id: string) => void;
  onViewOrder: (orderNo: string, contact?: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onDismiss,
  onViewOrder,
}) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2.5 max-w-sm sm:max-w-md w-full px-3 pointer-events-none">
      {toasts.map(toast => {
        const isPaidOrProcessing = toast.status === 'paid' || toast.status === 'processing';
        const isCompleted = toast.status === 'delivered' || toast.status === 'completed';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto rounded-2xl p-4 shadow-xl border backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in ${
              isPaidOrProcessing
                ? 'bg-[#fcfaf7] border-emerald-500/40 text-stone-900 shadow-emerald-950/10'
                : isCompleted
                ? 'bg-[#fcfaf7] border-blue-500/40 text-stone-900 shadow-blue-950/10'
                : 'bg-white border-[#ebdccd] text-stone-900'
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Icon */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                  isPaidOrProcessing
                    ? 'bg-emerald-100 text-emerald-700'
                    : isCompleted
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {isPaidOrProcessing ? (
                  <Sparkles className="w-5 h-5 animate-pulse" />
                ) : isCompleted ? (
                  <CheckCircle2 className="w-5 h-5" />
                ) : (
                  <Clock className="w-5 h-5" />
                )}
              </div>

              {/* Message Details */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h5 className="font-extrabold text-xs sm:text-sm text-[#2b1d12] flex items-center gap-1.5 truncate">
                    <span>{toast.title}</span>
                  </h5>
                  <button
                    onClick={() => onDismiss(toast.id)}
                    className="text-stone-400 hover:text-stone-700 p-0.5 rounded transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p className="text-xs text-[#5c4738] mt-1 leading-relaxed">
                  {toast.message}
                </p>

                {/* Action button */}
                <div className="mt-2.5 flex items-center gap-2">
                  <button
                    onClick={() => {
                      onViewOrder(toast.orderNo, toast.contact);
                      onDismiss(toast.id);
                    }}
                    className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-xs ${
                      isPaidOrProcessing
                        ? 'bg-emerald-700 hover:bg-emerald-800 text-white'
                        : 'bg-[#6b4226] hover:bg-[#53321d] text-white'
                    }`}
                  >
                    <span>Download Link ရယူရန်</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                  <span className="text-[10px] font-mono text-stone-400">
                    #{toast.orderNo}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
