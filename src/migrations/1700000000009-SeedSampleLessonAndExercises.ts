import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedSampleLessonAndExercises1700000000009 implements MigrationInterface {
  name = 'SeedSampleLessonAndExercises1700000000009';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // First check if we have a category, if not create one
    const categories = await queryRunner.query(`SELECT category_id FROM categories LIMIT 1`);
    let categoryId: number;
    
    if (categories.length === 0) {
      await queryRunner.query(`
        INSERT INTO categories (name, icon_url, order_index, is_active)
        VALUES ('JavaScript', 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg', 1, 1)
      `);
      const newCategory = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      categoryId = newCategory[0].id;
      console.log('Created sample category: JavaScript');
    } else {
      categoryId = categories[0].category_id;
    }

    // Check if we have an admin user
    const users = await queryRunner.query(`SELECT user_id FROM users WHERE role = 'ADMIN' LIMIT 1`);
    let userId: number;
    
    if (users.length === 0) {
      // Use any existing user
      const anyUser = await queryRunner.query(`SELECT user_id FROM users LIMIT 1`);
      if (anyUser.length === 0) {
        console.log('No users found, skipping sample lesson creation');
        return;
      }
      userId = anyUser[0].user_id;
    } else {
      userId = users[0].user_id;
    }

    // Create sample lesson
    await queryRunner.query(`
      INSERT INTO lessons (category_id, title, description, content, difficulty_level, order_index, is_published, created_by)
      VALUES (
        ${categoryId},
        'JavaScript DOM Cơ Bản',
        'Học cách thao tác với DOM (Document Object Model) trong JavaScript',
        '<h1>JavaScript DOM</h1>
<p>DOM (Document Object Model) là một API cho phép JavaScript truy cập và thao tác với các phần tử HTML.</p>

<h2>1. Lấy phần tử HTML</h2>
<pre><code>// Lấy phần tử theo ID
const element = document.getElementById("myId");

// Lấy phần tử theo class
const elements = document.getElementsByClassName("myClass");

// Lấy phần tử theo tag
const divs = document.getElementsByTagName("div");

// Sử dụng querySelector
const first = document.querySelector(".myClass");
const all = document.querySelectorAll(".myClass");
</code></pre>

<h2>2. Thay đổi nội dung</h2>
<pre><code>// Thay đổi nội dung text
element.textContent = "Nội dung mới";

// Thay đổi HTML
element.innerHTML = "&lt;strong&gt;HTML mới&lt;/strong&gt;";
</code></pre>

<h2>3. Thay đổi style</h2>
<pre><code>element.style.color = "red";
element.style.backgroundColor = "yellow";
element.classList.add("active");
element.classList.remove("hidden");
</code></pre>',
        'BEGINNER',
        1,
        1,
        ${userId}
      )
    `);

    const lesson = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
    const lessonId = lesson[0].id;
    console.log('Created sample lesson: JavaScript DOM Cơ Bản');

    // Create sample exercises
    const exercises = [
      {
        question: 'Phương thức nào được sử dụng để lấy một phần tử HTML theo ID?',
        exercise_type: 'MULTIPLE_CHOICE',
        options: JSON.stringify([
          { id: 'A', text: 'document.getElementById()' },
          { id: 'B', text: 'document.getElementByClass()' },
          { id: 'C', text: 'document.querySelector()' },
          { id: 'D', text: 'document.findById()' }
        ]),
        correct_answer: 'A',
        explanation: 'document.getElementById() là phương thức chuẩn để lấy một phần tử HTML theo thuộc tính id. Đây là phương thức nhanh nhất vì id là duy nhất trong document.',
        order_index: 0
      },
      {
        question: 'document.querySelector() chỉ trả về phần tử đầu tiên phù hợp với selector.',
        exercise_type: 'TRUE_FALSE',
        options: JSON.stringify([
          { id: 'TRUE', text: 'Đúng' },
          { id: 'FALSE', text: 'Sai' }
        ]),
        correct_answer: 'TRUE',
        explanation: 'Đúng! document.querySelector() chỉ trả về phần tử đầu tiên phù hợp. Nếu muốn lấy tất cả các phần tử, hãy sử dụng document.querySelectorAll().',
        order_index: 1
      },
      {
        question: 'Thuộc tính nào được sử dụng để thay đổi nội dung HTML của một phần tử?',
        exercise_type: 'MULTIPLE_CHOICE',
        options: JSON.stringify([
          { id: 'A', text: 'textContent' },
          { id: 'B', text: 'innerHTML' },
          { id: 'C', text: 'innerText' },
          { id: 'D', text: 'content' }
        ]),
        correct_answer: 'B',
        explanation: 'innerHTML cho phép bạn thay đổi nội dung HTML bên trong phần tử, bao gồm cả các thẻ HTML. textContent chỉ thay đổi text thuần túy.',
        order_index: 2
      },
      {
        question: 'Phương thức classList.toggle() làm gì?',
        exercise_type: 'MULTIPLE_CHOICE',
        options: JSON.stringify([
          { id: 'A', text: 'Xóa class khỏi phần tử' },
          { id: 'B', text: 'Thêm class vào phần tử' },
          { id: 'C', text: 'Thêm class nếu chưa có, xóa nếu đã có' },
          { id: 'D', text: 'Kiểm tra class có tồn tại không' }
        ]),
        correct_answer: 'C',
        explanation: 'classList.toggle() sẽ thêm class nếu phần tử chưa có class đó, hoặc xóa class nếu phần tử đã có. Rất hữu ích cho việc bật/tắt trạng thái.',
        order_index: 3
      },
      {
        question: 'document.getElementsByClassName() trả về một mảng (Array) thực sự.',
        exercise_type: 'TRUE_FALSE',
        options: JSON.stringify([
          { id: 'TRUE', text: 'Đúng' },
          { id: 'FALSE', text: 'Sai' }
        ]),
        correct_answer: 'FALSE',
        explanation: 'Sai! getElementsByClassName() trả về một HTMLCollection, không phải Array. Để sử dụng các phương thức của Array như forEach(), bạn cần chuyển đổi: Array.from(elements) hoặc [...elements].',
        order_index: 4
      }
    ];

    for (const ex of exercises) {
      await queryRunner.query(`
        INSERT INTO lesson_exercises (lesson_id, question, exercise_type, options, correct_answer, explanation, order_index)
        VALUES (${lessonId}, '${ex.question}', '${ex.exercise_type}', '${ex.options}', '${ex.correct_answer}', '${ex.explanation}', ${ex.order_index})
      `);
    }

    console.log(`Created ${exercises.length} sample exercises for lesson ${lessonId}`);
    console.log('');
    console.log('=== SAMPLE DATA CREATED ===');
    console.log(`Lesson ID: ${lessonId}`);
    console.log('You can test with:');
    console.log(`  GET /api/exercises/lesson/${lessonId} - Get all exercises`);
    console.log(`  GET /api/exercises/lesson/${lessonId}/start - Start exercise session`);
    console.log('===========================');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete sample exercises and lesson
    await queryRunner.query(`
      DELETE FROM lesson_exercises 
      WHERE lesson_id IN (SELECT lesson_id FROM lessons WHERE title = 'JavaScript DOM Cơ Bản')
    `);
    
    await queryRunner.query(`
      DELETE FROM lessons WHERE title = 'JavaScript DOM Cơ Bản'
    `);
    
    console.log('Removed sample lesson and exercises');
  }
}
