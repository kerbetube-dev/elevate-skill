/**
 * Referral Dashboard Component
 * Track referrals and earnings with beautiful visualizations
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import {
  Share2,
  Copy,
  CheckCircle,
  Users,
  DollarSign,
  TrendingUp,
  Gift,
  Clock,
  Award,
} from "lucide-react";
import { useState } from "react";
import { staggerContainer, staggerItem } from "@/lib/animations";
import { useToast } from "@/hooks/use-toast";

interface Referral {
  id: string;
  referredUserName: string;
  status: "pending" | "completed";
  rewardEarned: number;
  createdAt: string;
  completedAt?: string;
}

interface ReferralDashboardProps {
  referralCode: string;
  totalEarnings: number;
  pendingEarnings: number;
  totalReferrals: number;
  completedReferrals: number;
  referrals: Referral[];
  rewardPerReferral?: number;
}

export function ReferralDashboard({
  referralCode,
  totalEarnings,
  pendingEarnings,
  totalReferrals,
  completedReferrals,
  referrals,
  rewardPerReferral = 50,
}: ReferralDashboardProps) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const referralLink = `${window.location.origin}/register?ref=${referralCode}`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(referralCode);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Referral code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Copied!",
      description: "Referral link copied to clipboard",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Join Elevate Skill",
          text: `Join Elevate Skill and start learning today! Use my referral code: ${referralCode}`,
          url: referralLink,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      handleCopyLink();
    }
  };

  // Calculate progress to next milestone
  const nextMilestone = Math.ceil(totalReferrals / 5) * 5 || 5;
  const milestoneProgress = (totalReferrals / nextMilestone) * 100;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
      className="space-y-6"
    >
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div variants={staggerItem}>
          <Card className="glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <TrendingUp className="h-5 w-5 text-green-500" />
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{totalEarnings} ETB</p>
                <p className="text-sm text-muted-foreground">Total Earnings</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                  <Clock className="h-6 w-6 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{pendingEarnings} ETB</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{totalReferrals}</p>
                <p className="text-sm text-muted-foreground">Total Referrals</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={staggerItem}>
          <Card className="glass hover-lift">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                  <Award className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-3xl font-bold">{completedReferrals}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Referral Code Card */}
      <motion.div variants={staggerItem}>
        <Card className="glass">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5 text-primary" />
              Your Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-6 bg-gradient-primary rounded-xl text-white relative overflow-hidden">
              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-white/10 rounded-full blur-2xl" />

              <div className="relative z-10">
                <p className="text-sm mb-2 opacity-90">Share this code with friends:</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 bg-white/20 backdrop-blur-sm rounded-lg p-4 font-mono text-2xl font-bold tracking-wider">
                    {referralCode}
                  </div>
                  <Button
                    variant="secondary"
                    size="icon"
                    onClick={handleCopyCode}
                    className="h-14 w-14"
                  >
                    {copied ? (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Referral Link</label>
              <div className="flex gap-2">
                <Input
                  value={referralLink}
                  readOnly
                  className="font-mono text-sm"
                />
                <Button variant="outline" onClick={handleCopyLink}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="gradient" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share with Friends
              </Button>
            </div>

            <div className="p-4 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-start gap-3">
                <Gift className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">Earn {rewardPerReferral} ETB per referral!</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    When your friend enrolls in a course, you both earn rewards!
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Milestone Progress */}
      <motion.div variants={staggerItem}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Milestone Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  Next milestone: {nextMilestone} referrals
                </span>
                <span className="font-semibold">
                  {totalReferrals}/{nextMilestone}
                </span>
              </div>
              <Progress value={milestoneProgress} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {nextMilestone - totalReferrals} more referral(s) to unlock bonus rewards!
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Referrals List */}
      <motion.div variants={staggerItem}>
        <Card className="glass">
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Users className="h-16 w-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-semibold mb-2">No referrals yet</p>
                <p className="text-sm">
                  Share your referral code with friends to start earning!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {referrals.map((referral, index) => (
                  <motion.div
                    key={referral.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          referral.status === "completed"
                            ? "bg-green-100 dark:bg-green-900/30"
                            : "bg-yellow-100 dark:bg-yellow-900/30"
                        }`}
                      >
                        {referral.status === "completed" ? (
                          <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                        ) : (
                          <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{referral.referredUserName}</p>
                        <p className="text-xs text-muted-foreground">
                          Referred {new Date(referral.createdAt).toLocaleDateString()}
                          {referral.completedAt &&
                            ` • Completed ${new Date(referral.completedAt).toLocaleDateString()}`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={referral.status === "completed" ? "default" : "secondary"}
                      >
                        {referral.status}
                      </Badge>
                      {referral.status === "completed" && (
                        <p className="text-sm font-semibold text-green-600 dark:text-green-400 mt-1">
                          +{referral.rewardEarned} ETB
                        </p>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}

