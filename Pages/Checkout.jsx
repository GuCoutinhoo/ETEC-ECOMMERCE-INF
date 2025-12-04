import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { 
  CreditCard, Smartphone, FileText, Truck, Lock, 
  ChevronLeft, Check, MapPin, ShoppingBag, AlertCircle 
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [address, setAddress] = useState({
    cep: '',
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: ''
  });
  
  const [paymentMethod, setPaymentMethod] = useState('pix');
  const [cardData, setCardData] = useState({
    number: '',
    name: '',
    expiry: '',
    cvv: '',
    installments: '1'
  });
  
  const [shipping, setShipping] = useState(null);
  const [coupon, setCoupon] = useState('');
  const [discount, setDiscount] = useState(0);

  const queryClient = useQueryClient();

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
        } else {
          base44.auth.redirectToLogin(createPageUrl('Checkout'));
        }
      } catch (e) {
        base44.auth.redirectToLogin(createPageUrl('Checkout'));
      }
    };
    loadUser();
  }, []);

  const { data: cartItems = [] } = useQuery({
    queryKey: ['cart', user?.email],
    queryFn: () => base44.entities.CartItem.filter({ user_email: user?.email }),
    enabled: !!user?.email,
  });

  const createOrderMutation = useMutation({
    mutationFn: async (orderData) => {
      const order = await base44.entities.Order.create(orderData);
      // Clear cart
      for (const item of cartItems) {
        await base44.entities.CartItem.delete(item.id);
      }
      return order;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cart']);
      toast.success('Pedido realizado com sucesso!');
      navigate(createPageUrl('Orders'));
    }
  });

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = shipping?.cost || 0;
  const total = subtotal - discount + shippingCost;

  const fetchCep = async (cep) => {
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setAddress(prev => ({
          ...prev,
          street: data.logradouro,
          neighborhood: data.bairro,
          city: data.localidade,
          state: data.uf
        }));
        
        // Calculate shipping
        const cepNum = parseInt(cep);
        let cost = 29.90;
        if (cepNum >= 1000000 && cepNum <= 9999999) cost = 12.90;
        else if (cepNum >= 10000000 && cepNum <= 19999999) cost = 18.90;
        else if (cepNum >= 20000000 && cepNum <= 29999999) cost = 22.90;
        
        if (subtotal >= 299) cost = 0;
        
        setShipping({
          cost,
          days: cost === 0 ? '5-7' : '7-12',
          free: cost === 0
        });
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    }
  };

  const applyCoupon = () => {
    if (coupon.toUpperCase() === 'BEMVINDO10') {
      setDiscount(subtotal * 0.1);
      toast.success('Cupom aplicado com sucesso!');
    } else {
      toast.error('Cupom inválido');
    }
  };

  const handleSubmit = async () => {
    if (!address.cep || !address.street || !address.number || !address.city) {
      toast.error('Preencha o endereço completo');
      setStep(1);
      return;
    }

    setLoading(true);
    
    createOrderMutation.mutate({
      user_email: user.email,
      items: cartItems.map(item => ({
        product_id: item.product_id,
        product_name: item.product_name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      })),
      subtotal,
      shipping_cost: shippingCost,
      total,
      status: 'pendente',
      shipping_address: address,
      payment_method: paymentMethod
    });
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingBag className="w-10 h-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Carrinho Vazio</h2>
          <p className="text-gray-500 mb-6">Adicione produtos antes de finalizar a compra</p>
          <Link to={createPageUrl('Catalog')}>
            <Button className="bg-amber-500 hover:bg-amber-600 text-black">
              Explorar Produtos
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to={createPageUrl('Home')}>
                <Button variant="ghost" size="icon">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
                  <span className="text-black font-black text-sm">A</span>
                </div>
                <span className="font-black text-lg">
                  LUXE<span className="text-amber-500">STYLE</span>
                </span>
              </div>
            </div>
            <div className="flex items-center gap-1 text-sm text-gray-500">
              <Lock className="w-4 h-4" />
              Compra Segura
            </div>
          </div>
        </div>
      </header>

      {/* Progress Steps */}
      <div className="bg-white border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4">
            {[
              { num: 1, label: 'Endereço' },
              { num: 2, label: 'Pagamento' },
              { num: 3, label: 'Confirmação' }
            ].map((s, idx) => (
              <React.Fragment key={s.num}>
                <div 
                  className={`flex items-center gap-2 cursor-pointer ${step >= s.num ? 'text-amber-600' : 'text-gray-400'}`}
                  onClick={() => step > s.num && setStep(s.num)}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                    step > s.num 
                      ? 'bg-green-500 text-white' 
                      : step === s.num 
                        ? 'bg-amber-500 text-black' 
                        : 'bg-gray-200'
                  }`}>
                    {step > s.num ? <Check className="w-4 h-4" /> : s.num}
                  </div>
                  <span className="hidden sm:inline font-medium">{s.label}</span>
                </div>
                {idx < 2 && (
                  <div className={`w-16 h-0.5 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Address */}
            {step === 1 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <MapPin className="w-5 h-5 text-amber-500" />
                      Endereço de Entrega
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2 sm:col-span-1">
                        <Label>CEP</Label>
                        <Input
                          placeholder="00000-000"
                          value={address.cep}
                          onChange={(e) => {
                            const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                            setAddress(prev => ({ ...prev, cep: value }));
                            if (value.length === 8) fetchCep(value);
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-3 sm:col-span-2">
                        <Label>Rua</Label>
                        <Input
                          value={address.street}
                          onChange={(e) => setAddress(prev => ({ ...prev, street: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Número</Label>
                        <Input
                          value={address.number}
                          onChange={(e) => setAddress(prev => ({ ...prev, number: e.target.value }))}
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Complemento (opcional)</Label>
                      <Input
                        placeholder="Apt, bloco, etc"
                        value={address.complement}
                        onChange={(e) => setAddress(prev => ({ ...prev, complement: e.target.value }))}
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <Label>Bairro</Label>
                        <Input
                          value={address.neighborhood}
                          onChange={(e) => setAddress(prev => ({ ...prev, neighborhood: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Cidade</Label>
                        <Input
                          value={address.city}
                          onChange={(e) => setAddress(prev => ({ ...prev, city: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label>Estado</Label>
                        <Input
                          value={address.state}
                          onChange={(e) => setAddress(prev => ({ ...prev, state: e.target.value }))}
                          maxLength={2}
                        />
                      </div>
                    </div>

                    {shipping && (
                      <div className={`p-4 rounded-xl ${shipping.free ? 'bg-green-50 border border-green-200' : 'bg-amber-50 border border-amber-200'}`}>
                        <div className="flex items-center gap-2">
                          <Truck className={`w-5 h-5 ${shipping.free ? 'text-green-600' : 'text-amber-600'}`} />
                          <span className={`font-medium ${shipping.free ? 'text-green-700' : 'text-amber-700'}`}>
                            {shipping.free 
                              ? '🎉 Frete Grátis!' 
                              : `Frete: R$ ${shipping.cost.toFixed(2)}`
                            }
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          Entrega em {shipping.days} dias úteis
                        </p>
                      </div>
                    )}

                    <Button 
                      onClick={() => setStep(2)}
                      className="w-full bg-amber-500 hover:bg-amber-600 text-black font-bold py-6"
                      disabled={!address.cep || !address.street || !address.number || !address.city}
                    >
                      Continuar para Pagamento
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 2: Payment */}
            {step === 2 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <CreditCard className="w-5 h-5 text-amber-500" />
                      Forma de Pagamento
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                      {/* PIX */}
                      <div className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'pix' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="pix" id="pix" />
                          <Label htmlFor="pix" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                              <Smartphone className="w-5 h-5 text-green-600" />
                            </div>
                            <div>
                              <p className="font-semibold">PIX</p>
                              <p className="text-sm text-gray-500">Aprovação imediata</p>
                            </div>
                            <span className="ml-auto text-green-600 font-bold text-sm">5% OFF</span>
                          </Label>
                        </div>
                      </div>

                      {/* Credit Card */}
                      <div className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'cartao' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="cartao" id="cartao" />
                          <Label htmlFor="cartao" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <CreditCard className="w-5 h-5 text-blue-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Cartão de Crédito</p>
                              <p className="text-sm text-gray-500">Até 10x sem juros</p>
                            </div>
                          </Label>
                        </div>

                        {paymentMethod === 'cartao' && (
                          <div className="mt-4 space-y-4 pl-10">
                            <div>
                              <Label>Número do Cartão</Label>
                              <Input
                                placeholder="0000 0000 0000 0000"
                                value={cardData.number}
                                onChange={(e) => setCardData(prev => ({ ...prev, number: e.target.value }))}
                              />
                            </div>
                            <div>
                              <Label>Nome no Cartão</Label>
                              <Input
                                placeholder="Como está no cartão"
                                value={cardData.name}
                                onChange={(e) => setCardData(prev => ({ ...prev, name: e.target.value }))}
                              />
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              <div>
                                <Label>Validade</Label>
                                <Input
                                  placeholder="MM/AA"
                                  value={cardData.expiry}
                                  onChange={(e) => setCardData(prev => ({ ...prev, expiry: e.target.value }))}
                                />
                              </div>
                              <div>
                                <Label>CVV</Label>
                                <Input
                                  placeholder="123"
                                  value={cardData.cvv}
                                  onChange={(e) => setCardData(prev => ({ ...prev, cvv: e.target.value }))}
                                  maxLength={4}
                                />
                              </div>
                              <div>
                                <Label>Parcelas</Label>
                                <select 
                                  className="w-full h-10 border rounded-md px-3"
                                  value={cardData.installments}
                                  onChange={(e) => setCardData(prev => ({ ...prev, installments: e.target.value }))}
                                >
                                  {Array.from({ length: 10 }).map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                      {i + 1}x de R$ {(total / (i + 1)).toFixed(2)}
                                    </option>
                                  ))}
                                </select>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Boleto */}
                      <div className={`border-2 rounded-xl p-4 cursor-pointer transition-colors ${
                        paymentMethod === 'boleto' ? 'border-amber-500 bg-amber-50' : 'border-gray-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <RadioGroupItem value="boleto" id="boleto" />
                          <Label htmlFor="boleto" className="flex items-center gap-3 cursor-pointer flex-1">
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-gray-600" />
                            </div>
                            <div>
                              <p className="font-semibold">Boleto Bancário</p>
                              <p className="text-sm text-gray-500">Vencimento em 3 dias</p>
                            </div>
                          </Label>
                        </div>
                      </div>
                    </RadioGroup>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(1)}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button 
                        onClick={() => setStep(3)}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                      >
                        Revisar Pedido
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {/* Step 3: Confirmation */}
            {step === 3 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <Card>
                  <CardHeader>
                    <CardTitle>Revisar Pedido</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Address Summary */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Endereço de Entrega</p>
                        <p className="text-sm text-gray-600">
                          {address.street}, {address.number}
                          {address.complement && ` - ${address.complement}`}
                        </p>
                        <p className="text-sm text-gray-600">
                          {address.neighborhood} - {address.city}/{address.state}
                        </p>
                        <p className="text-sm text-gray-600">CEP: {address.cep}</p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setStep(1)}
                        className="ml-auto"
                      >
                        Editar
                      </Button>
                    </div>

                    {/* Payment Summary */}
                    <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
                      <CreditCard className="w-5 h-5 text-gray-400 mt-0.5" />
                      <div>
                        <p className="font-medium">Forma de Pagamento</p>
                        <p className="text-sm text-gray-600">
                          {paymentMethod === 'pix' && 'PIX (5% de desconto)'}
                          {paymentMethod === 'cartao' && `Cartão de Crédito - ${cardData.installments}x`}
                          {paymentMethod === 'boleto' && 'Boleto Bancário'}
                        </p>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => setStep(2)}
                        className="ml-auto"
                      >
                        Editar
                      </Button>
                    </div>

                    {/* Items */}
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex gap-3 p-3 bg-gray-50 rounded-xl">
                          <div className="w-16 h-20 rounded-lg overflow-hidden bg-gray-200">
                            <img
                              src={item.product_image || 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=200'}
                              alt={item.product_name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium">{item.product_name}</p>
                            <p className="text-sm text-gray-500">
                              {item.size && `Tam: ${item.size}`}
                              {item.size && item.color && ' • '}
                              {item.color && `Cor: ${item.color}`}
                            </p>
                            <p className="text-sm text-gray-500">Qtd: {item.quantity}</p>
                          </div>
                          <p className="font-bold">R$ {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <Button 
                        variant="outline"
                        onClick={() => setStep(2)}
                        className="flex-1"
                      >
                        Voltar
                      </Button>
                      <Button 
                        onClick={handleSubmit}
                        className="flex-1 bg-amber-500 hover:bg-amber-600 text-black font-bold"
                        disabled={loading}
                      >
                        {loading ? 'Processando...' : 'Finalizar Pedido'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:sticky lg:top-32 h-fit">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-amber-500" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Cart Items Preview */}
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-sm">
                      <span className="bg-gray-100 px-2 py-0.5 rounded">{item.quantity}x</span>
                      <span className="flex-1 truncate">{item.product_name}</span>
                      <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Cupom de desconto"
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                  />
                  <Button variant="outline" onClick={applyCoupon}>
                    Aplicar
                  </Button>
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  
                  {paymentMethod === 'pix' && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Desconto PIX (5%)</span>
                      <span>- R$ {(subtotal * 0.05).toFixed(2)}</span>
                    </div>
                  )}
                  
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Frete</span>
                    <span className={shipping?.free ? 'text-green-600' : ''}>
                      {shipping?.free ? 'Grátis' : shipping ? `R$ ${shippingCost.toFixed(2)}` : '-'}
                    </span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-xl font-bold">
                    <span>Total</span>
                    <span className="text-amber-600">
                      R$ {(total - (paymentMethod === 'pix' ? subtotal * 0.05 : 0)).toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Security Info */}
                <div className="flex items-center gap-2 p-3 bg-green-50 rounded-xl text-sm">
                  <Lock className="w-4 h-4 text-green-600" />
                  <span className="text-green-700">Compra 100% segura e protegida</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}