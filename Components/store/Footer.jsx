import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { Instagram, Facebook, Twitter, Mail, Phone, MapPin, CreditCard, Truck, ShieldCheck, RotateCcw } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      {/* Benefits */}
      <div className="border-b border-gray-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <Truck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Frete Grátis</p>
                <p className="text-xs text-gray-400">Acima de R$ 299</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <CreditCard className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Até 10x</p>
                <p className="text-xs text-gray-400">Sem juros</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Site Seguro</p>
                <p className="text-xs text-gray-400">Compra protegida</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center">
                <RotateCcw className="w-6 h-6 text-amber-500" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">Troca Fácil</p>
                <p className="text-xs text-gray-400">Até 30 dias</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                <span className="text-black font-black text-xl">L</span>
              </div>
              <span className="font-black text-xl text-white tracking-tight">
                LUXE<span className="text-amber-500">STYLE</span>
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Moda que inspira. Qualidade que transforma. Estilo que define você.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-amber-500 hover:text-black transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-white mb-4">Institucional</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Sobre Nós</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Trabalhe Conosco</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Política de Privacidade</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Termos de Uso</a></li>
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-bold text-white mb-4">Ajuda</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Central de Ajuda</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Como Comprar</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Formas de Pagamento</a></li>
              <li><a href="#" className="text-sm hover:text-amber-500 transition-colors">Trocas e Devoluções</a></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-white mb-4">Contato</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-sm">
                <Phone className="w-4 h-4 text-amber-500" />
                (11) 99999-9999
              </li>
              <li className="flex items-center gap-2 text-sm">
                <Mail className="w-4 h-4 text-amber-500" />
                contato@luxestyle.com
              </li>
              <li className="flex items-start gap-2 text-sm">
                <MapPin className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                São Paulo, SP - Brasil
              </li>
            </ul>
            
            <div className="mt-6">
              <p className="text-sm font-medium text-white mb-2">Newsletter</p>
              <div className="flex gap-2">
                <Input 
                  placeholder="Seu e-mail" 
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                />
                <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold px-4">
                  OK
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © 2025 LuxeStyle. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-4">
            <img src="https://upload.wikimedia.org/wikipedia/commons/0/04/Visa.svg" alt="Visa" className="h-6 opacity-50" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/a/a4/Mastercard_2019_logo.svg" alt="Mastercard" className="h-6 opacity-50" />
            <img src="https://upload.wikimedia.org/wikipedia/commons/f/fa/American_Express_logo_%282018%29.svg" alt="Amex" className="h-6 opacity-50" />
          </div>
        </div>
      </div>
    </footer>
  );
}