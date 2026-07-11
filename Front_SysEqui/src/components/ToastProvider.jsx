import { useCallback, useMemo, useState } from "react";
import { Toast } from "flowbite-react";
import { HiCheck, HiExclamation, HiInformationCircle, HiX } from "react-icons/hi";
import { ToastContext } from "./toastContext";

const toastStyles = {
  success: {
    icon: HiCheck,
    iconClass: "bg-green-100 text-green-600 dark:bg-green-800 dark:text-green-200",
  },
  error: {
    icon: HiX,
    iconClass: "bg-red-100 text-red-600 dark:bg-red-800 dark:text-red-200",
  },
  warning: {
    icon: HiExclamation,
    iconClass: "bg-yellow-100 text-yellow-600 dark:bg-yellow-800 dark:text-yellow-200",
  },
  info: {
    icon: HiInformationCircle,
    iconClass: "bg-blue-100 text-blue-600 dark:bg-blue-800 dark:text-blue-200",
  },
};

const DEFAULT_TOAST_DURATION = 3000;
const TOAST_ANIMATION_MS = 500;

export default function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const showToast = useCallback(
    ({ message, type = "success", duration = DEFAULT_TOAST_DURATION }) => {
      const id = crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      setToasts((current) => [...current, { id, message, type, leaving: false }]);

      window.setTimeout(() => {
        setToasts((current) => current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)));
        window.setTimeout(() => removeToast(id), TOAST_ANIMATION_MS);
      }, duration);
    },
    [removeToast],
  );

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed right-4 top-0 z-[9999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map(({ id, message, type, leaving }) => {
          const style = toastStyles[type] || toastStyles.info;
          const Icon = style.icon;

          return (
            <Toast
              key={id}
              className={`w-full min-h-40 border border-blue-400/40 bg-slate-800 px-6 py-6 text-white shadow-xl shadow-black/30 transition-all duration-300 ease-out dark:bg-slate-800 ${
                leaving ? "-translate-y-full opacity-0" : "translate-y-4 opacity-100 animate-toast-slide-in"
              }`}>
              <div className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${style.iconClass}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div className="ml-3 text-base font-normal">{message}</div>
              <Toast.Toggle
                onDismiss={() => {
                  setToasts((current) =>
                    current.map((toast) => (toast.id === id ? { ...toast, leaving: true } : toast)),
                  );
                  window.setTimeout(() => removeToast(id), TOAST_ANIMATION_MS);
                }}
              />
            </Toast>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}
