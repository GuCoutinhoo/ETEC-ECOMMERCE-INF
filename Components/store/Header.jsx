import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ShoppingBag, 
  Search, 
  User, 
  Menu, 
  X, 
  Heart,
  Package,
  LogOut,
  ChevronDown
} from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from 'framer-motion';

const categories = [
  { name: 'Camisetas', slug: 'camisetas' },
  { name: 'Calças', slug: 'calças' },
  { name: 'Vestidos', slug: 'vestidos' },
  { name: 'Casacos', slug: 'casacos' },
  { name: 'Acessórios', slug: 'acessórios' },
  { name: 'Sapatos', slug: 'sapatos' },
];

export default function Header({ cartItemCount = 0, onCartClick }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
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

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
  };

  return (
    <>
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-white/95 backdrop-blur-md shadow-lg' 
            : 'bg-white'
        }`}
      >
        {/* Top Bar */}
        <div className="bg-gray-900 text-white py-2 text-center text-xs">
          <p>🎉 FRETE GRÁTIS em compras acima de R$ 299 • Use o código <span className="text-amber-400 font-bold">BEMVINDO10</span></p>
        </div>

        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Mobile Menu Button */}
            <button 
              className="lg:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            {/* Logo */}
            <Link to={createPageUrl('Home')} className="flex items-center gap-2">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-xl">A</span>
              </div>
              <span className="font-black text-xl tracking-tight hidden sm:block">
                LUXE<span className="text-amber-500">STYLE</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              <Link 
                to={createPageUrl('Catalog')}
                className="text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors"
              >
                Novidades
              </Link>
              
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1 text-sm font-medium text-gray-700 hover:text-amber-600 transition-colors">
                  Categorias
                  <ChevronDown className="w-4 h-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-48">
                  {categories.map((cat) => (
                    <DropdownMenuItem key={cat.slug} asChild>
                      <Link to={createPageUrl(`Catalog?category=${cat.slug}`)}>
                        {cat.name}
                      </Link>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <Link 
                to={createPageUrl('Catalog?featured=true')}
                className="text-sm font-medium text-amber-600 hover:text-amber-700 transition-colors"
              >
                Promoções
              </Link>
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setSearchOpen(!searchOpen)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <Search className="w-5 h-5" />
              </button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                      <User className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-3 py-2">
                      <p className="font-medium text-sm">{user.full_name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Profile')} className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Orders')} className="flex items-center gap-2">
                        <Package className="w-4 h-4" />
                        Meus Pedidos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to={createPageUrl('Wishlist')} className="flex items-center gap-2">
                        <Heart className="w-4 h-4" />
                        Lista de Desejos
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                      <LogOut className="w-4 h-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => base44.auth.redirectToLogin()}
                  className="hidden sm:flex"
                >
                  Entrar
                </Button>
              )}

              <button 
                onClick={onCartClick}
                className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ShoppingBag className="w-5 h-5" />
                {cartItemCount > 0 && (
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 p-0 flex items-center justify-center bg-amber-500 text-black text-xs font-bold">
                    {cartItemCount}
                  </Badge>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t overflow-hidden"
            >
              <div className="container mx-auto px-4 py-4">
                <div className="relative max-w-2xl mx-auto">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <Input
                    placeholder="Buscar produtos..."
                    className="pl-12 pr-4 h-12 text-lg rounded-full border-gray-200"
                    autoFocus
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: -300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -300 }}
            className="fixed inset-0 z-40 lg:hidden"
          >
            <div className="absolute inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
            <div className="absolute left-0 top-0 bottom-0 w-80 bg-white overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center gap-2 mb-8">
                  <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                    <span className="text-black font-black text-xl">A</span>
                  </div>
                  <span className="font-black text-xl tracking-tight">
                    LUXE<span className="text-amber-500">STYLE</span>
                  </span>
                </div>

                <nav className="space-y-4">
                  <Link 
                    to={createPageUrl('Catalog')}
                    className="block py-2 text-lg font-medium"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Novidades
                  </Link>
                  
                  <div className="py-2">
                    <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
                      Categorias
                    </p>
                    {categories.map((cat) => (
                      <Link
                        key={cat.slug}
                        to={createPageUrl(`Catalog?category=${cat.slug}`)}
                        className="block py-2 text-gray-700 hover:text-amber-600"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {cat.name}
                      </Link>
                    ))}
                  </div>

                  <Link 
                    to={createPageUrl('Catalog?featured=true')}
                    className="block py-2 text-lg font-medium text-amber-600"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Promoções
                  </Link>
                </nav>

                {!user && (
                  <div className="mt-8 pt-8 border-t">
                    <Button 
                      onClick={() => base44.auth.redirectToLogin()}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                    >
                      Entrar / Cadastrar
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Spacer */}
      <div className="h-24 lg:h-28" />
    </>
  );
}