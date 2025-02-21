// components/SalesMap/SalesMap.jsx
import React, { useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import './SalesMap.css'; // Caso queira adicionar estilos personalizados

const SalesMap = () => {
  useEffect(() => {
    // Cria o mapa dentro do elemento com id "sales-map"
    const map = L.map('sales-map').setView([-5.79, -35.22], 8);

    // Adiciona a camada base do OpenStreetMap
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Dados de vendas (Cidade, Latitude, Longitude, Número de Vendas)
    const vendas = [
        { cidade: "Natal", lat: -5.79, lon: -35.22, vendas: 500 },
        { cidade: "Mossoró", lat: -5.11, lon: -37.3424, vendas: 300 },
        { cidade: "Caicó", lat: -6.4594, lon: -37.0902, vendas: 150 }
    ];

    // Cria bolhas no mapa para cada registro
    vendas.forEach(v => {
      L.circleMarker([v.lat, v.lon], {
        radius: v.vendas / 50, // Tamanho proporcional às vendas
        color: "red",
        fillColor: "rgba(255, 0, 0, 0.5)",
        fillOpacity: 0.6
      })
      .bindPopup(`<b>${v.cidade}</b><br>${v.vendas} vendas`)
      .addTo(map);
    });

    // Cleanup: remove o mapa quando o componente for desmontado
    return () => {
      map.remove();
    };
  }, []);

  return (
    <div>
      <h2>Distribuição Geografica de vendas</h2>
      <div id="sales-map" className="sales-map-container"></div>
    </div>
  );
};

export default SalesMap;
