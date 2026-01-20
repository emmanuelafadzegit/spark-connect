import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, ShieldCheck, Crown, AlertTriangle, TrendingUp, 
  Check, X, Eye, MessageSquare, Ban, MoreVertical 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { format } from "date-fns";

interface Stats {
  totalUsers: number;
  premiumUsers: number;
  pendingVerifications: number;
  activeReports: number;
  newUsersToday: number;
  totalMatches: number;
}

interface UserRow {
  id: string;
  user_id: string;
  display_name: string;
  city: string | null;
  is_verified: boolean;
  verification_status: string | null;
  verification_photo_url: string | null;
  created_at: string;
  is_visible: boolean;
  profile_photos: Array<{ photo_url: string; is_primary: boolean }>;
}

interface ReportRow {
  id: string;
  reason: string;
  description: string | null;
  status: string;
  created_at: string;
  reporter_id: string;
  reported_user_id: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<UserRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    checkAdminAndLoad();
  }, [user]);

  const checkAdminAndLoad = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    // Check admin role via database function
    const { data: roleData, error: roleError } = await supabase.rpc("is_admin");
    
    if (roleError || !roleData) {
      toast.error("Access denied. Admin privileges required.");
      navigate("/app");
      return;
    }

    setIsAdmin(true);
    await loadDashboardData();
  };

  const loadDashboardData = async () => {
    setLoading(true);

    try {
      // Load stats
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: pendingCount },
        { count: reportCount },
        { count: todayUsers },
        { count: matchCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).neq("tier", "free"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "submitted"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", new Date().toISOString().split("T")[0]),
        supabase.from("matches").select("*", { count: "exact", head: true }),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        pendingVerifications: pendingCount || 0,
        activeReports: reportCount || 0,
        newUsersToday: todayUsers || 0,
        totalMatches: matchCount || 0,
      });

      // Load users
      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, profile_photos(photo_url, is_primary)")
        .order("created_at", { ascending: false })
        .limit(50);
      setUsers((usersData as UserRow[]) || []);

      // Load pending verifications
      const { data: verifyData } = await supabase
        .from("profiles")
        .select("*, profile_photos(photo_url, is_primary)")
        .eq("verification_status", "submitted")
        .order("verification_submitted_at", { ascending: true });
      setPendingVerifications((verifyData as UserRow[]) || []);

      // Load reports
      const { data: reportsData } = await supabase
        .from("reports")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false });
      setReports((reportsData as ReportRow[]) || []);

    } catch (error) {
      console.error("Error loading dashboard:", error);
    }

    setLoading(false);
  };

  const handleVerification = async (profileId: string, approved: boolean) => {
    const { error } = await supabase
      .from("profiles")
      .update({
        verification_status: approved ? "approved" : "rejected",
        is_verified: approved,
        verification_reviewed_at: new Date().toISOString(),
        verification_reviewed_by: user?.id,
      })
      .eq("id", profileId);

    if (error) {
      toast.error("Failed to update verification");
      return;
    }

    toast.success(approved ? "User verified!" : "Verification rejected");
    loadDashboardData();
  };

  const handleReportAction = async (reportId: string, action: "resolved" | "dismissed") => {
    const { error } = await supabase
      .from("reports")
      .update({
        status: action,
        reviewed_at: new Date().toISOString(),
        reviewed_by: user?.id,
      })
      .eq("id", reportId);

    if (error) {
      toast.error("Failed to update report");
      return;
    }

    toast.success(`Report ${action}`);
    loadDashboardData();
  };

  const handleBanUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_visible: false })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to ban user");
      return;
    }

    toast.success("User banned");
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Loading admin dashboard...</div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getProfilePhoto = (user: UserRow) => {
    const primary = user.profile_photos?.find(p => p.is_primary);
    return primary?.photo_url || user.profile_photos?.[0]?.photo_url;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, verifications, and reports</p>
          </div>
          <Button variant="outline" onClick={() => navigate("/app")}>
            Back to App
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {[
            { label: "Total Users", value: stats?.totalUsers, icon: Users, color: "text-blue-500" },
            { label: "Premium Users", value: stats?.premiumUsers, icon: Crown, color: "text-yellow-500" },
            { label: "Pending Verifications", value: stats?.pendingVerifications, icon: ShieldCheck, color: "text-green-500" },
            { label: "Active Reports", value: stats?.activeReports, icon: AlertTriangle, color: "text-red-500" },
          ].map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card>
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`p-3 rounded-xl bg-muted ${stat.color}`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold">{stat.value || 0}</p>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <TrendingUp className="w-8 h-8 text-success" />
              <div>
                <p className="text-xl font-bold">{stats?.newUsersToday || 0}</p>
                <p className="text-sm text-muted-foreground">New users today</p>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <MessageSquare className="w-8 h-8 text-primary" />
              <div>
                <p className="text-xl font-bold">{stats?.totalMatches || 0}</p>
                <p className="text-sm text-muted-foreground">Total matches made</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">All Users</TabsTrigger>
            <TabsTrigger value="verifications">
              Verifications
              {stats?.pendingVerifications ? (
                <Badge className="ml-2" variant="destructive">
                  {stats.pendingVerifications}
                </Badge>
              ) : null}
            </TabsTrigger>
            <TabsTrigger value="reports">
              Reports
              {stats?.activeReports ? (
                <Badge className="ml-2" variant="destructive">
                  {stats.activeReports}
                </Badge>
              ) : null}
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="overview">
            <Card>
              <CardHeader>
                <CardTitle>Recent Users</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {users.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center justify-between p-4 rounded-xl bg-muted/50 hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-muted">
                          {getProfilePhoto(u) ? (
                            <img
                              src={getProfilePhoto(u)}
                              alt={u.display_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xl">
                              👤
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{u.display_name}</span>
                            {u.is_verified && (
                              <ShieldCheck className="w-4 h-4 text-success" />
                            )}
                            {!u.is_visible && (
                              <Badge variant="destructive">Banned</Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {u.city || "Unknown"} • Joined {format(new Date(u.created_at), "MMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleBanUser(u.user_id)}>
                            <Ban className="w-4 h-4 mr-2" />
                            Ban User
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Verifications Tab */}
          <TabsContent value="verifications">
            <Card>
              <CardHeader>
                <CardTitle>Pending Verifications</CardTitle>
              </CardHeader>
              <CardContent>
                {pendingVerifications.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending verifications
                  </div>
                ) : (
                  <div className="space-y-6">
                    {pendingVerifications.map((u) => (
                      <div
                        key={u.id}
                        className="p-4 rounded-xl border border-border"
                      >
                        <div className="flex items-start gap-4 mb-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                            {getProfilePhoto(u) ? (
                              <img
                                src={getProfilePhoto(u)}
                                alt="Profile"
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-2xl">
                                👤
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{u.display_name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Submitted for verification
                            </p>
                          </div>
                        </div>

                        {/* Photo comparison */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Profile Photo</p>
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              {getProfilePhoto(u) ? (
                                <img
                                  src={getProfilePhoto(u)}
                                  alt="Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  No photo
                                </div>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-2">Verification Photo</p>
                            <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                              {u.verification_photo_url ? (
                                <img
                                  src={u.verification_photo_url}
                                  alt="Verification"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  No photo
                                </div>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleVerification(u.id, true)}
                            className="flex-1 gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Approve
                          </Button>
                          <Button
                            onClick={() => handleVerification(u.id, false)}
                            variant="destructive"
                            className="flex-1 gap-2"
                          >
                            <X className="w-4 h-4" />
                            Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reports Tab */}
          <TabsContent value="reports">
            <Card>
              <CardHeader>
                <CardTitle>Active Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No active reports
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-xl border border-border"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <Badge variant="outline">{report.reason}</Badge>
                          <span className="text-xs text-muted-foreground">
                            {format(new Date(report.created_at), "MMM d, yyyy")}
                          </span>
                        </div>
                        {report.description && (
                          <p className="text-sm text-muted-foreground mb-4">
                            {report.description}
                          </p>
                        )}
                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReportAction(report.id, "resolved")}
                            size="sm"
                            className="gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Resolve
                          </Button>
                          <Button
                            onClick={() => handleReportAction(report.id, "dismissed")}
                            size="sm"
                            variant="outline"
                            className="gap-2"
                          >
                            <X className="w-4 h-4" />
                            Dismiss
                          </Button>
                          <Button
                            onClick={() => handleBanUser(report.reported_user_id)}
                            size="sm"
                            variant="destructive"
                            className="gap-2"
                          >
                            <Ban className="w-4 h-4" />
                            Ban User
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;