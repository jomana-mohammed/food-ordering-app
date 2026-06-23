import mongoose, { Schema, Document, Model } from "mongoose";

export type ProductCategory = "Burgers" | "Pizza" | "Drinks" | "Desserts" | "Salads";

export interface IProduct extends Document {
  _id: mongoose.Types.ObjectId;
  name: {
    en: string;
    ar: string;
  };
  description: {
    en: string;
    ar: string;
  };
  price: number;
  category: ProductCategory;
  image: string;
  available: boolean;
  createdAt: Date;
}

const LocalizedStringSchema = new Schema(
  {
    en: { type: String, required: true, trim: true },
    ar: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: LocalizedStringSchema,
      required: true,
    },
    description: {
      type: LocalizedStringSchema,
      required: true,
    },
    price: {
      type: Number,
      required: [true, "Price is required"],
      min: [0, "Price cannot be negative"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: ["Burgers", "Pizza", "Drinks", "Desserts", "Salads"],
    },
    image: {
      type: String,
      required: [true, "Image is required"],
    },
    available: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>("Product", ProductSchema);

export default Product;
