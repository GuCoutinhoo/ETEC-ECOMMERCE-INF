import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, ShoppingBag } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createPageUrl } from "@/utils";
import { motion } from 'framer-motion';

export default function ProductCard({ product, onAddToCart }) {
  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="group relative bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all duration-500"
    >
      <Link to={createPageUrl(`ProductDetail?id=${product.id}`)}>
        <div className="relative aspect-[3/4] overflow-hidden bg-gray-100">
          <img
            src={product.images?.[0] || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=400'}
            alt={product.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          />
          
          {discount > 0 && (
            <Badge className="absolute top-3 left-3 bg-amber-500 hover:bg-amber-600 text-black font-bold">
              -{discount}%
            </Badge>
          )}
          
          {product.featured && (
            <Badge className="absolute top-3 right-3 bg-black text-amber-400 font-medium">
              Destaque
            </Badge>
          )}

          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="absolute bottom-4 left-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300">
            <Button 
              onClick={(e) => {
                e.preventDefault();
                onAddToCart?.(product);
              }}
              className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-semibold"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              Adicionar
            </Button>
            <Button size="icon" variant="outline" className="bg-white/90 hover:bg-white border-0">
              <Heart className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">
          {product.category}
        </p>
        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1">
          {product.name}
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold text-gray-900">
            R$ {product.price?.toFixed(2)}
          </span>
          {product.original_price && (
            <span className="text-sm text-gray-400 line-through">
              R$ {product.original_price?.toFixed(2)}
            </span>
          )}
        </div>
        
        {product.colors?.length > 0 && (
          <div className="flex gap-1 mt-3">
            {product.colors.slice(0, 4).map((color, idx) => (
              <div
                key={idx}
                className="w-4 h-4 rounded-full border border-gray-200"
                style={{ backgroundColor: color }}
                title={color}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="text-xs text-gray-400 ml-1">+{product.colors.length - 4}</span>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
}