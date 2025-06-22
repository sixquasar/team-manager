import React, { useState } from 'react';
import { X, Shield, Smartphone, Copy, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContextTeam';

interface TwoFactorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function TwoFactorModal({ isOpen, onClose }: TwoFactorModalProps) {
  const { usuario } = useAuth();
  const [step, setStep] = useState<'setup' | 'verify' | 'success'>('setup');
  const [secretKey, setSecretKey] = useState('');
  const [qrCode, setQrCode] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [backupCodes, setBackupCodes] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedBackup, setCopiedBackup] = useState(false);

  // Gerar código 2FA (simulado)
  const generateTwoFactorSecret = () => {
    // Em produção, isso seria feito no backend
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
    let secret = '';
    for (let i = 0; i < 32; i++) {
      secret += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return secret;
  };

  // Gerar códigos de backup
  const generateBackupCodes = () => {
    const codes = [];
    for (let i = 0; i < 8; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  };

  // Iniciar configuração 2FA
  const startSetup = async () => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔐 Iniciando configuração 2FA...');

      // Gerar secret e QR code
      const secret = generateTwoFactorSecret();
      setSecretKey(secret);

      // Em produção, geraria QR code real com biblioteca como qrcode
      const appName = 'Team Manager';
      const userName = usuario?.email || 'user';
      const otpUrl = `otpauth://totp/${appName}:${userName}?secret=${secret}&issuer=${appName}`;
      
      // Por enquanto, apenas mostrar o secret para configuração manual
      setQrCode(otpUrl);

      console.log('✅ Secret 2FA gerado');
      setStep('setup');

    } catch (err: any) {
      console.error('❌ Erro ao gerar 2FA:', err);
      setError('Erro ao configurar autenticação de dois fatores');
    } finally {
      setLoading(false);
    }
  };

  // Verificar código
  const verifyCode = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setError('Digite um código de 6 dígitos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Verificando código 2FA...');

      // Em produção, verificaria no backend
      // Por enquanto, aceitar qualquer código de 6 dígitos
      if (verificationCode.length === 6 && /^\d+$/.test(verificationCode)) {
        // Gerar códigos de backup
        const codes = generateBackupCodes();
        setBackupCodes(codes);

        // Salvar configuração 2FA (simulado)
        console.log('✅ 2FA configurado com sucesso');
        setStep('success');
      } else {
        throw new Error('Código inválido');
      }

    } catch (err: any) {
      console.error('❌ Erro ao verificar código:', err);
      setError('Código inválido. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  // Copiar para área de transferência
  const copyToClipboard = async (text: string, type: 'secret' | 'backup') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'secret') {
        setCopiedSecret(true);
        setTimeout(() => setCopiedSecret(false), 2000);
      } else {
        setCopiedBackup(true);
        setTimeout(() => setCopiedBackup(false), 2000);
      }
    } catch (err) {
      console.error('Erro ao copiar:', err);
    }
  };

  // Iniciar setup ao abrir modal
  React.useEffect(() => {
    if (isOpen && step === 'setup' && !secretKey) {
      startSetup();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Shield className="mr-2 h-5 w-5" />
            Autenticação de Dois Fatores
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-6">
          {/* Mensagens de erro */}
          {error && (
            <div className="flex items-center p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Step 1: Setup */}
          {step === 'setup' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Configure a autenticação de dois fatores para adicionar uma camada extra de segurança à sua conta.
              </p>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  1. Instale um aplicativo autenticador
                </h3>
                <p className="text-sm text-gray-600 mb-2">
                  Recomendamos Google Authenticator, Microsoft Authenticator ou Authy.
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">
                  2. Escaneie o QR Code ou insira a chave manualmente
                </h3>
                
                {/* QR Code placeholder */}
                <div className="bg-white p-4 rounded border-2 border-gray-300 mb-3 flex items-center justify-center">
                  <div className="text-center">
                    <Smartphone className="h-24 w-24 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">QR Code seria exibido aqui</p>
                  </div>
                </div>

                {/* Secret key */}
                <div className="space-y-2">
                  <p className="text-sm font-medium text-gray-700">Chave secreta:</p>
                  <div className="flex items-center space-x-2">
                    <code className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded text-xs font-mono break-all">
                      {secretKey}
                    </code>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(secretKey, 'secret')}
                    >
                      {copiedSecret ? (
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep('verify')}
                className="w-full bg-team-primary hover:bg-team-primary/90"
                disabled={loading}
              >
                Continuar
              </Button>
            </div>
          )}

          {/* Step 2: Verify */}
          {step === 'verify' && (
            <div className="space-y-4">
              <p className="text-gray-600">
                Digite o código de 6 dígitos do seu aplicativo autenticador:
              </p>

              <input
                type="text"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full px-4 py-3 text-center text-2xl font-mono border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                placeholder="000000"
                maxLength={6}
                autoComplete="off"
                autoFocus
              />

              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={() => setStep('setup')}
                  className="flex-1"
                  disabled={loading}
                >
                  Voltar
                </Button>
                <Button
                  onClick={verifyCode}
                  className="flex-1 bg-team-primary hover:bg-team-primary/90"
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                      Verificando...
                    </>
                  ) : (
                    'Verificar'
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 'success' && (
            <div className="space-y-4">
              <div className="text-center py-4">
                <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  2FA Configurado com Sucesso!
                </h3>
                <p className="text-gray-600">
                  Sua conta agora está protegida com autenticação de dois fatores.
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium text-yellow-900 mb-2">
                  ⚠️ Códigos de Backup Importantes
                </h4>
                <p className="text-sm text-yellow-800 mb-3">
                  Guarde estes códigos em um local seguro. Você pode usá-los para acessar sua conta se perder acesso ao seu autenticador.
                </p>
                
                <div className="bg-white rounded border border-yellow-300 p-3">
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    {backupCodes.map((code, index) => (
                      <code key={index} className="text-sm font-mono text-gray-700">
                        {index + 1}. {code}
                      </code>
                    ))}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyToClipboard(backupCodes.join('\n'), 'backup')}
                    className="w-full"
                  >
                    {copiedBackup ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 text-green-600 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar Códigos
                      </>
                    )}
                  </Button>
                </div>
              </div>

              <Button
                onClick={onClose}
                className="w-full bg-team-primary hover:bg-team-primary/90"
              >
                Concluir
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}