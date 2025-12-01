import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProblems1700000000014 implements MigrationInterface {
  name = 'SeedProblems1700000000014';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get admin user ID
    const adminUserId = 1;

    // Get tag IDs
    const tagRows = await queryRunner.query(`SELECT tag_id, slug FROM tags`);
    const tagMap = new Map<string, number>();
    for (const row of tagRows) {
      tagMap.set(row.slug, row.tag_id);
    }

    // ==========================================
    // SEED PROBLEMS (20 problems)
    // Each tag will have related problems
    // ==========================================
    const problems = [
      // ===== EASY PROBLEMS (7) =====
      {
        title: 'Hello World',
        description: `## Mô tả
Viết chương trình in ra dòng chữ "Hello, World!".

## Yêu cầu
Chương trình không nhận input, chỉ cần in ra output đúng định dạng.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 50,
        input_format: 'Không có input',
        output_format: 'In ra dòng chữ "Hello, World!" (không có dấu ngoặc kép)',
        constraints: 'Không có',
        samples: JSON.stringify([
          { input: '', output: 'Hello, World!', explanation: 'Chỉ cần in ra đúng chuỗi' }
        ]),
        tags: ['syntax-basic'],
      },
      {
        title: 'Tổng hai số',
        description: `## Mô tả
Cho hai số nguyên a và b. Tính tổng của chúng.

## Yêu cầu
Đọc hai số từ input và in ra tổng của chúng.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 50,
        input_format: 'Hai số nguyên a và b trên cùng một dòng, cách nhau bởi dấu cách (-10^9 ≤ a, b ≤ 10^9)',
        output_format: 'In ra tổng a + b',
        constraints: '-10^9 ≤ a, b ≤ 10^9',
        samples: JSON.stringify([
          { input: '3 5', output: '8', explanation: '3 + 5 = 8' },
          { input: '-10 25', output: '15', explanation: '-10 + 25 = 15' }
        ]),
        tags: ['syntax-basic'],
      },
      {
        title: 'Số chẵn hay lẻ',
        description: `## Mô tả
Cho một số nguyên n. Kiểm tra xem n là số chẵn hay số lẻ.

## Yêu cầu
In ra "EVEN" nếu n chẵn, "ODD" nếu n lẻ.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 50,
        input_format: 'Một số nguyên n',
        output_format: '"EVEN" hoặc "ODD"',
        constraints: '-10^9 ≤ n ≤ 10^9',
        samples: JSON.stringify([
          { input: '4', output: 'EVEN' },
          { input: '7', output: 'ODD' },
          { input: '0', output: 'EVEN' }
        ]),
        tags: ['syntax-basic', 'logic-edge-cases'],
      },
      {
        title: 'Đếm số dương',
        description: `## Mô tả
Cho một dãy n số nguyên. Đếm số lượng số dương trong dãy.

## Yêu cầu
Đọc dãy số và đếm có bao nhiêu số lớn hơn 0.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 75,
        input_format: 'Dòng 1: Số nguyên n (1 ≤ n ≤ 1000)\nDòng 2: n số nguyên cách nhau bởi dấu cách',
        output_format: 'Số lượng số dương',
        constraints: '1 ≤ n ≤ 1000\n|a[i]| ≤ 10^6',
        samples: JSON.stringify([
          { input: '5\n1 -2 3 0 -5', output: '2', explanation: 'Có 2 số dương: 1 và 3' },
          { input: '3\n-1 -2 -3', output: '0' }
        ]),
        tags: ['syntax-basic', 'logic-edge-cases'],
      },
      {
        title: 'Tìm số lớn nhất',
        description: `## Mô tả
Cho một dãy n số nguyên. Tìm giá trị lớn nhất trong dãy.

## Yêu cầu
In ra giá trị lớn nhất.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 75,
        input_format: 'Dòng 1: Số nguyên n (1 ≤ n ≤ 10^5)\nDòng 2: n số nguyên',
        output_format: 'Giá trị lớn nhất',
        constraints: '1 ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '5\n3 1 4 1 5', output: '5' },
          { input: '3\n-5 -2 -8', output: '-2' }
        ]),
        tags: ['syntax-basic', 'logic-edge-cases'],
      },
      {
        title: 'Giai thừa',
        description: `## Mô tả
Tính n! (n giai thừa).

## Công thức
n! = 1 × 2 × 3 × ... × n
0! = 1`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 75,
        input_format: 'Một số nguyên n (0 ≤ n ≤ 20)',
        output_format: 'Giá trị n!',
        constraints: '0 ≤ n ≤ 20',
        samples: JSON.stringify([
          { input: '5', output: '120', explanation: '5! = 5×4×3×2×1 = 120' },
          { input: '0', output: '1' },
          { input: '10', output: '3628800' }
        ]),
        tags: ['syntax-basic', 'debugging'],
      },
      {
        title: 'Kiểm tra số nguyên tố',
        description: `## Mô tả
Cho số nguyên n. Kiểm tra xem n có phải là số nguyên tố không.

## Định nghĩa
Số nguyên tố là số tự nhiên lớn hơn 1 và chỉ chia hết cho 1 và chính nó.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 100,
        input_format: 'Một số nguyên n (1 ≤ n ≤ 10^9)',
        output_format: '"YES" nếu n là số nguyên tố, "NO" nếu không phải',
        constraints: '1 ≤ n ≤ 10^9',
        samples: JSON.stringify([
          { input: '7', output: 'YES' },
          { input: '10', output: 'NO' },
          { input: '1', output: 'NO' },
          { input: '2', output: 'YES' }
        ]),
        tags: ['time-complexity', 'logic-edge-cases'],
      },

      // ===== MEDIUM PROBLEMS (8) =====
      {
        title: 'Sắp xếp mảng',
        description: `## Mô tả
Cho một dãy n số nguyên. Sắp xếp dãy theo thứ tự tăng dần.

## Yêu cầu
Sử dụng thuật toán sắp xếp phù hợp để đảm bảo không bị TLE.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Số nguyên n (1 ≤ n ≤ 10^5)\nDòng 2: n số nguyên',
        output_format: 'Dãy đã sắp xếp, các phần tử cách nhau bởi dấu cách',
        constraints: '1 ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '5\n3 1 4 1 5', output: '1 1 3 4 5' },
          { input: '3\n-5 0 5', output: '-5 0 5' }
        ]),
        tags: ['time-complexity'],
      },
      {
        title: 'Tìm kiếm nhị phân',
        description: `## Mô tả
Cho một dãy n số nguyên **đã sắp xếp tăng dần** và q truy vấn.
Với mỗi truy vấn, tìm vị trí đầu tiên của giá trị x trong dãy.

## Yêu cầu
Sử dụng Binary Search để đảm bảo độ phức tạp O(log n) cho mỗi truy vấn.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Số nguyên n và q\nDòng 2: n số nguyên đã sắp xếp\nq dòng tiếp theo: mỗi dòng chứa số x cần tìm',
        output_format: 'q dòng, mỗi dòng là vị trí (1-indexed) hoặc -1 nếu không tìm thấy',
        constraints: '1 ≤ n, q ≤ 10^5\n|a[i]|, |x| ≤ 10^9',
        samples: JSON.stringify([
          { input: '5 3\n1 2 3 4 5\n3\n6\n1', output: '3\n-1\n1' }
        ]),
        tags: ['time-complexity'],
      },
      {
        title: 'Fibonacci',
        description: `## Mô tả
Tính số Fibonacci thứ n.

## Định nghĩa
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2) với n ≥ 2

## Lưu ý
Kết quả có thể rất lớn, hãy in ra kết quả mod 10^9 + 7.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Một số nguyên n (0 ≤ n ≤ 10^6)',
        output_format: 'F(n) mod (10^9 + 7)',
        constraints: '0 ≤ n ≤ 10^6',
        samples: JSON.stringify([
          { input: '10', output: '55' },
          { input: '50', output: '586268941' }
        ]),
        tags: ['time-complexity', 'memory-management'],
      },
      {
        title: 'Đảo ngược chuỗi',
        description: `## Mô tả
Cho một chuỗi s. In ra chuỗi đảo ngược của s.

## Yêu cầu
Không sử dụng hàm reverse có sẵn.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 100,
        input_format: 'Một chuỗi s (chỉ chứa chữ cái và số)',
        output_format: 'Chuỗi đảo ngược',
        constraints: '1 ≤ |s| ≤ 10^5',
        samples: JSON.stringify([
          { input: 'hello', output: 'olleh' },
          { input: 'Codery123', output: '321yredoC' }
        ]),
        tags: ['syntax-basic', 'debugging'],
      },
      {
        title: 'Dãy con liên tiếp có tổng lớn nhất',
        description: `## Mô tả
Cho một dãy n số nguyên (có thể âm). Tìm dãy con liên tiếp có tổng lớn nhất.

## Thuật toán
Sử dụng thuật toán Kadane để giải trong O(n).`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 200,
        input_format: 'Dòng 1: Số nguyên n\nDòng 2: n số nguyên',
        output_format: 'Tổng lớn nhất của dãy con liên tiếp',
        constraints: '1 ≤ n ≤ 10^5\n|a[i]| ≤ 10^4',
        samples: JSON.stringify([
          { input: '8\n-2 1 -3 4 -1 2 1 -5', output: '6', explanation: 'Dãy con [4, -1, 2, 1] có tổng = 6' },
          { input: '5\n-1 -2 -3 -4 -5', output: '-1' }
        ]),
        tags: ['time-complexity', 'logic-edge-cases'],
      },
      {
        title: 'Palindrome',
        description: `## Mô tả
Kiểm tra xem chuỗi s có phải là palindrome không.

## Định nghĩa
Palindrome là chuỗi đọc xuôi hay ngược đều giống nhau.

## Lưu ý
So sánh không phân biệt hoa thường, bỏ qua các ký tự không phải chữ cái.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 125,
        input_format: 'Một chuỗi s',
        output_format: '"YES" nếu là palindrome, "NO" nếu không phải',
        constraints: '1 ≤ |s| ≤ 10^5',
        samples: JSON.stringify([
          { input: 'A man a plan a canal Panama', output: 'YES' },
          { input: 'hello', output: 'NO' },
          { input: 'Was it a car or a cat I saw', output: 'YES' }
        ]),
        tags: ['logic-edge-cases', 'debugging'],
      },
      {
        title: 'Tính tổng số chữ số',
        description: `## Mô tả
Cho số nguyên dương n. Tính tổng các chữ số của n.
Lặp lại cho đến khi kết quả chỉ còn 1 chữ số.

## Ví dụ
n = 9875 → 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 125,
        input_format: 'Một số nguyên dương n',
        output_format: 'Chữ số cuối cùng sau khi cộng liên tục',
        constraints: '1 ≤ n ≤ 10^18',
        samples: JSON.stringify([
          { input: '9875', output: '2' },
          { input: '123456789', output: '9' }
        ]),
        tags: ['logic-edge-cases', 'debugging'],
      },
      {
        title: 'Đếm số nguyên tố trong đoạn',
        description: `## Mô tả
Cho hai số nguyên L và R. Đếm số lượng số nguyên tố trong đoạn [L, R].

## Yêu cầu
Tối ưu thuật toán để xử lý đoạn lớn.`,
        difficulty: 'MEDIUM',
        time_limit: 2000,
        memory_limit: 256,
        points: 175,
        input_format: 'Hai số nguyên L và R (1 ≤ L ≤ R ≤ 10^6)',
        output_format: 'Số lượng số nguyên tố trong đoạn [L, R]',
        constraints: '1 ≤ L ≤ R ≤ 10^6',
        samples: JSON.stringify([
          { input: '1 10', output: '4', explanation: 'Các số nguyên tố: 2, 3, 5, 7' },
          { input: '10 20', output: '4', explanation: 'Các số nguyên tố: 11, 13, 17, 19' }
        ]),
        tags: ['time-complexity', 'memory-management'],
      },

      // ===== HARD PROBLEMS (5) =====
      {
        title: 'Longest Increasing Subsequence',
        description: `## Mô tả
Cho một dãy n số nguyên. Tìm độ dài của dãy con tăng dài nhất (LIS).

## Định nghĩa
Dãy con tăng là dãy các phần tử được chọn từ dãy ban đầu (giữ nguyên thứ tự) sao cho mỗi phần tử lớn hơn phần tử trước.

## Yêu cầu
Thuật toán O(n log n)`,
        difficulty: 'HARD',
        time_limit: 1000,
        memory_limit: 256,
        points: 250,
        input_format: 'Dòng 1: Số nguyên n\nDòng 2: n số nguyên',
        output_format: 'Độ dài LIS',
        constraints: '1 ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '8\n10 9 2 5 3 7 101 18', output: '4', explanation: 'LIS: [2, 3, 7, 101] hoặc [2, 5, 7, 18]' },
          { input: '5\n5 4 3 2 1', output: '1' }
        ]),
        tags: ['time-complexity', 'memory-management'],
      },
      {
        title: 'Đường đi ngắn nhất',
        description: `## Mô tả
Cho đồ thị có hướng n đỉnh và m cạnh. Mỗi cạnh có trọng số.
Tìm đường đi ngắn nhất từ đỉnh 1 đến đỉnh n.

## Yêu cầu
Sử dụng thuật toán Dijkstra.`,
        difficulty: 'HARD',
        time_limit: 2000,
        memory_limit: 256,
        points: 300,
        input_format: 'Dòng 1: n và m\nm dòng tiếp theo: u v w (cạnh từ u đến v, trọng số w)',
        output_format: 'Độ dài đường đi ngắn nhất, hoặc -1 nếu không có đường đi',
        constraints: '1 ≤ n ≤ 10^5\n1 ≤ m ≤ 2×10^5\n1 ≤ w ≤ 10^6',
        samples: JSON.stringify([
          { input: '4 5\n1 2 1\n1 3 4\n2 3 2\n2 4 5\n3 4 1', output: '4', explanation: '1 → 2 → 3 → 4: 1+2+1 = 4' },
          { input: '2 0', output: '-1' }
        ]),
        tags: ['time-complexity', 'memory-management', 'debugging'],
      },
      {
        title: 'Knapsack Problem',
        description: `## Mô tả
Cho n món đồ, mỗi món có trọng lượng w[i] và giá trị v[i].
Bạn có túi chứa tối đa W đơn vị trọng lượng.
Chọn các món đồ để tổng giá trị lớn nhất mà không vượt quá W.

## Yêu cầu
Mỗi món chỉ được chọn 1 lần (0/1 Knapsack).`,
        difficulty: 'HARD',
        time_limit: 1000,
        memory_limit: 256,
        points: 275,
        input_format: 'Dòng 1: n và W\nn dòng tiếp: w[i] và v[i]',
        output_format: 'Giá trị lớn nhất có thể đạt được',
        constraints: '1 ≤ n ≤ 100\n1 ≤ W ≤ 10^4\n1 ≤ w[i], v[i] ≤ 1000',
        samples: JSON.stringify([
          { input: '4 7\n1 1\n3 4\n4 5\n5 7', output: '9', explanation: 'Chọn món 2 (w=3,v=4) và món 3 (w=4,v=5): tổng w=7, v=9' }
        ]),
        tags: ['memory-management', 'logic-edge-cases'],
      },
      {
        title: 'Edit Distance',
        description: `## Mô tả
Cho hai chuỗi s1 và s2. Tìm số phép biến đổi tối thiểu để chuyển s1 thành s2.

## Các phép biến đổi
- Insert: Thêm một ký tự
- Delete: Xóa một ký tự
- Replace: Thay thế một ký tự

## Thuật toán
Dynamic Programming với độ phức tạp O(n×m).`,
        difficulty: 'HARD',
        time_limit: 1000,
        memory_limit: 256,
        points: 275,
        input_format: 'Dòng 1: Chuỗi s1\nDòng 2: Chuỗi s2',
        output_format: 'Số phép biến đổi tối thiểu',
        constraints: '1 ≤ |s1|, |s2| ≤ 1000',
        samples: JSON.stringify([
          { input: 'horse\nros', output: '3', explanation: 'horse → rorse → rose → ros' },
          { input: 'intention\nexecution', output: '5' }
        ]),
        tags: ['memory-management', 'debugging'],
      },
      {
        title: 'Segment Tree - Range Sum Query',
        description: `## Mô tả
Cho dãy n số và q truy vấn. Mỗi truy vấn thuộc một trong hai loại:
1. Update: Thay đổi giá trị tại vị trí i thành x
2. Query: Tính tổng các phần tử từ vị trí l đến r

## Yêu cầu
Sử dụng Segment Tree để đạt O(log n) cho mỗi thao tác.`,
        difficulty: 'HARD',
        time_limit: 2000,
        memory_limit: 256,
        points: 350,
        input_format: 'Dòng 1: n và q\nDòng 2: n số nguyên\nq dòng tiếp: "1 i x" (update) hoặc "2 l r" (query)',
        output_format: 'Kết quả mỗi query trên một dòng',
        constraints: '1 ≤ n, q ≤ 10^5\n|a[i]|, |x| ≤ 10^9',
        samples: JSON.stringify([
          { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 1 5\n2 2 4', output: '15\n22\n16', explanation: 'Query [1,5]=15, Update a[3]=10, Query [1,5]=22, Query [2,4]=16' }
        ]),
        tags: ['time-complexity', 'memory-management', 'debugging'],
      },
    ];

    // Insert problems
    for (const problem of problems) {
      const existing = await queryRunner.query(
        `SELECT problem_id FROM problems WHERE title = ?`,
        [problem.title]
      );

      if (existing.length === 0) {
        // Insert problem
        await queryRunner.query(
          `INSERT INTO problems (
            title, description, difficulty, time_limit, memory_limit, points,
            input_format, output_format, constraints, samples, 
            created_by, is_published, acceptance_rate, total_submissions, accepted_submissions
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, true, 0, 0, 0)`,
          [
            problem.title,
            problem.description,
            problem.difficulty,
            problem.time_limit,
            problem.memory_limit,
            problem.points,
            problem.input_format,
            problem.output_format,
            problem.constraints,
            problem.samples,
            adminUserId,
          ]
        );

        // Get the inserted problem_id
        const [inserted] = await queryRunner.query(
          `SELECT problem_id FROM problems WHERE title = ?`,
          [problem.title]
        );

        // Insert problem-tag relations
        for (const tagSlug of problem.tags) {
          const tagId = tagMap.get(tagSlug);
          if (tagId) {
            await queryRunner.query(
              `INSERT INTO problem_tags (problem_id, tag_id) VALUES (?, ?)`,
              [inserted.problem_id, tagId]
            );

            // Update tag problem_count
            await queryRunner.query(
              `UPDATE tags SET problem_count = problem_count + 1 WHERE tag_id = ?`,
              [tagId]
            );
          }
        }
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get problem IDs
    const problemTitles = [
      'Hello World',
      'Tổng hai số',
      'Số chẵn hay lẻ',
      'Đếm số dương',
      'Tìm số lớn nhất',
      'Giai thừa',
      'Kiểm tra số nguyên tố',
      'Sắp xếp mảng',
      'Tìm kiếm nhị phân',
      'Fibonacci',
      'Đảo ngược chuỗi',
      'Dãy con liên tiếp có tổng lớn nhất',
      'Palindrome',
      'Tính tổng số chữ số',
      'Đếm số nguyên tố trong đoạn',
      'Longest Increasing Subsequence',
      'Đường đi ngắn nhất',
      'Knapsack Problem',
      'Edit Distance',
      'Segment Tree - Range Sum Query',
    ];

    for (const title of problemTitles) {
      // Get problem_id
      const [problem] = await queryRunner.query(
        `SELECT problem_id FROM problems WHERE title = ?`,
        [title]
      );

      if (problem) {
        // Get related tag_ids and decrement problem_count
        const tags = await queryRunner.query(
          `SELECT tag_id FROM problem_tags WHERE problem_id = ?`,
          [problem.problem_id]
        );

        for (const tag of tags) {
          await queryRunner.query(
            `UPDATE tags SET problem_count = GREATEST(0, problem_count - 1) WHERE tag_id = ?`,
            [tag.tag_id]
          );
        }

        // Delete problem_tags
        await queryRunner.query(
          `DELETE FROM problem_tags WHERE problem_id = ?`,
          [problem.problem_id]
        );

        // Delete problem
        await queryRunner.query(
          `DELETE FROM problems WHERE problem_id = ?`,
          [problem.problem_id]
        );
      }
    }
  }
}
