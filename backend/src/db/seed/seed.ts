import { db } from '../index';
import { users, courses, chapters, quizzes, assignments } from '../schema';
import { hash } from 'bcryptjs';
import { sql } from 'drizzle-orm';

// Define the Question type to match the schema
interface Question {
  id: string;
  type: 'multiple-choice' | 'true-false' | 'short-answer' | 'essay';
  question: string;
  options?: string[];
  correctAnswer: string | string[];
  points: number;
  explanation?: string;
}

async function seed() {
  try {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await db.execute(sql`
      TRUNCATE TABLE 
        users, 
        courses, 
        chapters, 
        quizzes, 
        assignments 
      CASCADE;
    `);
    console.log('🧹 Cleared existing data');

    // Create sample users
    const hashedPassword = await hash('password123', 10);
    
    const lecturer = await db.insert(users).values({
      fullName: 'Dr. John Smith',
      email: 'john.smith@university.com',
      password: hashedPassword,
      role: 'lecturer',
      bio: 'Senior Professor in Computer Science with 15 years of experience.',
      isVerified: true,
    }).returning();

    const student1 = await db.insert(users).values({
      fullName: 'Alice Johnson',
      email: 'alice.johnson@student.com',
      password: hashedPassword,
      role: 'student',
      bio: 'Computer Science student passionate about AI and Machine Learning.',
      isVerified: true,
    }).returning();

    const student2 = await db.insert(users).values({
      fullName: 'Bob Williams',
      email: 'bob.williams@student.com',
      password: hashedPassword,
      role: 'student',
      bio: 'Software Engineering student interested in web development.',
      isVerified: true,
    }).returning();

    console.log('✅ Created users:');
    console.log(`   - ${lecturer[0].fullName} (${lecturer[0].role})`);
    console.log(`   - ${student1[0].fullName} (${student1[0].role})`);
    console.log(`   - ${student2[0].fullName} (${student2[0].role})`);

    // Create sample course
    const course = await db.insert(courses).values({
      title: 'Complete Web Development Bootcamp 2024',
      slug: 'complete-web-development-bootcamp-2024',
      description: 'Master web development by building real-world projects. Learn HTML, CSS, JavaScript, React, Node.js, and MongoDB.',
      category: 'Web Development',
      thumbnail: 'https://example.com/thumbnails/web-dev-bootcamp.jpg',
      price: '99.99',
      isPublished: true,
      instructorId: lecturer[0].id,
      whatYouWillLearn: [
        'Build modern, responsive websites',
        'Master React.js and Next.js',
        'Create RESTful APIs with Node.js',
        'Work with databases (SQL & NoSQL)',
        'Deploy applications to production'
      ],
      requirements: [
        'Basic computer knowledge',
        'No prior programming experience required',
        'A computer with internet access'
      ],
      targetAudience: [
        'Complete beginners',
        'Developers wanting to transition to web development',
        'Professionals looking to update their skills'
      ],
      students: [student1[0].id, student2[0].id],
    }).returning();

    console.log(`✅ Created course: "${course[0].title}"`);

    // Create sample chapters
    await db.insert(chapters).values({
      title: 'Introduction to Web Development',
      description: 'Understand the fundamentals of web development, how the web works, and what tools you need to get started.',
      videoUrl: 'https://example.com/videos/intro-web-dev.mp4',
      videoDuration: 1800,
      order: 1,
      isFree: true,
      isPublished: true,
      courseId: course[0].id,
    });

    await db.insert(chapters).values({
      title: 'HTML Fundamentals',
      description: 'Learn the structure of web pages with HTML. Master tags, attributes, forms, and semantic HTML.',
      videoUrl: 'https://example.com/videos/html-fundamentals.mp4',
      videoDuration: 3600,
      order: 2,
      isFree: false,
      isPublished: true,
      courseId: course[0].id,
    });

    await db.insert(chapters).values({
      title: 'CSS Styling Essentials',
      description: 'Make your websites beautiful with CSS. Learn selectors, layouts, Flexbox, Grid, and animations.',
      videoUrl: 'https://example.com/videos/css-essentials.mp4',
      videoDuration: 5400,
      order: 3,
      isFree: false,
      isPublished: true,
      courseId: course[0].id,
    });

    console.log(`✅ Created ${3} chapters for the course`);

    // Define questions with proper typing
    const questions: Question[] = [
      {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Hyper Transfer Markup Language',
          'High Text Machine Language'
        ],
        correctAnswer: 'Hyper Text Markup Language',
        points: 10,
        explanation: 'HTML stands for Hyper Text Markup Language, the standard markup language for creating web pages.'
      },
      {
        id: 'q2',
        type: 'multiple-choice',
        question: 'Which CSS property is used to change the background color?',
        options: [
          'color',
          'background-color',
          'bgcolor',
          'background'
        ],
        correctAnswer: 'background-color',
        points: 10,
        explanation: 'The background-color property sets the background color of an element.'
      },
      {
        id: 'q3',
        type: 'true-false',
        question: 'JavaScript is a compiled language.',
        options: ['True', 'False'],
        correctAnswer: 'False',
        points: 10,
        explanation: 'JavaScript is an interpreted language, not compiled. It runs directly in the browser.'
      },
      {
        id: 'q4',
        type: 'multiple-choice',
        question: 'Which HTML tag is used to create a hyperlink?',
        options: [
          '<link>',
          '<a>',
          '<href>',
          '<url>'
        ],
        correctAnswer: '<a>',
        points: 10,
        explanation: 'The <a> (anchor) tag is used to create hyperlinks in HTML.'
      },
      {
        id: 'q5',
        type: 'short-answer',
        question: 'What is the correct HTML element for inserting a line break?',
        correctAnswer: '<br>',
        points: 10,
        explanation: 'The <br> tag inserts a single line break in HTML.'
      }
    ];

    // Create sample quiz with typed questions
    const quiz = await db.insert(quizzes).values({
      title: 'HTML & CSS Fundamentals Quiz',
      description: 'Test your knowledge of HTML and CSS basics. This quiz covers topics from the first three chapters.',
      timeLimit: 30,
      passingScore: 70,
      maxAttempts: 2,
      shuffleQuestions: true,
      shuffleOptions: true,
      courseId: course[0].id,
      questions: questions as any, // Type assertion to handle JSONB
    }).returning();

    console.log(`✅ Created quiz: "${quiz[0].title}" with ${(quiz[0].questions as Question[]).length} questions`);

    // Create sample assignment
    await db.insert(assignments).values({
      title: 'Build Your Personal Portfolio',
      description: 'Create a personal portfolio website using HTML and CSS. The portfolio should include:\n- About Me section\n- Projects gallery\n- Contact form\n- Resume download link',
      maxScore: 100,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      submissionType: 'both',
      allowLateSubmission: true,
      lateSubmissionPenalty: 10,
      courseId: course[0].id,
    });

    console.log(`✅ Created assignment: "Build Your Personal Portfolio"`);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - ${3} users (1 lecturer, 2 students)`);
    console.log(`   - ${1} course`);
    console.log(`   - ${3} chapters`);
    console.log(`   - ${1} quiz with ${(quiz[0].questions as Question[]).length} questions`);
    console.log(`   - ${1} assignment`);
    console.log('\n💡 Test Credentials:');
    console.log(`   Lecturer: john.smith@university.com / password123`);
    console.log(`   Student: alice.johnson@student.com / password123`);
    console.log(`   Student: bob.williams@student.com / password123`);
    
    process.exit(0);
  } catch (error) {
    const err = error as Error;
    console.error('❌ Seeding failed:', err.message);
    if (err.stack) {
      console.error('📝 Stack trace:', err.stack);
    }
    process.exit(1);
  }
}

seed();