#!/usr/bin/env python3
"""
Update existing courses with sample outcomes and curriculum
"""

import asyncio
from database.connection import get_async_session
from sqlalchemy import text

async def update_courses():
    """Update existing courses with sample data"""
    async with get_async_session() as session:
        try:
            # Update Digital Marketing course
            await session.execute(text("""
                UPDATE courses 
                SET outcomes = '["Master social media marketing strategies", "Understand SEO fundamentals and implementation", "Create effective PPC campaigns", "Develop content marketing strategies", "Analyze marketing metrics and ROI"]'::jsonb,
                    curriculum = '["Week 1: Introduction to Digital Marketing", "Week 2: Social Media Marketing", "Week 3: Search Engine Optimization (SEO)", "Week 4: Pay-Per-Click (PPC) Advertising", "Week 5: Content Marketing", "Week 6: Email Marketing", "Week 7: Analytics and Metrics", "Week 8: Final Project and Portfolio"]'::jsonb
                WHERE title = 'Digital Marketing'
            """))
            
            # Update Graphics Design course
            await session.execute(text("""
                UPDATE courses 
                SET outcomes = '["Master Adobe Creative Suite tools", "Understand design principles and color theory", "Create professional branding materials", "Develop typography skills", "Build a design portfolio"]'::jsonb,
                    curriculum = '["Week 1: Introduction to Graphic Design", "Week 2: Adobe Photoshop Basics", "Week 3: Adobe Illustrator Fundamentals", "Week 4: Typography and Layout", "Week 5: Color Theory and Application", "Week 6: Branding and Identity Design", "Week 7: Print Design Principles", "Week 8: Digital Design and Web Graphics", "Week 9: Portfolio Development", "Week 10: Final Project Presentation"]'::jsonb
                WHERE title = 'Graphics Design'
            """))
            
            # Update Video Editing course
            await session.execute(text("""
                UPDATE courses 
                SET outcomes = '["Master professional video editing software", "Learn advanced editing techniques", "Create motion graphics and effects", "Develop storytelling skills", "Build a professional video portfolio"]'::jsonb,
                    curriculum = '["Week 1: Introduction to Video Editing", "Week 2: Basic Editing Techniques", "Week 3: Advanced Editing Tools", "Week 4: Color Correction and Grading", "Week 5: Audio Editing and Mixing", "Week 6: Motion Graphics Basics", "Week 7: Effects and Transitions", "Week 8: Export and Delivery", "Week 9: Portfolio Development", "Week 10: Final Project"]'::jsonb
                WHERE title = 'Video Editing'
            """))
            
            await session.commit()
            print("✅ Successfully updated courses with outcomes and curriculum")
            
        except Exception as e:
            print(f"❌ Error updating courses: {e}")
            await session.rollback()
            raise

if __name__ == "__main__":
    asyncio.run(update_courses())
