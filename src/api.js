import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

export const getPokemonList = async (limit = 20, offset = 0) => {
  try {
    const response = await axios.get(`${BASE_URL}/pokemon`, {
      params: {
        limit,
        offset,
      },
    });
    return response.data.results;
  } catch (error) {
    console.error("Error fetching Pokémon list:", error);
    throw error;
  }
};

export const getPokemonDetails = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error)
  {
    console.error(`Error fetching details for Pokémon at ${url}:`, error);
    throw error;
  }
};

export const getTypeDetails = async (typeName) => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${typeName}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for type ${typeName}:`, error);
    throw error;
  }
};

export const getGenerations = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/generation`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching generations:", error);
    throw error;
  }
};

export const getTypes = async () => {
  try {
    const response = await axios.get(`${BASE_URL}/type`);
    return response.data.results;
  } catch (error) {
    console.error("Error fetching types:", error);
    throw error;
  }
};

export const getPokemonByGeneration = async (generationId) => {
  try {
    const response = await axios.get(`${BASE_URL}/generation/${generationId}`);
    return response.data.pokemon_species.map(p => ({ name: p.name, url: p.url.replace('-species', '') }));
  } catch (error) {
    console.error(`Error fetching Pokémon for generation ${generationId}:`, error);
    throw error;
  }
};

export const getPokemonByType = async (type) => {
  try {
    const response = await axios.get(`${BASE_URL}/type/${type}`);
    return response.data.pokemon.map(p => p.pokemon);
  } catch (error) {
    console.error(`Error fetching Pokémon for type ${type}:`, error);
    throw error;
  }
};
