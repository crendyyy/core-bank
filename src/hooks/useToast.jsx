import { useRef } from "react";
import { toast } from "react-toastify";

const useLoadingToast = () => {
  const toastRef = useRef(null);

  const loading = (message) => {
    toastRef.current = toast.loading(message);
  };

  const update = (message, toastType) => {
    toast.update(toastRef.current, {
      render: message,
      type: toastType,
      isLoading: false,
      autoClose: 1500,
    });
  };

  return { loading, update };
};

export default useLoadingToast;