import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Button } from "@/components/ui/button";
import { Heart, ShoppingBag, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function Wishlist() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        } else {
          base44.auth.redirectToLogin();
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Lista de Desejos</h1>

        <div className="text-center py-20">
          <div className="w-24 h-24 bg-pink-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-10 h-10 text-pink-400" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Sua lista está vazia
          </h3>
          <p className="text-gray-500 mb-6">
            Adicione produtos aos favoritos clicando no coração
          </p>
          <Link to={createPageUrl('Catalog')}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              <ShoppingBag className="w-4 h-4 mr-2" />
              Explorar Produtos
            </Button>
          </Link>
        </div>
      </div>

      <Footer />
    </div>
  );
}