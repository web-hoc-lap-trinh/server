import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { Express } from 'express';
import 'dotenv/config';
import path from 'path'; 

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Codery API Docs',
      version: '1.0.0',
      description: 'Tài liệu API cho dự án web dạy lập trình Codery',
    },
    servers: [
      {
        url: `http://localhost:${process.env.PORT || 3000}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        Problem: {
          type: 'object',
          properties: {
            problem_id: { type: 'integer', example: 1 },
            title: { type: 'string', example: 'Two Sum' },
            description: { type: 'string', example: 'Given an array of integers...' },
            difficulty: { type: 'string', enum: ['EASY', 'MEDIUM', 'HARD'], example: 'EASY' },
            points: { type: 'integer', example: 100 },
            time_limit: { type: 'integer', example: 1000, description: 'milliseconds' },
            memory_limit: { type: 'integer', example: 256, description: 'MB' },
            acceptance_rate: { type: 'number', format: 'float', example: 45.5 },
            total_submissions: { type: 'integer', example: 1000 },
            accepted_submissions: { type: 'integer', example: 455 },
            is_published: { type: 'boolean', example: true },
            is_daily_challenge: { type: 'boolean', example: false },
            created_at: { type: 'string', format: 'date-time' },
            updated_at: { type: 'string', format: 'date-time' },
          },
        },
        Language: {
          type: 'object',
          properties: {
            id: { type: 'string', example: 'cpp' },
            name: { type: 'string', example: 'C++' },
            version: { type: 'string', example: '17' },
            compiler: { type: 'string', example: 'g++' },
            file_extension: { type: 'string', example: '.cpp' },
            docker_image: { type: 'string', example: 'gcc:11' },
          },
        },
        PaginatedResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'array', items: {} },
            pagination: {
              type: 'object',
              properties: {
                total: { type: 'integer', example: 100 },
                page: { type: 'integer', example: 1 },
                limit: { type: 'integer', example: 10 },
                totalPages: { type: 'integer', example: 10 },
              },
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Error message' },
            error: { type: 'string', example: 'Error details' },
          },
        },
        CreateProblemRequest: {
          type: 'object',
          required: ['title', 'description', 'difficulty', 'points'],
          properties: {
            title: { 
              type: 'string', 
              example: 'Tổng Hai Số',
              description: 'Tiêu đề bài tập'
            },
            description: { 
              type: 'string', 
              example: '<p>Cho hai số nguyên <code>a</code> và <code>b</code>, hãy tính tổng của chúng.</p>',
              description: 'Mô tả bài tập (hỗ trợ HTML)'
            },
            difficulty: { 
              type: 'string', 
              enum: ['EASY', 'MEDIUM', 'HARD'], 
              example: 'EASY',
              description: 'Độ khó của bài tập'
            },
            tag_ids: { 
              type: 'array', 
              items: { type: 'integer' },
              example: [1, 4],
              description: 'Danh sách ID của các tag'
            },
            input_format: { 
              type: 'string', 
              example: 'Dòng đầu tiên chứa số nguyên a (-10^9 ≤ a ≤ 10^9)\nDòng thứ hai chứa số nguyên b (-10^9 ≤ b ≤ 10^9)',
              description: 'Định dạng input'
            },
            output_format: { 
              type: 'string', 
              example: 'In ra một số nguyên duy nhất là tổng a + b',
              description: 'Định dạng output'
            },
            constraints: { 
              type: 'string', 
              example: '-10^9 ≤ a, b ≤ 10^9',
              description: 'Ràng buộc của bài tập'
            },
            samples: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  input: { type: 'string', example: '3\n5' },
                  output: { type: 'string', example: '8' },
                  explanation: { type: 'string', example: '3 + 5 = 8' },
                },
              },
              example: [
                { input: '3\n5', output: '8', explanation: '3 + 5 = 8' },
                { input: '-5\n10', output: '5', explanation: '-5 + 10 = 5' },
              ],
              description: 'Các test case mẫu'
            },
            time_limit: { 
              type: 'integer', 
              example: 1000,
              description: 'Giới hạn thời gian (milliseconds)'
            },
            memory_limit: { 
              type: 'integer', 
              example: 256,
              description: 'Giới hạn bộ nhớ (MB)'
            },
            points: { 
              type: 'integer', 
              example: 100,
              description: 'Điểm của bài tập'
            },
            is_published: { 
              type: 'boolean', 
              example: true,
              description: 'Bài tập có được công khai không'
            },
            is_daily_challenge: { 
              type: 'boolean', 
              example: false,
              description: 'Bài tập có phải là thử thách hàng ngày không (được quản lý tự động)'
            },
          },
        },
        TestCase: {
          type: 'object',
          properties: {
            test_case_id: { type: 'integer', example: 1 },
            problem_id: { type: 'integer', example: 1 },
            input_data: { type: 'string', example: '3\n5' },
            expected_output: { type: 'string', example: '8' },
            score: { type: 'integer', example: 20 },
            is_sample: { type: 'boolean', example: true },
            is_hidden: { type: 'boolean', example: false },
            explanation: { type: 'string', example: '3 + 5 = 8', nullable: true },
            created_at: { type: 'string', format: 'date-time' },
          },
        },
        CreateTestCaseRequest: {
          type: 'object',
          required: ['input_data', 'expected_output', 'score'],
          properties: {
            input_data: { type: 'string', example: '3\n5', description: 'Dữ liệu đầu vào' },
            expected_output: { type: 'string', example: '8', description: 'Kết quả mong đợi' },
            score: { type: 'integer', example: 20, description: 'Điểm của test case' },
            is_sample: { type: 'boolean', example: true, description: 'Test case mẫu' },
            is_hidden: { type: 'boolean', example: false, description: 'Test case ẩn' },
            explanation: { type: 'string', example: '3 + 5 = 8', description: 'Giải thích' },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: [
    'src/api/**/*.route.ts', 
    'src/api/**/*.controller.ts',
    'dist/api/**/*.route.js',
    'dist/api/**/*.controller.js'
  ],
};

const swaggerSpec = swaggerJsdoc(options);

export const setupSwagger = (app: Express) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  console.log(
    `📚 Tài liệu API (Swagger) có tại: http://localhost:${
      process.env.PORT || 3000
    }/api-docs`
  );
};