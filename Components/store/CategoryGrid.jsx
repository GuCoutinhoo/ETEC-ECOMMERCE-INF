import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from "@/utils";
import { motion } from 'framer-motion';
import { ArrowUpRight } from 'lucide-react';

const categories = [
  {
    name: 'Camisetas',
    slug: 'camisetas',
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
    count: 48
  },
  {
    name: 'Vestidos',
    slug: 'vestidos',
    image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600',
    count: 36
  },
  {
    name: 'Calças',
    slug: 'calças',
    image: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600',
    count: 42
  },
  {
    name: 'Casacos',
    slug: 'casacos',
    image: 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600',
    count: 28
  },
  {
    name: 'Acessórios',
    slug: 'acessórios',
    image: 'https://images.unsplash.com/photo-1611923134239-b9be5816e23c?w=600',
    count: 64
  },
  {
    name: 'Sapatos',
    slug: 'sapatos',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
    count: 52
  }
];

export default function CategoryGrid() {
  return (
    <section className="py-20 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <span className="text-amber-600 font-semibold text-sm uppercase tracking-wider">
            Explore
          </span>
          <h2 className="text-4xl font-black text-gray-900 mt-2">
            Categorias
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <motion.div
              key={category.slug}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Link
                to={createPageUrl(`Catalog?category=${category.slug}`)}
                className="group relative block aspect-[4/5] rounded-2xl overflow-hidden"
              >
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="flex items-end justify-between">
                    <div>
                      <h3 className="text-xl md:text-2xl font-bold text-white">
                        {category.name}
                      </h3>
                      <p className="text-amber-400 text-sm mt-1">
                        {category.count} produtos
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center transform translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-300">
                      <ArrowUpRight className="w-5 h-5 text-black" />
                    </div>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}