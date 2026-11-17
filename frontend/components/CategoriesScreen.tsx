import React from 'react';
import { CATEGORIES } from '../constants';

const CategoriesScreen: React.FC = () => {
  return (
    <div className="w-full max-w-6xl mx-auto animate-fadeIn p-4 sm:p-8 bg-velvet/95 border border-velvet-line rounded-lg shadow-2xl shadow-black/40">
      <div className="text-center mb-10">
        <h1 className="font-display text-3xl sm:text-6xl uppercase tracking-wide text-paper">
          Categ<span className="text-gold">orias</span>
        </h1>
        <p className="mt-2 text-lg text-ash">Confira todas as categorias e indicados de 2026.</p>
      </div>

      <div className="space-y-10">
        {CATEGORIES.map(category => (
          <div key={category.id} className="bg-ink/70 p-4 sm:p-6 rounded-lg border border-velvet-line">
            <div className="flex flex-wrap justify-between items-center gap-2 mb-6">
              <h2 className="text-xl sm:text-3xl font-bold text-gold">{category.name}</h2>
              <span className="text-sm font-mono px-3 py-1 rounded-full bg-gold/10 text-gold border border-gold/40 shrink-0">
                {category.points} pts
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {category.nominees.map(nominee => (
                <div
                  key={nominee.id}
                  className="group relative cursor-pointer rounded-md overflow-hidden border-2 border-velvet-line hover:border-gold transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-gold/20"
                >
                  <div className="aspect-[3/4] relative overflow-hidden bg-ink">
                    <img
                      src={nominee.imageUrl}
                      alt={nominee.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/300x400/1a1420/c9a227?text=Game';
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent"></div>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black to-transparent">
                    <p className="text-paper text-sm font-bold leading-tight line-clamp-2">
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
