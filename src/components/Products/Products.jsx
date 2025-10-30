import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Products.css';
import { FaPlus } from 'react-icons/fa';
import ProductModal from './ProductModal';
import Toast from '../UI/Toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [selectedProductData, setSelectedProductData] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  const fetchProducts = async (page, count) => {
    try {
      setLoading(true);
      const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
        params: {
          query: `{
            produitspaginated(count:${count},page:${page}){
              metadata{
                current_page
                per_page
                total
              }
              data{
                id
                code
                designation
                stock_pharma
                stock_magasin
                pa
                pv
                famille{
                  nom
                }
              }
            }
          }`
        }
      });
        
        const { data, metadata } = response.data.data.produitspaginated;
        setProducts(data);
        // Calculer le nombre total de pages en divisant le total par le nombre d'éléments par page
        const calculatedTotalPages = Math.ceil(metadata.total / metadata.per_page);
        setTotalPages(calculatedTotalPages);
        setLoading(false);
      } catch (error) {
        console.error('Erreur lors du chargement des produits:', error);
        setLoading(false);
      }
    };

    useEffect(() => {
    fetchProducts(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1); // Retour à la première page lors du changement de nombre d'items
  };

  return (
    <div className="products-container">
      <h1 className="products-title">Liste des Produits</h1>
      <button
        className="new-product-btn"
        title="Nouveau produit"
        onClick={() => {
          setSelectedProductId(null);
          setSelectedProductData(null);
          setIsModalOpen(true);
        }}
      >
        <FaPlus />
      </button>
      
      <div className="table-container">
        {loading ? (
          <div className="loading-sketch">Chargement...</div>
        ) : (
          <div>
            <table className="products-table">
              <thead>
                <tr>
                  <th>Code</th>
                  <th>Désignation</th>
                  <th>Stock Magasin</th>
                  <th>Stock Pharmacie</th>
                  <th>Prix Achat</th>
                  <th>Prix Vente</th>
                  <th>Famille</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>{product.code}</td>
                    <td>{product.designation}</td>
                    <td>{product.stock_magasin}</td>
                    <td>{product.stock_pharma}</td>
                    <td>{product.pa?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</td>
                    <td>{product.pv?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' })}</td>
                    <td>{product.famille?.nom || '-'}</td>
                    <td>
                      <div className="action-buttons">
                      <button 
                        className="edit-btn" 
                        onClick={async () => {
                          try {
                            const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
                              params: {
                                query: `{
                                  produits(id: ${product.id}) {
                                    id
                                    image
                                    code
                                    designation
                                    description
                                    qte
                                    pa
                                    pv
                                    stock_pharma
                                    stock_magasin
                                    stock_initial_pharma
                                    stock_initial_magasin
                                    limite
                                    famille_id
                                    famille {
                                      id
                                      nom
                                    }
                                  }
                                }`
                              }
                            });
                            const productData = response.data.data.produits[0];
                            setSelectedProductId(product.id);
                            setSelectedProductData(productData);
                            setIsModalOpen(true);
                          } catch (error) {
                            console.error('Erreur lors du chargement du produit:', error);
                          }
                        }}
                      >
                        Modifier
                      </button>
                      <button className="delete-btn">Supprimer</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="pagination-container">
              <div className="items-per-page">
                <label>Éléments par page : </label>
                <select value={itemsPerPage} onChange={handleItemsPerPageChange}>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={30}>30</option>
                  <option value={50}>50</option>
                </select>
              </div>
              <div className="pagination">
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  ←
                </button>
                {[...Array(totalPages)].map((_, index) => {
                  const pageNumber = index + 1;
                  if (
                    pageNumber === 1 ||
                    pageNumber === totalPages ||
                    (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={pageNumber}
                        className={`pagination-btn ${currentPage === pageNumber ? 'active' : ''}`}
                        onClick={() => handlePageChange(pageNumber)}
                      >
                        {pageNumber}
                      </button>
                    );
                  } else if (
                    pageNumber === currentPage - 2 ||
                    pageNumber === currentPage + 2
                  ) {
                    return <span key={pageNumber} className="pagination-ellipsis">...</span>;
                  }
                  return null;
                })}
                <button
                  className="pagination-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  →
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      <ProductModal
        isOpen={isModalOpen}
        productId={selectedProductId}
        productData={selectedProductData}
        onClose={(wasUpdated) => {
          const wasCreate = selectedProductId == null;
          setIsModalOpen(false);
          setSelectedProductId(null);
          setSelectedProductData(null);
          if (wasUpdated) {
            // Recharger les données si le produit a été créé ou mis à jour
            fetchProducts(currentPage, itemsPerPage);
            setToastMessage(wasCreate ? 'Produit créé avec succès' : 'Produit mis à jour');
            // let Toast component handle auto-dismiss via onClose
            // clear existing message after duration handled in Toast
            
          }
        }}
      />

      {/* Toast notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
    </div>
  );
};

export default Products;