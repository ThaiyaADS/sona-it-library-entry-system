import { getAdminDashboardData } from "@/actions/dashboard";
import LiveMonitoringClient from "@/components/LiveMonitoringClient";

export const metadata = {
  title: "Live Monitoring - Sona IT Library",
};

export default async function AdminLiveMonitoring() {
  const { liveUsers } = await getAdminDashboardData();

  return (
    <div className="p-4 sm:p-6 md:p-8">
      <LiveMonitoringClient initialLiveUsers={liveUsers} />
    </div>
  );
}
