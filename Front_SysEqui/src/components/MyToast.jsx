// src/components/MyToast.jsx
import React, { useEffect, useState } from "react";

// Este componente es interno, se renderiza solo cuando se llama a showToast
export default function MyToast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000); // Desaparece en 3 segundos

    return () => clearTimeout(timer);
  }, [onClose]);

  const background =
    type === "success"
      ? "bg-green-500"
      : type === "error"
        ? "bg-red-500"
        : type === "info"
          ? "bg-blue-500"
          : "bg-gray-500";

  return (
    <div
      className={`${background} text-white px-4 py-2 rounded shadow-md fixed top-5 right-5 z-[9999] animate-fade-in-out`}>
      {message}
    </div>
  );
}

// ToastHandler: Manejador que se monta y desmonta dinámicamente
let toastRoot = null;

export function showToast(message, type = "success") {
  if (!toastRoot) {
    toastRoot = document.createElement("div");
    document.body.appendChild(toastRoot);
  }

  const ToastWrapper = () => {
    const [visible, setVisible] = useState(true);
    return visible ? (
      <Toast
        message={message}
        type={type}
        onClose={() => {
          setVisible(false);
          setTimeout(() => {
            if (toastRoot) {
              React.unmountComponentAtNode(toastRoot);
              toastRoot.remove();
              toastRoot = null;
            }
          }, 300);
        }}
      />
    ) : null;
  };

  React.render(<ToastWrapper />, toastRoot);
}
