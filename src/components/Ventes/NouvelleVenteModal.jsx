import React, { useState, useEffect } from 'react';
import { FaTrash } from 'react-icons/fa';
import auth from '../../api/auth';
import axios from 'axios';
import './NouvelleVenteModal.css';

const NouvelleVenteModal = ({ isOpen, onClose }) => {
  useEffect(() => {
    console.log('NouvelleVenteModal isOpen =', isOpen);
  }, [isOpen]);
  const [client, setClient] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [totalHT, setTotalHT] = useState(0);
  const [currentUser, setCurrentUser] = useState('');
  const [invoiceNumber] = useState(() => Math.floor(Math.random() * 9000000000000) + 1000000000000);

  useEffect(() => {
    // On va récupérer les informations de l'utilisateur via une requête GraphQL
    const fetchUserInfo = async () => {
      try {
        const token = auth.getToken();
        const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          params: {
            query: `{
              me {
                id
                name
              }
            }`
          }
        });
        
        if (response.data.data.me) {
          setCurrentUser(response.data.data.me.name);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des informations utilisateur:', error);
      }
    };
    
    fetchUserInfo();
  }, []);

  useEffect(() => {
    // Calculer le total HT
    const total = selectedProducts.reduce((sum, product) => {
      return sum + (product.prix_vente * product.quantity);
    }, 0);
    setTotalHT(total);
  }, [selectedProducts]);

  const handleSearchProduct = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }

    try {
      const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
        params: {
          query: `{
            produits(search: "${query}") {
              designation
              code
              pv
              id
              qte
              stock_pharma
              famille {
                nom
              }
            }
          }`
        }
      });

      const products = response.data.data.produits;
      setSearchResults(products || []);
    } catch (error) {
      console.error('Erreur lors de la recherche du produit:', error);
      setSearchResults([]);
    }
  };

  const handleAddProduct = (product) => {
    if (!selectedProducts.find(p => p.id === product.id)) {
      setSelectedProducts([...selectedProducts, {
        ...product,
        prix_vente: product.pv,
        quantity: 1,
        total: product.pv
      }]);
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const handleRemoveProduct = (productId) => {
    setSelectedProducts(selectedProducts.filter(p => p.id !== productId));
  };

  const handleQuantityChange = (productId, newQuantity) => {
    setSelectedProducts(selectedProducts.map(product => {
      if (product.id === productId) {
        const quantity = Math.min(Math.max(1, newQuantity), product.stock_pharma);
        return {
          ...product,
          quantity,
          total: quantity * product.prix_vente
        };
      }
      return product;
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = auth.getToken();
      const vente = {
        client,
        numero: invoiceNumber.toString(),
        montant_ht: totalHT,
        produits: selectedProducts.map(product => ({
          produit_id: product.id,
          qte: product.quantity,
          prix_vente: product.prix_vente
        }))
      };

      await axios.post('https://www.chifaa.sn/pharma_back_test/api/ventes', vente, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      onClose();
      // Recharger la liste des ventes
      window.location.reload();
    } catch (error) {
      console.error('Erreur lors de la création de la vente:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="nv-modal-overlay" onClick={onClose}>
      <div className="nv-modal-content" onClick={e => e.stopPropagation()}>
        <h2>Nouvelle vente</h2>
        <form onSubmit={handleSubmit}>
          <div className="modal-layout">
            <div className="info-section">
              <div className="form-group">
                <label htmlFor="client">Client :</label>
                <input
                  type="text"
                  id="client"
                  value={client}
                  onChange={(e) => setClient(e.target.value)}
                  placeholder="Nom du client"
                />
              </div>

              <div className="form-group">
                <label>Vendeur :</label>
                <input type="text" value={currentUser} disabled />
              </div>

              <div className="form-group">
                <label>Date :</label>
                <input type="text" value={new Date().toLocaleDateString()} disabled />
              </div>

              <div className="form-group">
                <label>N° facture :</label>
                <input type="text" value={invoiceNumber} disabled />
              </div>

              <div className="form-group" style={{ position: 'relative' }}>
                <label htmlFor="search">Rechercher un produit :</label>
                <input
                  type="text"
                  id="search"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    handleSearchProduct(e.target.value);
                  }}
                  placeholder="Rechercher un produit..."
                />
                {searchResults.length > 0 && (
                  <div className="search-results-container">
                    {searchResults.map((product) => (
                      <div key={product.id} className="search-result-item">
                        <div className="product-info">
                          <div className="product-name">{product.designation}</div>
                          <div className="product-details">
                            Code: {product.code} | Stock: {product.stock_pharma} | Prix: {product.pv.toLocaleString('fr-FR')} FCFA
                            {product.famille && <span> | Famille: {product.famille.nom}</span>}
                          </div>
                        </div>
                        <button
                          type="button"
                          className="add-product-btn"
                          onClick={() => handleAddProduct(product)}
                        >
                          +
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="info-block">
                💡 Vous pouvez aussi scanner le code-barres d'un produit pour l'ajouter automatiquement à la vente !
              </div>
            </div>

            <div className="products-section">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>NOM</th>
                    <th>QTÉ</th>
                    <th>P.UNITAIRE</th>
                    <th>TOTAL (FCFA)</th>
                    <th>ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedProducts.map((product) => (
                    <tr key={product.id}>
                      <td>{product.designation} - Stock : {product.stock_pharma}</td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          max={product.stock_pharma}
                          value={1}
                          onChange={(e) => {
                            const value = parseInt(e.target.value);
                            if (!isNaN(value) && value > 0) {
                              handleQuantityChange(product.id, value);
                            }
                          }}
                          onKeyPress={(e) => {
                            if (!/[0-9]/.test(e.key)) {
                              e.preventDefault();
                            }
                          }}
                          style={{ width: '80px' }}
                        />
                      </td>
                      <td>{product.prix_vente.toLocaleString('fr-FR')} FCFA</td>
                      <td>{(product.prix_vente * product.quantity).toLocaleString('fr-FR')} FCFA</td>
                      <td>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => handleRemoveProduct(product.id)}
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="total-section">
                <label>Montant total HT (FCFA) :</label>
                <input type="text" value={totalHT.toLocaleString('fr-FR')} disabled />
              </div>

              <div className="modal-actions">
                <button type="button" className="cancel-btn" onClick={onClose}>
                  Annuler
                </button>
                <button type="submit" className="submit-btn">
                  Valider la vente
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NouvelleVenteModal;