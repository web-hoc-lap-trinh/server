import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedDiscussionsAndReplies1766100000000 implements MigrationInterface {
  name = 'SeedDiscussionsAndReplies1766100000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get user IDs
    const users = await queryRunner.query(`SELECT user_id, email FROM users LIMIT 2`);
    const userId = users.find((u: any) => u.email === 'user@gmail.com')?.user_id || 1;
    const adminId = users.find((u: any) => u.email === 'admin@gmail.com')?.user_id || 2;

    // Get some problem IDs
    const problems = await queryRunner.query(`
      SELECT problem_id, title FROM problems 
      WHERE title IN (
        'Hello World',
        'Tổng hai số',
        'Số chẵn hay lẻ',
        'Kiểm tra số nguyên tố',
        'Sắp xếp mảng',
        'Fibonacci',
        'Tìm kiếm nhị phân'
      )
    `);

    const problemMap = new Map<string, number>();
    for (const problem of problems) {
      problemMap.set(problem.title, problem.problem_id);
    }

    // ==========================================
    // SEED DISCUSSIONS
    // ==========================================

    // Discussion 1: Question về Hello World
    const helloWorldProblemId = problemMap.get('Hello World');
    if (helloWorldProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${helloWorldProblemId},
          ${userId},
          'Tại sao code của mình bị lỗi?',
          'Em viết code như sau:\n\`\`\`python\nprint("Hello World")\n\`\`\`\n\nNhưng nó báo Wrong Answer. Em không biết sai ở đâu ạ. Mong mọi người giúp đỡ!',
          'QUESTION',
          false,
          5,
          0,
          45,
          0,
          DATE_SUB(NOW(), INTERVAL 3 DAY),
          DATE_SUB(NOW(), INTERVAL 3 DAY)
        )
      `);

      const [discussion1] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion1Id = discussion1.id;

      // Reply cho Discussion 1
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion1Id},
          ${adminId},
          'Chào bạn! Lỗi của bạn là output phải là "Hello, World!" (có dấu phẩy sau Hello). Bạn hãy thử lại nhé!',
          8,
          0,
          DATE_SUB(NOW(), INTERVAL 3 DAY),
          DATE_SUB(NOW(), INTERVAL 3 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 1 WHERE discussion_id = ${discussion1Id}
      `);

      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion1Id},
          ${userId},
          'Cảm ơn bạn nhiều! Mình đã fix và pass rồi! 🎉',
          3,
          0,
          DATE_SUB(NOW(), INTERVAL 2 DAY),
          DATE_SUB(NOW(), INTERVAL 2 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 2 WHERE discussion_id = ${discussion1Id}
      `);
    }

    // Discussion 2: Solution cho Tổng hai số
    const sumProblemId = problemMap.get('Tổng hai số');
    if (sumProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${sumProblemId},
          ${adminId},
          'Solution Python cơ bản - Tổng hai số',
          '## Phân tích bài toán\n\nĐây là bài toán cơ bản nhất để làm quen với việc đọc input và xuất output.\n\n## Code Python\n\`\`\`python\na, b = map(int, input().split())\nprint(a + b)\n\`\`\`\n\n## Giải thích\n\n1. **\`input().split()\`**: Đọc một dòng và tách thành các chuỗi\n2. **\`map(int, ...)\`**: Chuyển các chuỗi thành số nguyên\n3. **\`a, b = ...\`**: Unpacking vào 2 biến\n4. **\`print(a + b)\`**: In ra tổng\n\n## Độ phức tạp\n- Time: O(1)\n- Space: O(1)',
          'SOLUTION',
          true,
          24,
          0,
          156,
          0,
          DATE_SUB(NOW(), INTERVAL 5 DAY),
          DATE_SUB(NOW(), INTERVAL 5 DAY)
        )
      `);

      const [discussion2] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion2Id = discussion2.id;

      // Reply cho Discussion 2
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion2Id},
          ${userId},
          'Cảm ơn admin! Solution rất dễ hiểu và chi tiết! 👍',
          5,
          0,
          DATE_SUB(NOW(), INTERVAL 4 DAY),
          DATE_SUB(NOW(), INTERVAL 4 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 1 WHERE discussion_id = ${discussion2Id}
      `);
    }

    // Discussion 3: Question về số nguyên tố
    const primeProblemId = problemMap.get('Kiểm tra số nguyên tố');
    if (primeProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${primeProblemId},
          ${userId},
          'Code bị Time Limit Exceeded',
          'Em viết code kiểm tra từng số từ 2 đến n-1 nhưng bị TLE với n lớn. Có cách nào tối ưu hơn không ạ?\n\n\`\`\`python\nn = int(input())\nif n < 2:\n    print("NO")\nelse:\n    is_prime = True\n    for i in range(2, n):\n        if n % i == 0:\n            is_prime = False\n            break\n    print("YES" if is_prime else "NO")\n\`\`\`',
          'QUESTION',
          false,
          8,
          0,
          67,
          0,
          DATE_SUB(NOW(), INTERVAL 2 DAY),
          DATE_SUB(NOW(), INTERVAL 2 DAY)
        )
      `);

      const [discussion3] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion3Id = discussion3.id;

      // Reply cho Discussion 3
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion3Id},
          ${adminId},
          'Bạn có thể tối ưu bằng cách chỉ kiểm tra đến **sqrt(n)** thay vì n-1.\n\n**Lý do**: Nếu n = a × b và a ≤ sqrt(n), thì b ≥ sqrt(n). Do đó chỉ cần kiểm tra các ước từ 2 đến sqrt(n).\n\n\`\`\`python\nimport math\n\nn = int(input())\nif n < 2:\n    print("NO")\nelse:\n    is_prime = True\n    for i in range(2, int(math.sqrt(n)) + 1):\n        if n % i == 0:\n            is_prime = False\n            break\n    print("YES" if is_prime else "NO")\n\`\`\`\n\nĐộ phức tạp giảm từ O(n) xuống O(sqrt(n))!',
          12,
          0,
          DATE_SUB(NOW(), INTERVAL 2 DAY),
          DATE_SUB(NOW(), INTERVAL 2 DAY)
        )
      `);

      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion3Id},
          ${userId},
          'Wow cảm ơn nhiều ạ! Code đã pass hết test case rồi! 🚀',
          4,
          0,
          DATE_SUB(NOW(), INTERVAL 1 DAY),
          DATE_SUB(NOW(), INTERVAL 1 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 2 WHERE discussion_id = ${discussion3Id}
      `);
    }

    // Discussion 4: Solution cho Fibonacci
    const fibProblemId = problemMap.get('Fibonacci');
    if (fibProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${fibProblemId},
          ${adminId},
          'Solution: Fibonacci với Dynamic Programming',
          '## Phân tích\n\nNếu dùng đệ quy đơn thuần sẽ bị TLE do tính lại nhiều lần.\n\n### ❌ Cách sai (Đệ quy):\n\`\`\`python\ndef fib(n):\n    if n <= 1:\n        return n\n    return fib(n-1) + fib(n-2)\n\`\`\`\nĐộ phức tạp: O(2^n) - Quá chậm!\n\n### ✅ Cách đúng (Bottom-up DP):\n\`\`\`python\nMOD = 10**9 + 7\nn = int(input())\n\nif n <= 1:\n    print(n)\nelse:\n    dp = [0] * (n + 1)\n    dp[1] = 1\n    \n    for i in range(2, n + 1):\n        dp[i] = (dp[i-1] + dp[i-2]) % MOD\n    \n    print(dp[n])\n\`\`\`\n\n## Độ phức tạp\n- Time: O(n)\n- Space: O(n)\n\n## Tối ưu thêm\nCó thể giảm space xuống O(1) bằng cách chỉ lưu 2 giá trị gần nhất!',
          'SOLUTION',
          true,
          35,
          1,
          203,
          0,
          DATE_SUB(NOW(), INTERVAL 6 DAY),
          DATE_SUB(NOW(), INTERVAL 6 DAY)
        )
      `);

      const [discussion4] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion4Id = discussion4.id;

      // Reply cho Discussion 4
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion4Id},
          ${userId},
          'Cho mình hỏi cách tối ưu O(1) space thì code như thế nào ạ?',
          7,
          0,
          DATE_SUB(NOW(), INTERVAL 5 DAY),
          DATE_SUB(NOW(), INTERVAL 5 DAY)
        )
      `);

      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion4Id},
          ${adminId},
          'Dạ! Đây là code O(1) space:\n\n\`\`\`python\nMOD = 10**9 + 7\nn = int(input())\n\nif n <= 1:\n    print(n)\nelse:\n    prev2, prev1 = 0, 1\n    for i in range(2, n + 1):\n        current = (prev1 + prev2) % MOD\n        prev2 = prev1\n        prev1 = current\n    print(prev1)\n\`\`\`\n\nChỉ cần lưu 2 số trước đó thay vì toàn bộ mảng! 👍',
          15,
          0,
          DATE_SUB(NOW(), INTERVAL 5 DAY),
          DATE_SUB(NOW(), INTERVAL 5 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 2 WHERE discussion_id = ${discussion4Id}
      `);
    }

    // Discussion 5: General discussion về thuật toán sắp xếp
    const sortProblemId = problemMap.get('Sắp xếp mảng');
    if (sortProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${sortProblemId},
          ${userId},
          'So sánh các thuật toán sắp xếp',
          'Mọi người cho em hỏi:\n\n- Bubble Sort vs Merge Sort vs Quick Sort khác nhau như thế nào?\n- Khi nào thì nên dùng thuật toán nào?\n- Python \`sorted()\` dùng thuật toán gì?\n\nMong mọi người chia sẻ kinh nghiệm ạ!',
          'GENERAL',
          false,
          12,
          0,
          89,
          0,
          DATE_SUB(NOW(), INTERVAL 4 DAY),
          DATE_SUB(NOW(), INTERVAL 4 DAY)
        )
      `);

      const [discussion5] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion5Id = discussion5.id;

      // Replies cho Discussion 5
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion5Id},
          ${adminId},
          '## So sánh độ phức tạp:\n\n| Thuật toán | Best | Average | Worst | Space |\n|-----------|------|---------|-------|-------|\n| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) |\n| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) |\n| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) |\n\n**Python \`sorted()\`** dùng **Timsort** (lai giữa Merge Sort và Insertion Sort), rất tối ưu cho dữ liệu thực tế!\n\n**Lời khuyên**: Trong contest thường dùng \`sorted()\` có sẵn là đủ! 😄',
          18,
          0,
          DATE_SUB(NOW(), INTERVAL 4 DAY),
          DATE_SUB(NOW(), INTERVAL 4 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 1 WHERE discussion_id = ${discussion5Id}
      `);
    }

    // Discussion 6: Bug Report
    const binarySearchProblemId = problemMap.get('Tìm kiếm nhị phân');
    if (binarySearchProblemId) {
      await queryRunner.query(`
        INSERT INTO discussions (
          problem_id,
          user_id,
          title,
          content,
          discussion_type,
          is_solution,
          upvotes,
          downvotes,
          view_count,
          reply_count,
          created_at,
          updated_at
        ) VALUES (
          ${binarySearchProblemId},
          ${userId},
          'Test case 3 có vấn đề?',
          'Em submit code binary search chuẩn nhưng test case 3 báo Wrong Answer. Em nghi ngờ test case có vấn đề. Admin kiểm tra giúp em với ạ!\n\n\`\`\`python\ndef binary_search(arr, x):\n    left, right = 0, len(arr) - 1\n    while left <= right:\n        mid = (left + right) // 2\n        if arr[mid] == x:\n            return mid + 1\n        elif arr[mid] < x:\n            left = mid + 1\n        else:\n            right = mid - 1\n    return -1\n\`\`\`',
          'BUG_REPORT',
          false,
          3,
          1,
          34,
          0,
          DATE_SUB(NOW(), INTERVAL 1 DAY),
          DATE_SUB(NOW(), INTERVAL 1 DAY)
        )
      `);

      const [discussion6] = await queryRunner.query(`SELECT LAST_INSERT_ID() as id`);
      const discussion6Id = discussion6.id;

      // Reply cho Discussion 6
      await queryRunner.query(`
        INSERT INTO discussion_replies (
          discussion_id,
          user_id,
          content,
          upvotes,
          downvotes,
          created_at,
          updated_at
        ) VALUES (
          ${discussion6Id},
          ${adminId},
          'Chào bạn! Mình đã check test case 3, không có vấn đề gì.\n\nLỗi của bạn là: Khi mảng có **nhiều phần tử trùng nhau**, bạn cần tìm **vị trí đầu tiên**, nhưng code của bạn có thể trả về bất kỳ vị trí nào.\n\nVí dụ: \`arr = [1, 2, 2, 2, 3]\`, tìm \`x = 2\`, cần trả về \`2\` (vị trí đầu tiên), nhưng code bạn có thể trả về \`3\` hoặc \`4\`.\n\nHãy sửa logic để luôn tìm vị trí đầu tiên nhé!',
          6,
          0,
          DATE_SUB(NOW(), INTERVAL 1 DAY),
          DATE_SUB(NOW(), INTERVAL 1 DAY)
        )
      `);

      await queryRunner.query(`
        UPDATE discussions SET reply_count = 1 WHERE discussion_id = ${discussion6Id}
      `);
    }

    console.log('✅ Seeded discussions and replies successfully!');
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete all seeded replies and discussions
    await queryRunner.query(`
      DELETE FROM discussion_replies 
      WHERE discussion_id IN (
        SELECT discussion_id FROM discussions 
        WHERE title IN (
          'Tại sao code của mình bị lỗi?',
          'Solution Python cơ bản - Tổng hai số',
          'Code bị Time Limit Exceeded',
          'Solution: Fibonacci với Dynamic Programming',
          'So sánh các thuật toán sắp xếp',
          'Test case 3 có vấn đề?'
        )
      )
    `);

    await queryRunner.query(`
      DELETE FROM discussions 
      WHERE title IN (
        'Tại sao code của mình bị lỗi?',
        'Solution Python cơ bản - Tổng hai số',
        'Code bị Time Limit Exceeded',
        'Solution: Fibonacci với Dynamic Programming',
        'So sánh các thuật toán sắp xếp',
        'Test case 3 có vấn đề?'
      )
    `);

    console.log('✅ Removed seeded discussions and replies!');
  }
}
