import React from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const stats = [
    { title: 'Utilisateurs', value: '1,234', trend: '+12%' },
    { title: 'Revenus', value: '50,000€', trend: '+8%' },
    { title: 'Commandes', value: '456', trend: '+15%' },
    { title: 'Visites', value: '10,567', trend: '+20%' }
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">Tableau de bord</h1>
      
      <div className="stats-grid">
        {stats.map((stat, index) => (
          <div key={index} className="stat-card">
            <div className="stat-header">{stat.title}</div>
            <div className="stat-value">{stat.value}</div>
            <div className="stat-trend">{stat.trend}</div>
          </div>
        ))}
      </div>

      <div className="charts-container">
        <div className="chart-card">
          <h3 className="chart-title">Activité mensuelle</h3>
          <div className="sketch-chart">
            <div className="bar" style={{ height: '60%' }}></div>
            <div className="bar" style={{ height: '80%' }}></div>
            <div className="bar" style={{ height: '40%' }}></div>
            <div className="bar" style={{ height: '90%' }}></div>
            <div className="bar" style={{ height: '70%' }}></div>
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Répartition</h3>
          <div className="sketch-pie">
            <div className="pie-segment"></div>
          </div>
        </div>
      </div>

      <div className="recent-activity">
        <h3 className="section-title">Activité récente</h3>
        <div className="activity-list">
          <div className="activity-item">
            <span className="activity-dot"></span>
            <div className="activity-content">
              <p>Nouvelle commande #12345</p>
              <small>Il y a 5 minutes</small>
            </div>
          </div>
          <div className="activity-item">
            <span className="activity-dot"></span>
            <div className="activity-content">
              <p>Nouveau client inscrit</p>
              <small>Il y a 15 minutes</small>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;