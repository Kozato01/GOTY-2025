import React from 'react';
import { CATEGORIES } from '../constants';

const CategoriesScreen: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn p-8 bg-[#100720]/90 backdrop-blur-sm border-2 border-violet-600/60 rounded-2xl shadow-2xl shadow-violet-500/20">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest bg-gradient-to-r from-violet-400 to-amber-400 text-transparent bg-clip-text">
          Categorias
        </h1>
        <p className="mt-2 text-lg text-slate-300">Confira todas as categorias e indicados de 2026.</p>
      </div>

      <div className="space-y-10">
        {CATEGORIES.map(category => (
          <div key={category.id} className="bg-[#0f0620]/70 p-6 rounded-lg border border-violet-800/50">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl sm:text-3xl font-bold text-violet-400">{category.name}</h2>
              <span className="text-sm px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/50">
                {category.points} pts
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {category.nominees.map(nominee => (
                <div
                  key={nominee.id}
                  className="group relative cursor-pointer rounded-lg overflow-hidden border-2 border-violet-900/40 hover:border-violet-400 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-violet-400/30"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-[#07030f]">
                    <img
                      src={nominee.imageUrl}
                      alt={nominee.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x400/100720/8b5cf6?text=Game';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <p className="text-white text-sm font-bold leading-tight line-clamp-2">
                      {nominee.title}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesScreen;
