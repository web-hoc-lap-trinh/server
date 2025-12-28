/**
 * Direct Runner Service (Fixed for Render)
 * * Thay vì dùng Docker, module này chạy code trực tiếp trên server (Container của Render).
 * Môi trường (GCC, Python, Java) đã được cài sẵn qua Dockerfile.
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { v4 as uuidv4 } from 'uuid';

const execPromise = promisify(exec);
const fsPromise = fs.promises;

// ==========================================
// INTERFACES
// ==========================================

export interface ExecutionConfig {
  language: string;
  sourceCode: string;
  input: string;
  timeLimit: number;
  memoryLimit: number;
  dockerImage: string; // Giữ lại để không lỗi interface, nhưng sẽ không dùng
  compileCommand?: string | null;
  runCommand: string;
  fileExtension: string;
}

export interface ExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTime: number;
  memoryUsed: number;
  status: 'success' | 'timeout' | 'memory_limit' | 'runtime_error' | 'compile_error';
  compilationOutput?: string;
}

// ==========================================
// CONFIGURATION
// ==========================================

const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB max output

// Cấu hình lệnh chạy TRỰC TIẾP (Không qua Docker)
export const LANGUAGE_CONFIGS: Record<string, {
  fileExtension: string;
  sourceFileName: string;
  // Hàm trả về lệnh biên dịch
  getCompileCommand: (dir: string, file: string) => { cmd: string, args: string[] } | null;
  // Hàm trả về lệnh chạy
  getRunCommand: (dir: string, file: string) => { cmd: string, args: string[] };
}> = {
  cpp: {
    fileExtension: 'cpp',
    sourceFileName: 'solution.cpp',
    getCompileCommand: (dir, file) => ({ 
      cmd: 'g++', 
      args: ['-std=c++17', '-O2', '-o', path.join(dir, 'solution'), file] 
    }),
    getRunCommand: (dir, file) => ({ 
      cmd: path.join(dir, 'solution'), 
      args: [] 
    }),
  },
  c: {
    fileExtension: 'c',
    sourceFileName: 'solution.c',
    getCompileCommand: (dir, file) => ({ 
      cmd: 'gcc', 
      args: ['-std=c11', '-O2', '-o', path.join(dir, 'solution'), file] 
    }),
    getRunCommand: (dir, file) => ({ 
      cmd: path.join(dir, 'solution'), 
      args: [] 
    }),
  },
  python: {
    fileExtension: 'py',
    sourceFileName: 'solution.py',
    getCompileCommand: () => null,
    getRunCommand: (dir, file) => ({ 
      cmd: 'python3', 
      args: [file] 
    }),
  },
  javascript: {
    fileExtension: 'js',
    sourceFileName: 'solution.js',
    getCompileCommand: () => null,
    getRunCommand: (dir, file) => ({ 
      cmd: 'node', 
      args: [file] 
    }),
  },
  java: {
    fileExtension: 'java',
    sourceFileName: 'Solution.java',
    getCompileCommand: (dir, file) => ({ 
      cmd: 'javac', 
      args: [file] 
    }),
    getRunCommand: (dir, file) => ({ 
      cmd: 'java', 
      args: ['-cp', dir, 'Solution'] 
    }),
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

async function createTempDir(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `judge_${uuidv4()}`);
  await fsPromise.mkdir(tempDir, { recursive: true });
  return tempDir;
}

async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fsPromise.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up temp directory:', error);
  }
}

export function normalizeOutput(output: string): string {
  return output.replace(/\r\n/g, '\n').replace(/\r/g, '\n').trim();
}

export function compareOutputs(actual: string, expected: string): boolean {
  return normalizeOutput(actual) === normalizeOutput(expected);
}

function truncateOutput(output: string, maxSize: number = MAX_OUTPUT_SIZE): string {
  if (output.length > maxSize) {
    return output.substring(0, maxSize) + '\n... [output truncated]';
  }
  return output;
}

// ==========================================
// MAIN EXECUTION FUNCTIONS
// ==========================================

/**
 * Execute code DIRECTLY (Replaces executeInDocker)
 */
export async function executeInDocker(config: ExecutionConfig): Promise<ExecutionResult> {
  // Tên hàm vẫn giữ là executeInDocker để không phải sửa code gọi hàm này ở chỗ khác,
  // nhưng logic bên trong là chạy trực tiếp.
  const tempDir = await createTempDir();
  
  try {
    const langConfig = LANGUAGE_CONFIGS[config.language];
    if (!langConfig) {
      return {
        exitCode: 1, stdout: '', stderr: `Unsupported language: ${config.language}`,
        executionTime: 0, memoryUsed: 0, status: 'compile_error',
      };
    }

    // Write source code
    const sourceFile = path.join(tempDir, langConfig.sourceFileName);
    await fsPromise.writeFile(sourceFile, config.sourceCode);

    // Write input
    const inputFile = path.join(tempDir, 'input.txt');
    await fsPromise.writeFile(inputFile, config.input);

    // 1. COMPILE (Nếu cần)
    const compileCmd = langConfig.getCompileCommand(tempDir, sourceFile);
    if (compileCmd) {
      const compileResult = await runProcess(compileCmd.cmd, compileCmd.args, tempDir, null, 10000); // 10s compile limit
      
      if (compileResult.exitCode !== 0) {
        return {
          exitCode: compileResult.exitCode,
          stdout: '',
          stderr: compileResult.stderr,
          executionTime: 0,
          memoryUsed: 0,
          status: 'compile_error',
          compilationOutput: compileResult.stderr,
        };
      }
    }

    // 2. RUN
    const runCmd = langConfig.getRunCommand(tempDir, sourceFile);
    const runResult = await runProcess(
      runCmd.cmd, 
      runCmd.args, 
      tempDir, 
      inputFile, 
      config.timeLimit
    );

    return runResult;

  } finally {
    await cleanupTempDir(tempDir);
  }
}

