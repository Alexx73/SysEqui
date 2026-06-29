import { Button, Modal, ModalBody, ModalFooter, ModalHeader } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

export default function ConfirmModal({
  open,
  onClose,
  onConfirm,
  title = "Confirmar",
  message = "¿Estás seguro?",
  oneButton = false, // <-- Nuevo prop
}) {
  // Si se elige solo un botón, el botón Aceptar cierra directamente el modal
  const handleAceptar = () => {
    if (oneButton) {
      onClose();
    } else {
      onConfirm();
    }
  };

  return (
    <Modal dismissible size="md" show={open} onClose={onClose}>
      <ModalHeader>{title}</ModalHeader>
      <ModalBody>
        <div className="text-center">
          <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-yellow-400 dark:text-yellow-300" />
          <h3 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">{title}</h3>

          <div className="flex justify-center gap-4">
            <Button color="success" onClick={handleAceptar}>
              Aceptar
            </Button>
            {!oneButton && (
              <Button color="gray" onClick={onClose}>
                Cancelar
              </Button>
            )}
          </div>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">{message}</p>
        </div>
      </ModalBody>
      <ModalFooter />
    </Modal>
  );
}

