import React, { useEffect, useState } from 'react';
import './VenteDetailModal.css';
import { FaTimes } from 'react-icons/fa';

const VenteDetailModal = ({ isOpen, onClose, venteData }) => {
  const [isActive, setIsActive] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Petit délai pour permettre l'animation
      setTimeout(() => setIsActive(true), 50);
    } else {
      setIsActive(false);
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen || !venteData) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  const formatMontant = (montant) => {
    return montant?.toLocaleString('fr-FR', { style: 'currency', currency: 'XOF' }) || '0 XOF';
  };

  const handleClose = () => {
    setIsActive(false);
    // Attendre la fin de l'animation avant de fermer
    setTimeout(onClose, 300);
  };

  return (
    <div className={`modal-overlay ${isActive ? 'active' : ''}`} onClick={handleClose}>
      <div className={`modal-content ${isActive ? 'active' : ''}`} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Détail de la vente</h2>
          <button className="close-btn" onClick={handleClose}>
            <FaTimes />
          </button>
        </div>
        
        <div className="modal-body">
          <div className="vente-info">
            <div className="info-group">
              <label>Date</label>
              <span>{formatDate(venteData.created_at)}</span>
            </div>
            <div className="info-group">
              <label>Vendeur</label>
              <span>{venteData.user?.name || '-'}</span>
            </div>
            <div className="info-group">
              <label>Nombre de produits</label>
              <span>{venteData.vente_produits?.length || 0}</span>
            </div>
            <div className="info-group">
              <label>Montant HT</label>
              <span>{formatMontant(venteData.montant_ht)}</span>
            </div>
            <div className="info-group">
              <label>Remise total (%)</label>
              <span>{venteData.remise_total || 0}%</span>
            </div>
            <div className="info-group">
              <label>Montant avec remise</label>
              <span>{formatMontant(venteData.montant_avec_remise)}</span>
            </div>
            <div className="info-group">
              <label>Montant TTC</label>
              <span>{formatMontant(venteData.montant_ttc)}</span>
            </div>
          </div>

          <div className="produits-section">
            <h3>Liste des produits</h3>
            <div className="table-container">
              <table className="produits-table">
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Quantité</th>
                    <th>Remise (%)</th>
                    <th>Montant remise</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {venteData.vente_produits?.map((produit, index) => (
                    <tr key={index}>
                      <td>{produit.produit?.designation || '-'}</td>
                      <td>{produit.qte}</td>
                      <td>{produit.remise || 0}%</td>
                      <td>{formatMontant(produit.montant_remise)}</td>
                      <td>{formatMontant(produit.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VenteDetailModal;