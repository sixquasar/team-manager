import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContextTeam';
import { supabase } from '@/lib/supabase';

export interface UserSettings {
  // General Settings
  theme: 'light' | 'dark' | 'system';
  language: string;
  timezone: string;
  
  // Notifications
  emailNotifications: boolean;
  pushNotifications: boolean;
  soundEnabled: boolean;
  taskNotifications: boolean;
  projectNotifications: boolean;
  messageNotifications: boolean;
  
  // Privacy
  profileVisibility: 'public' | 'team' | 'private';
  showOnlineStatus: boolean;
  allowDirectMessages: boolean;
  
  // Advanced
  autoSave: boolean;
  dataCollection: boolean;
  crashReports: boolean;
}

const defaultSettings: UserSettings = {
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
};

export function useSettings() {
  const { usuario } = useAuth();
  const [settings, setSettings] = useState<UserSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carregar configurações do banco
  useEffect(() => {
    if (!usuario?.id) {
      setLoading(false);
      return;
    }

    loadSettings();
  }, [usuario?.id]);

  // Aplicar tema quando mudar
  useEffect(() => {
    applyTheme(settings.theme);
  }, [settings.theme]);

  // Aplicar idioma quando mudar
  useEffect(() => {
    applyLanguage(settings.language);
  }, [settings.language]);

  const loadSettings = async () => {
    if (!usuario?.id) return;

    try {
      setLoading(true);
      console.log('🔍 SETTINGS: Carregando configurações do usuário:', usuario.id);

      const { data, error: supabaseError } = await supabase
        .from('configuracoes_usuario')
        .select('configuracoes')
        .eq('usuario_id', usuario.id)
        .single();

      if (supabaseError && supabaseError.code !== 'PGRST116') {
        console.error('❌ SETTINGS: Erro ao carregar:', supabaseError);
        throw new Error(supabaseError.message);
      }

      if (data?.configuracoes) {
        console.log('✅ SETTINGS: Configurações carregadas:', data.configuracoes);
        const loadedSettings = { ...defaultSettings, ...data.configuracoes };
        setSettings(loadedSettings);
        
        // Aplicar configurações carregadas
        applyTheme(loadedSettings.theme);
        applyLanguage(loadedSettings.language);
      } else {
        console.log('ℹ️ SETTINGS: Usando configurações padrão (primeira vez)');
        // Criar configurações padrão para o usuário
        await saveSettings(defaultSettings);
      }

    } catch (err: any) {
      console.error('❌ SETTINGS: Erro:', err);
      setError(err.message || 'Erro ao carregar configurações');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: UserSettings) => {
    if (!usuario?.id) {
      setError('Usuário não identificado');
      return false;
    }

    try {
      setSaving(true);
      setError(null);
      console.log('💾 SETTINGS: Salvando configurações:', newSettings);

      // Verificar se já existe registro
      const { data: existing } = await supabase
        .from('configuracoes_usuario')
        .select('id')
        .eq('usuario_id', usuario.id)
        .single();

      if (existing) {
        // Atualizar existente
        const { error: updateError } = await supabase
          .from('configuracoes_usuario')
          .update({
            configuracoes: newSettings,
            updated_at: new Date().toISOString()
          })
          .eq('usuario_id', usuario.id);

        if (updateError) throw updateError;
      } else {
        // Criar novo
        const { error: insertError } = await supabase
          .from('configuracoes_usuario')
          .insert({
            usuario_id: usuario.id,
            configuracoes: newSettings
          });

        if (insertError) throw insertError;
      }

      console.log('✅ SETTINGS: Configurações salvas com sucesso');
      setSettings(newSettings);
      return true;

    } catch (err: any) {
      console.error('❌ SETTINGS: Erro ao salvar:', err);
      setError(err.message || 'Erro ao salvar configurações');
      return false;
    } finally {
      setSaving(false);
    }
  };

  const updateSetting = async (key: keyof UserSettings, value: any) => {
    const newSettings = { ...settings, [key]: value };
    const success = await saveSettings(newSettings);
    return success;
  };

  const resetSettings = async () => {
    const success = await saveSettings(defaultSettings);
    if (success) {
      applyTheme(defaultSettings.theme);
      applyLanguage(defaultSettings.language);
    }
    return success;
  };

  // Aplicar tema no documento
  const applyTheme = (theme: 'light' | 'dark' | 'system') => {
    console.log('🎨 SETTINGS: Aplicando tema:', theme);
    
    // Remover classes existentes
    document.documentElement.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      // Detectar preferência do sistema
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      document.documentElement.classList.add(systemTheme);
    } else {
      document.documentElement.classList.add(theme);
    }
    
    // Salvar no localStorage para persistir
    localStorage.setItem('team-manager-theme', theme);
  };

  // Aplicar idioma (preparação para i18n)
  const applyLanguage = (language: string) => {
    console.log('🌐 SETTINGS: Aplicando idioma:', language);
    document.documentElement.lang = language;
    localStorage.setItem('team-manager-language', language);
  };

  // Verificar permissão de notificação
  const checkNotificationPermission = async () => {
    if (!('Notification' in window)) {
      return 'unsupported';
    }
    
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      return permission;
    }
    
    return Notification.permission;
  };

  // Enviar notificação de teste
  const sendTestNotification = () => {
    if (!settings.pushNotifications || !settings.soundEnabled) {
      console.log('⚠️ SETTINGS: Notificações desabilitadas nas configurações');
      return;
    }

    if (Notification.permission === 'granted') {
      const notification = new Notification('Team Manager', {
        body: 'Notificações configuradas com sucesso!',
        icon: '/icon-192x192.png',
        badge: '/icon-72x72.png',
        tag: 'test-notification',
        requireInteraction: false
      });

      if (settings.soundEnabled) {
        // Tocar som de notificação
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(err => console.error('Erro ao tocar som:', err));
      }

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    }
  };

  return {
    settings,
    loading,
    saving,
    error,
    updateSetting,
    saveSettings,
    resetSettings,
    checkNotificationPermission,
    sendTestNotification,
    applyTheme,
    applyLanguage
  };
}