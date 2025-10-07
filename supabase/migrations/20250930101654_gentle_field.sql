/*
  # Insert Sample Courses Data

  1. Sample Courses
    - Digital Marketing
    - Graphics Design  
    - Video Editing
    - English Communication
    - Web Development
    - Application Development

  2. Features
    - Realistic pricing and duration
    - Student counts and ratings
    - Proper instructor assignments
*/

-- Insert sample courses
INSERT INTO courses (id, title, description, image, price, duration, students, rating, level, instructor) VALUES
(
  uuid_generate_v4(),
  'Digital Marketing',
  'Master social media, SEO, PPC, and content marketing strategies to grow your business and career in the digital age.',
  '/src/assets/digital-marketing.jpg',
  850.00,
  '8 weeks',
  1250,
  4.8,
  'Beginner to Intermediate',
  'Sarah Johnson'
),
(
  uuid_generate_v4(),
  'Graphics Design',
  'Learn professional graphic design using Adobe Creative Suite. Master typography, color theory, branding, and visual communication.',
  '/src/assets/graphics-design.jpg',
  850.00,
  '10 weeks',
  890,
  4.9,
  'Beginner to Intermediate',
  'Mike Chen'
),
(
  uuid_generate_v4(),
  'Video Editing',
  'Create professional videos using industry-standard software. Learn advanced editing techniques, motion graphics, and storytelling.',
  '/src/assets/video-editing.jpg',
  850.00,
  '12 weeks',
  670,
  4.7,
  'Intermediate to Advanced',
  'Alex Rodriguez'
),
(
  uuid_generate_v4(),
  'English Communication',
  'Enhance your English fluency with comprehensive speaking, writing, listening, and reading skills for business and daily use.',
  '/src/assets/english-communication.jpg',
  850.00,
  '6 weeks',
  2100,
  4.6,
  'All Levels',
  'Emma Thompson'
),
(
  uuid_generate_v4(),
  'Web Development',
  'Full-stack development with HTML, CSS, JavaScript, React, and Node.js. Build modern web applications from scratch.',
  '/src/assets/web-development.jpg',
  850.00,
  '16 weeks',
  1580,
  4.9,
  'Intermediate to Advanced',
  'David Kim'
),
(
  uuid_generate_v4(),
  'Application Development',
  'Develop cross-platform mobile and desktop applications using modern frameworks like React Native and Flutter.',
  '/src/assets/app-development.jpg',
  850.00,
  '14 weeks',
  920,
  4.8,
  'Advanced',
  'Lisa Wang'
);