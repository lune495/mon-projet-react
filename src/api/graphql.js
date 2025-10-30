import axios from 'axios';

const API_URL = 'https://www.chifaa.sn/pharma_back_test/graphql';

export const fetchCurrentUser = async () => {
  try {
    const response = await axios.post(API_URL, {
      query: `
        {
          users {
            id
            name
            email
          }
        }
      `
    });

    if (response.data.errors) {
      throw new Error(response.data.errors[0].message);
    }

    return response.data.data.users[0]; // Assuming we want the first user for now
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const logout = () => {
  // Supprimer le token d'authentification du localStorage
  localStorage.removeItem('authToken');
  // Vous pouvez ajouter d'autres actions de nettoyage ici
};