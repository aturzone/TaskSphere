
const API_BASE_URL = 'http://localhost:3001/api';

class ApiService {
  private async request(url: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_BASE_URL}${url}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Generic CRUD operations
  async getAll(entityType: string) {
    return this.request(`/${entityType}`);
  }

  async getById(entityType: string, id: string) {
    return this.request(`/${entityType}/${id}`);
  }

  async create(entityType: string, data: any) {
    return this.request(`/${entityType}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(entityType: string, id: string, data: any) {
    return this.request(`/${entityType}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async delete(entityType: string, id: string) {
    return this.request(`/${entityType}/${id}`, {
      method: 'DELETE',
    });
  }

  // Backup operations
  async exportData() {
    return this.request('/backup/export');
  }

  async importData(data: any) {
    return this.request('/backup/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async clearAllData() {
    return this.request('/backup/clear', {
      method: 'DELETE',
    });
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const apiService = new ApiService();
