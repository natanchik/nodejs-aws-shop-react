import axios, { AxiosError } from "axios";
import API_PATHS from "~/constants/apiPaths";
import {
  AvailableProduct,
  ProductDBModel,
  StockDBModel,
  joinProductAndStock,
} from "~/models/Product";
import { useQuery, useQueryClient, useMutation } from "react-query";
import React from "react";

export function useAvailableProducts() {
  return useQuery<AvailableProduct[], AxiosError>(
    "available-products",
    async () => {
      const [productsRes, stocksRes] = await Promise.all([
        axios.get<ProductDBModel[]>(`${API_PATHS.product}/products`),
        axios.get<StockDBModel[]>(`${API_PATHS.product}/stocks`),
      ]);

      return productsRes.data.map((product) => {
        const stock = stocksRes.data.find((s) => s.product_id === product.id);
        return joinProductAndStock(
          product,
          stock || { product_id: product.id, count: 0 }
        );
      });
    }
  );
}

export function useInvalidateAvailableProducts() {
  const queryClient = useQueryClient();
  return React.useCallback(
    () => queryClient.invalidateQueries("available-products", { exact: true }),
    []
  );
}

export function useAvailableProduct(id?: string) {
  return useQuery<AvailableProduct, AxiosError>(
    ["product", { id }],
    async () => {
      const [productRes, stockRes] = await Promise.all([
        axios.get<ProductDBModel>(`${API_PATHS.product}/products/${id}`),
        axios.get<StockDBModel>(`${API_PATHS.product}/stocks/${id}`),
      ]);

      return joinProductAndStock(
        productRes.data,
        stockRes.data || { product_id: id, count: 0 }
      );
    },
    { enabled: !!id }
  );
}

export function useRemoveProductCache() {
  const queryClient = useQueryClient();
  return React.useCallback(
    (id?: string) =>
      queryClient.removeQueries(["product", { id }], { exact: true }),
    []
  );
}

export function useUpsertAvailableProduct() {
  return useMutation((values: AvailableProduct) =>
    axios.put<AvailableProduct>(`${API_PATHS.bff}/product`, values, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}

export function useDeleteAvailableProduct() {
  return useMutation((id: string) =>
    axios.delete(`${API_PATHS.bff}/product/${id}`, {
      headers: {
        Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
      },
    })
  );
}
