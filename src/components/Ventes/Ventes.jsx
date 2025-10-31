import React, { useState, useEffect } from 'react';
import axios from 'axios';
import auth from '../../api/auth';
import './Ventes.css';
import { FaEye, FaFilePdf, FaTimes, FaPlus } from 'react-icons/fa';
import Toast from '../UI/Toast';
import VenteDetailModal from './VenteDetailModal';
import NouvelleVenteModal from './NouvelleVenteModal';

const Ventes = () => {
  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [toastMessage, setToastMessage] = useState('');
  const [selectedVente, setSelectedVente] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [confirmAnnulationId, setConfirmAnnulationId] = useState(null);
  const [isNewSaleModalOpen, setIsNewSaleModalOpen] = useState(false);

  const fetchVentes = async (page, count) => {
    try {
      setLoading(true);
      const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
        params: {
          query: `{
            ventespaginated(count:${count},page:${page}){
              metadata{
                current_page
                per_page
                total
              }
              data{
                id
                statut
                nom_complet
                paye
                client{
                  nom_complet
                }
                numero
                montant_ht
                montant_ttc
                remise_total
                montant_avec_remise
                created_at
                vente_produits{
                  qte
                  remise
                  montant_remise
                  total
                  produit{
                    designation
                  }
                }
                montant
                qte
                user {
                  id
                  name
                }
              }
            }
          }`
        }
      });
      
      const { data, metadata } = response.data.data.ventespaginated;
      setVentes(data);
      const calculatedTotalPages = Math.ceil(metadata.total / metadata.per_page);
      setTotalPages(calculatedTotalPages);
      setLoading(false);
    } catch (error) {
      console.error('Erreur lors du chargement des ventes:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVentes(currentPage, itemsPerPage);
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  const handleItemsPerPageChange = (event) => {
    const newItemsPerPage = parseInt(event.target.value);
    setItemsPerPage(newItemsPerPage);
    setCurrentPage(1);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR');
  };

  const formatHeure = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const formatMontant = (montant) => {
    return montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' });
  };

  const getStatutClass = (paye) => {
    return paye ? 'statut-valide' : 'statut-en-cours';
  };

  // Handler pour confirmer l'annulation
  const handleConfirmAnnulation = () => {
    if (confirmAnnulationId) {
      const token = auth.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      axios.post(`https://www.chifaa.sn/pharma_back_test/api/venteannulee/${confirmAnnulationId}`, {}, { headers })
        .then(() => {
          setToastMessage('Vente annulée avec succès');
          setVentes(prev => prev.map(v => v.id === confirmAnnulationId ? { ...v, statut: true } : v));
        })
        .catch(() => {
          setToastMessage("Erreur lors de l'annulation de la vente");
        })
        .finally(() => {
          setConfirmAnnulationId(null);
        });
    }
  };

  // Handler pour annuler la confirmation
  const handleCancelAnnulation = () => {
    setConfirmAnnulationId(null);
  };

  return (
    <div className="ventes-container">
      <div className="ventes-header">
        <h1 className="ventes-title">Liste des Ventes</h1>
        <button 
          className="new-sale-btn"
          onClick={() => {
            console.log('Ouverture modal nouvelle vente');
            setIsNewSaleModalOpen(true);
          }}
        >
          <FaPlus /> Nouvelle vente
        </button>
      </div>
      
      <div className="table-container">
        {loading ? (
          <div className="loading-sketch">Chargement...</div>
        ) : (
          <div>
            <table className="ventes-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Ref</th>
                  <th>Heure</th>
                  <th>Client</th>
                  <th>Total</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {ventes.map((vente) => (
                  <tr key={vente.id} className={vente.statut === true ? 'vente-annulee' : ''}>
                    <td>{formatDate(vente.created_at)}</td>
                    <td>{vente.numero}</td>
                    <td>{formatHeure(vente.created_at)}</td>
                    <td>{vente.client?.nom_complet || '-'}</td>
                    <td>{formatMontant(vente.montant_avec_remise || vente.montant_ttc)}</td>
                    <td>
                      <span className={`statut ${getStatutClass(vente.paye)}`}>
                        {vente.paye ? 'Payé' : 'Non payé'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="icon-btn view-icon"
                          title="Voir les détails"
                          aria-label={`Voir les détails de la vente ${vente.numero}`}
                          onClick={async () => {
                            try {
                              const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
                                params: {
                                  query: `{
                                    ventes(reference: "${vente.numero}") {
                                      id
                                      created_at
                                      montant_ht
                                      montant_ttc
                                      remise_total
                                      montant_avec_remise
                                      user {
                                        id
                                        name
                                      }
                                      vente_produits {
                                        qte
                                        remise
                                        montant_remise
                                        total
                                        produit {
                                          designation
                                        }
                                      }
                                    }
                                  }`
                                }
                              });
                              const venteDetail = response.data.data.ventes[0];
                              setSelectedVente(venteDetail);
                              setIsDetailModalOpen(true);
                            } catch (error) {
                              console.error('Erreur lors du chargement des détails:', error);
                              setToastMessage('Erreur lors du chargement des détails de la vente');
                            }
                          }}
                        >
                          <FaEye />
                        </button>

                        <button
                          className={`icon-btn cancel-icon${vente.statut === true ? ' disabled' : ''}`}
                          title="Annuler la vente"
                          disabled={vente.statut === true}
                          aria-label={`Annuler la vente ${vente.numero}`}
                          onClick={() => {
                            if (vente.statut === false) {
                              setConfirmAnnulationId(vente.id);
                            }
                          }}
                        >
                          <FaTimes />
                        </button>

                        <button
                          className="icon-btn pdf-icon"
                          title="Générer PDF"
                          aria-label={`Générer PDF de la vente ${vente.numero}`}
                          onClick={() => window.open(`https://www.chifaa.sn/pharma_back_test/vente/generate-pdf/${vente.id}`, '_blank')}
                        >
                          <FaFilePdf />
                        </button>
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

      {/* Toast notification */}
      <Toast message={toastMessage} onClose={() => setToastMessage('')} />
      <div
        className={`custom-confirm-overlay ${confirmAnnulationId ? 'show' : ''}`}
        onClick={handleCancelAnnulation}
      >
        <div className="custom-toast-confirm" onClick={e => e.stopPropagation()}>
          <div className="custom-toast-content">
            <span>Voulez-vous vraiment annuler cette vente ?</span>
            <div className="custom-toast-actions">
              <button className="btn-confirm" onClick={handleConfirmAnnulation}>Oui</button>
              <button className="btn-cancel" onClick={handleCancelAnnulation}>Non</button>
            </div>
          </div>
        </div>
      </div>

      <VenteDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedVente(null);
        }}
        venteData={selectedVente}
      />

      <NouvelleVenteModal
        isOpen={isNewSaleModalOpen}
        onClose={() => setIsNewSaleModalOpen(false)}
      />
    </div>
  );
};

export default Ventes;