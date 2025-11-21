// Message Service

import { normalizeMensagem } from './adapters';
import { apiClient } from './api';
import type { Mensagem } from './types';

const USE_MOCK = process.env.VITE_USE_MOCK_API === 'true';

const API_BASE_URL = process.env.VITE_API_BASE_URL || 'https://beta3.christus.com.br:8082';

export const messageService = {
  /**
   * Fetch all messages
   */
  async fetchMessages(): Promise<Mensagem[]> {
    //if (USE_MOCK) {
    //  return mockMessageService.fetchMessages();
    //}
    try {
      const response = await apiClient.get('/rest/mensagem');
      const messages = Array.isArray(response.data) ? response.data : [];
      return messages.map(normalizeMensagem);
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw new Error('Erro ao carregar avisos');
    }
  },

  /**
   * Mark message as read
   */
  async markAsRead(codigoMensagem: string): Promise<void> {
    //if (USE_MOCK) {
    //  return mockMessageService.markAsRead(codigoMensagem);
    //}
    try {
      await apiClient.put(`/rest/mensagem/${codigoMensagem}`, {
        lida: 'S',
      });
    } catch (error) {
      console.error('Error marking message as read:', error);
      throw new Error('Erro ao marcar como lida');
    }
  },

  async onMarkAsUnread(codigoMensagem: string): Promise<void> {
    try {
      await apiClient.put(`/rest/mensagem/${codigoMensagem}`, {
        lida: 'N',
      });
    } catch (error) {
      console.error('Error marking message as unread:', error);
      throw new Error('Erro ao marcar como não lida');
    }
  },

  /**
   * Delete message
   */
  async deleteMessage(codigoMensagem: string): Promise<void> {
    //if (USE_MOCK) {
    //  return mockMessageService.deleteMessage(codigoMensagem);
    //}
    try {
      await apiClient.delete(`/rest/mensagem/${codigoMensagem}`);
    } catch (error) {
      console.error('Error deleting message:', error);
      throw new Error('Erro ao deletar mensagem');
    }
  },

  /**
   * Download attachment
   */
  async downloadAttachment(codigoMensagem: string, tipoAcao: string): Promise<Blob> {
    try {
      const response = await apiClient.get(
        `/rest/mensagem/${codigoMensagem}/anexo?acao=${tipoAcao}`,
        { responseType: 'blob' }
      );
      return response.data;
    } catch (error) {
      console.error('Error downloading attachment:', error);
      throw new Error('Erro ao baixar anexo');
    }
  },
};