/**
 * Helper để chạy process bằng spawn
 */
async function runProcess(
  command: string, 
  args: string[], 
  cwd: string, 
  inputFile: string | null, 
  timeLimit: number
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    let stdout = '';
    let stderr = '';
    let isTimeout = false;

    // Mở file input để đọc (nếu có)
    let stdioConfig: any = ['pipe', 'pipe', 'pipe'];
    if (inputFile) {
      try {
        const fd = fs.openSync(inputFile, 'r');
        stdioConfig = [fd, 'pipe', 'pipe'];
      } catch (e) {
        // Fallback nếu không mở được file
      }
    }

    const child = spawn(command, args, {
      cwd,
      stdio: stdioConfig,
      timeout: timeLimit + 500, // Node.js timeout (buffer thêm 500ms)
    });

    // Timer để kill process nếu quá giờ (backup)
    const timer = setTimeout(() => {
      isTimeout = true;
      child.kill('SIGKILL');
    }, timeLimit);

    child.stdout?.on('data', (data) => {
      if (stdout.length < MAX_OUTPUT_SIZE) stdout += data.toString();
    });

    child.stderr?.on('data', (data) => stderr += data.toString());

    child.on('close', (code, signal) => {
      clearTimeout(timer);
      const executionTime = Date.now() - startTime;

      let status: ExecutionResult['status'] = 'success';
      
      // Kiểm tra timeout (signal SIGTERM/SIGKILL do option timeout của spawn hoặc timer)
      if (signal === 'SIGTERM' || signal === 'SIGKILL' || isTimeout || executionTime > timeLimit) {
        status = 'timeout';
      } else if (code !== 0) {
        status = 'runtime_error';
      }

      resolve({
        exitCode: code || 0,
        stdout: truncateOutput(stdout),
        stderr: truncateOutput(stderr),
        executionTime,
        memoryUsed: 0, // Không đo được chính xác nếu không dùng Docker/Cgroups
        status
      });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      resolve({
        exitCode: 1,
        stdout: '',
        stderr: err.message,
        executionTime: 0,
        memoryUsed: 0,
        status: 'runtime_error'
      });
    });
  });
}

// Hàm giữ nguyên logic cũ để tương thích
export async function executeWithTestCases(
  language: string,
  sourceCode: string,
  testCases: Array<{ input: string; expectedOutput: string; score: number; testCaseId: number; isSample: boolean }>,
  timeLimit: number,
  memoryLimit: number
) {
  // Giữ nguyên logic lặp qua test cases, chỉ gọi executeInDocker (đã sửa) ở trên
  const results: any[] = [];
  let totalPassed = 0;
  let totalScore = 0;
  let maxExecutionTime = 0;
  let maxMemoryUsed = 0;

  for (const testCase of testCases) {
    const result = await executeInDocker({
      language,
      sourceCode,
      input: testCase.input,
      timeLimit,
      memoryLimit,
      dockerImage: '', // Ignored
      compileCommand: '', // Ignored
      runCommand: '', // Ignored
      fileExtension: '' // Ignored
    });

    const passed = result.status === 'success' && compareOutputs(result.stdout, testCase.expectedOutput);
    const score = passed ? testCase.score : 0;

    if (passed) {
      totalPassed++;
      totalScore += testCase.score;
    }

    maxExecutionTime = Math.max(maxExecutionTime, result.executionTime);
    maxMemoryUsed = Math.max(maxMemoryUsed, result.memoryUsed);

    results.push({
      testCaseId: testCase.testCaseId,
      passed,
      executionTime: result.executionTime,
      memoryUsed: result.memoryUsed,
      stdout: result.stdout,
      stderr: result.stderr,
      status: result.status,
      score,
      isSample: testCase.isSample,
    });

    if (result.status === 'compile_error') {
      // Skip remaining if compile error
      for (let i = results.length; i < testCases.length; i++) {
         results.push({ testCaseId: testCases[i].testCaseId, passed: false, executionTime: 0, memoryUsed: 0, stdout: '', stderr: result.stderr, status: 'compile_error', score: 0, isSample: testCases[i].isSample });
      }
      break;
    }
  }

  return { results, totalPassed, totalScore, maxExecutionTime, maxMemoryUsed };
}

// Bỏ qua check docker vì ta không dùng docker run nữa
export async function checkDockerAvailable(): Promise<boolean> {
  return true; 
}

export async function pullDockerImages(): Promise<void> {
  console.log('Skipping docker pull (Direct execution mode)');
}