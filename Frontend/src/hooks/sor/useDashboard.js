import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import dashboardService from '../../services/sor/dashboardService';
import authService from '../../services/auth/authService';

const useDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading]             = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const user = authService.getCurrentUser();
        const res  = user?.roleName === 'Manager'
          ? await dashboardService.getManagerDashboard()
          : await dashboardService.getHRDashboard();
        setDashboardData(res.data || res);
      } catch (e) { toast.error(e.message); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  return { dashboardData, loading };
};

export default useDashboard;
