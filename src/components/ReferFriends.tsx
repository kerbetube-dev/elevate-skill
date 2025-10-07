import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Copy, Gift, Users, Coins, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { referralService, ReferralStats, Referral } from "@/services/referrals";

export function ReferFriends() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [referralEmail, setReferralEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchReferralData();
  }, []);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [stats, referralsData] = await Promise.all([
        referralService.getReferralStats(),
        referralService.getReferrals()
      ]);
      
      setReferralStats(stats);
      setReferrals(referralsData);
    } catch (error) {
      console.error('Error fetching referral data:', error);
      toast({
        title: "Error",
        description: "Failed to load referral data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyReferralCode = () => {
    if (referralStats?.referralCode) {
      navigator.clipboard.writeText(referralStats.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard"
      });
    }
  };

  const shareReferralLink = () => {
    if (referralStats?.referralCode) {
      const referralLink = `${window.location.origin}/register?ref=${referralStats.referralCode}`;
      navigator.clipboard.writeText(referralLink);
      toast({
        title: "Link Copied!",
        description: "Referral link copied to clipboard"
      });
    }
  };

  const handleReferFriend = async () => {
    if (!referralEmail.trim()) {
      toast({
        title: "Error",
        description: "Please enter an email address",
        variant: "destructive"
      });
      return;
    }

    try {
      setSubmitting(true);
      await referralService.createReferral(referralEmail.trim());
      toast({
        title: "Success!",
        description: "Referral invitation sent successfully"
      });
      setReferralEmail("");
      // Refresh data
      await fetchReferralData();
    } catch (error: any) {
      console.error('Error creating referral:', error);
      toast({
        title: "Error",
        description: error.response?.data?.detail || "Failed to send referral invitation",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Loading referral data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Refer Friends & Earn</h2>
        <p className="text-muted-foreground">
          Invite friends to join Elevate Skill and earn rewards for each successful referral!
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Referrals</p>
                <p className="text-2xl font-bold">{referralStats?.totalReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Gift className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold">{referralStats?.completedReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-yellow-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold">{referralStats?.pendingReferrals || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Coins className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total Earnings</p>
                <p className="text-2xl font-bold">{referralStats?.totalEarnings || 0} ETB</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referral Code</CardTitle>
          <CardDescription>
            Share this code with friends to earn rewards when they sign up
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              value={referralStats?.referralCode || ''} 
              readOnly 
              className="font-mono"
            />
            <Button onClick={copyReferralCode} variant="outline">
              <Copy className="h-4 w-4" />
            </Button>
            <Button onClick={shareReferralLink} variant="outline">
              Share Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Refer a Friend */}
      <Card>
        <CardHeader>
          <CardTitle>Refer a Friend</CardTitle>
          <CardDescription>
            Enter your friend's email to send them an invitation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input 
              type="email"
              placeholder="friend@example.com"
              value={referralEmail}
              onChange={(e) => setReferralEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={handleReferFriend}
              disabled={submitting || !referralEmail.trim()}
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Send Invitation"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Track your referrals and earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.map((referral) => (
              <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h4 className="font-semibold">{referral.referredUserName || 'Unknown User'}</h4>
                  <p className="text-sm text-muted-foreground">{referral.email}</p>
                  <p className="text-xs text-muted-foreground">
                    Referred: {new Date(referral.dateReferred).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="text-right">
                  <Badge 
                    variant={referral.status === 'completed' ? 'default' : 'secondary'}
                  >
                    {referral.status === 'completed' ? 'Completed' : 'Pending'}
                  </Badge>
                  {referral.rewardEarned > 0 && (
                    <p className="text-sm font-semibold text-green-600 mt-1">
                      +{referral.rewardEarned} ETB
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {referrals.length === 0 && (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Referrals Yet</h3>
              <p className="text-muted-foreground">
                Start referring friends to earn rewards!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}