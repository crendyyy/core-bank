import { useMutation, useQueryClient } from "@tanstack/react-query";
import useAxios from "../../hooks/useHooks";
import useLoadingToast from "../../hooks/useToast";
import cifKeys from ".";

export const useCreateCIF = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create CIF....");
      return axiosClient._post(`/CIF/createCIF`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useCreateCIFDarurat = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create CIF Darurat....");
      return axiosClient._post(`/CIF/createCIFDarurat`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF Darurat create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};

export const useCreateCIFPenjamin = () => {
  const queryClient = useQueryClient();
  const axiosClient = useAxios();
  const toast = useLoadingToast();

  return useMutation({
    mutationFn: (data) => {
      toast.loading("Create CIF Penjamin....");
      return axiosClient._post(`/CIF/createCIFPenjamin`, data);
    },

    onSuccess: (response) => {
      toast.update("CIF Penjamin create successfully.", "success");

      // Refresh data related to the stock after a successful update
      queryClient.invalidateQueries({ queryKey: cifKeys.lists });
    },

    onError: (response) => {
      toast.update(`${response?.response?.data?.message}`, "error");
    },
  });
};