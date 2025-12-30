import { MigrationInterface, QueryRunner } from 'typeorm';

export class UpdateProblemDescriptionsToHTML1767188487000 implements MigrationInterface {
  name = 'UpdateProblemDescriptionsToHTML1767188487000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Get all problems that have markdown descriptions
    const problems = await queryRunner.query(`SELECT problem_id, title, description FROM problems`);

    const updates = [
      {
        title: 'Hello World',
        description: `<h2>Mô tả</h2>
<p>Viết chương trình in ra dòng chữ "Hello, World!".</p>

<h2>Yêu cầu</h2>
<p>Chương trình không nhận input, chỉ cần in ra output đúng định dạng.</p>`
      },
      {
        title: 'Tổng hai số',
        description: `<h2>Mô tả</h2>
<p>Cho hai số nguyên a và b. Tính tổng của chúng.</p>

<h2>Yêu cầu</h2>
<p>Đọc hai số từ input và in ra tổng của chúng.</p>`
      },
      {
        title: 'Số chẵn hay lẻ',
        description: `<h2>Mô tả</h2>
<p>Cho một số nguyên n. Kiểm tra xem n là số chẵn hay số lẻ.</p>

<h2>Yêu cầu</h2>
<p>In ra "EVEN" nếu n chẵn, "ODD" nếu n lẻ.</p>`
      },
      {
        title: 'Đếm số dương',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên. Đếm số lượng số dương trong dãy.</p>

<h2>Yêu cầu</h2>
<p>Đọc dãy số và đếm có bao nhiêu số lớn hơn 0.</p>`
      },
      {
        title: 'Tìm số lớn nhất',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên. Tìm giá trị lớn nhất trong dãy.</p>

<h2>Yêu cầu</h2>
<p>In ra giá trị lớn nhất.</p>`
      },
      {
        title: 'Giai thừa',
        description: `<h2>Mô tả</h2>
<p>Tính n! (n giai thừa).</p>

<h2>Công thức</h2>
<p>n! = 1 × 2 × 3 × ... × n<br>0! = 1</p>`
      },
      {
        title: 'Kiểm tra số nguyên tố',
        description: `<h2>Mô tả</h2>
<p>Cho số nguyên n. Kiểm tra xem n có phải là số nguyên tố không.</p>

<h2>Định nghĩa</h2>
<p>Số nguyên tố là số tự nhiên lớn hơn 1 và chỉ chia hết cho 1 và chính nó.</p>`
      },
      {
        title: 'Sắp xếp mảng',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên. Sắp xếp dãy theo thứ tự tăng dần.</p>

<h2>Yêu cầu</h2>
<p>Sử dụng thuật toán sắp xếp phù hợp để đảm bảo không bị TLE.</p>`
      },
      {
        title: 'Tìm kiếm nhị phân',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên <strong>đã sắp xếp tăng dần</strong> và q truy vấn.<br>
Với mỗi truy vấn, tìm vị trí đầu tiên của giá trị x trong dãy.</p>

<h2>Yêu cầu</h2>
<p>Sử dụng Binary Search để đảm bảo độ phức tạp O(log n) cho mỗi truy vấn.</p>`
      },
      {
        title: 'Fibonacci',
        description: `<h2>Mô tả</h2>
<p>Tính số Fibonacci thứ n.</p>

<h2>Định nghĩa</h2>
<p>F(0) = 0, F(1) = 1<br>
F(n) = F(n-1) + F(n-2) với n ≥ 2</p>

<h2>Lưu ý</h2>
<p>Kết quả có thể rất lớn, hãy in ra kết quả mod 10^9 + 7.</p>`
      },
      {
        title: 'Đảo ngược chuỗi',
        description: `<h2>Mô tả</h2>
<p>Cho một chuỗi s. In ra chuỗi đảo ngược của s.</p>

<h2>Yêu cầu</h2>
<p>Không sử dụng hàm reverse có sẵn.</p>`
      },
      {
        title: 'Dãy con liên tiếp có tổng lớn nhất',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên (có thể âm). Tìm dãy con liên tiếp có tổng lớn nhất.</p>

<h2>Thuật toán</h2>
<p>Sử dụng thuật toán Kadane để giải trong O(n).</p>`
      },
      {
        title: 'Palindrome',
        description: `<h2>Mô tả</h2>
<p>Kiểm tra xem chuỗi s có phải là palindrome không.</p>

<h2>Định nghĩa</h2>
<p>Palindrome là chuỗi đọc xuôi hay ngược đều giống nhau.</p>

<h2>Lưu ý</h2>
<p>So sánh không phân biệt hoa thường, bỏ qua các ký tự không phải chữ cái.</p>`
      },
      {
        title: 'Tính tổng số chữ số',
        description: `<h2>Mô tả</h2>
<p>Cho số nguyên dương n. Tính tổng các chữ số của n.<br>
Lặp lại cho đến khi kết quả chỉ còn 1 chữ số.</p>

<h2>Ví dụ</h2>
<p>n = 9875 → 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2</p>`
      },
      {
        title: 'Đếm số nguyên tố trong đoạn',
        description: `<h2>Mô tả</h2>
<p>Cho hai số nguyên L và R. Đếm số lượng số nguyên tố trong đoạn [L, R].</p>

<h2>Yêu cầu</h2>
<p>Tối ưu thuật toán để xử lý đoạn lớn.</p>`
      },
      {
        title: 'Longest Increasing Subsequence',
        description: `<h2>Mô tả</h2>
<p>Cho một dãy n số nguyên. Tìm độ dài của dãy con tăng dài nhất (LIS).</p>

<h2>Định nghĩa</h2>
<p>Dãy con tăng là dãy các phần tử được chọn từ dãy ban đầu (giữ nguyên thứ tự) sao cho mỗi phần tử lớn hơn phần tử trước.</p>

<h2>Yêu cầu</h2>
<p>Thuật toán O(n log n)</p>`
      },
      {
        title: 'Đường đi ngắn nhất',
        description: `<h2>Mô tả</h2>
<p>Cho đồ thị có hướng n đỉnh và m cạnh. Mỗi cạnh có trọng số.<br>
Tìm đường đi ngắn nhất từ đỉnh 1 đến đỉnh n.</p>

<h2>Yêu cầu</h2>
<p>Sử dụng thuật toán Dijkstra.</p>`
      },
      {
        title: 'Knapsack Problem',
        description: `<h2>Mô tả</h2>
<p>Cho n món đồ, mỗi món có trọng lượng w[i] và giá trị v[i].<br>
Bạn có túi chứa tối đa W đơn vị trọng lượng.<br>
Chọn các món đồ để tổng giá trị lớn nhất mà không vượt quá W.</p>

<h2>Yêu cầu</h2>
<p>Mỗi món chỉ được chọn 1 lần (0/1 Knapsack).</p>`
      },
      {
        title: 'Edit Distance',
        description: `<h2>Mô tả</h2>
<p>Cho hai chuỗi s1 và s2. Tìm số phép biến đổi tối thiểu để chuyển s1 thành s2.</p>

<h2>Các phép biến đổi</h2>
<ul>
<li>Insert: Thêm một ký tự</li>
<li>Delete: Xóa một ký tự</li>
<li>Replace: Thay thế một ký tự</li>
</ul>

<h2>Thuật toán</h2>
<p>Dynamic Programming với độ phức tạp O(n×m).</p>`
      },
      {
        title: 'Segment Tree - Range Sum Query',
        description: `<h2>Mô tả</h2>
<p>Cho dãy n số và q truy vấn. Mỗi truy vấn thuộc một trong hai loại:</p>
<ol>
<li>Update: Thay đổi giá trị tại vị trí i thành x</li>
<li>Query: Tính tổng các phần tử từ vị trí l đến r</li>
</ol>

<h2>Yêu cầu</h2>
<p>Sử dụng Segment Tree để đạt O(log n) cho mỗi thao tác.</p>`
      }
    ];

    // Update each problem description
    for (const update of updates) {
      await queryRunner.query(
        `UPDATE problems SET description = ? WHERE title = ?`,
        [update.description, update.title]
      );
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Revert back to markdown format
    const revertUpdates = [
      {
        title: 'Hello World',
        description: `## Mô tả
Viết chương trình in ra dòng chữ "Hello, World!".

## Yêu cầu
Chương trình không nhận input, chỉ cần in ra output đúng định dạng.`
      },
      {
        title: 'Tổng hai số',
        description: `## Mô tả
Cho hai số nguyên a và b. Tính tổng của chúng.

## Yêu cầu
Đọc hai số từ input và in ra tổng của chúng.`
      },
      {
        title: 'Số chẵn hay lẻ',
        description: `## Mô tả
Cho một số nguyên n. Kiểm tra xem n là số chẵn hay số lẻ.

## Yêu cầu
In ra "EVEN" nếu n chẵn, "ODD" nếu n lẻ.`
      },
      {
        title: 'Đếm số dương',
        description: `## Mô tả
Cho một dãy n số nguyên. Đếm số lượng số dương trong dãy.

## Yêu cầu
Đọc dãy số và đếm có bao nhiêu số lớn hơn 0.`
      },
      {
        title: 'Tìm số lớn nhất',
        description: `## Mô tả
Cho một dãy n số nguyên. Tìm giá trị lớn nhất trong dãy.

## Yêu cầu
In ra giá trị lớn nhất.`
      },
      {
        title: 'Giai thừa',
        description: `## Mô tả
Tính n! (n giai thừa).

## Công thức
n! = 1 × 2 × 3 × ... × n
0! = 1`
      },
      {
        title: 'Kiểm tra số nguyên tố',
        description: `## Mô tả
Cho số nguyên n. Kiểm tra xem n có phải là số nguyên tố không.

## Định nghĩa
Số nguyên tố là số tự nhiên lớn hơn 1 và chỉ chia hết cho 1 và chính nó.`
      },
      {
        title: 'Sắp xếp mảng',
        description: `## Mô tả
Cho một dãy n số nguyên. Sắp xếp dãy theo thứ tự tăng dần.

## Yêu cầu
Sử dụng thuật toán sắp xếp phù hợp để đảm bảo không bị TLE.`
      },
      {
        title: 'Tìm kiếm nhị phân',
        description: `## Mô tả
Cho một dãy n số nguyên **đã sắp xếp tăng dần** và q truy vấn.
Với mỗi truy vấn, tìm vị trí đầu tiên của giá trị x trong dãy.

## Yêu cầu
Sử dụng Binary Search để đảm bảo độ phức tạp O(log n) cho mỗi truy vấn.`
      },
      {
        title: 'Fibonacci',
        description: `## Mô tả
Tính số Fibonacci thứ n.

## Định nghĩa
F(0) = 0, F(1) = 1
F(n) = F(n-1) + F(n-2) với n ≥ 2

## Lưu ý
Kết quả có thể rất lớn, hãy in ra kết quả mod 10^9 + 7.`
      },
      {
        title: 'Đảo ngược chuỗi',
        description: `## Mô tả
Cho một chuỗi s. In ra chuỗi đảo ngược của s.

## Yêu cầu
Không sử dụng hàm reverse có sẵn.`
      },
      {
        title: 'Dãy con liên tiếp có tổng lớn nhất',
        description: `## Mô tả
Cho một dãy n số nguyên (có thể âm). Tìm dãy con liên tiếp có tổng lớn nhất.

## Thuật toán
Sử dụng thuật toán Kadane để giải trong O(n).`
      },
      {
        title: 'Palindrome',
        description: `## Mô tả
Kiểm tra xem chuỗi s có phải là palindrome không.

## Định nghĩa
Palindrome là chuỗi đọc xuôi hay ngược đều giống nhau.

## Lưu ý
So sánh không phân biệt hoa thường, bỏ qua các ký tự không phải chữ cái.`
      },
      {
        title: 'Tính tổng số chữ số',
        description: `## Mô tả
Cho số nguyên dương n. Tính tổng các chữ số của n.
Lặp lại cho đến khi kết quả chỉ còn 1 chữ số.

## Ví dụ
n = 9875 → 9+8+7+5 = 29 → 2+9 = 11 → 1+1 = 2`
      },
      {
        title: 'Đếm số nguyên tố trong đoạn',
        description: `## Mô tả
Cho hai số nguyên L và R. Đếm số lượng số nguyên tố trong đoạn [L, R].

## Yêu cầu
Tối ưu thuật toán để xử lý đoạn lớn.`
      },
      {
        title: 'Longest Increasing Subsequence',
        description: `## Mô tả
Cho một dãy n số nguyên. Tìm độ dài của dãy con tăng dài nhất (LIS).

## Định nghĩa
Dãy con tăng là dãy các phần tử được chọn từ dãy ban đầu (giữ nguyên thứ tự) sao cho mỗi phần tử lớn hơn phần tử trước.

## Yêu cầu
Thuật toán O(n log n)`
      },
      {
        title: 'Đường đi ngắn nhất',
        description: `## Mô tả
Cho đồ thị có hướng n đỉnh và m cạnh. Mỗi cạnh có trọng số.
Tìm đường đi ngắn nhất từ đỉnh 1 đến đỉnh n.

## Yêu cầu
Sử dụng thuật toán Dijkstra.`
      },
      {
        title: 'Knapsack Problem',
        description: `## Mô tả
Cho n món đồ, mỗi món có trọng lượng w[i] và giá trị v[i].
Bạn có túi chứa tối đa W đơn vị trọng lượng.
Chọn các món đồ để tổng giá trị lớn nhất mà không vượt quá W.

## Yêu cầu
Mỗi món chỉ được chọn 1 lần (0/1 Knapsack).`
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
Dynamic Programming với độ phức tạp O(n×m).`
      },
      {
        title: 'Segment Tree - Range Sum Query',
        description: `## Mô tả
Cho dãy n số và q truy vấn. Mỗi truy vấn thuộc một trong hai loại:
1. Update: Thay đổi giá trị tại vị trí i thành x
2. Query: Tính tổng các phần tử từ vị trí l đến r

## Yêu cầu
Sử dụng Segment Tree để đạt O(log n) cho mỗi thao tác.`
      }
    ];

    // Revert each problem description
    for (const update of revertUpdates) {
      await queryRunner.query(
        `UPDATE problems SET description = ? WHERE title = ?`,
        [update.description, update.title]
      );
    }
  }
}
