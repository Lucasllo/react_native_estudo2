// Login Page

import logoImg from '@/assets/images/icon.png';
import { Avatar, AvatarImage } from '@/components/ui2/avatar';
import { Button } from '@/components/ui2/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui2/card';
import { Input } from '@/components/ui2/input';
import { Label } from '@/components/ui2/label';
import { useAuth } from '@/contexts/AuthContext';
// import { pushNotificationService } from '@/services/pushNotificationService';
import { Loader2 } from 'lucide-react-native';
import { useState } from 'react';
import { View } from 'react-native';
// import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner-native';

export function LoginPage() {
//   const navigate = useNavigate();
  const { login, isAuthenticated } = useAuth();
  const [usuario, setUsuario] = useState('');
  const [senha, setSenha] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Redirect if already authenticated
  if (isAuthenticated) {
    // navigate('/');
    return null;
  }

  const handleSubmit = async () => {
    // e.preventDefault();
    
    if (!usuario || !senha) {
      toast.error('Preencha todos os campos');
      return;
    }

    setIsLoading(true);

    try {
      await login(usuario, senha);
      
      try {
        // await pushNotificationService.register();
      } catch (pushError) {
        console.warn('[Login] Push registration falhou:', pushError);
      }
      
      toast.success('Login realizado com sucesso!');
    //   navigate('/');
    } catch (error: any) {
      toast.error(error.message || 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  if (showForgotPassword) {
    return <ForgotPasswordView onBack={() => setShowForgotPassword(false)} />;
  }

  return (
    <View className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <View className="mb-4 flex justify-center self-center" >
          
            <Avatar className="w-full h-full" alt="logo">
              <AvatarImage src={logoImg}  />
            </Avatar>

            {/* <View className="w-16 h-16 rounded-full bg-primary flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-foreground">C</span>
            </View> */}
          </View>
          <CardTitle className="text-2xl">CHRISTUS ONLINE</CardTitle>
          <CardDescription>Entre com suas credenciais</CardDescription>
        </CardHeader>
        <CardContent>
          <View className="space-y-4">
            <View className="space-y-2">
              <Label >Usuário ou Email</Label>
              <Input
                id="usuario"
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                placeholder="Seu usuário"
                disabled={isLoading}
                autoComplete="username"
              />
            </View>
            <View className="space-y-2">
              <Label >Senha</Label>
              <Input
                id="senha"
                type="password"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="Sua senha"
                disabled={isLoading}
                autoComplete="current-password"
              />
            </View>
            <Button 
            //   type="submit" 
              className="w-full" 
              disabled={isLoading}
              onPress={handleSubmit}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Entrar
            </Button>
            <Button
            //   type="button"
              variant="ghost"
              className="w-full"
              onPress={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              Esqueci minha senha
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}

function ForgotPasswordView({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    // e.preventDefault();
    
    if (!email) {
      toast.error('Informe seu email');
      return;
    }

    setIsLoading(true);

    try {
      const { authService } = await import('@/services/authService');
      await authService.recoverPassword(email);
      toast.success('Se o email existir, você receberá instruções para recuperar sua senha');
      setTimeout(onBack, 2000);
    } catch (error) {
      toast.success('Se o email existir, você receberá instruções para recuperar sua senha');
      setTimeout(onBack, 2000);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <View className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Recuperar Senha</CardTitle>
        </CardHeader>
        <CardContent>
          <View className="space-y-4">
            <View className="space-y-2">
              <Label >Para Responsável digite o e-mail, para Aluno o n° de Matrícula</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                autoComplete="email"
              />
            </View>
            <Button className="w-full" disabled={isLoading} onPress={handleSubmit}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Enviar
            </Button>
            <Button
            //   type="button"
              variant="ghost"
              className="w-full"
              onPress={onBack}
              disabled={isLoading}
            >
              Voltar
            </Button>
          </View>
        </CardContent>
      </Card>
    </View>
  );
}