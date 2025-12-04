const axios = require('axios');
class  AlertsClient {
  constructor(){
    this.api = axios.create({
      baseURL: 'http://alertas:3054',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  async getAlertsForToday(){
    try 
    {
      const response = await this.api.get('/api/v1/alerts/today');
      return response.data; 
    } 
    catch (error)
    {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener las alertas');
    }
  }
}

module.exports = new AlertsClient();