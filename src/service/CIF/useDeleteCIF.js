import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import cifKeys from ".";

export const useDeleteCIF = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      toast.loading("Delete CIF....");
      return axiosClient._delete(`/CIF/deleteCIF/${id}`);
    },

    onSuccess: (response) => {
      toast.update("CIF Delete successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useDeleteCIFDarurat = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      toast.loading("Delete CIF Darurat....");
      return axiosClient._delete(`/CIF/deleteCIFDarurat/${id}`);
    },

    onSuccess: (response) => {
      toast.update("CIF Darurat Delete successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useDeleteCIFPenjamin = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (id) => {
      toast.loading("Delete CIF Penjamin....");
      return axiosClient._delete(`/CIF/deleteCIFPenjamin/${id}`);
    },

    onSuccess: (response) => {
      toast.update("CIF Penjamin Delete successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};