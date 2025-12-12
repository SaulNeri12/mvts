import axios from 'https://cdn.jsdelivr.net/npm/axios@1.6.0/+esm';

export default class  ReportsClient {
  constructor(baseURL = 'http://localhost:8080'){
    this.api = axios.create({
      baseURL,
      timeout: 15000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * REST Client to get all the notifications from the server.
   * @returns Array of notifications.
   */  
  async getAllNotifications()
  {
    try{
        const lights =  await this.api.get('/api/v1/alerts/today');
        return lights.data;
    }
    catch(error){
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al intentar obtener las notificaciones');
    }
  }

/**
   * Obtiene las congestiones en un rango de fechas.
   * Endpoint: /api/v1/alerts/congestion?startDate=Y-M-D&endDate=Y-M-D
   */  
  async getCongestions(startDate, endDate) {
    try {
        const response = await this.api.get('/api/v1/alerts/congestion', {
            params: { startDate, endDate }
        });
        // El backend devuelve { status: 'success', data: [...] }
        return response.data.data; 
    } catch(error) {
        console.error("Error fetching congestions:", error);
        throw new Error(error.response?.data?.error || 'Error al obtener reporte de congestiones');
    }
  }

  /**
   * Obtiene los viajes completados (entregas) en un rango de fechas.
   * Endpoint: /api/v1/alerts/viajes?startDate=Y-M-D&endDate=Y-M-D
   */
  async getCompletedTravels(startDate, endDate) {
    try {
        const response = await this.api.get('/api/v1/alerts/viajes', {
            params: { startDate, endDate }
        });
        return response.data.data;
    } catch(error) {
        console.error("Error fetching travels:", error);
        throw new Error(error.response?.data?.error || 'Error al obtener reporte de viajes');
    }
  }
}