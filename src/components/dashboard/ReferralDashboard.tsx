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
	rewardPerReferral = 100,
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
			<div className="gap-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
				<motion.div variants={staggerItem}>
					<Card className="glass hover-lift">
						<CardContent className="p-6">
							<div className="flex justify-between items-center mb-4">
								<div className="flex justify-center items-center bg-green-100 dark:bg-green-900/30 rounded-xl w-12 h-12">
									<DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
								</div>
								<TrendingUp className="w-5 h-5 text-green-500" />
							</div>
							<div className="space-y-1">
								<p className="font-bold text-3xl">
									{totalEarnings} ETB
								</p>
								<p className="text-muted-foreground text-sm">
									Total Earnings
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={staggerItem}>
					<Card className="glass hover-lift">
						<CardContent className="p-6">
							<div className="flex justify-between items-center mb-4">
								<div className="flex justify-center items-center bg-yellow-100 dark:bg-yellow-900/30 rounded-xl w-12 h-12">
									<Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
								</div>
							</div>
							<div className="space-y-1">
								<p className="font-bold text-3xl">
									{pendingEarnings} ETB
								</p>
								<p className="text-muted-foreground text-sm">
									Pending
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={staggerItem}>
					<Card className="glass hover-lift">
						<CardContent className="p-6">
							<div className="flex justify-between items-center mb-4">
								<div className="flex justify-center items-center bg-blue-100 dark:bg-blue-900/30 rounded-xl w-12 h-12">
									<Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
								</div>
							</div>
							<div className="space-y-1">
								<p className="font-bold text-3xl">
									{totalReferrals}
								</p>
								<p className="text-muted-foreground text-sm">
									Total Referrals
								</p>
							</div>
						</CardContent>
					</Card>
				</motion.div>

				<motion.div variants={staggerItem}>
					<Card className="glass hover-lift">
						<CardContent className="p-6">
							<div className="flex justify-between items-center mb-4">
								<div className="flex justify-center items-center bg-purple-100 dark:bg-purple-900/30 rounded-xl w-12 h-12">
									<Award className="w-6 h-6 text-purple-600 dark:text-purple-400" />
								</div>
							</div>
							<div className="space-y-1">
								<p className="font-bold text-3xl">
									{completedReferrals}
								</p>
								<p className="text-muted-foreground text-sm">
									Completed
								</p>
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
							<Share2 className="w-5 h-5 text-primary" />
							Your Referral Code
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-4">
						<div className="relative bg-gradient-primary p-6 rounded-xl overflow-hidden text-white">
							{/* Decorative Elements */}
							<div className="top-0 right-0 absolute bg-white/10 blur-3xl rounded-full w-40 h-40" />
							<div className="bottom-0 left-0 absolute bg-white/10 blur-2xl rounded-full w-32 h-32" />

							<div className="z-10 relative">
								<p className="opacity-90 mb-2 text-sm">
									Share this code with friends:
								</p>
								<div className="flex items-center gap-3">
									<div className="flex-1 bg-white/20 backdrop-blur-sm p-4 rounded-lg font-mono font-bold text-2xl tracking-wider">
										{referralCode}
									</div>
									<Button
										variant="secondary"
										size="icon"
										onClick={handleCopyCode}
										className="w-14 h-14"
									>
										{copied ? (
											<CheckCircle className="w-5 h-5 text-green-500" />
										) : (
											<Copy className="w-5 h-5" />
										)}
									</Button>
								</div>
							</div>
						</div>

						<div className="space-y-2">
							<label className="font-medium text-sm">
								Referral Link
							</label>
							<div className="flex gap-2">
								<Input
									value={referralLink}
									readOnly
									className="font-mono text-sm"
								/>
								<Button
									variant="outline"
									onClick={handleCopyLink}
								>
									<Copy className="mr-2 w-4 h-4" />
									Copy
								</Button>
							</div>
						</div>

						<div className="flex gap-2">
							<Button
								variant="gradient"
								className="flex-1"
								onClick={handleShare}
							>
								<Share2 className="mr-2 w-4 h-4" />
								Share with Friends
							</Button>
						</div>

						<div className="bg-primary/5 p-4 border border-primary/10 rounded-lg">
							<div className="flex items-start gap-3">
								<Gift className="flex-shrink-0 mt-0.5 w-5 h-5 text-primary" />
								<div>
									<p className="font-semibold text-sm">
										Earn {rewardPerReferral} ETB per
										referral!
									</p>
									<p className="mt-1 text-muted-foreground text-xs">
										When your friend registers using your
										referral code, you both earn rewards
										instantly!
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
							<div className="flex justify-between items-center">
								<span className="text-muted-foreground text-sm">
									Next milestone: {nextMilestone} referrals
								</span>
								<span className="font-semibold">
									{totalReferrals}/{nextMilestone}
								</span>
							</div>
							<Progress
								value={milestoneProgress}
								className="h-3"
							/>
							<p className="text-muted-foreground text-xs">
								{nextMilestone - totalReferrals} more
								referral(s) to unlock bonus rewards!
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
							<div className="py-12 text-muted-foreground text-center">
								<Users className="opacity-50 mx-auto mb-4 w-16 h-16" />
								<p className="mb-2 font-semibold text-lg">
									No referrals yet
								</p>
								<p className="text-sm">
									Share your referral code with friends to
									start earning!
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
										className="flex justify-between items-center bg-card hover:bg-muted/50 p-4 border rounded-lg transition-colors"
									>
										<div className="flex items-center gap-4">
											<div
												className={`w-10 h-10 rounded-full flex items-center justify-center ${
													referral.status ===
													"completed"
														? "bg-green-100 dark:bg-green-900/30"
														: "bg-yellow-100 dark:bg-yellow-900/30"
												}`}
											>
												{referral.status ===
												"completed" ? (
													<CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
												) : (
													<Clock className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
												)}
											</div>
											<div>
												<p className="font-semibold text-sm">
													{referral.referredUserName}
												</p>
												<p className="text-muted-foreground text-xs">
													Referred{" "}
													{new Date(
														referral.createdAt
													).toLocaleDateString()}
													{referral.completedAt &&
														` • Completed ${new Date(
															referral.completedAt
														).toLocaleDateString()}`}
												</p>
											</div>
										</div>
										<div className="text-right">
											<Badge
												variant={
													referral.status ===
													"completed"
														? "default"
														: "secondary"
												}
											>
												{referral.status}
											</Badge>
											{referral.status ===
												"completed" && (
												<p className="mt-1 font-semibold text-green-600 dark:text-green-400 text-sm">
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
