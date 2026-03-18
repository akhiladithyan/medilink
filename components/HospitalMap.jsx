'use client'
import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import L from 'leaflet'

delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

export default function HospitalMap({ hospitals }) {
  const defaultCenter = [12.6208, 80.1945]

  return (
    <MapContainer center={defaultCenter} zoom={14} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; OpenStreetMap contributors'
      />
      {hospitals.map(h => (
        h.latitude && h.longitude && (
          <Marker key={h.id} position={[h.latitude, h.longitude]}>
            <Popup>
              <strong>{h.name}</strong><br />
              {h.address}
            </Popup>
          </Marker>
        )
      ))}
    </MapContainer>
  )
}