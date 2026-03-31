import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { DataSourcesPage } from './pages/DataSourcesPage.tsx'
import { IndicatorsPage } from './pages/IndicatorsPage.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/data-sources" element={<DataSourcesPage />} />
        <Route path="/indicators" element={<IndicatorsPage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
