"use client";
import { useCartStore } from "@/lib/store/cart";
import Image from "next/image";
import Link from "next/link";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function CartPageClient() {
  const { items, removeItem, updateQuantity, total } = useCartStore();
  const shipping = total() >= 500 ? 0 : 49.9;
  if (items.length === 0) return <div className="max-w-2xl mx-auto px-4 py-24 text-center" />;
  return <div className="max-w-5xl mx-auto px-4 py-10" />;
}
