/**
 * QR Code Generator Component
 * Generates downloadable QR codes for referral links
 */

import { useState } from "react";
import { motion } from "framer-motion";
import QRCode from "react-qr-code";
import * as QRCodeLib from "qrcode";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Download, QrCode, Share2, Copy, CheckCircle, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface QRCodeGeneratorProps {
	referralCode: string;
	referralLink: string;
	userName?: string;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

export function QRCodeGenerator({
	referralCode,
	referralLink,
	userName = "User",
	open = false,
	onOpenChange,
}: QRCodeGeneratorProps) {
	const [copied, setCopied] = useState(false);
	const [downloading, setDownloading] = useState(false);
	const { toast } = useToast();

	const handleCopyLink = () => {
		navigator.clipboard.writeText(referralLink);
		setCopied(true);
		toast({
			title: "Copied!",
			description: "Referral link copied to clipboard",
		});
		setTimeout(() => setCopied(false), 2000);
	};

	const handleDownloadQR = async (format: "png" | "svg" = "png") => {
		setDownloading(true);
		try {
			if (format === "png") {
				// Generate PNG using qrcode library
				const canvas = document.createElement("canvas");
				await QRCodeLib.toCanvas(canvas, referralLink, {
					width: 512,
					margin: 2,
					color: {
						dark: "#000000",
						light: "#ffffff",
					},
				});

				// Create download link
				const link = document.createElement("a");
				link.download = `elevate-skill-referral-${referralCode}.png`;
				link.href = canvas.toDataURL();
				link.click();
			} else {
				// Generate SVG
				const svgString = await QRCodeLib.toString(referralLink, {
					type: "svg",
					width: 512,
					margin: 2,
				});

				const blob = new Blob([svgString], { type: "image/svg+xml" });
				const url = URL.createObjectURL(blob);
				const link = document.createElement("a");
				link.download = `elevate-skill-referral-${referralCode}.svg`;
				link.href = url;
				link.click();
				URL.revokeObjectURL(url);
			}

			toast({
				title: "Downloaded!",
				description: `QR code saved as ${format.toUpperCase()}`,
			});
		} catch (error) {
			console.error("Download failed:", error);
			toast({
				title: "Download failed",
				description: "Please try again",
				variant: "destructive",
			});
		} finally {
			setDownloading(false);
		}
	};

	const handleShare = async () => {
		if (navigator.share) {
			try {
				await navigator.share({
					title: "Join Elevate Skill",
					text: `Hey! Join Elevate Skill using my referral code: ${referralCode}`,
					url: referralLink,
				});
			} catch (err) {
				console.log("Share cancelled");
			}
		} else {
			handleCopyLink();
		}
	};

	return (
		<Dialog open={open} onOpenChange={onOpenChange}>
			<DialogContent className="max-w-lg">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<QrCode className="w-5 h-5 text-primary" />
						Share Your Referral QR Code
					</DialogTitle>
					<DialogDescription>
						Share this QR code with friends so they can easily
						access your referral link
					</DialogDescription>
				</DialogHeader>

				<div className="space-y-6">
					{/* QR Code Display */}
					<motion.div
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.3 }}
						className="flex justify-center"
					>
						<div className="bg-white shadow-lg p-6 rounded-xl">
							<QRCode
								value={referralLink}
								size={200}
								style={{
									height: "auto",
									maxWidth: "100%",
									width: "100%",
								}}
								viewBox="0 0 256 256"
							/>
						</div>
					</motion.div>

					{/* Referral Info */}
					<Card className="bg-primary/5 border-primary/20">
						<CardContent className="p-4">
							<div className="space-y-3">
								<div className="flex justify-between items-center">
									<span className="font-medium text-sm">
										Referral Code
									</span>
									<Badge
										variant="secondary"
										className="font-mono"
									>
										{referralCode}
									</Badge>
								</div>
								<div className="space-y-2">
									<span className="font-medium text-sm">
										Referral Link
									</span>
									<div className="flex gap-2">
										<div className="flex-1 bg-muted p-2 rounded font-mono text-xs truncate">
											{referralLink}
										</div>
										<Button
											variant="outline"
											size="sm"
											onClick={handleCopyLink}
											className="flex-shrink-0"
										>
											{copied ? (
												<CheckCircle className="w-4 h-4 text-green-500" />
											) : (
												<Copy className="w-4 h-4" />
											)}
										</Button>
									</div>
								</div>
							</div>
						</CardContent>
					</Card>

					{/* Action Buttons */}
					<div className="gap-3 grid grid-cols-2">
						<Button
							variant="outline"
							onClick={() => handleDownloadQR("png")}
							disabled={downloading}
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							{downloading ? "Downloading..." : "Download PNG"}
						</Button>
						<Button
							variant="outline"
							onClick={() => handleDownloadQR("svg")}
							disabled={downloading}
							className="flex items-center gap-2"
						>
							<Download className="w-4 h-4" />
							{downloading ? "Downloading..." : "Download SVG"}
						</Button>
					</div>

					<Button
						onClick={handleShare}
						className="w-full"
						variant="gradient"
					>
						<Share2 className="mr-2 w-4 h-4" />
						Share QR Code
					</Button>

					{/* Instructions */}
					<div className="bg-muted/50 p-3 rounded-lg">
						<p className="text-muted-foreground text-xs text-center">
							💡 Your friends can scan this QR code with their
							phone camera to quickly access your referral link
						</p>
					</div>
				</div>
			</DialogContent>
		</Dialog>
	);
}

interface QRCodeButtonProps {
	referralCode: string;
	referralLink: string;
	userName?: string;
	variant?: "default" | "outline" | "ghost";
	size?: "sm" | "default" | "lg";
	className?: string;
}

export function QRCodeButton({
	referralCode,
	referralLink,
	userName,
	variant = "outline",
	size = "default",
	className = "",
}: QRCodeButtonProps) {
	const [showQR, setShowQR] = useState(false);

	return (
		<>
			<Button
				variant={variant}
				size={size}
				onClick={() => setShowQR(true)}
				className={className}
			>
				<QrCode className="mr-2 w-4 h-4" />
				Generate QR Code
			</Button>

			<QRCodeGenerator
				referralCode={referralCode}
				referralLink={referralLink}
				userName={userName}
				open={showQR}
				onOpenChange={setShowQR}
			/>
		</>
	);
}
