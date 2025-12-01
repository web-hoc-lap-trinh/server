import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedMoreProblems1700000000015 implements MigrationInterface {
  name = 'SeedMoreProblems1700000000015';

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
    // SEED MORE PROBLEMS (20 problems)
    // Distributed across all tags
    // ==========================================
    const problems = [
      // ===== ARRAY PROBLEMS =====
      {
        title: 'Tìm phần tử xuất hiện nhiều nhất',
        description: `## Mô tả
Cho một mảng n số nguyên. Tìm phần tử xuất hiện nhiều lần nhất trong mảng.

## Yêu cầu
Nếu có nhiều phần tử có cùng số lần xuất hiện lớn nhất, in ra phần tử nhỏ nhất.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 75,
        input_format: 'Dòng 1: Số nguyên n (1 ≤ n ≤ 10^5)\nDòng 2: n số nguyên',
        output_format: 'Phần tử xuất hiện nhiều nhất',
        constraints: '1 ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '7\n1 2 2 3 3 3 4', output: '3', explanation: 'Số 3 xuất hiện 3 lần, nhiều nhất' },
          { input: '5\n1 1 2 2 3', output: '1', explanation: '1 và 2 đều xuất hiện 2 lần, chọn 1 vì nhỏ hơn' }
        ]),
        tags: ['array', 'hash-table'],
      },
      {
        title: 'Xoay mảng',
        description: `## Mô tả
Cho một mảng n số nguyên và số k. Xoay mảng sang phải k vị trí.

## Ví dụ
Mảng [1, 2, 3, 4, 5] xoay phải 2 vị trí thành [4, 5, 1, 2, 3].`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 125,
        input_format: 'Dòng 1: Hai số n và k\nDòng 2: n số nguyên',
        output_format: 'Mảng sau khi xoay, các phần tử cách nhau bởi dấu cách',
        constraints: '1 ≤ n ≤ 10^5\n0 ≤ k ≤ 10^9',
        samples: JSON.stringify([
          { input: '5 2\n1 2 3 4 5', output: '4 5 1 2 3' },
          { input: '7 3\n1 2 3 4 5 6 7', output: '5 6 7 1 2 3 4' }
        ]),
        tags: ['array', 'two-pointers'],
      },

      // ===== STRING PROBLEMS =====
      {
        title: 'Đếm từ trong chuỗi',
        description: `## Mô tả
Cho một chuỗi văn bản. Đếm số từ trong chuỗi.

## Định nghĩa
Từ là dãy các ký tự liên tiếp không chứa dấu cách.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 50,
        input_format: 'Một dòng chứa chuỗi văn bản',
        output_format: 'Số lượng từ trong chuỗi',
        constraints: '1 ≤ |s| ≤ 10^4',
        samples: JSON.stringify([
          { input: 'Hello World', output: '2' },
          { input: '  Xin   chao   Viet Nam  ', output: '4', explanation: 'Bỏ qua khoảng trắng thừa' }
        ]),
        tags: ['string', 'syntax-basic'],
      },
      {
        title: 'Chuỗi con chung dài nhất',
        description: `## Mô tả
Cho hai chuỗi s1 và s2. Tìm độ dài chuỗi con chung dài nhất (Longest Common Substring).

## Chú ý
Chuỗi con là dãy các ký tự liên tiếp trong chuỗi gốc.`,
        difficulty: 'HARD',
        time_limit: 2000,
        memory_limit: 256,
        points: 250,
        input_format: 'Dòng 1: Chuỗi s1\nDòng 2: Chuỗi s2',
        output_format: 'Độ dài chuỗi con chung dài nhất',
        constraints: '1 ≤ |s1|, |s2| ≤ 1000',
        samples: JSON.stringify([
          { input: 'ABCDGH\nABDGHR', output: '3', explanation: 'Chuỗi con chung dài nhất là "DGH"' },
          { input: 'ABCDEF\nXYZABC', output: '3', explanation: 'Chuỗi con chung dài nhất là "ABC"' }
        ]),
        tags: ['string', 'dynamic-programming'],
      },

      // ===== HASH TABLE PROBLEMS =====
      {
        title: 'Hai số có tổng bằng K',
        description: `## Mô tả
Cho một mảng n số nguyên và số nguyên K. Tìm hai số trong mảng có tổng bằng K.

## Yêu cầu
In ra chỉ số của hai số đó (1-indexed). Nếu có nhiều cặp, in ra cặp đầu tiên tìm được.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 100,
        input_format: 'Dòng 1: Hai số n và K\nDòng 2: n số nguyên',
        output_format: 'Hai chỉ số i j (i < j) hoặc "-1" nếu không tìm thấy',
        constraints: '2 ≤ n ≤ 10^5\n|a[i]|, |K| ≤ 10^9',
        samples: JSON.stringify([
          { input: '5 9\n2 7 11 15 1', output: '1 2', explanation: 'a[1] + a[2] = 2 + 7 = 9' },
          { input: '3 10\n1 2 3', output: '-1' }
        ]),
        tags: ['hash-table', 'array'],
      },
      {
        title: 'Đếm cặp số có hiệu bằng K',
        description: `## Mô tả
Cho một mảng n số nguyên phân biệt và số nguyên K. Đếm số cặp (i, j) sao cho |a[i] - a[j]| = K (với i < j).

## Yêu cầu
Sử dụng Hash Table để đạt độ phức tạp O(n).`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Hai số n và K\nDòng 2: n số nguyên phân biệt',
        output_format: 'Số cặp có hiệu bằng K',
        constraints: '2 ≤ n ≤ 10^5\n|a[i]| ≤ 10^9\n0 ≤ K ≤ 10^9',
        samples: JSON.stringify([
          { input: '5 2\n1 5 3 4 2', output: '3', explanation: 'Các cặp: (1,3), (3,5), (2,4)' },
          { input: '4 0\n1 2 3 4', output: '0' }
        ]),
        tags: ['hash-table', 'sorting'],
      },

      // ===== MATH PROBLEMS =====
      {
        title: 'Ước chung lớn nhất',
        description: `## Mô tả
Cho hai số nguyên dương a và b. Tìm ước chung lớn nhất (GCD) của chúng.

## Gợi ý
Sử dụng thuật toán Euclid.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 75,
        input_format: 'Hai số nguyên dương a và b',
        output_format: 'GCD(a, b)',
        constraints: '1 ≤ a, b ≤ 10^18',
        samples: JSON.stringify([
          { input: '12 18', output: '6' },
          { input: '7 13', output: '1', explanation: '7 và 13 nguyên tố cùng nhau' }
        ]),
        tags: ['math', 'recursion'],
      },
      {
        title: 'Lũy thừa modulo',
        description: `## Mô tả
Tính a^n mod m.

## Yêu cầu
Sử dụng thuật toán lũy thừa nhanh (Binary Exponentiation) để đạt độ phức tạp O(log n).`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Ba số nguyên dương a, n, m',
        output_format: 'a^n mod m',
        constraints: '1 ≤ a, m ≤ 10^9\n0 ≤ n ≤ 10^18',
        samples: JSON.stringify([
          { input: '2 10 1000', output: '24', explanation: '2^10 = 1024, 1024 mod 1000 = 24' },
          { input: '3 0 100', output: '1' }
        ]),
        tags: ['math', 'bit-manipulation'],
      },

      // ===== SORTING & GREEDY =====
      {
        title: 'Hội nghị phòng họp',
        description: `## Mô tả
Cho n cuộc họp với thời gian bắt đầu và kết thúc. Tìm số lượng cuộc họp tối đa có thể tham gia mà không bị trùng lặp thời gian.

## Yêu cầu
Sử dụng chiến lược tham lam.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Số nguyên n\nn dòng tiếp: start[i] end[i]',
        output_format: 'Số cuộc họp tối đa',
        constraints: '1 ≤ n ≤ 10^5\n0 ≤ start[i] < end[i] ≤ 10^9',
        samples: JSON.stringify([
          { input: '4\n1 3\n2 4\n3 5\n0 2', output: '3', explanation: 'Chọn: (0,2), (2,4) không được vì trùng, chọn (3,5)' }
        ]),
        tags: ['sorting', 'greedy'],
      },
      {
        title: 'Chia kẹo',
        description: `## Mô tả
Có n trẻ em đứng thành hàng, mỗi trẻ có một điểm số. Bạn cần chia kẹo sao cho:
1. Mỗi trẻ nhận ít nhất 1 viên kẹo
2. Trẻ có điểm cao hơn trẻ bên cạnh phải nhận nhiều kẹo hơn

Tìm số kẹo tối thiểu cần phát.`,
        difficulty: 'HARD',
        time_limit: 1000,
        memory_limit: 256,
        points: 275,
        input_format: 'Dòng 1: Số nguyên n\nDòng 2: n số nguyên là điểm số của các trẻ',
        output_format: 'Số kẹo tối thiểu',
        constraints: '1 ≤ n ≤ 10^5\n1 ≤ rating[i] ≤ 10^5',
        samples: JSON.stringify([
          { input: '3\n1 0 2', output: '5', explanation: 'Phát: 2, 1, 2 viên' },
          { input: '5\n1 2 3 4 5', output: '15', explanation: 'Phát: 1, 2, 3, 4, 5 viên' }
        ]),
        tags: ['greedy', 'array'],
      },

      // ===== TREE & GRAPH =====
      {
        title: 'Duyệt cây theo thứ tự giữa',
        description: `## Mô tả
Cho một cây nhị phân dưới dạng danh sách các cạnh. Duyệt cây theo thứ tự giữa (Inorder Traversal) và in ra các node.

## Định nghĩa
Inorder: Left → Root → Right`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Số node n và gốc root\nn-1 dòng tiếp: parent child (child là con trái nếu child < parent, ngược lại là con phải)',
        output_format: 'Các node theo thứ tự inorder, cách nhau bởi dấu cách',
        constraints: '1 ≤ n ≤ 10^4',
        samples: JSON.stringify([
          { input: '5 2\n2 1\n2 3\n1 0\n3 4', output: '0 1 2 3 4' }
        ]),
        tags: ['tree', 'recursion'],
      },
      {
        title: 'Đếm thành phần liên thông',
        description: `## Mô tả
Cho đồ thị vô hướng n đỉnh và m cạnh. Đếm số thành phần liên thông của đồ thị.

## Gợi ý
Sử dụng BFS hoặc DFS.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 175,
        input_format: 'Dòng 1: n và m\nm dòng tiếp: u v (cạnh nối u và v)',
        output_format: 'Số thành phần liên thông',
        constraints: '1 ≤ n ≤ 10^5\n0 ≤ m ≤ 2×10^5',
        samples: JSON.stringify([
          { input: '5 3\n1 2\n2 3\n4 5', output: '2', explanation: 'Thành phần 1: {1,2,3}, Thành phần 2: {4,5}' },
          { input: '4 0', output: '4' }
        ]),
        tags: ['graph', 'recursion'],
      },

      // ===== TWO POINTERS =====
      {
        title: 'Dãy con có tổng bằng S',
        description: `## Mô tả
Cho mảng n số nguyên dương và số nguyên S. Tìm dãy con liên tiếp ngắn nhất có tổng >= S.

## Yêu cầu
Sử dụng kỹ thuật Two Pointers / Sliding Window.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 175,
        input_format: 'Dòng 1: Hai số n và S\nDòng 2: n số nguyên dương',
        output_format: 'Độ dài dãy con ngắn nhất, hoặc 0 nếu không có',
        constraints: '1 ≤ n ≤ 10^5\n1 ≤ S ≤ 10^9\n1 ≤ a[i] ≤ 10^4',
        samples: JSON.stringify([
          { input: '6 7\n2 3 1 2 4 3', output: '2', explanation: 'Dãy [4, 3] có tổng = 7' },
          { input: '3 100\n1 2 3', output: '0' }
        ]),
        tags: ['two-pointers', 'array'],
      },

      // ===== STACK & QUEUE =====
      {
        title: 'Kiểm tra ngoặc hợp lệ',
        description: `## Mô tả
Cho một chuỗi chỉ chứa các ký tự '(', ')', '[', ']', '{', '}'. Kiểm tra xem chuỗi có hợp lệ không.

## Định nghĩa
Chuỗi hợp lệ khi:
- Mỗi ngoặc mở có ngoặc đóng tương ứng
- Các cặp ngoặc được đóng đúng thứ tự`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 100,
        input_format: 'Một chuỗi s',
        output_format: '"YES" nếu hợp lệ, "NO" nếu không',
        constraints: '1 ≤ |s| ≤ 10^4',
        samples: JSON.stringify([
          { input: '()[]{}', output: 'YES' },
          { input: '([)]', output: 'NO' },
          { input: '{[()]}', output: 'YES' }
        ]),
        tags: ['stack', 'string'],
      },
      {
        title: 'Sliding Window Maximum',
        description: `## Mô tả
Cho mảng n số nguyên và số k. Tìm giá trị lớn nhất trong mỗi cửa sổ trượt có kích thước k.

## Yêu cầu
Sử dụng Deque để đạt O(n).`,
        difficulty: 'HARD',
        time_limit: 1000,
        memory_limit: 256,
        points: 275,
        input_format: 'Dòng 1: Hai số n và k\nDòng 2: n số nguyên',
        output_format: 'n-k+1 số là max của mỗi cửa sổ',
        constraints: '1 ≤ k ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7' }
        ]),
        tags: ['queue', 'array', 'heap'],
      },

      // ===== LINKED LIST =====
      {
        title: 'Đảo ngược danh sách liên kết',
        description: `## Mô tả
Cho một danh sách liên kết đơn. Đảo ngược danh sách.

## Input
Danh sách được biểu diễn bằng dãy các số. -1 đánh dấu kết thúc.`,
        difficulty: 'EASY',
        time_limit: 1000,
        memory_limit: 256,
        points: 100,
        input_format: 'Một dòng chứa các số, kết thúc bằng -1',
        output_format: 'Danh sách sau khi đảo ngược (không có -1)',
        constraints: '0 ≤ n ≤ 10^4\n|val| ≤ 10^6',
        samples: JSON.stringify([
          { input: '1 2 3 4 5 -1', output: '5 4 3 2 1' },
          { input: '1 -1', output: '1' }
        ]),
        tags: ['linked-list', 'two-pointers'],
      },

      // ===== BACKTRACKING =====
      {
        title: 'Tổ hợp K phần tử',
        description: `## Mô tả
Cho hai số nguyên n và k. Liệt kê tất cả tổ hợp chập k của n phần tử từ 1 đến n.

## Yêu cầu
In các tổ hợp theo thứ tự từ điển.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Hai số nguyên n và k',
        output_format: 'Mỗi dòng một tổ hợp, các phần tử cách nhau bởi dấu cách',
        constraints: '1 ≤ k ≤ n ≤ 10',
        samples: JSON.stringify([
          { input: '4 2', output: '1 2\n1 3\n1 4\n2 3\n2 4\n3 4' },
          { input: '3 3', output: '1 2 3' }
        ]),
        tags: ['backtracking', 'recursion'],
      },
      {
        title: 'N-Queens',
        description: `## Mô tả
Đặt n quân hậu trên bàn cờ n×n sao cho không có hai quân hậu nào tấn công nhau.

## Yêu cầu
Đếm số cách đặt hợp lệ.`,
        difficulty: 'HARD',
        time_limit: 2000,
        memory_limit: 256,
        points: 300,
        input_format: 'Một số nguyên n',
        output_format: 'Số cách đặt hợp lệ',
        constraints: '1 ≤ n ≤ 12',
        samples: JSON.stringify([
          { input: '4', output: '2' },
          { input: '8', output: '92' },
          { input: '1', output: '1' }
        ]),
        tags: ['backtracking', 'recursion', 'bit-manipulation'],
      },

      // ===== HEAP =====
      {
        title: 'K phần tử lớn nhất',
        description: `## Mô tả
Cho mảng n số nguyên và số k. Tìm k phần tử lớn nhất trong mảng.

## Yêu cầu
Sử dụng Heap để tối ưu.`,
        difficulty: 'MEDIUM',
        time_limit: 1000,
        memory_limit: 256,
        points: 150,
        input_format: 'Dòng 1: Hai số n và k\nDòng 2: n số nguyên',
        output_format: 'k số lớn nhất theo thứ tự giảm dần',
        constraints: '1 ≤ k ≤ n ≤ 10^5\n|a[i]| ≤ 10^9',
        samples: JSON.stringify([
          { input: '6 3\n3 2 1 5 6 4', output: '6 5 4' },
          { input: '5 5\n1 2 3 4 5', output: '5 4 3 2 1' }
        ]),
        tags: ['heap', 'sorting'],
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
      'Tìm phần tử xuất hiện nhiều nhất',
      'Xoay mảng',
      'Đếm từ trong chuỗi',
      'Chuỗi con chung dài nhất',
      'Hai số có tổng bằng K',
      'Đếm cặp số có hiệu bằng K',
      'Ước chung lớn nhất',
      'Lũy thừa modulo',
      'Hội nghị phòng họp',
      'Chia kẹo',
      'Duyệt cây theo thứ tự giữa',
      'Đếm thành phần liên thông',
      'Dãy con có tổng bằng S',
      'Kiểm tra ngoặc hợp lệ',
      'Sliding Window Maximum',
      'Đảo ngược danh sách liên kết',
      'Tổ hợp K phần tử',
      'N-Queens',
      'K phần tử lớn nhất',
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
