import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import cifKeys from ".";

export const useUpdateCIF = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({id, data}) => {
      toast.loading("Update CIF....");
      return axiosClient._patch(`/CIF/updateCIF/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useUpdateCIFDarurat = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({id, data}) => {
      toast.loading("Update CIF Darurat....");
      return axiosClient._patch(`/CIF/updateCIFDarurat/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF Darurat Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useUpdateCIFPenjamin = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: ({id, data}) => {
      toast.loading("Update CIF Penjamin....");
      return axiosClient._patch(`/CIF/updateCIFPenjamin/${id}`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF Penjamin Update successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};