import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, Truck, CheckCircle2, Clock, XCircle, 
  ChevronRight, MapPin, CreditCard, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

const statusConfig = {
  pendente: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  confirmado: { label: 'Confirmado', color: 'bg-blue-100 text-blue-800', icon: Package },
  enviado: { label: 'Enviado', color: 'bg-purple-100 text-purple-800', icon: Truck },
  entregue: { label: 'Entregue', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'bg-red-100 text-red-800', icon: XCircle },
};

export default function Orders() {
  const [user, setUser] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

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

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders', user?.email],
    queryFn: () => base44.entities.Order.filter({ user_email: user?.email }, '-created_date'),
    enabled: !!user?.email,
  });

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => base44.entities.CartItem.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const filteredOrders = activeTab === 'all' 
    ? orders 
    : orders.filter(order => order.status === activeTab);

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        cartItemCount={cartItems.reduce((sum, item) => sum + item.quantity, 0)} 
        onCartClick={() => {}} 
      />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-black text-gray-900 mb-8">Meus Pedidos</h1>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="bg-white shadow-sm p-1">
            <TabsTrigger value="all">Todos</TabsTrigger>
            <TabsTrigger value="pendente">Pendentes</TabsTrigger>
            <TabsTrigger value="enviado">Enviados</TabsTrigger>
            <TabsTrigger value="entregue">Entregues</TabsTrigger>
          </TabsList>
        </Tabs>

        {isLoading ? (
          <div className="grid gap-4">
            {[1, 2, 3].map(i => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-6">
                  <div className="h-20 bg-gray-200 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhum pedido encontrado
            </h3>
            <p className="text-gray-500 mb-6">
              Você ainda não fez nenhum pedido
            </p>
            <Link to={createPageUrl('Catalog')}>
              <Button className="bg-amber-500 hover:bg-amber-600 text-black">
                Explorar Produtos
              </Button>
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order, index) => {
              const StatusIcon = statusConfig[order.status]?.icon || Clock;
              
              return (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card 
                    className={`cursor-pointer transition-all hover:shadow-lg ${
                      selectedOrder?.id === order.id ? 'ring-2 ring-amber-500' : ''
                    }`}
                    onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <Badge className={statusConfig[order.status]?.color}>
                              <StatusIcon className="w-3 h-3 mr-1" />
                              {statusConfig[order.status]?.label}
                            </Badge>
                            <span className="text-sm text-gray-500">
                              Pedido #{order.id?.slice(-8).toUpperCase()}
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {order.created_date && format(new Date(order.created_date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                          </p>
                        </div>

                        {/* Items Preview */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-3">
                            {order.items?.slice(0, 3).map((item, idx) => (
                              <div 
                                key={idx} 
                                className="w-12 h-12 rounded-lg border-2 border-white bg-gray-100 overflow-hidden"
                              >
                                <img 
                                  src={`https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100`}
                                  alt=""
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            ))}
                            {order.items?.length > 3 && (
                              <div className="w-12 h-12 rounded-lg border-2 border-white bg-gray-200 flex items-center justify-center text-sm font-medium">
                                +{order.items.length - 3}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Total & Action */}
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            R$ {order.total?.toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items?.reduce((sum, item) => sum + item.quantity, 0)} itens
                          </p>
                        </div>

                        <ChevronRight className={`w-5 h-5 text-gray-400 hidden md:block transition-transform ${
                          selectedOrder?.id === order.id ? 'rotate-90' : ''
                        }`} />
                      </div>

                      {/* Expanded Details */}
                      {selectedOrder?.id === order.id && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-6 pt-6 border-t"
                        >
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Items */}
                            <div>
                              <h4 className="font-semibold mb-3">Itens do Pedido</h4>
                              <div className="space-y-3">
                                {order.items?.map((item, idx) => (
                                  <div key={idx} className="flex gap-3 p-3 bg-gray-50 rounded-lg">
                                    <div className="w-14 h-16 rounded bg-gray-200 overflow-hidden">
                                      <img 
                                        src={`https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=100`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div className="flex-1">
                                      <p className="font-medium text-sm">{item.product_name}</p>
                                      <p className="text-xs text-gray-500">
                                        {item.size && `Tam: ${item.size}`}
                                        {item.size && item.color && ' • '}
                                        {item.color && `Cor: ${item.color}`}
                                      </p>
                                      <p className="text-xs text-gray-500">Qtd: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* Order Details */}
                            <div className="space-y-4">
                              {/* Address */}
                              <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <MapPin className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-sm">Endereço de Entrega</span>
                                </div>
                                {order.shipping_address && (
                                  <p className="text-sm text-gray-600">
                                    {order.shipping_address.street}, {order.shipping_address.number}
                                    {order.shipping_address.complement && ` - ${order.shipping_address.complement}`}
                                    <br />
                                    {order.shipping_address.neighborhood} - {order.shipping_address.city}/{order.shipping_address.state}
                                    <br />
                                    CEP: {order.shipping_address.cep}
                                  </p>
                                )}
                              </div>

                              {/* Payment */}
                              <div className="p-4 bg-gray-50 rounded-xl">
                                <div className="flex items-center gap-2 mb-2">
                                  <CreditCard className="w-4 h-4 text-gray-400" />
                                  <span className="font-medium text-sm">Pagamento</span>
                                </div>
                                <p className="text-sm text-gray-600">
                                  {order.payment_method === 'pix' && 'PIX'}
                                  {order.payment_method === 'cartao' && 'Cartão de Crédito'}
                                  {order.payment_method === 'boleto' && 'Boleto Bancário'}
                                </p>
                              </div>

                              {/* Totals */}
                              <div className="p-4 bg-amber-50 rounded-xl">
                                <div className="space-y-1 text-sm">
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Subtotal</span>
                                    <span>R$ {order.subtotal?.toFixed(2)}</span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span className="text-gray-600">Frete</span>
                                    <span className={order.shipping_cost === 0 ? 'text-green-600' : ''}>
                                      {order.shipping_cost === 0 ? 'Grátis' : `R$ ${order.shipping_cost?.toFixed(2)}`}
                                    </span>
                                  </div>
                                  <div className="flex justify-between font-bold text-lg pt-2 border-t">
                                    <span>Total</span>
                                    <span className="text-amber-600">R$ {order.total?.toFixed(2)}</span>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}