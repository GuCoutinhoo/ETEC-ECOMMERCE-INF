import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import CartDrawer from '@/components/store/CartDrawer';
import ProductCard from '@/components/store/ProductCard';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ShoppingBag, Heart, Share2, Truck, RotateCcw, ShieldCheck, 
  Minus, Plus, ChevronLeft, ChevronRight, Star, Check
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function ProductDetail() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');

  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor, setSelectedColor] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImage, setCurrentImage] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        }
      } catch (e) {
        console.log('User not logged in');
      }
    };
    loadUser();
  }, []);

  const { data: product, isLoading } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => {
      const products = await base44.entities.Product.filter({ id: productId });
      return products[0];
    },
    enabled: !!productId,
  });

  const { data: relatedProducts = [] } = useQuery({
    queryKey: ['related-products', product?.category],
    queryFn: () => base44.entities.Product.filter({ category: product.category }, '-created_date', 4),
    enabled: !!product?.category,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => base44.entities.CartItem.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const addToCartMutation = useMutation({
    mutationFn: () => base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0],
      price: product.price,
      quantity: quantity,
      user_email: user?.email,
      size: selectedSize || '',
      color: selectedColor || ''
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Produto adicionado ao carrinho!');
      setCartOpen(true);
    }
  });

  const updateCartMutation = useMutation({
    mutationFn: ({ id, quantity }) => base44.entities.CartItem.update(id, { quantity }),
    onSuccess: () => queryClient.invalidateQueries(['cart'])
  });

  const removeCartMutation = useMutation({
    mutationFn: (id) => base44.entities.CartItem.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['cart'])
  });

  const handleAddToCart = () => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      base44.auth.redirectToLogin();
      return;
    }
    if (product.sizes?.length && !selectedSize) {
      toast.error('Selecione um tamanho');
      return;
    }
    addToCartMutation.mutate();
  };

  if (isLoading || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const discount = product.original_price 
    ? Math.round((1 - product.price / product.original_price) * 100) 
    : 0;

  const images = product.images?.length > 0 
    ? product.images 
    : ['https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800'];

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => setCartOpen(true)} 
      />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link to={createPageUrl('Home')} className="hover:text-amber-600">Home</Link>
          <span>/</span>
          <Link to={createPageUrl('Catalog')} className="hover:text-amber-600">Catálogo</Link>
          <span>/</span>
          <Link to={createPageUrl(`Catalog?category=${product.category}`)} className="hover:text-amber-600 capitalize">
            {product.category}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{product.name}</span>
        </div>

        <div className="grid lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentImage}
                  src={images[currentImage]}
                  alt={product.name}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="w-full h-full object-cover"
                />
              </AnimatePresence>

              {discount > 0 && (
                <Badge className="absolute top-4 left-4 bg-amber-500 text-black font-bold text-lg px-4 py-2">
                  -{discount}%
                </Badge>
              )}

              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/90 rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-colors"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentImage(idx)}
                    className={`w-20 h-24 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${
                      currentImage === idx ? 'border-amber-500' : 'border-transparent'
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <p className="text-amber-600 font-semibold text-sm uppercase tracking-wider mb-2">
                {product.category}
              </p>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">
                {product.name}
              </h1>
              
              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-5 h-5 ${i < 4 ? 'fill-amber-500 text-amber-500' : 'text-gray-300'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-500">(127 avaliações)</span>
              </div>

              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-black text-gray-900">
                  R$ {product.price?.toFixed(2)}
                </span>
                {product.original_price && (
                  <span className="text-xl text-gray-400 line-through">
                    R$ {product.original_price?.toFixed(2)}
                  </span>
                )}
              </div>

              <p className="text-sm text-gray-500 mt-2">
                ou 10x de R$ {(product.price / 10).toFixed(2)} sem juros
              </p>
            </div>

            {/* Colors */}
            {product.colors?.length > 0 && (
              <div>
                <p className="font-semibold text-gray-900 mb-3">
                  Cor: <span className="font-normal text-gray-500">{selectedColor || 'Selecione'}</span>
                </p>
                <div className="flex gap-3">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => setSelectedColor(color)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
                        selectedColor === color 
                          ? 'border-amber-500 ring-2 ring-amber-500 ring-offset-2' 
                          : 'border-gray-200'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Sizes */}
            {product.sizes?.length > 0 && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="font-semibold text-gray-900">
                    Tamanho: <span className="font-normal text-gray-500">{selectedSize || 'Selecione'}</span>
                  </p>
                  <button className="text-sm text-amber-600 hover:underline">
                    Guia de Tamanhos
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`w-14 h-14 rounded-xl border-2 font-semibold transition-all ${
                        selectedSize === size 
                          ? 'border-amber-500 bg-amber-50 text-amber-700' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <p className="font-semibold text-gray-900 mb-3">Quantidade</p>
              <div className="inline-flex items-center border-2 rounded-xl overflow-hidden">
                <button
                  onClick={() => setQuantity(prev => Math.max(1, prev - 1))}
                  className="p-3 hover:bg-gray-100 transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-5 h-5" />
                </button>
                <span className="px-6 py-3 font-semibold text-lg">{quantity}</span>
                <button
                  onClick={() => setQuantity(prev => prev + 1)}
                  className="p-3 hover:bg-gray-100 transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <div className="flex gap-4">
              <Button 
                onClick={handleAddToCart}
                className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg h-14 rounded-xl"
                disabled={addToCartMutation.isPending}
              >
                <ShoppingBag className="w-5 h-5 mr-2" />
                {addToCartMutation.isPending ? 'Adicionando...' : 'Adicionar ao Carrinho'}
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                <Heart className="w-5 h-5" />
              </Button>
              <Button variant="outline" size="icon" className="h-14 w-14 rounded-xl">
                <Share2 className="w-5 h-5" />
              </Button>
            </div>

            {/* Benefits */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t">
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <Truck className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs font-medium">Frete Grátis</p>
                <p className="text-xs text-gray-500">Acima de R$ 299</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <RotateCcw className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs font-medium">Troca Fácil</p>
                <p className="text-xs text-gray-500">Até 30 dias</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center mx-auto mb-2">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <p className="text-xs font-medium">Compra Segura</p>
                <p className="text-xs text-gray-500">100% protegida</p>
              </div>
            </div>

            {/* Description Tabs */}
            <Tabs defaultValue="description" className="pt-6 border-t">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="description">Descrição</TabsTrigger>
                <TabsTrigger value="details">Detalhes</TabsTrigger>
                <TabsTrigger value="reviews">Avaliações</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="pt-4">
                <p className="text-gray-600 leading-relaxed">
                  {product.description || 'Peça de alta qualidade, confeccionada com materiais premium para garantir conforto e durabilidade. Design moderno e versátil, perfeito para diversas ocasiões.'}
                </p>
              </TabsContent>
              <TabsContent value="details" className="pt-4">
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Composição: 100% Algodão
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Lavagem à máquina
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-500" />
                    Produto importado
                  </li>
                </ul>
              </TabsContent>
              <TabsContent value="reviews" className="pt-4">
                <div className="flex items-center gap-4 mb-4">
                  <div className="text-center">
                    <p className="text-4xl font-bold text-gray-900">4.8</p>
                    <div className="flex justify-center">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 mt-1">127 avaliações</p>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Produtos Relacionados</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {relatedProducts.filter(p => p.id !== product.id).slice(0, 4).map((prod) => (
                <ProductCard 
                  key={prod.id} 
                  product={prod}
                  onAddToCart={(p) => {
                    if (!user) {
                      toast.error('Faça login para adicionar ao carrinho');
                      base44.auth.redirectToLogin();
                      return;
                    }
                    addToCartMutation.mutate();
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </div>

      <Footer />

      <CartDrawer 
        open={cartOpen} 
        onClose={() => setCartOpen(false)} 
        items={cartItems}
        onUpdateQuantity={(id, quantity) => updateCartMutation.mutate({ id, quantity })}
        onRemove={(id) => removeCartMutation.mutate(id)}
      />
    </div>
  );
}