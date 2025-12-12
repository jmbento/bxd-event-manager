import React from 'react';
import { Clock, Zap, AlertTriangle, ArrowRight, Crown } from 'lucide-react';

interface TrialBannerProps {
  daysRemaining: number;
  planName: string;
  onUpgrade: () => void;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ 
  daysRemaining, 
  planName,
  onUpgrade 
}) => {
  // Cores baseadas nos dias restantes
  const getBannerStyle = () => {
    if (daysRemaining <= 0) {
      return 'bg-red-500/10 border-red-500/30 text-red-400';
    }
    if (daysRemaining <= 3) {
      return 'bg-orange-500/10 border-orange-500/30 text-orange-400';
    }
    if (daysRemaining <= 7) {
      return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    }
    return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
  };

  const getIcon = () => {
    if (daysRemaining <= 0) return AlertTriangle;
    if (daysRemaining <= 3) return AlertTriangle;
    return Clock;
  };

  const Icon = getIcon();

  if (daysRemaining <= 0) {
    return (
      <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-lg flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="font-semibold text-red-400">
                Seu período de teste expirou
              </p>
              <p className="text-sm text-red-400/80">
                Faça upgrade para continuar usando todos os recursos
              </p>
            </div>
          </div>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition flex items-center gap-2"
          >
            <Crown className="w-4 h-4" />
            Fazer Upgrade
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`border rounded-xl p-4 ${getBannerStyle()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            daysRemaining <= 3 ? 'bg-orange-500/20' : 'bg-blue-500/20'
          }`}>
            <Icon className={`w-5 h-5 ${
              daysRemaining <= 3 ? 'text-orange-400' : 'text-blue-400'
            }`} />
          </div>
          <div>
            <p className={`font-semibold ${
              daysRemaining <= 3 ? 'text-orange-400' : 'text-blue-400'
            }`}>
              {daysRemaining === 1 
                ? 'Último dia de teste!' 
                : `${daysRemaining} dias restantes no teste`}
            </p>
            <p className={`text-sm opacity-80`}>
              Plano {planName} • Todos os recursos disponíveis
            </p>
          </div>
        </div>
        <button
          onClick={onUpgrade}
          className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
            daysRemaining <= 3
              ? 'bg-orange-500 text-white hover:bg-orange-600'
              : 'bg-blue-500/20 text-blue-400 hover:bg-blue-500/30'
          }`}
        >
          {daysRemaining <= 3 ? 'Garantir desconto' : 'Ver planos'}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

interface TrialExpiredOverlayProps {
  onUpgrade: () => void;
  onLogout: () => void;
}

export const TrialExpiredOverlay: React.FC<TrialExpiredOverlayProps> = ({ 
  onUpgrade,
  onLogout 
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 border border-slate-700 rounded-2xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertTriangle className="w-8 h-8 text-red-400" />
        </div>

        <h2 className="text-2xl font-bold text-white mb-3">
          Seu período de teste expirou
        </h2>

        <p className="text-slate-400 mb-8">
          Para continuar usando o BXD Event Manager e acessar todos os seus dados, 
          escolha um plano que atenda suas necessidades.
        </p>

        <div className="space-y-3">
          <button
            onClick={onUpgrade}
            className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
          >
            <Crown className="w-5 h-5" />
            Escolher um Plano
          </button>

          <button
            onClick={onLogout}
            className="w-full py-3 text-slate-400 hover:text-white transition"
          >
            Sair da conta
          </button>
        </div>

        <p className="mt-6 text-xs text-slate-500">
          Seus dados estão seguros e serão mantidos por 30 dias
        </p>
      </div>
    </div>
  );
};

interface FeatureGateProps {
  feature: string;
  hasAccess: boolean;
  children: React.ReactNode;
  onUpgrade: () => void;
}

export const FeatureGate: React.FC<FeatureGateProps> = ({
  feature,
  hasAccess,
  children,
  onUpgrade
}) => {
  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm rounded-xl z-10 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="w-12 h-12 bg-purple-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Zap className="w-6 h-6 text-purple-400" />
          </div>
          <h3 className="text-lg font-semibold text-white mb-2">
            Recurso Premium
          </h3>
          <p className="text-sm text-slate-400 mb-4 max-w-xs">
            {feature} está disponível no plano Pro ou superior
          </p>
          <button
            onClick={onUpgrade}
            className="px-4 py-2 bg-purple-500 text-white rounded-lg font-medium hover:bg-purple-600 transition flex items-center gap-2 mx-auto"
          >
            <Crown className="w-4 h-4" />
            Fazer Upgrade
          </button>
        </div>
      </div>
      <div className="opacity-30 pointer-events-none">
        {children}
      </div>
    </div>
  );
};

export default TrialBanner;
