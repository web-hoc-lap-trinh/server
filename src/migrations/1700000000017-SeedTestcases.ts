import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedTestcases1700000000017 implements MigrationInterface {
  name = 'SeedTestcases1700000000017';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all problems
    const problems = await queryRunner.query(`SELECT problem_id, title FROM problems`);
    const problemMap = new Map<string, number>();
    for (const p of problems) {
      problemMap.set(p.title, p.problem_id);
    }

    // ==========================================
    // TESTCASES FOR ALL PROBLEMS
    // Each problem will have 3-5 test cases
    // ==========================================
    const testcases: {
      problemTitle: string;
      cases: { input: string; output: string; is_sample: boolean; is_hidden: boolean; explanation?: string; score: number }[];
    }[] = [
      // ===== MIGRATION 14 PROBLEMS =====
      {
        problemTitle: 'Hello World',
        cases: [
          { input: '', output: 'Hello, World!', is_sample: true, is_hidden: false, explanation: 'Output chuẩn', score: 100 },
        ],
      },
      {
        problemTitle: 'Tổng hai số',
        cases: [
          { input: '3 5', output: '8', is_sample: true, is_hidden: false, explanation: '3 + 5 = 8', score: 20 },
          { input: '-10 25', output: '15', is_sample: true, is_hidden: false, explanation: '-10 + 25 = 15', score: 20 },
          { input: '0 0', output: '0', is_sample: false, is_hidden: true, score: 20 },
          { input: '1000000000 1000000000', output: '2000000000', is_sample: false, is_hidden: true, score: 20 },
          { input: '-1000000000 -1000000000', output: '-2000000000', is_sample: false, is_hidden: true, score: 20 },
        ],
      },
      {
        problemTitle: 'Số chẵn hay lẻ',
        cases: [
          { input: '4', output: 'EVEN', is_sample: true, is_hidden: false, score: 20 },
          { input: '7', output: 'ODD', is_sample: true, is_hidden: false, score: 20 },
          { input: '0', output: 'EVEN', is_sample: true, is_hidden: false, score: 20 },
          { input: '-3', output: 'ODD', is_sample: false, is_hidden: true, score: 20 },
          { input: '1000000000', output: 'EVEN', is_sample: false, is_hidden: true, score: 20 },
        ],
      },
      {
        problemTitle: 'Đếm số dương',
        cases: [
          { input: '5\n1 -2 3 0 -5', output: '2', is_sample: true, is_hidden: false, explanation: 'Có 2 số dương: 1 và 3', score: 25 },
          { input: '3\n-1 -2 -3', output: '0', is_sample: true, is_hidden: false, score: 25 },
          { input: '4\n1 2 3 4', output: '4', is_sample: false, is_hidden: true, score: 25 },
          { input: '1\n0', output: '0', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Tìm số lớn nhất',
        cases: [
          { input: '5\n3 1 4 1 5', output: '5', is_sample: true, is_hidden: false, score: 25 },
          { input: '3\n-5 -2 -8', output: '-2', is_sample: true, is_hidden: false, score: 25 },
          { input: '1\n42', output: '42', is_sample: false, is_hidden: true, score: 25 },
          { input: '6\n1000000000 -1000000000 0 999999999 -999999999 1', output: '1000000000', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Giai thừa',
        cases: [
          { input: '5', output: '120', is_sample: true, is_hidden: false, explanation: '5! = 120', score: 20 },
          { input: '0', output: '1', is_sample: true, is_hidden: false, score: 20 },
          { input: '10', output: '3628800', is_sample: true, is_hidden: false, score: 20 },
          { input: '1', output: '1', is_sample: false, is_hidden: true, score: 20 },
          { input: '20', output: '2432902008176640000', is_sample: false, is_hidden: true, score: 20 },
        ],
      },
      {
        problemTitle: 'Kiểm tra số nguyên tố',
        cases: [
          { input: '7', output: 'YES', is_sample: true, is_hidden: false, score: 20 },
          { input: '10', output: 'NO', is_sample: true, is_hidden: false, score: 20 },
          { input: '1', output: 'NO', is_sample: true, is_hidden: false, score: 20 },
          { input: '2', output: 'YES', is_sample: true, is_hidden: false, score: 20 },
          { input: '999999937', output: 'YES', is_sample: false, is_hidden: true, score: 20 },
        ],
      },
      {
        problemTitle: 'Sắp xếp mảng',
        cases: [
          { input: '5\n3 1 4 1 5', output: '1 1 3 4 5', is_sample: true, is_hidden: false, score: 25 },
          { input: '3\n-5 0 5', output: '-5 0 5', is_sample: true, is_hidden: false, score: 25 },
          { input: '1\n42', output: '42', is_sample: false, is_hidden: true, score: 25 },
          { input: '6\n6 5 4 3 2 1', output: '1 2 3 4 5 6', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Tìm kiếm nhị phân',
        cases: [
          { input: '5 3\n1 2 3 4 5\n3\n6\n1', output: '3\n-1\n1', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 2\n1 1 1 1 1\n1\n2', output: '1\n-1', is_sample: false, is_hidden: true, score: 25 },
          { input: '3 1\n10 20 30\n20', output: '2', is_sample: false, is_hidden: true, score: 25 },
          { input: '4 2\n-10 -5 0 5\n-5\n100', output: '2\n-1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Fibonacci',
        cases: [
          { input: '10', output: '55', is_sample: true, is_hidden: false, score: 20 },
          { input: '50', output: '586268941', is_sample: true, is_hidden: false, score: 20 },
          { input: '0', output: '0', is_sample: false, is_hidden: true, score: 20 },
          { input: '1', output: '1', is_sample: false, is_hidden: true, score: 20 },
          { input: '1000000', output: '918987769', is_sample: false, is_hidden: true, score: 20 },
        ],
      },
      {
        problemTitle: 'Đảo ngược chuỗi',
        cases: [
          { input: 'hello', output: 'olleh', is_sample: true, is_hidden: false, score: 25 },
          { input: 'Codery123', output: '321yredoC', is_sample: true, is_hidden: false, score: 25 },
          { input: 'a', output: 'a', is_sample: false, is_hidden: true, score: 25 },
          { input: 'abcdefghijklmnopqrstuvwxyz', output: 'zyxwvutsrqponmlkjihgfedcba', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Dãy con liên tiếp có tổng lớn nhất',
        cases: [
          { input: '8\n-2 1 -3 4 -1 2 1 -5', output: '6', is_sample: true, is_hidden: false, explanation: 'Dãy con [4, -1, 2, 1]', score: 25 },
          { input: '5\n-1 -2 -3 -4 -5', output: '-1', is_sample: true, is_hidden: false, score: 25 },
          { input: '1\n5', output: '5', is_sample: false, is_hidden: true, score: 25 },
          { input: '6\n1 2 3 4 5 6', output: '21', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Palindrome',
        cases: [
          { input: 'A man a plan a canal Panama', output: 'YES', is_sample: true, is_hidden: false, score: 25 },
          { input: 'hello', output: 'NO', is_sample: true, is_hidden: false, score: 25 },
          { input: 'Was it a car or a cat I saw', output: 'YES', is_sample: true, is_hidden: false, score: 25 },
          { input: 'a', output: 'YES', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Tính tổng số chữ số',
        cases: [
          { input: '9875', output: '2', is_sample: true, is_hidden: false, score: 25 },
          { input: '123456789', output: '9', is_sample: true, is_hidden: false, score: 25 },
          { input: '1', output: '1', is_sample: false, is_hidden: true, score: 25 },
          { input: '999999999999999999', output: '9', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Đếm số nguyên tố trong đoạn',
        cases: [
          { input: '1 10', output: '4', is_sample: true, is_hidden: false, explanation: '2, 3, 5, 7', score: 25 },
          { input: '10 20', output: '4', is_sample: true, is_hidden: false, explanation: '11, 13, 17, 19', score: 25 },
          { input: '1 1', output: '0', is_sample: false, is_hidden: true, score: 25 },
          { input: '1 1000000', output: '78498', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Longest Increasing Subsequence',
        cases: [
          { input: '8\n10 9 2 5 3 7 101 18', output: '4', is_sample: true, is_hidden: false, explanation: '[2, 3, 7, 101]', score: 25 },
          { input: '5\n5 4 3 2 1', output: '1', is_sample: true, is_hidden: false, score: 25 },
          { input: '6\n1 2 3 4 5 6', output: '6', is_sample: false, is_hidden: true, score: 25 },
          { input: '1\n42', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Đường đi ngắn nhất',
        cases: [
          { input: '4 5\n1 2 1\n1 3 4\n2 3 2\n2 4 5\n3 4 1', output: '4', is_sample: true, is_hidden: false, explanation: '1 → 2 → 3 → 4', score: 25 },
          { input: '2 0', output: '-1', is_sample: true, is_hidden: false, score: 25 },
          { input: '3 3\n1 2 1\n2 3 1\n1 3 3', output: '2', is_sample: false, is_hidden: true, score: 25 },
          { input: '2 1\n1 2 100', output: '100', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Knapsack Problem',
        cases: [
          { input: '4 7\n1 1\n3 4\n4 5\n5 7', output: '9', is_sample: true, is_hidden: false, explanation: 'Chọn món 2 và 3', score: 25 },
          { input: '3 5\n2 3\n3 4\n4 5', output: '7', is_sample: false, is_hidden: true, score: 25 },
          { input: '1 10\n5 10', output: '10', is_sample: false, is_hidden: true, score: 25 },
          { input: '2 3\n5 10\n6 20', output: '0', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Edit Distance',
        cases: [
          { input: 'horse\nros', output: '3', is_sample: true, is_hidden: false, explanation: 'horse → rorse → rose → ros', score: 25 },
          { input: 'intention\nexecution', output: '5', is_sample: true, is_hidden: false, score: 25 },
          { input: 'abc\nabc', output: '0', is_sample: false, is_hidden: true, score: 25 },
          { input: 'a\nb', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Segment Tree - Range Sum Query',
        cases: [
          { input: '5 4\n1 2 3 4 5\n2 1 5\n1 3 10\n2 1 5\n2 2 4', output: '15\n22\n16', is_sample: true, is_hidden: false, score: 25 },
          { input: '3 2\n1 1 1\n2 1 3\n1 2 5', output: '3', is_sample: false, is_hidden: true, score: 25 },
          { input: '4 3\n0 0 0 0\n1 1 10\n1 4 20\n2 1 4', output: '30', is_sample: false, is_hidden: true, score: 25 },
          { input: '2 2\n100 200\n2 1 2\n2 2 2', output: '300\n200', is_sample: false, is_hidden: true, score: 25 },
        ],
      },

      // ===== MIGRATION 15 PROBLEMS =====
      {
        problemTitle: 'Tìm phần tử xuất hiện nhiều nhất',
        cases: [
          { input: '7\n1 2 2 3 3 3 4', output: '3', is_sample: true, is_hidden: false, explanation: 'Số 3 xuất hiện 3 lần', score: 25 },
          { input: '5\n1 1 2 2 3', output: '1', is_sample: true, is_hidden: false, explanation: '1 và 2 đều 2 lần, chọn 1', score: 25 },
          { input: '1\n42', output: '42', is_sample: false, is_hidden: true, score: 25 },
          { input: '6\n5 5 5 5 5 5', output: '5', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Xoay mảng',
        cases: [
          { input: '5 2\n1 2 3 4 5', output: '4 5 1 2 3', is_sample: true, is_hidden: false, score: 25 },
          { input: '7 3\n1 2 3 4 5 6 7', output: '5 6 7 1 2 3 4', is_sample: true, is_hidden: false, score: 25 },
          { input: '3 0\n1 2 3', output: '1 2 3', is_sample: false, is_hidden: true, score: 25 },
          { input: '4 8\n1 2 3 4', output: '1 2 3 4', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Đếm từ trong chuỗi',
        cases: [
          { input: 'Hello World', output: '2', is_sample: true, is_hidden: false, score: 25 },
          { input: '  Xin   chao   Viet Nam  ', output: '4', is_sample: true, is_hidden: false, score: 25 },
          { input: 'SingleWord', output: '1', is_sample: false, is_hidden: true, score: 25 },
          { input: '   ', output: '0', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Chuỗi con chung dài nhất',
        cases: [
          { input: 'ABCDGH\nABDGHR', output: '3', is_sample: true, is_hidden: false, explanation: 'DGH', score: 25 },
          { input: 'ABCDEF\nXYZABC', output: '3', is_sample: true, is_hidden: false, explanation: 'ABC', score: 25 },
          { input: 'AAA\nAAA', output: '3', is_sample: false, is_hidden: true, score: 25 },
          { input: 'ABC\nXYZ', output: '0', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Hai số có tổng bằng K',
        cases: [
          { input: '5 9\n2 7 11 15 1', output: '1 2', is_sample: true, is_hidden: false, explanation: '2 + 7 = 9', score: 25 },
          { input: '3 10\n1 2 3', output: '-1', is_sample: true, is_hidden: false, score: 25 },
          { input: '4 6\n3 3 3 3', output: '1 2', is_sample: false, is_hidden: true, score: 25 },
          { input: '2 0\n-5 5', output: '1 2', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Đếm cặp số có hiệu bằng K',
        cases: [
          { input: '5 2\n1 5 3 4 2', output: '3', is_sample: true, is_hidden: false, explanation: '(1,3), (3,5), (2,4)', score: 25 },
          { input: '4 0\n1 2 3 4', output: '0', is_sample: true, is_hidden: false, score: 25 },
          { input: '3 1\n1 2 3', output: '2', is_sample: false, is_hidden: true, score: 25 },
          { input: '2 100\n1 101', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Ước chung lớn nhất',
        cases: [
          { input: '12 18', output: '6', is_sample: true, is_hidden: false, score: 25 },
          { input: '7 13', output: '1', is_sample: true, is_hidden: false, explanation: 'Nguyên tố cùng nhau', score: 25 },
          { input: '100 100', output: '100', is_sample: false, is_hidden: true, score: 25 },
          { input: '1 1000000000000000000', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Lũy thừa modulo',
        cases: [
          { input: '2 10 1000', output: '24', is_sample: true, is_hidden: false, explanation: '2^10 mod 1000 = 24', score: 25 },
          { input: '3 0 100', output: '1', is_sample: true, is_hidden: false, score: 25 },
          { input: '2 1000000000000000000 1000000007', output: '140625001', is_sample: false, is_hidden: true, score: 25 },
          { input: '1 999999999 999999999', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Hội nghị phòng họp',
        cases: [
          { input: '4\n1 3\n2 4\n3 5\n0 2', output: '3', is_sample: true, is_hidden: false, score: 25 },
          { input: '3\n1 2\n2 3\n3 4', output: '3', is_sample: false, is_hidden: true, score: 25 },
          { input: '2\n0 10\n1 2', output: '1', is_sample: false, is_hidden: true, score: 25 },
          { input: '1\n0 1000000000', output: '1', is_sample: false, is_hidden: true, score: 50 },
        ],
      },
      {
        problemTitle: 'Chia kẹo',
        cases: [
          { input: '3\n1 0 2', output: '5', is_sample: true, is_hidden: false, explanation: '2, 1, 2 viên', score: 25 },
          { input: '5\n1 2 3 4 5', output: '15', is_sample: true, is_hidden: false, score: 25 },
          { input: '5\n5 4 3 2 1', output: '15', is_sample: false, is_hidden: true, score: 25 },
          { input: '3\n1 1 1', output: '3', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Duyệt cây theo thứ tự giữa',
        cases: [
          { input: '5 2\n2 1\n2 3\n1 0\n3 4', output: '0 1 2 3 4', is_sample: true, is_hidden: false, score: 34 },
          { input: '3 2\n2 1\n2 3', output: '1 2 3', is_sample: false, is_hidden: true, score: 33 },
          { input: '1 1', output: '1', is_sample: false, is_hidden: true, score: 33 },
        ],
      },
      {
        problemTitle: 'Đếm thành phần liên thông',
        cases: [
          { input: '5 3\n1 2\n2 3\n4 5', output: '2', is_sample: true, is_hidden: false, explanation: '{1,2,3}, {4,5}', score: 25 },
          { input: '4 0', output: '4', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 4\n1 2\n2 3\n3 4\n4 5', output: '1', is_sample: false, is_hidden: true, score: 25 },
          { input: '3 3\n1 2\n2 3\n1 3', output: '1', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Dãy con có tổng bằng S',
        cases: [
          { input: '6 7\n2 3 1 2 4 3', output: '2', is_sample: true, is_hidden: false, explanation: '[4, 3]', score: 25 },
          { input: '3 100\n1 2 3', output: '0', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 15\n1 2 3 4 5', output: '5', is_sample: false, is_hidden: true, score: 25 },
          { input: '4 4\n1 1 1 1', output: '4', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Kiểm tra ngoặc hợp lệ',
        cases: [
          { input: '()[]{}', output: 'YES', is_sample: true, is_hidden: false, score: 25 },
          { input: '([)]', output: 'NO', is_sample: true, is_hidden: false, score: 25 },
          { input: '{[()]}', output: 'YES', is_sample: true, is_hidden: false, score: 25 },
          { input: '(((', output: 'NO', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Sliding Window Maximum',
        cases: [
          { input: '8 3\n1 3 -1 -3 5 3 6 7', output: '3 3 5 5 6 7', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 1\n1 2 3 4 5', output: '1 2 3 4 5', is_sample: false, is_hidden: true, score: 25 },
          { input: '4 4\n4 3 2 1', output: '4', is_sample: false, is_hidden: true, score: 25 },
          { input: '6 2\n1 -1 2 -2 3 -3', output: '1 2 2 3 3', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'Đảo ngược danh sách liên kết',
        cases: [
          { input: '1 2 3 4 5 -1', output: '5 4 3 2 1', is_sample: true, is_hidden: false, score: 34 },
          { input: '1 -1', output: '1', is_sample: true, is_hidden: false, score: 33 },
          { input: '10 20 30 -1', output: '30 20 10', is_sample: false, is_hidden: true, score: 33 },
        ],
      },
      {
        problemTitle: 'Tổ hợp K phần tử',
        cases: [
          { input: '4 2', output: '1 2\n1 3\n1 4\n2 3\n2 4\n3 4', is_sample: true, is_hidden: false, score: 25 },
          { input: '3 3', output: '1 2 3', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 1', output: '1\n2\n3\n4\n5', is_sample: false, is_hidden: true, score: 25 },
          { input: '3 2', output: '1 2\n1 3\n2 3', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'N-Queens',
        cases: [
          { input: '4', output: '2', is_sample: true, is_hidden: false, score: 25 },
          { input: '8', output: '92', is_sample: true, is_hidden: false, score: 25 },
          { input: '1', output: '1', is_sample: true, is_hidden: false, score: 25 },
          { input: '10', output: '724', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
      {
        problemTitle: 'K phần tử lớn nhất',
        cases: [
          { input: '6 3\n3 2 1 5 6 4', output: '6 5 4', is_sample: true, is_hidden: false, score: 25 },
          { input: '5 5\n1 2 3 4 5', output: '5 4 3 2 1', is_sample: true, is_hidden: false, score: 25 },
          { input: '4 1\n10 20 30 40', output: '40', is_sample: false, is_hidden: true, score: 25 },
          { input: '3 2\n-1 -2 -3', output: '-1 -2', is_sample: false, is_hidden: true, score: 25 },
        ],
      },
    ];

    // Insert test cases
    for (const tc of testcases) {
      const problemId = problemMap.get(tc.problemTitle);
      if (!problemId) {
        console.log(`Problem not found: ${tc.problemTitle}`);
        continue;
      }

      // Check if testcases already exist for this problem
      const existing = await queryRunner.query(
        `SELECT COUNT(*) as count FROM test_cases WHERE problem_id = ?`,
        [problemId]
      );

      if (existing[0].count > 0) {
        console.log(`Testcases already exist for: ${tc.problemTitle}`);
        continue;
      }

      for (const c of tc.cases) {
        await queryRunner.query(
          `INSERT INTO test_cases (problem_id, input_data, expected_output, is_sample, is_hidden, explanation, score) VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [problemId, c.input, c.output, c.is_sample, c.is_hidden, c.explanation || null, c.score]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Get all problem IDs from the seeded problems
    const problemTitles = [
      'Hello World', 'Tổng hai số', 'Số chẵn hay lẻ', 'Đếm số dương', 'Tìm số lớn nhất',
      'Giai thừa', 'Kiểm tra số nguyên tố', 'Sắp xếp mảng', 'Tìm kiếm nhị phân', 'Fibonacci',
      'Đảo ngược chuỗi', 'Dãy con liên tiếp có tổng lớn nhất', 'Palindrome', 'Tính tổng số chữ số',
      'Đếm số nguyên tố trong đoạn', 'Longest Increasing Subsequence', 'Đường đi ngắn nhất',
      'Knapsack Problem', 'Edit Distance', 'Segment Tree - Range Sum Query',
      'Tìm phần tử xuất hiện nhiều nhất', 'Xoay mảng', 'Đếm từ trong chuỗi', 'Chuỗi con chung dài nhất',
      'Hai số có tổng bằng K', 'Đếm cặp số có hiệu bằng K', 'Ước chung lớn nhất', 'Lũy thừa modulo',
      'Hội nghị phòng họp', 'Chia kẹo', 'Duyệt cây theo thứ tự giữa', 'Đếm thành phần liên thông',
      'Dãy con có tổng bằng S', 'Kiểm tra ngoặc hợp lệ', 'Sliding Window Maximum',
      'Đảo ngược danh sách liên kết', 'Tổ hợp K phần tử', 'N-Queens', 'K phần tử lớn nhất',
    ];

    for (const title of problemTitles) {
      const [problem] = await queryRunner.query(
        `SELECT problem_id FROM problems WHERE title = ?`,
        [title]
      );

      if (problem) {
        await queryRunner.query(
          `DELETE FROM test_cases WHERE problem_id = ?`,
          [problem.problem_id]
        );
      }
    }
  }
}
