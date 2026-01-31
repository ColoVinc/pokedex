import React, { useState, useEffect } from 'react';
import { getTypeDetails } from '../api';

const typeColors = {
  normal: 'bg-gray-400',
  fire: 'bg-red-500',
  water: 'bg-blue-500',
  electric: 'bg-yellow-400',
  grass: 'bg-green-500',
  ice: 'bg-blue-200',
  fighting: 'bg-red-700',
  poison: 'bg-purple-500',
  ground: 'bg-yellow-600',
  flying: 'bg-indigo-400',
  psychic: 'bg-pink-500',
  bug: 'bg-green-700',
  rock: 'bg-yellow-700',
  ghost: 'bg-purple-700',
  dragon: 'bg-indigo-700',
  dark: 'bg-gray-800',
  steel: 'bg-gray-500',
  fairy: 'bg-pink-300',
};

const Stat = ({ name, value }) => (
    <div className="flex justify-between items-center w-full">
        <span className="w-1/3 text-sm font-medium text-gray-600 capitalize">{name}</span>
        <span className="w-1/6 text-right font-semibold">{value}</span>
        <div className="w-1/2 bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${Math.min(value, 100)}%` }}></div>
        </div>
    </div>
);


const PokemonDetailModal = ({ pokemon, onClose }) => {
  const [weaknesses, setWeaknesses] = useState([]);
  const [loadingWeaknesses, setLoadingWeaknesses] = useState(true);

  useEffect(() => {
    if (!pokemon) return;

    const fetchWeaknesses = async () => {
      try {
        setLoadingWeaknesses(true);
        const types = pokemon.types.map(t => t.type.name);
        const typeDetails = await Promise.all(types.map(t => getTypeDetails(t)));

        const damageRelations = {
          double_damage_from: new Set(),
          half_damage_to: new Set(),
          no_damage_to: new Set(),
        };

        typeDetails.forEach(detail => {
          detail.damage_relations.double_damage_from.forEach(t => damageRelations.double_damage_from.add(t.name));
          detail.damage_relations.half_damage_from.forEach(t => damageRelations.half_damage_to.add(t.name));
          detail.damage_relations.no_damage_from.forEach(t => damageRelations.no_damage_to.add(t.name));
        });

        const finalWeaknesses = [...damageRelations.double_damage_from].filter(
          type => !damageRelations.half_damage_to.has(type) && !damageRelations.no_damage_to.has(type)
        );

        setWeaknesses(finalWeaknesses);
      } catch (error) {
        console.error("Failed to fetch weaknesses", error);
        setWeaknesses([]);
      } finally {
        setLoadingWeaknesses(false);
      }
    };

    fetchWeaknesses();
  }, [pokemon]);

  if (!pokemon) return null;

  const types = pokemon.types.map(typeInfo => typeInfo.type.name);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 relative max-w-2xl w-full max-h-full overflow-y-auto" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-600 hover:text-gray-900 text-3xl font-bold">
          &times;
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex flex-col items-center">
            <img src={pokemon.sprites.versions['generation-v']['black-white'].animated.front_default || pokemon.sprites.other['official-artwork'].front_default} alt={pokemon.name} className="w-[8rem] h-[8rem]" />
            <h2 className="text-3xl font-bold capitalize mt-4">{pokemon.name}</h2>
            <span className="text-gray-500 font-semibold">#{pokemon.id.toString().padStart(3, '0')}</span>
            <div className="flex gap-2 mt-2">
              {types.map(type => (
                <span key={type} className={`${typeColors[type] || 'bg-gray-400'} text-white text-sm font-semibold px-3 py-1 rounded-full`}>
                  {type}
                </span>
              ))}
            </div>
             <div className="text-center mt-4 grid grid-cols-2 gap-4">
                <div>
                    <h3 className="font-bold text-gray-600">Height</h3>
                    <p>{pokemon.height / 10} m</p>
                </div>
                <div>
                    <h3 className="font-bold text-gray-600">Weight</h3>
                    <p>{pokemon.weight / 10} kg</p>
                </div>
            </div>
          </div>
          
          <div className="flex flex-col justify-start">
            <div>
              <h3 className="text-xl font-bold mb-2">Stats</h3>
              <div className="space-y-2">
                {pokemon.stats.map(stat => (
                    <Stat key={stat.stat.name} name={stat.stat.name} value={stat.base_stat} />
                ))}
              </div>
            </div>
            
            <div className="mt-4">
                <h3 className="text-xl font-bold mb-2">Weaknesses</h3>
                {loadingWeaknesses ? <p>Loading weaknesses...</p> : (
                    <div className="flex flex-wrap gap-2">
                        {weaknesses.length > 0 ? weaknesses.map(type => (
                             <span key={type} className={`${typeColors[type] || 'bg-gray-400'} text-white text-xs font-semibold px-2.5 py-0.5 rounded-full`}>
                                {type}
                            </span>
                        )) : <p>No specific weaknesses.</p>}
                    </div>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokemonDetailModal;

// End file