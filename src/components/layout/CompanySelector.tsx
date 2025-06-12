import { useAuth } from '@/contexts/AuthContextProprio';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Building2 } from 'lucide-react';

export function CompanySelector() {
  const {
    usuario,
    empresa,
    userEmpresas = [],
    hasMultipleCompanies,
    switchCompany,
  } = useAuth();

  // Se usuário só tem uma empresa, mostrar apenas o nome
  if (!hasMultipleCompanies) {
    return (
      <div className="flex items-center gap-2 px-3 py-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">{empresa?.nome}</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select
        value={empresa?.id}
        onValueChange={switchCompany}
      >
        <SelectTrigger className="w-[200px]">
          <SelectValue placeholder="Selecione a empresa" />
        </SelectTrigger>
        <SelectContent>
          {userEmpresas.map((ue) => (
            <SelectItem key={ue.empresa_id} value={ue.empresa_id}>
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                <span>{ue.empresas.nome}</span>
                {usuario?.cargo && (
                  <span className="text-xs text-muted-foreground">({usuario.cargo})</span>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}