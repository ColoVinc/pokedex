import { useState, useEffect, useRef } from 'react';
import { 
  getPokemonList, 
  getPokemonDetails, 
  getGenerations, 
  getTypes, 
  getPokemonByGeneration, 
  getPokemonByType 
} from './api';
import PokemonCard from './components/PokemonCard';
import PokemonDetailModal from './components/PokemonDetailModal';

const POKEMON_PER_PAGE = 20;
const ALL_POKEMON_LIMIT = 2000;

function App() {
  const [pokemonList, setPokemonList] = useState([]); // Holds the DETAILED Pokémon currently displayed
  const [allPokemonBasicInfo, setAllPokemonBasicInfo] = useState([]); // Holds ALL basic Pokémon {name, url}
  const [filteredBasicInfo, setFilteredBasicInfo] = useState([]); // Holds the FULL filtered list of basic info
  const [selectedPokemon, setSelectedPokemon] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState(null);
  const [offset, setOffset] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGeneration, setSelectedGeneration] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [generations, setGenerations] = useState([]);
  const [types, setTypes] = useState([]);

  // --- 1. Initial Data Fetch ---
  useEffect(() => {
    const fetchInitialGlobalData = async () => {
      setIsLoading(true);
      try {
        const [allPokemonRes, gensRes, typesRes] = await Promise.all([
          getPokemonList(ALL_POKEMON_LIMIT, 0),
          getGenerations(),
          getTypes()
        ]);
        setAllPokemonBasicInfo(allPokemonRes);
        setFilteredBasicInfo(allPokemonRes); // Initially, the filtered list is the full list
        setGenerations(gensRes);
        setTypes(typesRes);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch initial global data:", err);
        setError('Impossibile caricare i dati iniziali.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialGlobalData();
  }, []);

  // --- 2. Logic to Determine the Filtered List ---
  useEffect(() => {
    const applyFiltersAndSearch = async () => {
      if (!allPokemonBasicInfo.length) return; // Don't run until initial data is loaded

      let results = [...allPokemonBasicInfo];

      // Filter by Generation and Type
      if (selectedGeneration || selectedType) {
        const genPokemonNames = selectedGeneration ? new Set((await getPokemonByGeneration(selectedGeneration)).map(p => p.name)) : null;
        const typePokemonNames = selectedType ? new Set((await getPokemonByType(selectedType)).map(p => p.name)) : null;

        results = allPokemonBasicInfo.filter(p => {
          const inGen = genPokemonNames ? genPokemonNames.has(p.name) : true;
          const inType = typePokemonNames ? typePokemonNames.has(p.name) : true;
          return inGen && inType;
        });
      }

      // Filter by Search Term
      if (searchTerm) {
        results = results.filter(pokemon =>
          pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }
      
      setFilteredBasicInfo(results);
    };

    applyFiltersAndSearch();

  }, [searchTerm, selectedGeneration, selectedType, allPokemonBasicInfo]);

  // --- 3. Fetch and Display Pokémon from the Filtered List ---
  useEffect(() => {
    const fetchAndDisplay = async () => {
      // This effect runs when the filtered list changes, to display the first page.
      if (!filteredBasicInfo) return;
      
      setIsLoading(true);
      setError(null);
      setOffset(0);

      const firstPageOfFiltered = filteredBasicInfo.slice(0, POKEMON_PER_PAGE);
      try {
        const details = await Promise.all(firstPageOfFiltered.map(p => getPokemonDetails(p.url)));
        setPokemonList(details);
      } catch (err) {
        console.error("Error fetching details for filtered list:", err);
        setError("Errore nel caricamento dei Pokémon filtrati.");
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAndDisplay();
  }, [filteredBasicInfo]);
  
  // --- 4. Handle "Load More" ---
  useEffect(() => {
    if (!isLoadingMore || offset === 0) return; // Only run when loading more

    const fetchMore = async () => {
      try {
        const nextPageOfFiltered = filteredBasicInfo.slice(offset, offset + POKEMON_PER_PAGE);
        if (nextPageOfFiltered.length > 0) {
          const details = await Promise.all(nextPageOfFiltered.map(p => getPokemonDetails(p.url)));
          setPokemonList(prevList => [...prevList, ...details]);
        }
      } catch (err) {
        console.error("Error fetching more pokemon details:", err);
        setError("Errore nel caricamento di altri Pokémon.");
      } finally {
        setIsLoadingMore(false);
      }
    };

    fetchMore();
  }, [isLoadingMore]);

  const handleLoadMore = () => {
    if (!isLoading) {
      setOffset(prevOffset => prevOffset + POKEMON_PER_PAGE);
      setIsLoadingMore(true);
    }
  };

  // --- Event Handlers ---
  const handleCardClick = (pokemon) => setSelectedPokemon(pokemon);
  const handleCloseModal = () => setSelectedPokemon(null);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setSelectedGeneration('');
    setSelectedType('');
  };
  
  const handleGenerationChange = (event) => {
    setSelectedGeneration(event.target.value);
    setSearchTerm('');
  };
  
  const handleTypeChange = (event) => {
    setSelectedType(event.target.value);
    setSearchTerm('');
  };
  
  const showLoadMore = !isLoading && filteredBasicInfo && pokemonList.length < filteredBasicInfo.length;

  return (
    <div className="bg-gray-100 min-h-screen">
      <header className="bg-red-600 p-4 shadow-md sticky top-0 z-10">
        <div className='flex gap-4 items-center justify-center '>
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/items/poke-ball.png" alt="Pokeball" className="w-10 h-10" />
          <h1 className="text-3xl font-bold text-center text-white" style={{ fontFamily: "'Press Start 2P', cursive" }}>
            Pokédex
          </h1>
        </div>
      </header>
      <main className="p-4">

        <div className="flex flex-col md:flex-row gap-4 mb-8 justify-center">
          <input
            type="text"
            placeholder="Search Pokemon..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="p-2 border rounded-md shadow-sm w-full md:w-1/3"
          />
          <select value={selectedGeneration} onChange={handleGenerationChange} className="p-2 border rounded-md shadow-sm w-full md:w-1/4">
            <option value="">All generations</option>
            {generations.map(gen => (
              <option key={gen.name} value={gen.name} className='uppercase'>{gen.name.charAt(0).toUpperCase() + gen.name.slice(1).replace('-', ' ')}</option>
            ))}
          </select>
          <select value={selectedType} onChange={handleTypeChange} className="p-2 border rounded-md shadow-sm w-full md:w-1/4">
            <option value="">All types</option>
            {types.map(type => (
              <option key={type.name} value={type.name}>{type.name.charAt(0).toUpperCase() + type.name.slice(1)}</option>
            ))}
          </select>
        </div>

        {isLoading && pokemonList.length === 0 && <p className="text-center text-gray-700 text-2xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>Loading...</p>}
        {error && <p className="text-center text-red-500">{error}</p>}
        
        {!isLoading && pokemonList.length === 0 && (
          <p className="text-center text-gray-500 text-xl" style={{ fontFamily: "'Press Start 2P', cursive" }}>Nessun Pokémon trovato.</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
          {pokemonList.map(pokemon => (
            <PokemonCard key={pokemon.id} pokemon={pokemon} onCardClick={handleCardClick}  />
          ))}
        </div>

        {showLoadMore && (
          <div className="flex justify-center mt-8">
            <button onClick={handleLoadMore} disabled={isLoadingMore} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-full disabled:bg-gray-400">
              {isLoadingMore ? 'Loading...' : 'Load more'}
            </button>
          </div>
        )}
      </main>

      {selectedPokemon && (
        <PokemonDetailModal pokemon={selectedPokemon} onClose={handleCloseModal} />
      )}
    </div>
  );
}

// This is a test for github
// Questo è un test per il nuovo branch

export default App;
