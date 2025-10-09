/**
 * Design System Demo Component
 * Showcases all the new Phase 1 enhancements
 * This file can be removed after Phase 2
 */

import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton, SkeletonCard, SkeletonText, SkeletonCourseCard } from "@/components/ui/skeleton";
import { motion } from "framer-motion";
import { fadeInUp, staggerContainer, staggerItem } from "@/lib/animations";
import { gradients, shadows, glassEffect, textGradient, center, typography, spacing } from "@/lib/cn";
import { Sparkles, Zap, Star, TrendingUp } from "lucide-react";

export function DesignSystemDemo() {
  return (
    <div className="min-h-screen bg-gradient-mesh p-8">
      <div className="max-w-7xl mx-auto space-y-12">
        {/* Header */}
        <motion.div
          variants={fadeInUp}
          initial="hidden"
          animate="visible"
          className="text-center space-y-4"
        >
          <h1 className={textGradient("ocean") + " " + typography.h1}>
            Phase 1 Complete! 🎉
          </h1>
          <p className="text-xl text-muted-foreground">
            Modern UI Foundation Ready
          </p>
        </motion.div>

        {/* Buttons Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={staggerItem} className={typography.h3}>
            Enhanced Buttons
          </motion.h2>
          
          <motion.div variants={staggerItem} className="flex flex-wrap gap-4">
            <Button variant="default">Default</Button>
            <Button variant="gradient">Gradient</Button>
            <Button variant="gradient-ocean">Ocean</Button>
            <Button variant="gradient-sunset">Sunset</Button>
            <Button variant="gradient-forest">Forest</Button>
            <Button variant="gradient-cosmic">Cosmic</Button>
            <Button variant="glass">Glass</Button>
            <Button variant="success">Success</Button>
            <Button variant="warning">Warning</Button>
            <Button variant="glow">Glowing</Button>
          </motion.div>

          <motion.div variants={staggerItem} className="flex flex-wrap gap-4 items-center">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button size="xl">Extra Large</Button>
            <Button animated variant="gradient">
              <Sparkles className="mr-2 h-4 w-4" />
              Animated
            </Button>
          </motion.div>
        </motion.div>

        {/* Cards Section */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="space-y-6"
        >
          <motion.h2 variants={staggerItem} className={typography.h3}>
            Enhanced Cards
          </motion.h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card variant="default" hover="lift">
              <CardHeader>
                <CardTitle>Default Card</CardTitle>
                <CardDescription>With lift hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Clean and simple design with smooth shadows.</p>
              </CardContent>
            </Card>

            <Card variant="elevated" hover="glow">
              <CardHeader>
                <CardTitle>Elevated Card</CardTitle>
                <CardDescription>With glow hover effect</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Higher elevation with glowing hover.</p>
              </CardContent>
            </Card>

            <Card variant="glass" hover="scale">
              <CardHeader>
                <CardTitle className="text-white">Glass Card</CardTitle>
                <CardDescription className="text-white/80">
                  Glassmorphism effect
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-white/90">Beautiful frosted glass effect.</p>
              </CardContent>
            </Card>

            <Card variant="gradient" animated>
              <CardHeader>
                <CardTitle>Gradient Card</CardTitle>
                <CardDescription>With fade-in animation</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Beautiful gradient background.</p>
              </CardContent>
            </Card>

            <Card variant="outline" hover="lift">
              <CardHeader>
                <CardTitle>Outline Card</CardTitle>
                <CardDescription>Minimal border design</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Clean outlined variant.</p>
              </CardContent>
            </Card>

            <Card variant="flat" hover="scale">
              <CardHeader>
                <CardTitle>Flat Card</CardTitle>
                <CardDescription>No shadows or borders</CardDescription>
              </CardHeader>
              <CardContent>
                <p>Minimalist flat design.</p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Animations Demo */}
        <div className="space-y-6">
          <h2 className={typography.h3}>Animations & Effects</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-6 rounded-xl bg-gradient-primary text-white cursor-pointer"
            >
              <Zap className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">Hover Me</h3>
              <p className="text-sm opacity-90">Scale animation</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="p-6 rounded-xl bg-gradient-forest text-white"
            >
              <Star className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">Floating</h3>
              <p className="text-sm opacity-90">Float animation</p>
            </motion.div>

            <motion.div
              animate={{ rotate: [0, 5, 0, -5, 0] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="p-6 rounded-xl bg-gradient-sunset text-white"
            >
              <TrendingUp className="h-8 w-8 mb-2" />
              <h3 className="font-semibold mb-1">Wiggle</h3>
              <p className="text-sm opacity-90">Rotation animation</p>
            </motion.div>
          </div>
        </div>

        {/* Skeleton Loaders */}
        <div className="space-y-6">
          <h2 className={typography.h3}>Skeleton Loaders</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-4">Course Card Skeleton</h4>
              <SkeletonCourseCard />
            </div>

            <div>
              <h4 className="font-semibold mb-4">Generic Card Skeleton</h4>
              <SkeletonCard />
            </div>

            <div>
              <h4 className="font-semibold mb-4">Text Skeleton</h4>
              <SkeletonText lines={5} />
            </div>

            <div>
              <h4 className="font-semibold mb-4">Custom Skeleton</h4>
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          </div>
        </div>

        {/* Utility Classes Demo */}
        <div className="space-y-6">
          <h2 className={typography.h3}>Utility Classes</h2>
          
          <div className="space-y-4">
            <div className={glassEffect + " p-6 rounded-xl"}>
              <h3 className="font-semibold mb-2">Glassmorphism</h3>
              <p className="text-sm">Using the <code>.glass</code> utility class</p>
            </div>

            <div className="animated-gradient p-6 rounded-xl text-white">
              <h3 className="font-semibold mb-2">Animated Gradient</h3>
              <p className="text-sm">Smoothly shifting gradient background</p>
            </div>

            <div className="hover-lift bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-semibold mb-2">Hover Lift</h3>
              <p className="text-sm">Lifts up when you hover</p>
            </div>

            <div className="card-glow bg-white p-6 rounded-xl shadow-md">
              <h3 className="font-semibold mb-2">Card Glow</h3>
              <p className="text-sm">Glows when you hover</p>
            </div>
          </div>
        </div>

        {/* Typography */}
        <div className="space-y-6 bg-white p-8 rounded-xl shadow-lg">
          <h2 className={typography.h3}>Typography System</h2>
          
          <div className="space-y-4">
            <h1 className={typography.h1}>Heading 1 - Poppins Bold</h1>
            <h2 className={typography.h2}>Heading 2 - Poppins Bold</h2>
            <h3 className={typography.h3}>Heading 3 - Poppins Semibold</h3>
            <h4 className={typography.h4}>Heading 4 - Poppins Semibold</h4>
            <p className={typography.body}>Body text using Inter font family. Clean and readable for all content.</p>
            <p className={typography.small}>Small text for captions and metadata.</p>
            <p className={typography.tiny}>Tiny text for legal or footnotes.</p>
          </div>
        </div>

        {/* Success Message */}
        <Card variant="elevated" className="border-success-500 border-2">
          <CardHeader>
            <CardTitle className="text-success-600 flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              Phase 1 Complete!
            </CardTitle>
            <CardDescription>
              All foundation components are ready for Phase 2
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Modern design tokens
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Framer Motion animations
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Enhanced components
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Glassmorphism effects
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Beautiful gradients
              </p>
              <p className="flex items-center gap-2">
                <Badge variant="default">✓</Badge> Modern typography
              </p>
            </div>
          </CardContent>
          <CardFooter>
            <Button variant="gradient" size="lg" className="w-full">
              Ready for Phase 2 →
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}

