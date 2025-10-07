// service/ApiService.js
export class ApiService {
  constructor(baseUrl) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Evita doble slash
  }

  async request(method, endpoint, data = {}, params = {}) {
    const url = new URL(`${this.baseUrl}/${endpoint}`);
    if (["GET", "DELETE"].includes(method)) {
      Object.keys(params).forEach(key => url.searchParams.append(key, params[key]));
    }

    const options = {
      method,
      headers: { "Content-Type": "application/json" }
    };

    if (["POST", "PUT"].includes(method)) {
      options.body = JSON.stringify(data);
    }

    const response = await fetch(url, options);
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Error ${response.status}: ${text}`);
    }
    return await response.json();
  }

  get(endpoint, params = {}) { return this.request("GET", endpoint, {}, params); }
  post(endpoint, data = {}) { return this.request("POST", endpoint, data); }
  put(endpoint, data = {}) { return this.request("PUT", endpoint, data); }
  delete(endpoint, params = {}) { return this.request("DELETE", endpoint, {}, params); }
}
