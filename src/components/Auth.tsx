import React, { useState, useEffect } from 'react';
import { auth } from '../lib/supabase';
import {
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  UserPlus,
  LogOut,
  AlertCircle,
  CheckCircle,
  Loader
} from 'lucide-react';

interface AuthProps {
  onAuthSuccess: (user: any) => void;
  onAuthError: (error: string) => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuthSuccess, onAuthError }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Verificar se já está logado
    const checkUser = async () => {
      const currentUser = await auth.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        onAuthSuccess(currentUser);
      }
    };

    checkUser();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user);
        onAuthSuccess(session.user);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [onAuthSuccess]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      if (isLogin) {
        const { error } = await auth.signIn(email, password);
        if (error) throw error;
        setMessage({ type: 'success', text: 'Login realizado com sucesso!' });
      } else {
        const { error } = await auth.signUp(email, password, name);
        if (error) throw error;
        setMessage({
          type: 'success',
          text: 'Conta criada com sucesso! Verifique seu email para confirmar.'
        });
      }
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      onAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const { error } = await auth.signOut();
      if (error) throw error;
      setUser(null);
      setMessage({ type: 'success', text: 'Logout realizado com sucesso!' });
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message });
      onAuthError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (user) {
    return (
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <User className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Bem-vindo, {user.user_metadata?.name || user.email}!
          </h2>
          <p className="text-gray-600 mb-6">
            Você está conectado e pronto para usar o Briefy
          </p>

          <button
            onClick={handleSignOut}
            disabled={isLoading}
            className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <Loader className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <LogOut className="w-4 h-4 mr-2" />
            )}
            Sair
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-blue-600" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isLogin ? 'Entrar no Briefy' : 'Criar Conta'}
        </h2>
        <p className="text-gray-600">
          {isLogin
            ? 'Acesse sua conta para continuar'
            : 'Crie sua conta para começar a usar o Briefy'
          }
        </p>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg flex items-center ${
          message.type === 'success'
            ? 'bg-green-50 text-green-800 border border-green-200'
            : 'bg-red-50 text-red-800 border border-red-200'
        }`}>
          {message.type === 'success' ? (
            <CheckCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
          )}
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Nome
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required={!isLogin}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Seu nome completo"
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="seu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            Senha
          </label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Sua senha"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
          {isLogin && (
            <p className="text-xs text-gray-500 mt-1">
              Mínimo 6 caracteres
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {isLoading ? (
            <Loader className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <>
              {isLogin ? (
                <LogIn className="w-4 h-4 mr-2" />
              ) : (
                <UserPlus className="w-4 h-4 mr-2" />
              )}
              {isLogin ? 'Entrar' : 'Criar Conta'}
            </>
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <button
          onClick={() => {
            setIsLogin(!isLogin);
            setMessage(null);
            setName('');
            setEmail('');
            setPassword('');
          }}
          className="text-blue-600 hover:text-blue-800 text-sm font-medium"
        >
          {isLogin
            ? 'Não tem uma conta? Crie agora'
            : 'Já tem uma conta? Entre aqui'
          }
        </button>
      </div>

      <div className="mt-8 p-4 bg-blue-50 rounded-lg">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">Sobre o Briefy</h3>
        <p className="text-sm text-blue-700">
          Sistema inteligente para extração de contexto de vídeos e geração automática de documentação completa para projetos de software.
        </p>
      </div>
    </div>
  );
};
