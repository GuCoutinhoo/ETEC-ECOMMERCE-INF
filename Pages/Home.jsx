import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import HeroSection from '@/components/store/HeroSection';
import CategoryGrid from '@/components/store/CategoryGrid';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer from '@/components/store/CartDrawer';
import { Button } from "@/components/ui/button";
import { ArrowRight, Star, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Home() {
  const [cartOpen, setCartOpen] = useState(false);
  const [user, setUser] = useState(null);
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

  const { data: products = [] } = useQuery({
    queryKey: ['products', 'featured'],
    queryFn: () => base44.entities.Product.filter({ featured: true }, '-created_date', 8),
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => base44.entities.CartItem.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const addToCartMutation = useMutation({
    mutationFn: (product) => base44.entities.CartItem.create({
      product_id: product.id,
      product_name: product.name,
      product_image: product.images?.[0],
      price: product.price,
      quantity: 1,
      user_email: user?.email,
      size: product.sizes?.[0] || '',
      color: product.colors?.[0] || ''
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

  const handleAddToCart = (product) => {
    if (!user) {
      toast.error('Faça login para adicionar ao carrinho');
      base44.auth.redirectToLogin();
      return;
    }
    addToCartMutation.mutate(product);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => setCartOpen(true)} 
      />
      
      <HeroSection />
      
      <CategoryGrid />

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
                Selecionados
              </span>
              <h2 className="text-4xl font-black text-gray-900 mt-2">
                Produtos em Destaque
              </h2>
            </div>
            <Link to={createPageUrl('Catalog')}>
              <Button variant="outline" className="hidden md:flex">
                Ver Todos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {products.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product} 
                onAddToCart={handleAddToCart}
              />
            ))}
          </div>

          <div className="text-center mt-8 md:hidden">
            <Link to={createPageUrl('Catalog')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Ver Todos os Produtos
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Special Offer Banner */}
      <section className="py-20 bg-gradient-to-r from-amber-500 to-amber-400 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-black rounded-full -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-64 h-64 bg-black rounded-full translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="inline-block px-4 py-2 bg-black/10 text-black text-sm font-bold rounded-full mb-6">
                OFERTA ESPECIAL
              </span>
              <h2 className="text-4xl md:text-5xl font-black text-black mb-4">
                Use o Cupom BEMVINDO10
              </h2>
              <p className="text-xl text-black/70 mb-8">
                Ganhe 10% OFF na sua primeira compra + Frete Grátis!
              </p>
              <Link to={createPageUrl('Catalog')}>
                <Button size="lg" className="bg-black hover:bg-gray-900 text-amber-400 font-bold text-lg px-10 py-6 rounded-full">
                  Aproveitar Agora
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
              Depoimentos
            </span>
            <h2 className="text-4xl font-black text-gray-900 mt-2">
              O Que Dizem Nossos Clientes
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: 'Maria Silva',
                text: 'Qualidade incrível! As roupas são lindas e o atendimento é excepcional. Virei cliente fiel!',
                rating: 5
              },
              {
                name: 'João Santos',
                text: 'Entrega super rápida e as peças vieram exatamente como nas fotos. Recomendo demais!',
                rating: 5
              },
              {
                name: 'Ana Costa',
                text: 'Achei o estilo que procurava! Preços justos e qualidade premium. Adorei a experiência.',
                rating: 5
              }
            ].map((review, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="bg-white rounded-2xl p-8 shadow-sm"
              >
                <Quote className="w-10 h-10 text-amber-500/20 mb-4" />
                <p className="text-gray-600 mb-6">{review.text}</p>
                <div className="flex items-center gap-2 mb-4">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                  ))}
                </div>
                <p className="font-semibold text-gray-900">{review.name}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

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