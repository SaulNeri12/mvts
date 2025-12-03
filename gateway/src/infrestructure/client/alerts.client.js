const axios = require('axios');

export default class  AlertsClient {
  constructor(){
    this.api = axios.create({
      baseURL: 'http://localhost:3001',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * REST Client to retrieve all alerts.
   * @returns all alerts
   */
  async getAllAlerts(){
    try 
    {
      const response = await this.api.get('url', {});
      return response.data; 
    } 
    catch (error)
    {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener las alertas');
    }
  }

}