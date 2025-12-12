const axios = require('axios');

/**
 * AlertsClient
 *
 * HTTP client wrapper around the Alertas service.
 * Provides convenience methods to fetch alerts from the remote
 * `alertas` service.
 *
 * Instance is exported as a singleton.
 */
class AlertsClient {
  /**
   * Create a new AlertsClient.
   *
   * Initializes an Axios instance configured to talk to the
   * `alertas` service. No parameters are required.
   */
  constructor() {
    this.api = axios.create({
      baseURL: 'http://alertas:3054',
      timeout: 3000,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  /**
   * Get alerts for today.
   *
   * Calls the `GET /api/v1/alerts/today` endpoint and returns the
   * parsed response payload.
   *
   * @returns {Promise<any>} Resolves with the response body from the alerts service.
   * @throws {Error} Throws a generic Error when the request fails; the
   *                 error message will prefer the remote response body
   *                 when available.
   */
  async getAlertsForToday() {
    try {
      const response = await this.api.get('/api/v1/alerts/today');
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener las alertas');
    }
  }

  async getAlertsAll() {
    try {
      const response = await this.api.get("/api/v1/alerts/all");
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data;
      throw new Error(errorMessage || 'Error al obtener las alertas');
    }
  }

  async getViajesCompletadosByDataRange(startDate, endDate) {
    try {
      const response = await this.api.get(`/api/v1/alerts/viajes`, {
        params: {
            startDate,
            endDate
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      throw new Error(errorMessage || 'Error al obtener las alertas de viajes completados por rango de fecha.');
    }
  }

  /**
   * Obtiene alertas de tipo 'congestion' dentro de un rango de fechas.
   * @param {string} startDate - Fecha de inicio (en formato ISO o similar).
   * @param {string} endDate - Fecha de fin (en formato ISO o similar).
   * @returns {Promise<any>} Datos de respuesta.
   */
  async getCongestionByDateRange(startDate, endDate) {
    try {
      const response = await this.api.get(`/api/v1/alerts/congestion`, {
        params: {
            startDate,
            endDate
        }
      });
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.error;
      throw new Error(errorMessage || 'Error al obtener las alertas de congestión por rango de fecha.');
    }
  }
}

module.exports = new AlertsClient();