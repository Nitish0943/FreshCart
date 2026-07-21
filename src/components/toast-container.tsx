"use client";

import { useToastStore } from "@/store/toast-store";

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full px-4 sm:px-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-start justify-between p-4 rounded-2xl shadow-lg border backdrop-blur-md transition-all animate-in slide-in-from-bottom-5 duration-300 ${
            t.type === "success"
              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
              : t.type === "error"
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : t.type === "warning"
              ? "bg-amber-50 border-amber-200 text-amber-800"
              : "bg-blue-50 border-blue-200 text-blue-800"
          }`}
        >
          <div className="flex items-start space-x-2.5">
            {/* Type Icons */}
            {t.type === "success" && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 mt-0.5 text-emerald-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
            {t.type === "error" && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 mt-0.5 text-destructive">
                <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            )}
            {t.type === "warning" && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 mt-0.5 text-amber-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
              </svg>
            )}
            {t.type === "info" && (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-5 w-5 mt-0.5 text-blue-600">
                <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 1 1 1.085 1.085l-.04.04m-2.137.837 3.618-3.617A.75.75 0 1 1 14.89 10.6l-3.619 3.617a.75.75 0 0 1-1.06 0Z" />
              </svg>
            )}

            <div className="space-y-0.5">
              {t.title && <h4 className="font-extrabold text-sm">{t.title}</h4>}
              <p className="text-xs font-semibold leading-normal">{t.message}</p>
            </div>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-muted-foreground hover:text-foreground ml-4 mt-0.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="h-4 w-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ))}
    </div>
  );
}
