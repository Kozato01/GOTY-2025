import React from 'react';
import { CATEGORIES } from '../constants';

const CategoriesScreen: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto animate-fadeIn p-8 bg-black bg-opacity-30 backdrop-blur-md border border-gray-700 rounded-lg">
      <div className="text-center mb-10">
        <h1 className="text-4xl sm:text-6xl font-black uppercase tracking-widest text-shadow-sky">
          Categorias
        </h1>
        <p className="mt-2 text-lg text-gray-300">Confira todas as categorias e indicados de 2025.</p>
      </div>
      
      <div className="space-y-8">
        {CATEGORIES.map(category => (
          <div key={category.id} className="bg-black bg-opacity-30 p-4 sm:p-6 rounded-lg border border-gray-700">
            <h2 className="text-xl sm:text-2xl font-bold text-sky-400">{category.name}</h2>
            <p className="text-gray-400 mb-4">({category.points} pontos)</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-gray-200 list-disc list-inside">
              {category.options.map(option => <li key={option}>{option}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoriesScreen;