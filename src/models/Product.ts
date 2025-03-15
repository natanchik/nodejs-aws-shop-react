import * as Yup from "yup";

export const ProductSchema = Yup.object({
  id: Yup.string(),
  price: Yup.number().positive().required().defined().default(0),
  title: Yup.string().required().default(""),
  description: Yup.string().default(""),
});

export const AvailableProductSchema = ProductSchema.shape({
  count: Yup.number().integer().min(0).required().defined().default(0),
});

export interface StockDBModel {
  product_id: string;
  count: number;
}

export interface ProductDBModel {
  id: string;
  title: string;
  description: string;
  price: number;
}

export const joinProductAndStock = (
  product: ProductDBModel,
  stock: StockDBModel
): AvailableProduct => {
  return {
    id: product.id,
    count: stock.count,
    price: product.price,
    title: product.title,
    description: product.description,
  };
};

export type Product = Yup.InferType<typeof ProductSchema>;
export type AvailableProduct = Yup.InferType<typeof AvailableProductSchema>;
