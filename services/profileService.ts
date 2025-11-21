// Profile Service

import { normalizePerfil } from './adapters';
import { apiClient } from './api';
import type { ChangePasswordPayload, Perfil } from './types';

const USE_MOCK = process.env.VITE_USE_MOCK_API === 'true';

export const profileService = {
  /**
   * Fetch user profile
   */
  async fetchProfile(): Promise<Perfil> {
    try {
      const response = await apiClient.get('/rest/perfil');
      return normalizePerfil(response.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw new Error('Erro ao carregar perfil');
    }
  },

  /**
   * Change password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<string> {
    try {
      const response = await apiClient.put<string>('/rest/perfil/senha', payload);
      localStorage.setItem('auth_token', response.data);
      return '';
    } catch (error: any) {
      if (error.response?.status === 406) {
        throw new Error('Senha atual incorreta ou nova senha inválida');
      }
      throw new Error('Erro ao alterar senha');
    }
  },

  /**
   * Fetch user photo
   */
  async fetchPhoto(): Promise<Blob> {
    try {
      const response = await apiClient.get('/rest/foto', {
        responseType: 'blob',
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching photo:', error);
      throw new Error('Erro ao carregar foto');
    }
  },

  /**
   * Upload user photo
   */
  async uploadPhoto(base64Image: string): Promise<void> {
    
    try {
      await apiClient.put('/rest/foto', {imagem: base64Image});
    } catch (error: any) {
      if (error.response?.status === 413) {
        throw new Error('Foto muito grande. Máximo 5MB');
      }
      throw new Error('Erro ao enviar foto');
    }
  },

  /**
   * Delete user photo
   */
  async deletePhoto(): Promise<void> {
    try {
      await apiClient.delete('/rest/foto');
    } catch (error) {
      throw new Error('Erro ao excluir foto');
    }
  },

  async fetchColorScheme(): Promise<boolean> {
    try {
      const response = await apiClient.get('/rest/tema/mob', {skipAuthRedirect: true} as any);
      return response.data;
    } catch (error) {
      throw new Error('Erro ao carregar tema');
    }
  },

  async updateColorScheme(temaMob: boolean): Promise<void> {
    try {
      await apiClient.put('/rest/tema/salvar/mob', temaMob);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
      throw new Error('Erro ao salvar tema');
    }
  },

  async updateColorSchemeTest(temaMob: boolean): Promise<void> {
    return;
  }
};