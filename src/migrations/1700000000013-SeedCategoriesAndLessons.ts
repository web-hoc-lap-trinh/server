import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedCategoriesAndLessons1700000000013 implements MigrationInterface {
  name = 'SeedCategoriesAndLessons1700000000013';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // ==========================================
    // SEED CATEGORIES (5 categories)
    // ==========================================
    const categories = [
      {
        name: 'Nhập môn lập trình',
        icon_url: '/icons/intro-programming.svg',
        order_index: 1,
      },
      {
        name: 'Cấu trúc dữ liệu',
        icon_url: '/icons/data-structures.svg',
        order_index: 2,
      },
      {
        name: 'Thuật toán cơ bản',
        icon_url: '/icons/algorithms.svg',
        order_index: 3,
      },
      {
        name: 'Lập trình hướng đối tượng',
        icon_url: '/icons/oop.svg',
        order_index: 4,
      },
      {
        name: 'Kỹ thuật lập trình nâng cao',
        icon_url: '/icons/advanced.svg',
        order_index: 5,
      },
    ];

    // Insert categories and store their IDs
    const categoryIds: number[] = [];
    for (const category of categories) {
      const existing = await queryRunner.query(
        `SELECT category_id FROM categories WHERE name = ?`,
        [category.name]
      );

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO categories (name, icon_url, order_index, is_active) VALUES (?, ?, ?, true)`,
          [category.name, category.icon_url, category.order_index]
        );
        const [inserted] = await queryRunner.query(
          `SELECT category_id FROM categories WHERE name = ?`,
          [category.name]
        );
        categoryIds.push(inserted.category_id);
      } else {
        categoryIds.push(existing[0].category_id);
      }
    }

    // Get admin user ID (created_by = 1 as default admin)
    const adminUserId = 1;

    // ==========================================
    // SEED LESSONS (4 lessons per category = 20 total)
    // ==========================================
    const lessons = [
      // Category 1: Nhập môn lập trình
      {
        category_index: 0,
        title: 'Giới thiệu về lập trình',
        description: 'Tổng quan về lập trình và các ngôn ngữ phổ biến',
        content: `# Giới thiệu về lập trình

## Lập trình là gì?
Lập trình là quá trình viết các chỉ dẫn (code) để máy tính thực hiện một nhiệm vụ cụ thể.

## Tại sao nên học lập trình?
- Phát triển tư duy logic
- Cơ hội nghề nghiệp rộng mở
- Tạo ra sản phẩm công nghệ

## Các ngôn ngữ lập trình phổ biến
1. **Python** - Dễ học, đa năng
2. **JavaScript** - Web development
3. **C/C++** - Hiệu năng cao
4. **Java** - Enterprise applications

\`\`\`python
# Chương trình đầu tiên
print("Hello, World!")
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 1,
      },
      {
        category_index: 0,
        title: 'Biến và kiểu dữ liệu',
        description: 'Học về biến, kiểu dữ liệu cơ bản trong lập trình',
        content: `# Biến và Kiểu dữ liệu

## Biến là gì?
Biến là vùng nhớ được đặt tên để lưu trữ dữ liệu.

## Các kiểu dữ liệu cơ bản
| Kiểu | Mô tả | Ví dụ |
|------|-------|-------|
| int | Số nguyên | 42, -10 |
| float | Số thực | 3.14, -2.5 |
| string | Chuỗi ký tự | "Hello" |
| bool | Logic | true, false |

\`\`\`cpp
// Khai báo biến trong C++
int age = 25;
float pi = 3.14159;
string name = "Codery";
bool isStudent = true;
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 2,
      },
      {
        category_index: 0,
        title: 'Câu lệnh điều kiện',
        description: 'If-else, switch-case và logic điều kiện',
        content: `# Câu lệnh điều kiện

## Câu lệnh if-else
Dùng để thực hiện các hành động khác nhau dựa trên điều kiện.

\`\`\`cpp
int score = 85;

if (score >= 90) {
    cout << "Xuất sắc!";
} else if (score >= 70) {
    cout << "Khá!";
} else {
    cout << "Cần cố gắng thêm!";
}
\`\`\`

## Câu lệnh switch-case
Dùng khi có nhiều trường hợp cụ thể.

\`\`\`cpp
int day = 3;
switch (day) {
    case 1: cout << "Thứ 2"; break;
    case 2: cout << "Thứ 3"; break;
    case 3: cout << "Thứ 4"; break;
    default: cout << "Ngày khác";
}
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 3,
      },
      {
        category_index: 0,
        title: 'Vòng lặp',
        description: 'For, while, do-while loops',
        content: `# Vòng lặp trong lập trình

## Vòng lặp for
Dùng khi biết trước số lần lặp.

\`\`\`cpp
// In số từ 1 đến 5
for (int i = 1; i <= 5; i++) {
    cout << i << " ";
}
// Output: 1 2 3 4 5
\`\`\`

## Vòng lặp while
Lặp khi điều kiện còn đúng.

\`\`\`cpp
int count = 0;
while (count < 3) {
    cout << "Lặp lần " << count << endl;
    count++;
}
\`\`\`

## Vòng lặp do-while
Thực hiện ít nhất 1 lần rồi mới kiểm tra điều kiện.

\`\`\`cpp
int n;
do {
    cout << "Nhập số dương: ";
    cin >> n;
} while (n <= 0);
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 4,
      },

      // Category 2: Cấu trúc dữ liệu
      {
        category_index: 1,
        title: 'Mảng một chiều',
        description: 'Array cơ bản và các thao tác',
        content: `# Mảng một chiều (Array)

## Định nghĩa
Mảng là tập hợp các phần tử cùng kiểu dữ liệu, được lưu trữ liên tiếp trong bộ nhớ.

## Khai báo và khởi tạo
\`\`\`cpp
// Cách 1: Khai báo rồi gán giá trị
int arr[5];
arr[0] = 10;

// Cách 2: Khởi tạo trực tiếp
int arr[] = {1, 2, 3, 4, 5};

// Cách 3: Chỉ định kích thước
int arr[5] = {1, 2, 3}; // {1, 2, 3, 0, 0}
\`\`\`

## Duyệt mảng
\`\`\`cpp
int arr[] = {10, 20, 30, 40, 50};
int n = 5;

for (int i = 0; i < n; i++) {
    cout << arr[i] << " ";
}
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 1,
      },
      {
        category_index: 1,
        title: 'Mảng hai chiều',
        description: 'Ma trận và các phép toán',
        content: `# Mảng hai chiều (Matrix)

## Định nghĩa
Mảng 2 chiều là mảng của các mảng, thường dùng để biểu diễn ma trận.

## Khai báo
\`\`\`cpp
// Ma trận 3x4
int matrix[3][4];

// Khởi tạo trực tiếp
int matrix[2][3] = {
    {1, 2, 3},
    {4, 5, 6}
};
\`\`\`

## Duyệt ma trận
\`\`\`cpp
int rows = 2, cols = 3;
int matrix[2][3] = {{1, 2, 3}, {4, 5, 6}};

for (int i = 0; i < rows; i++) {
    for (int j = 0; j < cols; j++) {
        cout << matrix[i][j] << " ";
    }
    cout << endl;
}
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 2,
      },
      {
        category_index: 1,
        title: 'Danh sách liên kết',
        description: 'Linked List và các thao tác cơ bản',
        content: `# Danh sách liên kết (Linked List)

## Định nghĩa
Danh sách liên kết là cấu trúc dữ liệu gồm các node, mỗi node chứa dữ liệu và con trỏ đến node tiếp theo.

## Cấu trúc Node
\`\`\`cpp
struct Node {
    int data;
    Node* next;
    
    Node(int val) : data(val), next(nullptr) {}
};
\`\`\`

## Thêm node vào đầu
\`\`\`cpp
void insertAtHead(Node*& head, int val) {
    Node* newNode = new Node(val);
    newNode->next = head;
    head = newNode;
}
\`\`\`

## Duyệt danh sách
\`\`\`cpp
void printList(Node* head) {
    Node* current = head;
    while (current != nullptr) {
        cout << current->data << " -> ";
        current = current->next;
    }
    cout << "NULL" << endl;
}
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 3,
      },
      {
        category_index: 1,
        title: 'Stack và Queue',
        description: 'Ngăn xếp và hàng đợi',
        content: `# Stack và Queue

## Stack (Ngăn xếp)
- Nguyên tắc: **LIFO** (Last In First Out)
- Thao tác: push, pop, top

\`\`\`cpp
#include <stack>

stack<int> s;
s.push(1);    // [1]
s.push(2);    // [1, 2]
s.push(3);    // [1, 2, 3]

cout << s.top();  // 3
s.pop();          // [1, 2]
\`\`\`

## Queue (Hàng đợi)
- Nguyên tắc: **FIFO** (First In First Out)
- Thao tác: push, pop, front

\`\`\`cpp
#include <queue>

queue<int> q;
q.push(1);    // [1]
q.push(2);    // [1, 2]
q.push(3);    // [1, 2, 3]

cout << q.front();  // 1
q.pop();            // [2, 3]
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 4,
      },

      // Category 3: Thuật toán cơ bản
      {
        category_index: 2,
        title: 'Thuật toán sắp xếp',
        description: 'Bubble Sort, Selection Sort, Insertion Sort',
        content: `# Thuật toán sắp xếp cơ bản

## Bubble Sort
So sánh và đổi chỗ các cặp phần tử liền kề.

\`\`\`cpp
void bubbleSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        for (int j = 0; j < n - i - 1; j++) {
            if (arr[j] > arr[j + 1]) {
                swap(arr[j], arr[j + 1]);
            }
        }
    }
}
\`\`\`
**Độ phức tạp:** O(n²)

## Selection Sort
Tìm phần tử nhỏ nhất và đưa về đầu.

\`\`\`cpp
void selectionSort(int arr[], int n) {
    for (int i = 0; i < n - 1; i++) {
        int minIdx = i;
        for (int j = i + 1; j < n; j++) {
            if (arr[j] < arr[minIdx]) {
                minIdx = j;
            }
        }
        swap(arr[i], arr[minIdx]);
    }
}
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 1,
      },
      {
        category_index: 2,
        title: 'Thuật toán tìm kiếm',
        description: 'Linear Search, Binary Search',
        content: `# Thuật toán tìm kiếm

## Linear Search (Tìm kiếm tuyến tính)
Duyệt từng phần tử từ đầu đến cuối.

\`\`\`cpp
int linearSearch(int arr[], int n, int target) {
    for (int i = 0; i < n; i++) {
        if (arr[i] == target) {
            return i;
        }
    }
    return -1; // Không tìm thấy
}
\`\`\`
**Độ phức tạp:** O(n)

## Binary Search (Tìm kiếm nhị phân)
Áp dụng cho mảng **đã sắp xếp**. Chia đôi liên tục.

\`\`\`cpp
int binarySearch(int arr[], int n, int target) {
    int left = 0, right = n - 1;
    
    while (left <= right) {
        int mid = left + (right - left) / 2;
        
        if (arr[mid] == target) return mid;
        if (arr[mid] < target) left = mid + 1;
        else right = mid - 1;
    }
    return -1;
}
\`\`\`
**Độ phức tạp:** O(log n)`,
        difficulty_level: 'BEGINNER',
        order_index: 2,
      },
      {
        category_index: 2,
        title: 'Đệ quy',
        description: 'Khái niệm đệ quy và các bài toán cơ bản',
        content: `# Đệ quy (Recursion)

## Định nghĩa
Đệ quy là kỹ thuật trong đó hàm tự gọi chính nó.

## Cấu trúc hàm đệ quy
1. **Base case** (điều kiện dừng)
2. **Recursive case** (bước đệ quy)

## Ví dụ: Tính giai thừa
\`\`\`cpp
int factorial(int n) {
    // Base case
    if (n <= 1) return 1;
    
    // Recursive case
    return n * factorial(n - 1);
}
// factorial(5) = 5 * 4 * 3 * 2 * 1 = 120
\`\`\`

## Ví dụ: Fibonacci
\`\`\`cpp
int fibonacci(int n) {
    if (n <= 1) return n;
    return fibonacci(n - 1) + fibonacci(n - 2);
}
// 0, 1, 1, 2, 3, 5, 8, 13, 21...
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 3,
      },
      {
        category_index: 2,
        title: 'Thuật toán tham lam',
        description: 'Greedy Algorithm và ứng dụng',
        content: `# Thuật toán tham lam (Greedy Algorithm)

## Định nghĩa
Thuật toán tham lam đưa ra quyết định tối ưu cục bộ tại mỗi bước với hy vọng đạt được kết quả tối ưu toàn cục.

## Đặc điểm
- Đơn giản, dễ cài đặt
- Không phải lúc nào cũng cho kết quả tối ưu
- Hiệu quả về thời gian

## Ví dụ: Bài toán đổi tiền
\`\`\`cpp
// Cho các mệnh giá: 1, 5, 10, 25, 100
// Tìm số đồng xu ít nhất để đổi N đồng

int coinChange(int n) {
    int coins[] = {100, 25, 10, 5, 1};
    int count = 0;
    
    for (int coin : coins) {
        count += n / coin;
        n %= coin;
    }
    return count;
}
// coinChange(289) = 2*100 + 3*25 + 1*10 + 4*1 = 10 xu
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 4,
      },

      // Category 4: Lập trình hướng đối tượng
      {
        category_index: 3,
        title: 'Giới thiệu OOP',
        description: 'Class, Object và các khái niệm cơ bản',
        content: `# Lập trình hướng đối tượng (OOP)

## 4 tính chất của OOP
1. **Encapsulation** (Đóng gói)
2. **Inheritance** (Kế thừa)
3. **Polymorphism** (Đa hình)
4. **Abstraction** (Trừu tượng)

## Class và Object
\`\`\`cpp
class Student {
private:
    string name;
    int age;
    
public:
    // Constructor
    Student(string n, int a) : name(n), age(a) {}
    
    // Getter
    string getName() { return name; }
    
    // Setter
    void setAge(int a) { age = a; }
    
    // Method
    void introduce() {
        cout << "Tôi là " << name << ", " << age << " tuổi." << endl;
    }
};

// Sử dụng
Student s("Nam", 20);
s.introduce();
\`\`\``,
        difficulty_level: 'BEGINNER',
        order_index: 1,
      },
      {
        category_index: 3,
        title: 'Kế thừa',
        description: 'Inheritance trong OOP',
        content: `# Kế thừa (Inheritance)

## Định nghĩa
Kế thừa cho phép class con thừa hưởng thuộc tính và phương thức từ class cha.

## Ví dụ
\`\`\`cpp
// Class cha
class Animal {
protected:
    string name;
    
public:
    Animal(string n) : name(n) {}
    
    void eat() {
        cout << name << " đang ăn." << endl;
    }
};

// Class con
class Dog : public Animal {
public:
    Dog(string n) : Animal(n) {}
    
    void bark() {
        cout << name << " sủa: Gâu gâu!" << endl;
    }
};

// Sử dụng
Dog myDog("Milo");
myDog.eat();   // Milo đang ăn.
myDog.bark();  // Milo sủa: Gâu gâu!
\`\`\`

## Các loại kế thừa
- **public**: Giữ nguyên access modifier
- **protected**: public → protected
- **private**: Tất cả → private`,
        difficulty_level: 'INTERMEDIATE',
        order_index: 2,
      },
      {
        category_index: 3,
        title: 'Đa hình',
        description: 'Polymorphism và Virtual Functions',
        content: `# Đa hình (Polymorphism)

## Định nghĩa
Đa hình cho phép các đối tượng khác nhau phản hồi khác nhau với cùng một phương thức.

## Virtual Function
\`\`\`cpp
class Shape {
public:
    virtual void draw() {
        cout << "Vẽ hình" << endl;
    }
    
    virtual double area() = 0; // Pure virtual
};

class Circle : public Shape {
private:
    double radius;
    
public:
    Circle(double r) : radius(r) {}
    
    void draw() override {
        cout << "Vẽ hình tròn" << endl;
    }
    
    double area() override {
        return 3.14159 * radius * radius;
    }
};

class Rectangle : public Shape {
private:
    double width, height;
    
public:
    Rectangle(double w, double h) : width(w), height(h) {}
    
    void draw() override {
        cout << "Vẽ hình chữ nhật" << endl;
    }
    
    double area() override {
        return width * height;
    }
};
\`\`\``,
        difficulty_level: 'ADVANCED',
        order_index: 3,
      },
      {
        category_index: 3,
        title: 'Interface và Abstract Class',
        description: 'Trừu tượng hóa trong OOP',
        content: `# Interface và Abstract Class

## Abstract Class
Class có ít nhất một pure virtual function.

\`\`\`cpp
class Database {
public:
    virtual void connect() = 0;
    virtual void query(string sql) = 0;
    virtual void disconnect() = 0;
    
    void log(string msg) {
        cout << "[LOG] " << msg << endl;
    }
};

class MySQL : public Database {
public:
    void connect() override {
        cout << "Connecting to MySQL..." << endl;
    }
    
    void query(string sql) override {
        cout << "MySQL: " << sql << endl;
    }
    
    void disconnect() override {
        cout << "Disconnected from MySQL" << endl;
    }
};
\`\`\`

## Lưu ý
- Không thể tạo object từ abstract class
- Class con phải implement tất cả pure virtual functions
- Dùng để định nghĩa "hợp đồng" cho các class con`,
        difficulty_level: 'ADVANCED',
        order_index: 4,
      },

      // Category 5: Kỹ thuật lập trình nâng cao
      {
        category_index: 4,
        title: 'Con trỏ và tham chiếu',
        description: 'Pointers, References và Memory',
        content: `# Con trỏ và Tham chiếu

## Con trỏ (Pointer)
Biến lưu địa chỉ bộ nhớ của biến khác.

\`\`\`cpp
int x = 10;
int* ptr = &x;  // ptr trỏ đến x

cout << x;      // 10 (giá trị)
cout << &x;     // 0x7fff... (địa chỉ)
cout << ptr;    // 0x7fff... (địa chỉ)
cout << *ptr;   // 10 (giá trị tại địa chỉ)

*ptr = 20;      // Thay đổi x qua con trỏ
cout << x;      // 20
\`\`\`

## Tham chiếu (Reference)
Bí danh cho một biến khác.

\`\`\`cpp
int x = 10;
int& ref = x;   // ref là alias của x

ref = 20;
cout << x;      // 20

// Hàm với tham chiếu
void swap(int& a, int& b) {
    int temp = a;
    a = b;
    b = temp;
}
\`\`\``,
        difficulty_level: 'INTERMEDIATE',
        order_index: 1,
      },
      {
        category_index: 4,
        title: 'Quản lý bộ nhớ động',
        description: 'Dynamic Memory Allocation',
        content: `# Quản lý bộ nhớ động

## Cấp phát động với new/delete
\`\`\`cpp
// Cấp phát một biến
int* p = new int;
*p = 42;
delete p;

// Cấp phát mảng
int* arr = new int[10];
for (int i = 0; i < 10; i++) {
    arr[i] = i * 2;
}
delete[] arr;
\`\`\`

## Memory Leak
Xảy ra khi quên giải phóng bộ nhớ.

\`\`\`cpp
void memoryLeak() {
    int* p = new int[1000];
    // Quên delete[] p
    // => Memory leak!
}
\`\`\`

## Smart Pointers (C++11)
\`\`\`cpp
#include <memory>

// unique_ptr - Sở hữu duy nhất
unique_ptr<int> p1 = make_unique<int>(42);

// shared_ptr - Chia sẻ ownership
shared_ptr<int> p2 = make_shared<int>(100);
shared_ptr<int> p3 = p2; // OK, reference count = 2

// Tự động giải phóng khi ra khỏi scope
\`\`\``,
        difficulty_level: 'ADVANCED',
        order_index: 2,
      },
      {
        category_index: 4,
        title: 'Template',
        description: 'Generic Programming với Template',
        content: `# Template trong C++

## Function Template
Viết hàm tổng quát cho nhiều kiểu dữ liệu.

\`\`\`cpp
template <typename T>
T getMax(T a, T b) {
    return (a > b) ? a : b;
}

// Sử dụng
int maxInt = getMax(3, 7);         // 7
double maxDouble = getMax(3.5, 2.1); // 3.5
string maxStr = getMax("abc", "xyz"); // "xyz"
\`\`\`

## Class Template
\`\`\`cpp
template <typename T>
class Stack {
private:
    vector<T> data;
    
public:
    void push(T value) {
        data.push_back(value);
    }
    
    T pop() {
        T top = data.back();
        data.pop_back();
        return top;
    }
    
    bool isEmpty() {
        return data.empty();
    }
};

// Sử dụng
Stack<int> intStack;
Stack<string> strStack;
\`\`\``,
        difficulty_level: 'ADVANCED',
        order_index: 3,
      },
      {
        category_index: 4,
        title: 'Exception Handling',
        description: 'Xử lý ngoại lệ trong C++',
        content: `# Xử lý ngoại lệ (Exception Handling)

## Cú pháp try-catch
\`\`\`cpp
try {
    // Code có thể gây lỗi
    int result = divide(10, 0);
} catch (const runtime_error& e) {
    // Xử lý lỗi runtime_error
    cout << "Lỗi: " << e.what() << endl;
} catch (const exception& e) {
    // Xử lý các lỗi khác
    cout << "Exception: " << e.what() << endl;
} catch (...) {
    // Bắt tất cả các ngoại lệ
    cout << "Lỗi không xác định" << endl;
}
\`\`\`

## Ném ngoại lệ với throw
\`\`\`cpp
double divide(double a, double b) {
    if (b == 0) {
        throw runtime_error("Không thể chia cho 0!");
    }
    return a / b;
}
\`\`\`

## Custom Exception
\`\`\`cpp
class InvalidAgeException : public exception {
public:
    const char* what() const noexcept override {
        return "Tuổi không hợp lệ!";
    }
};

void setAge(int age) {
    if (age < 0 || age > 150) {
        throw InvalidAgeException();
    }
}
\`\`\``,
        difficulty_level: 'ADVANCED',
        order_index: 4,
      },
    ];

    // Insert lessons
    for (const lesson of lessons) {
      const categoryId = categoryIds[lesson.category_index];
      
      const existing = await queryRunner.query(
        `SELECT lesson_id FROM lessons WHERE title = ? AND category_id = ?`,
        [lesson.title, categoryId]
      );

      if (existing.length === 0) {
        await queryRunner.query(
          `INSERT INTO lessons (category_id, title, description, content, difficulty_level, order_index, is_published, view_count, created_by)
           VALUES (?, ?, ?, ?, ?, ?, true, 0, ?)`,
          [
            categoryId,
            lesson.title,
            lesson.description,
            lesson.content,
            lesson.difficulty_level,
            lesson.order_index,
            adminUserId,
          ]
        );
      }
    }
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete seeded lessons
    const lessonTitles = [
      'Giới thiệu về lập trình',
      'Biến và kiểu dữ liệu',
      'Câu lệnh điều kiện',
      'Vòng lặp',
      'Mảng một chiều',
      'Mảng hai chiều',
      'Danh sách liên kết',
      'Stack và Queue',
      'Thuật toán sắp xếp',
      'Thuật toán tìm kiếm',
      'Đệ quy',
      'Thuật toán tham lam',
      'Giới thiệu OOP',
      'Kế thừa',
      'Đa hình',
      'Interface và Abstract Class',
      'Con trỏ và tham chiếu',
      'Quản lý bộ nhớ động',
      'Template',
      'Exception Handling',
    ];

    for (const title of lessonTitles) {
      await queryRunner.query(`DELETE FROM lessons WHERE title = ?`, [title]);
    }

    // Delete seeded categories
    const categoryNames = [
      'Nhập môn lập trình',
      'Cấu trúc dữ liệu',
      'Thuật toán cơ bản',
      'Lập trình hướng đối tượng',
      'Kỹ thuật lập trình nâng cao',
    ];

    for (const name of categoryNames) {
      await queryRunner.query(`DELETE FROM categories WHERE name = ?`, [name]);
    }
  }
}
