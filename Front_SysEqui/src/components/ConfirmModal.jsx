import { useCallback, useEffect } from "react";
import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmar",
  message = "¿Estás seguro?",
  oneButton = false,
  confirmLabel = "Aceptar",
  cancelLabel = "Cancelar",
  confirmColor = "success",
}) {
  const handleConfirm = useCallback(() => {
    if (oneButton) {
      onClose?.();
      return;
    }

    onConfirm?.();
  }, [oneButton, onClose, onConfirm]);

  useEffect(() => {
    if (!open) return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleConfirm, open]);

  return (
    <Modal dismissible size="md" show={open} onClose={onClose}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-yellow-400 dark:text-yellow-300" />
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>
          <p className="mb-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>

          <div className="flex justify-center gap-4">
            <Button color={confirmColor} onClick={handleConfirm}>
              {confirmLabel}
            </Button>
            {!oneButton && (
              <Button color="gray" onClick={onClose}>
                {cancelLabel}
              </Button>
            )}
          </div>
        </div>
      </ModalBody>
      <ModalFooter />
    </Modal>
  );
}
