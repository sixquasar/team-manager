import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Settings as SettingsIcon,
  Bell,
  Shield,
  Palette,
  Globe,
  Moon,
  Sun,
  Monitor,
  Lock,
  Key,
  Mail,
  MessageSquare,
  Smartphone,
  Volume2,
  VolumeX,
  Eye,
  EyeOff,
  Download,
  Trash2,
  AlertTriangle,
  Save,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContextTeam';

export function Settings() {
  const { usuario, equipe } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // General Settings
    theme: 'system', // light, dark, system
    language: 'pt-BR',
    timezone: 'America/Sao_Paulo',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: true,
    soundEnabled: true,
    taskNotifications: true,
    projectNotifications: true,
    messageNotifications: true,
    
    // Privacy
    profileVisibility: 'team', // public, team, private
    showOnlineStatus: true,
    allowDirectMessages: true,
    
    // Advanced
    autoSave: true,
    dataCollection: true,
    crashReports: true
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    // TODO: Implementar salvamento no Supabase
    console.log('Salvando configurações:', settings);
  };

  const handleResetSettings = () => {
    // Resetar para configurações padrão
    setSettings({
      theme: 'system',
      language: 'pt-BR', 
      timezone: 'America/Sao_Paulo',
      emailNotifications: true,
      pushNotifications: true,
      soundEnabled: true,
      taskNotifications: true,
      projectNotifications: true,
      messageNotifications: true,
      profileVisibility: 'team',
      showOnlineStatus: true,
      allowDirectMessages: true,
      autoSave: true,
      dataCollection: true,
      crashReports: true
    });
  };

  const handleExportData = () => {
    // TODO: Implementar exportação de dados
    console.log('Exportando dados do usuário...');
  };

  const handleDeleteAccount = () => {
    // TODO: Implementar exclusão de conta
    if (confirm('Tem certeza que deseja excluir sua conta? Esta ação é irreversível.')) {
      console.log('Excluindo conta...');
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: SettingsIcon },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'privacy', label: 'Privacidade', icon: Shield },
    { id: 'advanced', label: 'Avançado', icon: Lock }
  ];

  const SettingRow = ({ icon, title, description, children }: any) => (
    <div className="flex items-center justify-between py-4 border-b border-gray-100 last:border-b-0">
      <div className="flex items-start space-x-3">
        {icon && <icon className="h-5 w-5 text-gray-400 mt-0.5" />}
        <div>
          <h4 className="text-sm font-medium text-gray-900">{title}</h4>
          {description && <p className="text-sm text-gray-500 mt-1">{description}</p>}
        </div>
      </div>
      <div className="flex-shrink-0">
        {children}
      </div>
    </div>
  );

  const ToggleSwitch = ({ enabled, onChange }: { enabled: boolean, onChange: (value: boolean) => void }) => (
    <button
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        enabled ? 'bg-team-primary' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas preferências e configurações da conta
          </p>
        </div>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleResetSettings}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Resetar
          </Button>
          <Button onClick={handleSaveSettings} className="bg-team-primary hover:bg-team-primary/90">
            <Save className="h-4 w-4 mr-2" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-0">
              <nav className="space-y-1">
                {tabs.map(tab => {
                  const IconComponent = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                        activeTab === tab.id ? 'bg-team-primary/10 text-team-primary border-r-2 border-team-primary' : 'text-gray-700'
                      }`}
                    >
                      <IconComponent className="h-5 w-5" />
                      <span className="font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          {/* General Settings */}
          {activeTab === 'general' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <SettingsIcon className="mr-2 h-5 w-5" />
                  Configurações Gerais
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <SettingRow
                    icon={Palette}
                    title="Tema"
                    description="Escolha entre tema claro, escuro ou automático"
                  >
                    <select
                      value={settings.theme}
                      onChange={(e) => handleSettingChange('theme', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                    >
                      <option value="light">Claro</option>
                      <option value="dark">Escuro</option>
                      <option value="system">Automático</option>
                    </select>
                  </SettingRow>

                  <SettingRow
                    icon={Globe}
                    title="Idioma"
                    description="Idioma da interface do sistema"
                  >
                    <select
                      value={settings.language}
                      onChange={(e) => handleSettingChange('language', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                    >
                      <option value="pt-BR">Português (Brasil)</option>
                      <option value="en-US">English (US)</option>
                      <option value="es-ES">Español</option>
                    </select>
                  </SettingRow>

                  <SettingRow
                    icon={Globe}
                    title="Fuso Horário"
                    description="Seu fuso horário local"
                  >
                    <select
                      value={settings.timezone}
                      onChange={(e) => handleSettingChange('timezone', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                    >
                      <option value="America/Sao_Paulo">São Paulo (UTC-3)</option>
                      <option value="America/New_York">New York (UTC-5)</option>
                      <option value="Europe/London">London (UTC+0)</option>
                    </select>
                  </SettingRow>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Notifications */}
          {activeTab === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Bell className="mr-2 h-5 w-5" />
                  Notificações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <SettingRow
                    icon={Mail}
                    title="Notificações por Email"
                    description="Receber notificações importantes por email"
                  >
                    <ToggleSwitch 
                      enabled={settings.emailNotifications}
                      onChange={(value) => handleSettingChange('emailNotifications', value)}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={Smartphone}
                    title="Notificações Push"
                    description="Receber notificações push no navegador"
                  >
                    <ToggleSwitch 
                      enabled={settings.pushNotifications}
                      onChange={(value) => handleSettingChange('pushNotifications', value)}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={settings.soundEnabled ? Volume2 : VolumeX}
                    title="Sons de Notificação"
                    description="Reproduzir sons quando receber notificações"
                  >
                    <ToggleSwitch 
                      enabled={settings.soundEnabled}
                      onChange={(value) => handleSettingChange('soundEnabled', value)}
                    />
                  </SettingRow>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Tipos de Notificação</h4>
                    
                    <SettingRow
                      title="Tarefas"
                      description="Notificações sobre tarefas atribuídas a você"
                    >
                      <ToggleSwitch 
                        enabled={settings.taskNotifications}
                        onChange={(value) => handleSettingChange('taskNotifications', value)}
                      />
                    </SettingRow>

                    <SettingRow
                      title="Projetos"
                      description="Atualizações sobre projetos que você participa"
                    >
                      <ToggleSwitch 
                        enabled={settings.projectNotifications}
                        onChange={(value) => handleSettingChange('projectNotifications', value)}
                      />
                    </SettingRow>

                    <SettingRow
                      icon={MessageSquare}
                      title="Mensagens"
                      description="Notificações de mensagens diretas e menções"
                    >
                      <ToggleSwitch 
                        enabled={settings.messageNotifications}
                        onChange={(value) => handleSettingChange('messageNotifications', value)}
                      />
                    </SettingRow>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Privacy */}
          {activeTab === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Shield className="mr-2 h-5 w-5" />
                  Privacidade e Segurança
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <SettingRow
                    icon={Eye}
                    title="Visibilidade do Perfil"
                    description="Quem pode ver seu perfil completo"
                  >
                    <select
                      value={settings.profileVisibility}
                      onChange={(e) => handleSettingChange('profileVisibility', e.target.value)}
                      className="px-3 py-1.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-team-primary focus:border-transparent"
                    >
                      <option value="public">Público</option>
                      <option value="team">Apenas Equipe</option>
                      <option value="private">Privado</option>
                    </select>
                  </SettingRow>

                  <SettingRow
                    title="Status Online"
                    description="Mostrar quando você está online"
                  >
                    <ToggleSwitch 
                      enabled={settings.showOnlineStatus}
                      onChange={(value) => handleSettingChange('showOnlineStatus', value)}
                    />
                  </SettingRow>

                  <SettingRow
                    icon={MessageSquare}
                    title="Mensagens Diretas"
                    description="Permitir que outros membros enviem mensagens diretas"
                  >
                    <ToggleSwitch 
                      enabled={settings.allowDirectMessages}
                      onChange={(value) => handleSettingChange('allowDirectMessages', value)}
                    />
                  </SettingRow>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Segurança</h4>
                    
                    <SettingRow
                      icon={Key}
                      title="Alterar Senha"
                      description="Atualize sua senha regularmente"
                    >
                      <Button variant="outline" size="sm">
                        Alterar
                      </Button>
                    </SettingRow>

                    <SettingRow
                      icon={Shield}
                      title="Autenticação de Dois Fatores"
                      description="Adicione uma camada extra de segurança"
                    >
                      <Button variant="outline" size="sm">
                        Configurar
                      </Button>
                    </SettingRow>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Advanced */}
          {activeTab === 'advanced' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="mr-2 h-5 w-5" />
                  Configurações Avançadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <SettingRow
                    title="Salvamento Automático"
                    description="Salvar automaticamente alterações em formulários"
                  >
                    <ToggleSwitch 
                      enabled={settings.autoSave}
                      onChange={(value) => handleSettingChange('autoSave', value)}
                    />
                  </SettingRow>

                  <SettingRow
                    title="Coleta de Dados"
                    description="Ajudar a melhorar o produto compartilhando dados de uso"
                  >
                    <ToggleSwitch 
                      enabled={settings.dataCollection}
                      onChange={(value) => handleSettingChange('dataCollection', value)}
                    />
                  </SettingRow>

                  <SettingRow
                    title="Relatórios de Erro"
                    description="Enviar automaticamente relatórios de erro"
                  >
                    <ToggleSwitch 
                      enabled={settings.crashReports}
                      onChange={(value) => handleSettingChange('crashReports', value)}
                    />
                  </SettingRow>

                  <div className="pt-4 border-t border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Dados da Conta</h4>
                    
                    <SettingRow
                      icon={Download}
                      title="Exportar Dados"
                      description="Baixar uma cópia de todos os seus dados"
                    >
                      <Button variant="outline" size="sm" onClick={handleExportData}>
                        Exportar
                      </Button>
                    </SettingRow>
                  </div>

                  <div className="pt-4 border-t border-red-200">
                    <h4 className="text-sm font-medium text-red-900 mb-3">Zona de Perigo</h4>
                    
                    <SettingRow
                      icon={Trash2}
                      title="Excluir Conta"
                      description="Remover permanentemente sua conta e todos os dados"
                    >
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleDeleteAccount}
                        className="border-red-300 text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Excluir
                      </Button>
                    </SettingRow>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}