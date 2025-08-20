import { AppHeader } from "@/components/app-header";
import { TeroBot } from "@/components/tero-bot";
import { RoleGuard } from "@/lib/role-guard";
import { ROLES } from "@shared/roles";

export default function TeroTestingPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <AppHeader />
      
      <div className="max-w-7xl mx-auto p-6">
        <RoleGuard allowedRoles={[ROLES.SUPER_ADMIN, ROLES.ADMIN]}>
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">TERO Testing Suite</h1>
            <p className="text-muted-foreground">
              Comprehensive automated testing for every component, API endpoint, and functionality in LinxIQ
            </p>
          </div>

          <TeroBot />
        </RoleGuard>
      </div>
    </div>
  );
}