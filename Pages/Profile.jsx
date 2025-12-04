import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  User, Mail, Phone, MapPin, Lock, Camera, 
  Package, Heart, CreditCard, Settings, LogOut, Check
} from 'lucide-react';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
    cpf: '',
    birth_date: '',
    address: {
      cep: '',
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: ''
    }
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        const isAuth = await base44.auth.isAuthenticated();
        if (isAuth) {
          const userData = await base44.auth.me();
          setUser(userData);
          setFormData({
            full_name: userData.full_name || '',
            phone: userData.phone || '',
            cpf: userData.cpf || '',
            birth_date: userData.birth_date || '',
            address: userData.address || {
              cep: '',
              street: '',
              number: '',
              complement: '',
              neighborhood: '',
              city: '',
              state: ''
            }
          });
        } else {
          base44.auth.redirectToLogin();
        }
      } catch (e) {
        base44.auth.redirectToLogin();
      }
    };
    loadUser();
  }, []);

  const updateProfileMutation = useMutation({
    mutationFn: async (data) => {
      await base44.auth.updateMe(data);
      return data;
    },
    onSuccess: (data) => {
      setUser(prev => ({ ...prev, ...data }));
      setIsEditing(false);
      toast.success('Perfil atualizado com sucesso!');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateProfileMutation.mutate(formData);
  };

  const fetchCep = async (cep) => {
    if (cep.length !== 8) return;
    
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await response.json();
      
      if (!data.erro) {
        setFormData(prev => ({
          ...prev,
          address: {
            ...prev.address,
            street: data.logradouro,
            neighborhood: data.bairro,
            city: data.localidade,
            state: data.uf
          }
        }));
      }
    } catch (error) {
      console.error('Error fetching CEP:', error);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const menuItems = [
    { icon: Package, label: 'Meus Pedidos', href: 'Orders' },
    { icon: Heart, label: 'Lista de Desejos', href: 'Wishlist' },
    { icon: CreditCard, label: 'Formas de Pagamento', href: null },
    { icon: Settings, label: 'Configurações', href: null },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="relative inline-block">
                    <Avatar className="w-24 h-24 mx-auto">
                      <AvatarFallback className="bg-amber-500 text-black text-2xl font-bold">
                        {user.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <button className="absolute bottom-0 right-0 w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white">
                      <Camera className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-lg mt-4">{user.full_name || 'Usuário'}</h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>

                <Separator className="my-4" />

                <nav className="space-y-1">
                  {menuItems.map((item) => (
                    <div key={item.label}>
                      {item.href ? (
                        <Link 
                          to={createPageUrl(item.href)}
                          className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{item.label}</span>
                        </Link>
                      ) : (
                        <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-gray-100 transition-colors text-left">
                          <item.icon className="w-5 h-5 text-gray-400" />
                          <span className="font-medium">{item.label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </nav>

                <Separator className="my-4" />

                <button 
                  onClick={() => base44.auth.logout()}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-red-50 text-red-600 transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="font-medium">Sair</span>
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Personal Info */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5 text-amber-500" />
                  Dados Pessoais
                </CardTitle>
                <Button 
                  variant={isEditing ? 'outline' : 'default'}
                  onClick={() => setIsEditing(!isEditing)}
                  className={isEditing ? '' : 'bg-amber-500 hover:bg-amber-600 text-black'}
                >
                  {isEditing ? 'Cancelar' : 'Editar'}
                </Button>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <Label>Nome Completo</Label>
                      <Input
                        value={formData.full_name}
                        onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>E-mail</Label>
                      <Input
                        value={user.email}
                        disabled
                        className="mt-1 bg-gray-50"
                      />
                    </div>
                    <div>
                      <Label>Telefone</Label>
                      <Input
                        value={formData.phone}
                        onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="(00) 00000-0000"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>CPF</Label>
                      <Input
                        value={formData.cpf}
                        onChange={(e) => setFormData(prev => ({ ...prev, cpf: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="000.000.000-00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Data de Nascimento</Label>
                      <Input
                        type="date"
                        value={formData.birth_date}
                        onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                        disabled={!isEditing}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {isEditing && (
                    <Button 
                      type="submit"
                      className="bg-amber-500 hover:bg-amber-600 text-black"
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? 'Salvando...' : (
                        <>
                          <Check className="w-4 h-4 mr-2" />
                          Salvar Alterações
                        </>
                      )}
                    </Button>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-amber-500" />
                  Endereço Principal
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <Label>CEP</Label>
                    <Input
                      value={formData.address.cep}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 8);
                        setFormData(prev => ({ 
                          ...prev, 
                          address: { ...prev.address, cep: value } 
                        }));
                        if (value.length === 8) fetchCep(value);
                      }}
                      disabled={!isEditing}
                      placeholder="00000-000"
                      className="mt-1"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label>Rua</Label>
                    <Input
                      value={formData.address.street}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, street: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Número</Label>
                    <Input
                      value={formData.address.number}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, number: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Complemento</Label>
                    <Input
                      value={formData.address.complement}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, complement: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      placeholder="Apt, bloco, etc"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bairro</Label>
                    <Input
                      value={formData.address.neighborhood}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, neighborhood: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Cidade</Label>
                    <Input
                      value={formData.address.city}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, city: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Estado</Label>
                    <Input
                      value={formData.address.state}
                      onChange={(e) => setFormData(prev => ({ 
                        ...prev, 
                        address: { ...prev.address, state: e.target.value } 
                      }))}
                      disabled={!isEditing}
                      maxLength={2}
                      className="mt-1"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-amber-500" />
                  Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                  <div>
                    <p className="font-medium">Alterar Senha</p>
                    <p className="text-sm text-gray-500">Mantenha sua conta segura</p>
                  </div>
                  <Button variant="outline">
                    Alterar
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}