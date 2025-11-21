// Authentication Service

import { parseLoginResponse } from '@/services/adapters';
import { apiClient } from '@/services/api';
import type { LoginResponse } from '@/services/types';
// import { Device } from '@capacitor/device';

const USE_MOCK = process.env.VITE_USE_MOCK_API === 'true';

export const authService = {
  /**
   * Login user
   */
   
//   async getPlatform(): Promise<string> {
//     try {
//       const info = await Device.getInfo();
//       return info.platform;
//     } catch (error) {
//       console.error('Erro ao capturar plataforma', error);
//       return 'unknown';
//     }
//   }, 
   
  async login(usuario: string, senha: string): Promise<LoginResponse> {
    try {

    //   const plataforma = (await this.getPlatform()).toUpperCase();

      const response = await apiClient.post<{codigo: string, descricao: string}>('/rest/login', {
        usuario,
        senha,
      },
      {
        // headers: {
        //   'X-Dispositivo': plataforma
        // }
      }
      );
      
      // Parse String response into typed object
      const loginData = parseLoginResponse(response.data.descricao);
      
      // Store token and user type
      localStorage.setItem('auth_token', response.data.descricao);

      const responsePapel = await apiClient.get<string[]>('/rest/listarPapeis');
      const papeis = responsePapel?.data || [];
      const papeisValidos = ['AL', 'AD', 'RE'];
      const possuiPapelValido = papeis.some(papel => papeisValidos.includes(papel.trim().toUpperCase()));
      
      if (!possuiPapelValido) {
        throw new Error('Erro ao fazer login. Tente novamente.');
      }

      const codigoPapel = responsePapel?.data?.filter(x => x != 'cd').filter(x => x != 'pr')[0] || 'AL';

      const mapTipoUsuario = (codigo: string): 'ALUNO' | 'RESPONSAVEL' => {
        switch (codigo.trim().toUpperCase()) {
          case 'AD':
          case 'RE':
            return 'RESPONSAVEL';
          case 'AL':
          default:
            return 'ALUNO';
        }
      };

      const tipo = mapTipoUsuario(codigoPapel);
      localStorage.setItem('tipo_usuario', tipo);
      
      return {
        ...loginData,
        tipoUsuario: tipo,
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        throw new Error('Usuário ou senha incorretos');
      }
      throw new Error('Erro ao fazer login. Tente novamente.');
    }
  },

  /**
   * Recover password
   */
  async recoverPassword(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<boolean>('/rest/recuperaSenha', {
        email,
      });
      return response.data;
    } catch (error) {
      // Always return generic message for security
      return true;
    }
  },

  async getKey(): Promise<string> {
    try {
      const response = await apiClient.get<{key: string}>('/rest/key');
      return response.data.key;
    } catch (error: any) {
      throw new Error('Erro ao buscar key. Tente novamente.');
    }
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('tipo_usuario');
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('auth_token');
  },

  /**
   * Get stored user type
   */
  getUserType(): 'ALUNO' | 'RESPONSAVEL' | null {
    return localStorage.getItem('tipo_usuario') as 'ALUNO' | 'RESPONSAVEL' | null;
  },
};