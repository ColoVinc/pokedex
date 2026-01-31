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

const PokemonCard = ({ pokemon, onCardClick }) => {
  const types = pokemon.types.map(typeInfo => typeInfo.type.name);

  return (
    <div onClick={() => onCardClick(pokemon)} className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 ease-in-out p-4 flex flex-col items-center justify-between cursor-pointer">
      <div className="text-right w-full font-semibold text-gray-400">#{pokemon.id.toString().padStart(3, '0')}</div>
      <div className="rounded-lg p-2 w-36 h-36 flex items-center justify-center">
        <img src={pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default} alt={pokemon.name} className="w-32 h-32 object-contain" />
      </div>
      <h2 className="text-2xl font-bold capitalize mt-2 text-gray-800">{pokemon.name}</h2>
      <div className="flex gap-2 mt-2">
        {types.map(type => (
          <span key={type} className={`${typeColors[type] || 'bg-gray-400'} text-white text-xs font-semibold px-3 py-1 rounded-full`}>
            {type}
          </span>
        ))}
      </div>
    </div>
  );
};

export default PokemonCard;