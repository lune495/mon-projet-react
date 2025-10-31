import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import './ProductModal.css';
import auth from '../../api/auth';

const ProductModal = ({ isOpen, onClose, productId, productData }) => {
  const [isActive, setIsActive] = useState(false);
  const [familles, setFamilles] = useState([]);
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    description: '',
    pa: 0,
    qte: 0,
    pv: 0,
    stock_pharma: 0,
    stock_magasin: 0,
    stock_initial_pharma: 0,
    stock_initial_magasin: 0,
    limite: 0,
    famille_id: '',
    image: ''
  });

  useEffect(() => {
    const fetchFamilles = async () => {
      try {
        const response = await axios.get('https://www.chifaa.sn/pharma_back_test/graphql', {
          params: {
            query: `{
              familles {
                id
                nom
              }
            }`
          }
        });
        setFamilles(response.data.data.familles);
      } catch (error) {
        console.error('Erreur lors du chargement des familles:', error);
      }
    };

    if (isOpen) {
      fetchFamilles();
    }
  }, [isOpen]);

  useEffect(() => {
    if (productData) {
      setFormData({
        code: productData.code || '',
        designation: productData.designation || '',
        description: productData.description || '',
        pa: productData.pa || 0,
        qte: productData.qte || 0,
        pv: productData.pv || 0,
        stock_pharma: productData.stock_pharma || 0,
        stock_magasin: productData.stock_magasin || 0,
        stock_initial_pharma: productData.stock_initial_pharma || 0,
        stock_initial_magasin: productData.stock_initial_magasin || 0,
        limite: productData.limite || 0,
        famille_id: productData.famille_id || '',
        image: productData.image || ''
      });
    }
  }, [productData]);

  const designationRef = useRef(null);

  useEffect(() => {
    if (isActive && designationRef.current) {
      designationRef.current.focus();
    }
  }, [isActive]);



  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Use REST endpoint for create/update. Build payload similar to the PHP example.
    try {
      const payload = {
        pa: String(formData.pa ?? 0),
        code: formData.code === '' ? 'null' : String(formData.code),
        designation: String(formData.designation ?? ''),
        qte: String(formData.qte ?? 0),
        pv: String(formData.pv ?? 0),
        famille_id: String(formData.famille_id ?? '')
      };

      // Only include id for update
      if (productId) {
        payload.id = String(productId);
      }

      const token = auth.getToken();
      const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {})
      };

      const response = await axios.post(
        'https://www.chifaa.sn/pharma_back_test/api/produits',
        payload,
        { headers }
      );

      // Accept 200/201 as success depending on API behavior
      if (response && (response.status === 200 || response.status === 201)) {
        onClose(true); // indicate successful create/update
      } else {
        console.error('Opération non réussie, réponse:', response && response.data ? response.data : response);
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour/création du produit via REST:', error);
    }
  };

  useEffect(() => {
    if (isOpen) {
      // Petit délai pour permettre au DOM de se mettre à jour
      setTimeout(() => setIsActive(true), 50);
    } else {
      setIsActive(false);
    }
  }, [isOpen]);

  const handleCloseModal = () => {
    setIsActive(false);
    // Attendre la fin de l'animation avant de fermer complètement
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className={`modal-overlay ${isActive ? 'active' : ''}`}>
      <div className={`modal-content ${isActive ? 'active' : ''}`}>
        <div className="modal-header">
          <h2>{productId ? 'Modifier le produit' : 'Créer un produit'}</h2>
          <button className="close-button" onClick={handleCloseModal}>&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="product-form">
            <div className="form-group">
              <label htmlFor="code">Code</label>
              <input
                type="text"
                id="code"
                name="code"
                value={formData.code}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="designation">Désignation</label>
              <input
                ref={designationRef}
                type="text"
                id="designation"
                name="designation"
                value={formData.designation}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="pa">Prix d'Achat</label>
                <input
                  type="number"
                  id="pa"
                  name="pa"
                  value={formData.pa}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="pv">Prix de Vente</label>
                <input
                  type="number"
                  id="pv"
                  name="pv"
                  value={formData.pv}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_pharma">Stock Pharmacie</label>
                <input
                  type="number"
                  id="stock_pharma"
                  name="stock_pharma"
                  value={formData.stock_pharma}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_magasin">Stock Magasin</label>
                <input
                  type="number"
                  id="stock_magasin"
                  name="stock_magasin"
                  value={formData.stock_magasin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="stock_initial_pharma">Stock Initial Pharmacie</label>
                <input
                  type="number"
                  id="stock_initial_pharma"
                  name="stock_initial_pharma"
                  value={formData.stock_initial_pharma}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock_initial_magasin">Stock Initial Magasin</label>
                <input
                  type="number"
                  id="stock_initial_magasin"
                  name="stock_initial_magasin"
                  value={formData.stock_initial_magasin}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="limite">Limite</label>
                <input
                  type="number"
                  id="limite"
                  name="limite"
                  value={formData.limite}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label htmlFor="famille_id">Famille</label>
                <select
                  className="select-sketch"
                  id="famille_id"
                  name="famille_id"
                  value={formData.famille_id}
                  onChange={handleChange}
                >
                  <option value="">Sélectionner une famille</option>
                  {familles.map(famille => (
                    <option key={famille.id} value={famille.id}>
                      {famille.nom}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="image">Image URL</label>
              <input
                type="text"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
              />
            </div>

            <div className="modal-footer">
              <button type="button" className="cancel-btn" onClick={() => onClose(false)}>
                Annuler
              </button>
              <button type="submit" className="save-btn">
                Enregistrer
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default ProductModal;