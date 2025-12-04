import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import ProductCard from '@/components/store/ProductCard';
import CartDrawer from '@/components/store/CartDrawer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Filter, SlidersHorizontal, X, Search, Grid2X2, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";

const categories = [
  { name: 'Todos', value: 'all' },
  { name: 'Camisetas', value: 'camisetas' },
  { name: 'Calças', value: 'calças' },
  { name: 'Vestidos', value: 'vestidos' },
  { name: 'Casacos', value: 'casacos' },
  { name: 'Acessórios', value: 'acessórios' },
  { name: 'Sapatos', value: 'sapatos' },
];

const sizes = ['PP', 'P', 'M', 'G', 'GG', 'XG'];

export default function Catalog() {
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category') || 'all';
  const isFeatured = urlParams.get('featured') === 'true';

  const [cartOpen, setCartOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [priceRange, setPriceRange] = useState([0, 500]);
  const [selectedSizes, setSelectedSizes] = useState([]);
  const [sortBy, setSortBy] = useState('newest');
  const [gridCols, setGridCols] = useState(4);

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

  const { data: products = [], isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: () => base44.entities.Product.list('-created_date', 100),
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

  const toggleSize = (size) => {
    setSelectedSizes(prev => 
      prev.includes(size) 
        ? prev.filter(s => s !== size)
        : [...prev, size]
    );
  };

  const filteredProducts = products.filter(product => {
    if (searchQuery && !product.name?.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (selectedCategory !== 'all' && product.category !== selectedCategory) return false;
    if (product.price < priceRange[0] || product.price > priceRange[1]) return false;
    if (selectedSizes.length > 0 && !product.sizes?.some(s => selectedSizes.includes(s))) return false;
    if (isFeatured && !product.featured) return false;
    return true;
  }).sort((a, b) => {
    switch (sortBy) {
      case 'price-asc': return a.price - b.price;
      case 'price-desc': return b.price - a.price;
      case 'name': return a.name.localeCompare(b.name);
      default: return 0;
    }
  });

  const clearFilters = () => {
    setSelectedCategory('all');
    setPriceRange([0, 500]);
    setSelectedSizes([]);
    setSearchQuery('');
  };

  const activeFiltersCount = [
    selectedCategory !== 'all',
    priceRange[0] > 0 || priceRange[1] < 500,
    selectedSizes.length > 0
  ].filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => setCartOpen(true)} 
      />
      
      <div className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-gray-900">
            {isFeatured ? 'Promoções' : selectedCategory !== 'all' 
              ? categories.find(c => c.value === selectedCategory)?.name 
              : 'Todos os Produtos'}
          </h1>
          <p className="text-gray-500 mt-2">
            {filteredProducts.length} produtos encontrados
          </p>
        </div>

        {/* Filters Bar */}
        <div className="bg-white rounded-2xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <Input
                placeholder="Buscar produtos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 rounded-xl"
              />
            </div>

            {/* Category Pills - Desktop */}
            <div className="hidden lg:flex items-center gap-2 overflow-x-auto">
              {categories.map((cat) => (
                <Button
                  key={cat.value}
                  variant={selectedCategory === cat.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(cat.value)}
                  className={selectedCategory === cat.value 
                    ? 'bg-amber-500 hover:bg-amber-600 text-black rounded-full'
                    : 'rounded-full'
                  }
                >
                  {cat.name}
                </Button>
              ))}
            </div>

            {/* Sort */}
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px] h-12 rounded-xl">
                <SelectValue placeholder="Ordenar" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Mais Recentes</SelectItem>
                <SelectItem value="price-asc">Menor Preço</SelectItem>
                <SelectItem value="price-desc">Maior Preço</SelectItem>
                <SelectItem value="name">Nome A-Z</SelectItem>
              </SelectContent>
            </Select>

            {/* Filter Button - Mobile/Tablet */}
            <Sheet open={filterOpen} onOpenChange={setFilterOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="h-12 lg:hidden rounded-xl">
                  <Filter className="w-5 h-5 mr-2" />
                  Filtros
                  {activeFiltersCount > 0 && (
                    <Badge className="ml-2 bg-amber-500 text-black">{activeFiltersCount}</Badge>
                  )}
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-full sm:max-w-md">
                <SheetHeader>
                  <SheetTitle className="flex items-center justify-between">
                    Filtros
                    {activeFiltersCount > 0 && (
                      <Button variant="ghost" size="sm" onClick={clearFilters}>
                        Limpar
                      </Button>
                    )}
                  </SheetTitle>
                </SheetHeader>
                <div className="mt-6 space-y-6">
                  {/* Categories */}
                  <div>
                    <Label className="text-sm font-semibold">Categoria</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {categories.map((cat) => (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.value)}
                          className={selectedCategory === cat.value 
                            ? 'bg-amber-500 hover:bg-amber-600 text-black'
                            : ''
                          }
                        >
                          {cat.name}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Price Range */}
                  <div>
                    <Label className="text-sm font-semibold">Faixa de Preço</Label>
                    <div className="mt-4 px-2">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        min={0}
                        max={500}
                        step={10}
                        className="mb-4"
                      />
                      <div className="flex justify-between text-sm text-gray-500">
                        <span>R$ {priceRange[0]}</span>
                        <span>R$ {priceRange[1]}</span>
                      </div>
                    </div>
                  </div>

                  {/* Sizes */}
                  <div>
                    <Label className="text-sm font-semibold">Tamanho</Label>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {sizes.map((size) => (
                        <button
                          key={size}
                          onClick={() => toggleSize(size)}
                          className={`w-12 h-12 rounded-lg border-2 font-medium transition-colors ${
                            selectedSizes.includes(size)
                              ? 'border-amber-500 bg-amber-50 text-amber-700'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setFilterOpen(false)}
                    className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold"
                  >
                    Aplicar Filtros
                  </Button>
                </div>
              </SheetContent>
            </Sheet>

            {/* Grid Toggle */}
            <div className="hidden md:flex items-center gap-1 border rounded-xl p-1">
              <button
                onClick={() => setGridCols(3)}
                className={`p-2 rounded-lg ${gridCols === 3 ? 'bg-gray-100' : ''}`}
              >
                <Grid2X2 className="w-5 h-5" />
              </button>
              <button
                onClick={() => setGridCols(4)}
                className={`p-2 rounded-lg ${gridCols === 4 ? 'bg-gray-100' : ''}`}
              >
                <LayoutGrid className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Active Filters */}
          {activeFiltersCount > 0 && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <span className="text-sm text-gray-500">Filtros ativos:</span>
              {selectedCategory !== 'all' && (
                <Badge variant="secondary" className="gap-1">
                  {categories.find(c => c.value === selectedCategory)?.name}
                  <button onClick={() => setSelectedCategory('all')}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {(priceRange[0] > 0 || priceRange[1] < 500) && (
                <Badge variant="secondary" className="gap-1">
                  R$ {priceRange[0]} - R$ {priceRange[1]}
                  <button onClick={() => setPriceRange([0, 500])}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              )}
              {selectedSizes.map(size => (
                <Badge key={size} variant="secondary" className="gap-1">
                  {size}
                  <button onClick={() => toggleSize(size)}>
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                Limpar Todos
              </Button>
            </div>
          )}
        </div>

        {/* Products Grid */}
        <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-${gridCols} gap-4 md:gap-6`}>
          <AnimatePresence>
            {filteredProducts.map((product) => (
              <ProductCard 
                key={product.id} 
                product={product}
                onAddToCart={handleAddToCart}
              />
            ))}
          </AnimatePresence>
        </div>

        {filteredProducts.length === 0 && !isLoading && (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum produto encontrado
            </h3>
            <p className="text-gray-500 mb-4">
              Tente ajustar os filtros ou buscar por outro termo
            </p>
            <Button onClick={clearFilters} className="bg-amber-500 hover:bg-amber-600 text-black">
              Limpar Filtros
            </Button>
          </div>
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