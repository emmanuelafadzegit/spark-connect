import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  Users, ShieldCheck, Crown, AlertTriangle, TrendingUp, 
  Check, X, Eye, MessageSquare, Ban, MoreVertical, Search,
  RefreshCw, UserX, UserCheck, ArrowLeft, Calendar, Filter
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
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
  suspendedUsers: number;
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
  is_suspended: boolean;
  suspended_at: string | null;
  suspension_reason: string | null;
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
  const [filteredUsers, setFilteredUsers] = useState<UserRow[]>([]);
  const [pendingVerifications, setPendingVerifications] = useState<UserRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [activeTab, setActiveTab] = useState("overview");
  const [searchQuery, setSearchQuery] = useState("");
  const [userFilter, setUserFilter] = useState<"all" | "suspended" | "verified" | "unverified">("all");
  
  // Suspension dialog
  const [suspendDialogOpen, setSuspendDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserRow | null>(null);
  const [suspensionReason, setSuspensionReason] = useState("");

  useEffect(() => {
    checkAdminAndLoad();
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, userFilter]);

  const filterUsers = () => {
    let filtered = [...users];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.display_name.toLowerCase().includes(query) ||
        u.city?.toLowerCase().includes(query)
      );
    }
    
    // Apply status filter
    switch (userFilter) {
      case "suspended":
        filtered = filtered.filter(u => u.is_suspended);
        break;
      case "verified":
        filtered = filtered.filter(u => u.is_verified);
        break;
      case "unverified":
        filtered = filtered.filter(u => !u.is_verified);
        break;
    }
    
    setFilteredUsers(filtered);
  };

  const checkAdminAndLoad = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

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
      const [
        { count: totalUsers },
        { count: premiumUsers },
        { count: pendingCount },
        { count: reportCount },
        { count: todayUsers },
        { count: matchCount },
        { count: suspendedCount },
      ] = await Promise.all([
        supabase.from("profiles").select("*", { count: "exact", head: true }),
        supabase.from("subscriptions").select("*", { count: "exact", head: true }).neq("tier", "free"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("verification_status", "submitted"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "pending"),
        supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", new Date().toISOString().split("T")[0]),
        supabase.from("matches").select("*", { count: "exact", head: true }),
        supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_suspended", true),
      ]);

      setStats({
        totalUsers: totalUsers || 0,
        premiumUsers: premiumUsers || 0,
        pendingVerifications: pendingCount || 0,
        activeReports: reportCount || 0,
        newUsersToday: todayUsers || 0,
        totalMatches: matchCount || 0,
        suspendedUsers: suspendedCount || 0,
      });

      const { data: usersData } = await supabase
        .from("profiles")
        .select("*, profile_photos(photo_url, is_primary)")
        .order("created_at", { ascending: false })
        .limit(100);
      setUsers((usersData as UserRow[]) || []);

      const { data: verifyData } = await supabase
        .from("profiles")
        .select("*, profile_photos(photo_url, is_primary)")
        .eq("verification_status", "submitted")
        .order("verification_submitted_at", { ascending: true });
      setPendingVerifications((verifyData as UserRow[]) || []);

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

  const openSuspendDialog = (userRow: UserRow) => {
    setSelectedUser(userRow);
    setSuspensionReason("");
    setSuspendDialogOpen(true);
  };

  const handleSuspendUser = async () => {
    if (!selectedUser) return;
    
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_suspended: true,
        suspended_at: new Date().toISOString(),
        suspended_by: user?.id,
        suspension_reason: suspensionReason || "Violated community guidelines"
      })
      .eq("user_id", selectedUser.user_id);

    if (error) {
      toast.error("Failed to suspend user");
      return;
    }

    toast.success("User suspended. They can no longer swipe, message, or post.");
    setSuspendDialogOpen(false);
    setSelectedUser(null);
    loadDashboardData();
  };

  const handleUnsuspendUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ 
        is_suspended: false,
        suspended_at: null,
        suspended_by: null,
        suspension_reason: null
      })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to unsuspend user");
      return;
    }

    toast.success("User unsuspended");
    loadDashboardData();
  };

  const handleHideUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_visible: false })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to hide user");
      return;
    }

    toast.success("User hidden from discovery");
    loadDashboardData();
  };

  const handleUnhideUser = async (userId: string) => {
    const { error } = await supabase
      .from("profiles")
      .update({ is_visible: true })
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to unhide user");
      return;
    }

    toast.success("User visible in discovery again");
    loadDashboardData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse flex flex-col items-center gap-2">
          <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          <p>Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  const getProfilePhoto = (userRow: UserRow) => {
    const primary = userRow.profile_photos?.find(p => p.is_primary);
    return primary?.photo_url || userRow.profile_photos?.[0]?.photo_url;
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/app")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">Manage users, verifications, and reports</p>
            </div>
          </div>
          <Button variant="outline" onClick={loadDashboardData} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Refresh
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
        <div className="grid gap-4 md:grid-cols-3 mb-8">
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
          <Card>
            <CardContent className="flex items-center gap-4 p-6">
              <UserX className="w-8 h-8 text-destructive" />
              <div>
                <p className="text-xl font-bold">{stats?.suspendedUsers || 0}</p>
                <p className="text-sm text-muted-foreground">Suspended users</p>
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <CardTitle>User Management</CardTitle>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search users..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="gap-2">
                          <Filter className="w-4 h-4" />
                          {userFilter === "all" ? "All Users" : 
                           userFilter === "suspended" ? "Suspended" :
                           userFilter === "verified" ? "Verified" : "Unverified"}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent>
                        <DropdownMenuItem onClick={() => setUserFilter("all")}>
                          All Users
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUserFilter("suspended")}>
                          Suspended Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUserFilter("verified")}>
                          Verified Only
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setUserFilter("unverified")}>
                          Unverified Only
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredUsers.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No users found
                    </div>
                  ) : (
                    filteredUsers.map((u) => (
                      <div
                        key={u.id}
                        className={`flex items-center justify-between p-4 rounded-xl transition-colors ${
                          u.is_suspended 
                            ? 'bg-destructive/10 border border-destructive/20' 
                            : 'bg-muted/50 hover:bg-muted'
                        }`}
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
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium">{u.display_name}</span>
                              {u.is_verified && (
                                <ShieldCheck className="w-4 h-4 text-success" />
                              )}
                              {u.is_suspended && (
                                <Badge variant="destructive" className="gap-1">
                                  <Ban className="w-3 h-3" />
                                  Suspended
                                </Badge>
                              )}
                              {!u.is_visible && !u.is_suspended && (
                                <Badge variant="secondary">Hidden</Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {u.city || "Unknown"} • Joined {format(new Date(u.created_at), "MMM d, yyyy")}
                            </p>
                            {u.is_suspended && u.suspension_reason && (
                              <p className="text-xs text-destructive mt-1">
                                Reason: {u.suspension_reason}
                              </p>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {u.is_suspended ? (
                              <DropdownMenuItem onClick={() => handleUnsuspendUser(u.user_id)}>
                                <UserCheck className="w-4 h-4 mr-2" />
                                Unsuspend User
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => openSuspendDialog(u)}
                                className="text-destructive"
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Suspend User
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            {u.is_visible ? (
                              <DropdownMenuItem onClick={() => handleHideUser(u.user_id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Hide from Discovery
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem onClick={() => handleUnhideUser(u.user_id)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Show in Discovery
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    ))
                  )}
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
                <CardTitle>Pending Reports</CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No pending reports
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="p-4 rounded-xl border border-border"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <Badge variant="destructive">{report.reason}</Badge>
                            <p className="text-sm text-muted-foreground mt-2">
                              Reported on {format(new Date(report.created_at), "MMM d, yyyy 'at' h:mm a")}
                            </p>
                          </div>
                        </div>
                        
                        {report.description && (
                          <p className="text-sm mb-4 p-3 bg-muted rounded-lg">
                            "{report.description}"
                          </p>
                        )}

                        <div className="flex gap-2">
                          <Button
                            onClick={() => handleReportAction(report.id, "resolved")}
                            className="flex-1 gap-2"
                          >
                            <Check className="w-4 h-4" />
                            Resolve
                          </Button>
                          <Button
                            onClick={() => handleReportAction(report.id, "dismissed")}
                            variant="outline"
                            className="flex-1 gap-2"
                          >
                            <X className="w-4 h-4" />
                            Dismiss
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

      {/* Suspend User Dialog */}
      <Dialog open={suspendDialogOpen} onOpenChange={setSuspendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Suspend User</DialogTitle>
            <DialogDescription>
              Suspending {selectedUser?.display_name} will prevent them from swiping, 
              sending messages, and posting to feeds. Their profile will also be hidden 
              from other users.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Reason for suspension</label>
              <Textarea
                placeholder="e.g., Violated community guidelines, inappropriate behavior..."
                value={suspensionReason}
                onChange={(e) => setSuspensionReason(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSuspendDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleSuspendUser}>
              Suspend User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
