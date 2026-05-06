const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Departments
  const csDept = await prisma.department.upsert({
    where: { code: 'CS' },
    update: {},
    create: {
      name: 'Computer Science',
      code: 'CS',
      description: 'Department of Computer Science and Engineering'
    }
  });

  const eeDept = await prisma.department.upsert({
    where: { code: 'EE' },
    update: {},
    create: {
      name: 'Electrical Engineering',
      code: 'EE',
      description: 'Department of Electrical and Electronics Engineering'
    }
  });

  const meDept = await prisma.department.upsert({
    where: { code: 'ME' },
    update: {},
    create: {
      name: 'Mechanical Engineering',
      code: 'ME',
      description: 'Department of Mechanical Engineering'
    }
  });

  const baDept = await prisma.department.upsert({
    where: { code: 'BA' },
    update: {},
    create: {
      name: 'Business Administration',
      code: 'BA',
      description: 'Department of Business Administration and Management'
    }
  });

  console.log('✅ Departments created');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@university.edu' },
    update: {},
    create: {
      supabaseId: 'admin-supabase-id-placeholder',
      email: 'admin@university.edu',
      passwordHash: adminPassword,
      role: 'ADMIN',
      profile: {
        create: {
          firstName: 'System',
          lastName: 'Administrator',
          employeeId: 'ADM00001',
          phone: '+1234567890'
        }
      }
    }
  });

  // Create Faculty Users
  const facultyPassword = await bcrypt.hash('faculty123', 12);
  const faculty1 = await prisma.user.upsert({
    where: { email: 'john.smith@university.edu' },
    update: {},
    create: {
      supabaseId: 'faculty1-supabase-id-placeholder',
      email: 'john.smith@university.edu',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      profile: {
        create: {
          firstName: 'John',
          lastName: 'Smith',
          employeeId: 'FAC00001',
          departmentId: csDept.id,
          phone: '+1234567891'
        }
      }
    },
    include: { profile: true }
  });

  const faculty2 = await prisma.user.upsert({
    where: { email: 'sarah.johnson@university.edu' },
    update: {},
    create: {
      supabaseId: 'faculty2-supabase-id-placeholder',
      email: 'sarah.johnson@university.edu',
      passwordHash: facultyPassword,
      role: 'FACULTY',
      profile: {
        create: {
          firstName: 'Sarah',
          lastName: 'Johnson',
          employeeId: 'FAC00002',
          departmentId: eeDept.id,
          phone: '+1234567892'
        }
      }
    },
    include: { profile: true }
  });

  console.log('✅ Faculty created');

  // Create Student Users
  const studentPassword = await bcrypt.hash('student123', 12);
  const student1 = await prisma.user.upsert({
    where: { email: 'alice.williams@university.edu' },
    update: {},
    create: {
      supabaseId: 'student1-supabase-id-placeholder',
      email: 'alice.williams@university.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      profile: {
        create: {
          firstName: 'Alice',
          lastName: 'Williams',
          studentId: 'STU20240001',
          departmentId: csDept.id,
          phone: '+1234567893',
          dateOfBirth: new Date('2002-05-15')
        }
      }
    },
    include: { profile: true }
  });

  const student2 = await prisma.user.upsert({
    where: { email: 'bob.davis@university.edu' },
    update: {},
    create: {
      supabaseId: 'student2-supabase-id-placeholder',
      email: 'bob.davis@university.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      profile: {
        create: {
          firstName: 'Bob',
          lastName: 'Davis',
          studentId: 'STU20240002',
          departmentId: csDept.id,
          phone: '+1234567894',
          dateOfBirth: new Date('2001-11-22')
        }
      }
    },
    include: { profile: true }
  });

  const student3 = await prisma.user.upsert({
    where: { email: 'carol.martinez@university.edu' },
    update: {},
    create: {
      supabaseId: 'student3-supabase-id-placeholder',
      email: 'carol.martinez@university.edu',
      passwordHash: studentPassword,
      role: 'STUDENT',
      profile: {
        create: {
          firstName: 'Carol',
          lastName: 'Martinez',
          studentId: 'STU20240003',
          departmentId: eeDept.id,
          phone: '+1234567895',
          dateOfBirth: new Date('2002-08-10')
        }
      }
    },
    include: { profile: true }
  });

  console.log('✅ Students created');

  // Create Courses
  const course1 = await prisma.course.upsert({
    where: { code: 'CS101' },
    update: {},
    create: {
      name: 'Introduction to Computer Science',
      code: 'CS101',
      description: 'Fundamentals of computer science including algorithms and data structures',
      credits: 4,
      semester: 'SPRING_2025',
      departmentId: csDept.id,
      facultyId: faculty1.profile.id,
      maxCapacity: 60
    }
  });

  const course2 = await prisma.course.upsert({
    where: { code: 'CS201' },
    update: {},
    create: {
      name: 'Data Structures and Algorithms',
      code: 'CS201',
      description: 'Advanced data structures, algorithm design and analysis',
      credits: 4,
      semester: 'SPRING_2025',
      departmentId: csDept.id,
      facultyId: faculty1.profile.id,
      maxCapacity: 45
    }
  });

  const course3 = await prisma.course.upsert({
    where: { code: 'EE101' },
    update: {},
    create: {
      name: 'Circuit Analysis',
      code: 'EE101',
      description: 'Introduction to electrical circuits and analysis techniques',
      credits: 3,
      semester: 'SPRING_2025',
      departmentId: eeDept.id,
      facultyId: faculty2.profile.id,
      maxCapacity: 50
    }
  });

  const course4 = await prisma.course.upsert({
    where: { code: 'CS301' },
    update: {},
    create: {
      name: 'Database Systems',
      code: 'CS301',
      description: 'Relational databases, SQL, and database design principles',
      credits: 3,
      semester: 'SPRING_2025',
      departmentId: csDept.id,
      facultyId: faculty1.profile.id,
      maxCapacity: 40
    }
  });

  console.log('✅ Courses created');

  // Create Enrollments
  await prisma.enrollment.createMany({
    data: [
      { studentId: student1.profile.id, courseId: course1.id },
      { studentId: student1.profile.id, courseId: course2.id },
      { studentId: student1.profile.id, courseId: course4.id },
      { studentId: student2.profile.id, courseId: course1.id },
      { studentId: student2.profile.id, courseId: course2.id },
      { studentId: student3.profile.id, courseId: course3.id },
      { studentId: student3.profile.id, courseId: course1.id },
    ],
    skipDuplicates: true
  });

  console.log('✅ Enrollments created');

  // Create Attendance Records
  const today = new Date();
  const dates = Array.from({ length: 10 }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - i - 1);
    return d;
  });

  for (const date of dates.slice(0, 5)) {
    await prisma.attendance.createMany({
      data: [
        { studentId: student1.profile.id, courseId: course1.id, date, status: Math.random() > 0.2 ? 'PRESENT' : 'ABSENT', markedBy: faculty1.profile.id },
        { studentId: student2.profile.id, courseId: course1.id, date, status: Math.random() > 0.3 ? 'PRESENT' : 'LATE', markedBy: faculty1.profile.id },
        { studentId: student3.profile.id, courseId: course1.id, date, status: Math.random() > 0.1 ? 'PRESENT' : 'ABSENT', markedBy: faculty1.profile.id },
      ],
      skipDuplicates: true
    });
  }

  console.log('✅ Attendance records created');

  // Create Grades
  await prisma.grade.createMany({
    data: [
      { studentId: student1.profile.id, courseId: course1.id, semester: 'FALL_2024', midterm: 85, final: 90, assignment: 88, totalMarks: 88, grade: 'A', gpa: 4.0, gradedBy: faculty1.profile.id },
      { studentId: student1.profile.id, courseId: course2.id, semester: 'FALL_2024', midterm: 78, final: 82, assignment: 80, totalMarks: 80, grade: 'B+', gpa: 3.5, gradedBy: faculty1.profile.id },
      { studentId: student2.profile.id, courseId: course1.id, semester: 'FALL_2024', midterm: 92, final: 88, assignment: 95, totalMarks: 91, grade: 'A+', gpa: 4.0, gradedBy: faculty1.profile.id },
      { studentId: student3.profile.id, courseId: course3.id, semester: 'FALL_2024', midterm: 70, final: 75, assignment: 72, totalMarks: 72, grade: 'B', gpa: 3.0, gradedBy: faculty2.profile.id },
    ],
    skipDuplicates: true
  });

  console.log('✅ Grades created');

  // Create Fee Status
  await prisma.feeStatus.createMany({
    data: [
      { studentId: student1.profile.id, semester: 'SPRING_2025', totalAmount: 15000, paidAmount: 15000, dueDate: new Date('2025-01-15'), status: 'PAID', paidAt: new Date('2025-01-10') },
      { studentId: student2.profile.id, semester: 'SPRING_2025', totalAmount: 15000, paidAmount: 7500, dueDate: new Date('2025-01-15'), status: 'PARTIAL' },
      { studentId: student3.profile.id, semester: 'SPRING_2025', totalAmount: 15000, paidAmount: 0, dueDate: new Date('2025-01-15'), status: 'OVERDUE' },
    ],
    skipDuplicates: true
  });

  console.log('✅ Fee status records created');
  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Test Credentials:');
  console.log('   Admin:   admin@university.edu / admin123');
  console.log('   Faculty: john.smith@university.edu / faculty123');
  console.log('   Student: alice.williams@university.edu / student123');
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
