import React, { useState } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Minus, Plus, Trash2, ShoppingBag, Truck, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { motion, AnimatePresence } from 'framer-motion';

export default function CartDrawer({ open, onClose, items, onUpdateQuantity, onRemove }) {
  const [cep, setCep] = useState('');
  const [shipping, setShipping] = useState(null);
  const [loadingShipping, setLoadingShipping] = useState(false);

  const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const calculateShipping = async () => {
    if (cep.length < 8) return;
    setLoadingShipping(true);
    
    // Simula cálculo de frete
    await new Promise(r => setTimeout(r, 1000));
    
    const cepNum = parseInt(cep.replace(/\D/g, ''));
    let cost = 0;
    
    if (cepNum >= 1000000 && cepNum <= 9999999) {
      cost = 12.90; // São Paulo capital
    } else if (cepNum >= 10000000 && cepNum <= 19999999) {
      cost = 18.90; // Interior SP
    } else if (cepNum >= 20000000 && cepNum <= 29999999) {
      cost = 22.90; // RJ
    } else {
      cost = 29.90; // Outros estados
    }
    
    if (subtotal >= 299) {
      cost = 0;
    }
    
    setShipping({
      cost,
      days: cost === 0 ? '5-7' : '7-12',
      free: cost === 0
    });
    setLoadingShipping(false);
  };

  const total = subtotal + (shipping?.cost || 0);

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader className="border-b pb-4">
          <SheetTitle className="flex items-center gap-2 text-xl">
            <ShoppingBag className="w-5 h-5 text-amber-500" />
            Meu Carrinho
            <span className="text-sm font-normal text-gray-500">
              ({items.length} {items.length === 1 ? 'item' : 'itens'})
            </span>
          </SheetTitle>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-12">
              <div className="w-20 h-20 rounded-full bg-amber-50 flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 text-amber-500" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Carrinho vazio</h3>
              <p className="text-gray-500 text-sm mb-4">
                Adicione produtos para começar suas compras
              </p>
              <Button onClick={onClose} className="bg-amber-500 hover:bg-amber-600 text-black">
                Explorar Produtos
              </Button>
            </div>
          ) : (
            <AnimatePresence>
              <div className="space-y-4">
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="flex gap-4 bg-gray-50 rounded-xl p-3"
                  >
                    <div className="w-20 h-24 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <img
                        src={item.product_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'}
                        alt={item.product_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 text-sm line-clamp-1">
                        {item.product_name}
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">
                        {item.size && `Tam: ${item.size}`}
                        {item.size && item.color && ' • '}
                        {item.color && `Cor: ${item.color}`}
                      </p>
                      <p className="font-bold text-gray-900 mt-2">
                        R$ {(item.price * item.quantity).toFixed(2)}
                      </p>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center border rounded-lg overflow-hidden">
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                            disabled={item.quantity <= 1}
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-3 text-sm font-medium">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                            className="p-1.5 hover:bg-gray-100 transition-colors"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        
                        <button
                          onClick={() => onRemove(item.id)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t pt-4 space-y-4">
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-amber-600" />
                <span className="text-sm font-medium text-amber-900">Calcular Frete</span>
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite seu CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="flex-1"
                />
                <Button
                  onClick={calculateShipping}
                  disabled={cep.length < 8 || loadingShipping}
                  variant="outline"
                  className="border-amber-500 text-amber-700 hover:bg-amber-100"
                >
                  {loadingShipping ? 'Calculando...' : 'Calcular'}
                </Button>
              </div>
              
              {shipping && (
                <div className="mt-3 p-3 bg-white rounded-lg">
                  {shipping.free ? (
                    <p className="text-green-600 font-medium text-sm">
                      🎉 Frete Grátis! Entrega em {shipping.days} dias úteis
                    </p>
                  ) : (
                    <p className="text-gray-700 text-sm">
                      Frete: <span className="font-bold">R$ {shipping.cost.toFixed(2)}</span> 
                      <span className="text-gray-500 ml-1">({shipping.days} dias úteis)</span>
                    </p>
                  )}
                </div>
              )}
              
              {subtotal < 299 && (
                <p className="text-xs text-amber-700 mt-2">
                  Faltam R$ {(299 - subtotal).toFixed(2)} para frete grátis!
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal</span>
                <span className="font-medium">R$ {subtotal.toFixed(2)}</span>
              </div>
              {shipping && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Frete</span>
                  <span className={`font-medium ${shipping.free ? 'text-green-600' : ''}`}>
                    {shipping.free ? 'Grátis' : `R$ ${shipping.cost.toFixed(2)}`}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Total</span>
                <span className="text-amber-600">R$ {total.toFixed(2)}</span>
              </div>
            </div>

            <Link to={createPageUrl('Checkout')} onClick={onClose}>
              <Button className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold text-lg py-6">
                Finalizar Compra
              </Button>
            </Link>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}