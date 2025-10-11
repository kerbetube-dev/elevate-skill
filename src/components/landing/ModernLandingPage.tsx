/**
 * Modern Landing Page - Complete Redesign
 * Professional, animated, responsive landing experience with all sections
 * No loading states - each component handles its own data fetching
 */

import { motion } from "framer-motion";

// Import all landing page sections
import { Navbar } from "./Navbar";
import { HeroSection } from "./HeroSection";
import { FeaturesSection } from "./FeaturesSection";
import { CoursesShowcase } from "./CoursesShowcase";
import { TestimonialsSection } from "./TestimonialsSection";
import { CTASection } from "./CTASection";
import { FAQSection } from "./FAQSection";
import { Footer } from "./Footer";

const ModernLandingPage = () => {
	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.5 }}
			className="bg-background min-h-screen overflow-x-hidden"
		>
			{/* Modern Navbar */}
			<Navbar />

			{/* Main Content */}
			<main className="relative">
				{/* Hero Section */}
				<section id="home" className="pt-16 md:pt-20">
					<HeroSection />
				</section>

				{/* Features Section */}
				<section id="features" className="scroll-mt-20">
					<FeaturesSection />
				</section>

				{/* Testimonials Section */}
				<section id="testimonials" className="scroll-mt-20">
					<TestimonialsSection />
				</section>

				{/* FAQ Section */}
				<section id="faq" className="scroll-mt-20">
					<FAQSection />
				</section>

				{/* Call to Action Section */}
				<section id="cta" className="scroll-mt-20">
					<CTASection />
				</section>
			</main>

			{/* Modern Footer */}
			<Footer />
		</motion.div>
	);
};

export default ModernLandingPage;
