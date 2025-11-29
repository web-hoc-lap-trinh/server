/**
 * Docker Sandbox Runner
 * 
 * This module provides isolated code execution using Docker containers.
 * Features:
 * - Network isolation (--network none)
 * - Memory limits
 * - CPU limits
 * - Timeout handling
 * - Secure execution environment
 */

import { exec, spawn, ChildProcess } from 'child_process';
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
  timeLimit: number; // milliseconds
  memoryLimit: number; // MB
  dockerImage: string;
  compileCommand?: string | null;
  runCommand: string;
  fileExtension: string;
}

export interface ExecutionResult {
  exitCode: number;
  stdout: string;
  stderr: string;
  executionTime: number; // milliseconds
  memoryUsed: number; // KB
  status: 'success' | 'timeout' | 'memory_limit' | 'runtime_error' | 'compile_error';
  compilationOutput?: string;
}

// ==========================================
// CONSTANTS
// ==========================================

const DOCKER_WORK_DIR = '/app';
const MAX_OUTPUT_SIZE = 1024 * 1024; // 1MB max output
const CONTAINER_PREFIX = 'judge_';

// Language-specific configurations
export const LANGUAGE_CONFIGS: Record<string, {
  dockerImage: string;
  compileCommand: string | null;
  runCommand: string;
  fileExtension: string;
  sourceFileName: string;
}> = {
  cpp: {
    dockerImage: 'gcc:latest',
    compileCommand: 'g++ -std=c++17 -O2 -o /app/solution /app/solution.cpp 2>&1',
    runCommand: '/app/solution',
    fileExtension: 'cpp',
    sourceFileName: 'solution.cpp',
  },
  c: {
    dockerImage: 'gcc:latest',
    compileCommand: 'gcc -std=c11 -O2 -o /app/solution /app/solution.c 2>&1',
    runCommand: '/app/solution',
    fileExtension: 'c',
    sourceFileName: 'solution.c',
  },
  python: {
    dockerImage: 'python:3.11-slim',
    compileCommand: null,
    runCommand: 'python3 /app/solution.py',
    fileExtension: 'py',
    sourceFileName: 'solution.py',
  },
  javascript: {
    dockerImage: 'node:20-slim',
    compileCommand: null,
    runCommand: 'node /app/solution.js',
    fileExtension: 'js',
    sourceFileName: 'solution.js',
  },
  java: {
    // Use eclipse-temurin instead of openjdk (openjdk:17-slim is deprecated)
    dockerImage: 'eclipse-temurin:17-jdk',
    compileCommand: 'javac /app/Solution.java 2>&1',
    runCommand: 'java -cp /app Solution',
    fileExtension: 'java',
    sourceFileName: 'Solution.java',
  },
};

// ==========================================
// HELPER FUNCTIONS
// ==========================================

/**
 * Create a temporary directory for the submission
 */
async function createTempDir(): Promise<string> {
  const tempDir = path.join(os.tmpdir(), `judge_${uuidv4()}`);
  await fsPromise.mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Clean up temporary directory
 */
async function cleanupTempDir(tempDir: string): Promise<void> {
  try {
    await fsPromise.rm(tempDir, { recursive: true, force: true });
  } catch (error) {
    console.error('Error cleaning up temp directory:', error);
  }
}

/**
 * Normalize output for comparison
 * - Trim leading/trailing whitespace
 * - Normalize line endings to \n
 * - Remove trailing whitespace from each line
 */
export function normalizeOutput(output: string): string {
  return output
    .replace(/\r\n/g, '\n') // Windows -> Unix line endings
    .replace(/\r/g, '\n') // Old Mac -> Unix line endings
    .split('\n')
    .map(line => line.trimEnd()) // Remove trailing whitespace from each line
    .join('\n')
    .trim(); // Remove leading/trailing whitespace
}

/**
 * Compare two outputs for equality
 */
export function compareOutputs(actual: string, expected: string): boolean {
  const normalizedActual = normalizeOutput(actual);
  const normalizedExpected = normalizeOutput(expected);
  const result = normalizedActual === normalizedExpected;
  
  // Debug logging
  if (!result) {
    console.log(`[Compare] Mismatch:`);
    console.log(`  Actual (${normalizedActual.length} chars): "${normalizedActual.substring(0, 100)}"`);
    console.log(`  Expected (${normalizedExpected.length} chars): "${normalizedExpected.substring(0, 100)}"`);
  }
  
  return result;
}

/**
 * Truncate output if too long
 */
function truncateOutput(output: string, maxSize: number = MAX_OUTPUT_SIZE): string {
  if (output.length > maxSize) {
    return output.substring(0, maxSize) + '\n... [output truncated]';
  }
  return output;
}

/**
 * Convert Windows path to Docker-compatible path
 * On Windows with Docker Desktop, paths like C:\Users\... need to be converted to /c/Users/...
 * or use forward slashes
 */
function toDockerPath(windowsPath: string): string {
  if (process.platform !== 'win32') {
    return windowsPath;
  }
  
  // Replace backslashes with forward slashes
  let dockerPath = windowsPath.replace(/\\/g, '/');
  
  // Log for debugging
  console.log(`[Docker] Converting path: ${windowsPath} -> ${dockerPath}`);
  
  return dockerPath;
}

/**
 * Kill a running container
 */
async function killContainer(containerId: string): Promise<void> {
  try {
    await execPromise(`docker kill ${containerId}`);
    await execPromise(`docker rm -f ${containerId}`);
  } catch (error) {
    // Container might already be stopped
  }
}

// ==========================================
// MAIN EXECUTION FUNCTIONS
// ==========================================

/**
 * Execute code inside a Docker container
 */
export async function executeInDocker(config: ExecutionConfig): Promise<ExecutionResult> {
  const tempDir = await createTempDir();
  const containerId = `${CONTAINER_PREFIX}${uuidv4().slice(0, 8)}`;
  
  try {
    const langConfig = LANGUAGE_CONFIGS[config.language];
    if (!langConfig) {
      return {
        exitCode: 1,
        stdout: '',
        stderr: `Unsupported language: ${config.language}`,
        executionTime: 0,
        memoryUsed: 0,
        status: 'compile_error',
      };
    }

    // Write source code to temp file
    const sourceFile = path.join(tempDir, langConfig.sourceFileName);
    await fsPromise.writeFile(sourceFile, config.sourceCode);

    // Write input to temp file
    const inputFile = path.join(tempDir, 'input.txt');
    await fsPromise.writeFile(inputFile, config.input);

    // Compile if needed
    if (langConfig.compileCommand) {
      const compileResult = await compileCode(
        tempDir,
        containerId + '_compile',
        langConfig.dockerImage,
        langConfig.compileCommand,
        config.memoryLimit
      );

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

    // Run the code
    const runResult = await runCode(
      tempDir,
      containerId,
      langConfig.dockerImage,
      langConfig.runCommand,
      config.timeLimit,
      config.memoryLimit
    );

    return runResult;
  } finally {
    // Cleanup
    await killContainer(containerId);
    await killContainer(containerId + '_compile');
    await cleanupTempDir(tempDir);
  }
}

/**
 * Compile code in Docker container
 */
async function compileCode(
  tempDir: string,
  containerId: string,
  dockerImage: string,
  compileCommand: string,
  memoryLimit: number
): Promise<{ exitCode: number; stdout: string; stderr: string }> {
  const dockerPath = toDockerPath(tempDir);
  
  // Use spawn with array args to avoid shell escaping issues on Windows
  const dockerArgs = [
    'run',
    '--name', containerId,
    '--rm',
    '--network', 'none',
    '-m', `${memoryLimit}m`,
    '--cpus', '1',
    '-v', `${dockerPath}:${DOCKER_WORK_DIR}`,
    '-w', DOCKER_WORK_DIR,
    dockerImage,
    'sh', '-c', compileCommand,
  ];

  console.log(`[Docker] Compiling with: docker ${dockerArgs.join(' ')}`);

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';

    const childProcess = spawn('docker', dockerArgs, {
      timeout: 30000,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
    });

    childProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
    });

    childProcess.on('close', (code) => {
      console.log(`[Docker] Compile exit code: ${code}, stderr: ${stderr.substring(0, 200)}`);
      resolve({
        exitCode: code || 0,
        stdout: truncateOutput(stdout),
        stderr: truncateOutput(stderr),
      });
    });

    childProcess.on('error', (error) => {
      resolve({
        exitCode: 1,
        stdout: '',
        stderr: error.message,
      });
    });
  });
}

/**
 * Run code in Docker container with timeout and memory limits
 */
async function runCode(
  tempDir: string,
  containerId: string,
  dockerImage: string,
  runCommand: string,
  timeLimit: number,
  memoryLimit: number
): Promise<ExecutionResult> {
  const startTime = Date.now();
  const dockerPath = toDockerPath(tempDir);
  
  // Convert timeLimit from ms to seconds for timeout command (with buffer)
  const timeLimitSeconds = Math.ceil(timeLimit / 1000) + 1;
  
  // Docker run command with resource limits - use array args for spawn
  const dockerArgs = [
    'run',
    '--name', containerId,
    '--rm',
    '--network', 'none', // No network access
    '-m', `${memoryLimit}m`, // Memory limit
    '--memory-swap', `${memoryLimit}m`, // Disable swap
    '--cpus', '1', // CPU limit
    '--pids-limit', '64', // Limit number of processes
    '--ulimit', 'fsize=10485760:10485760', // 10MB file size limit
    '-v', `${dockerPath}:${DOCKER_WORK_DIR}:ro`, // Read-only mount
    '-w', DOCKER_WORK_DIR,
    '-i', // Keep stdin open
    dockerImage,
    'sh', '-c', `timeout ${timeLimitSeconds}s ${runCommand} < ${DOCKER_WORK_DIR}/input.txt`,
  ];

  return new Promise((resolve) => {
    let stdout = '';
    let stderr = '';
    let isTimeout = false;
    let isMemoryLimit = false;

    const childProcess = spawn('docker', dockerArgs, {
      timeout: (timeLimit + 5000), // Add larger buffer for Docker overhead
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    // Set external timeout as backup (longer than internal timeout)
    const timeout = setTimeout(async () => {
      isTimeout = true;
      await killContainer(containerId);
    }, timeLimit + 3000);

    childProcess.stdout?.on('data', (data: Buffer) => {
      stdout += data.toString();
      if (stdout.length > MAX_OUTPUT_SIZE) {
        stdout = truncateOutput(stdout);
        isTimeout = true;
        killContainer(containerId);
      }
    });

    childProcess.stderr?.on('data', (data: Buffer) => {
      stderr += data.toString();
      // Check for OOM killer
      if (stderr.includes('Killed') || stderr.includes('OOM')) {
        isMemoryLimit = true;
      }
    });

    childProcess.on('close', (code: number | null) => {
      clearTimeout(timeout);
      const totalTime = Date.now() - startTime;
      
      // Estimate actual execution time (subtract Docker overhead, approx 500-1500ms)
      // But cap it to at least show some execution time
      const dockerOverhead = Math.min(1500, totalTime * 0.3);
      const executionTime = Math.max(1, totalTime - dockerOverhead);

      // Determine status - ORDER MATTERS!
      let status: ExecutionResult['status'] = 'success';
      
      // 1. First check for memory limit (OOM killer uses code 137)
      if (isMemoryLimit || code === 137) {
        status = 'memory_limit';
      }
      // 2. Check for timeout - exit code 124 is from timeout command
      else if (isTimeout || code === 124) {
        status = 'timeout';
      }
      // 3. Check for runtime error (non-zero exit code)
      else if (code !== 0 && code !== null) {
        status = 'runtime_error';
      }

      resolve({
        exitCode: code || 0,
        stdout: truncateOutput(stdout),
        stderr: truncateOutput(stderr),
        executionTime: Math.round(executionTime),
        memoryUsed: 0, // Docker stats would need separate call
        status,
      });
    });

    childProcess.on('error', (error: Error) => {
      clearTimeout(timeout);
      const executionTime = Date.now() - startTime;

      resolve({
        exitCode: 1,
        stdout: '',
        stderr: error.message,
        executionTime,
        memoryUsed: 0,
        status: 'runtime_error',
      });
    });
  });
}

/**
 * Execute code with multiple test cases
 */
export async function executeWithTestCases(
  language: string,
  sourceCode: string,
  testCases: Array<{ input: string; expectedOutput: string; score: number; testCaseId: number; isSample: boolean }>,
  timeLimit: number,
  memoryLimit: number
): Promise<{
  results: Array<{
    testCaseId: number;
    passed: boolean;
    executionTime: number;
    memoryUsed: number;
    stdout: string;
    stderr: string;
    status: ExecutionResult['status'];
    score: number;
    isSample: boolean;
  }>;
  totalPassed: number;
  totalScore: number;
  maxExecutionTime: number;
  maxMemoryUsed: number;
}> {
  const langConfig = LANGUAGE_CONFIGS[language];
  if (!langConfig) {
    throw new Error(`Unsupported language: ${language}`);
  }

  const results: Array<{
    testCaseId: number;
    passed: boolean;
    executionTime: number;
    memoryUsed: number;
    stdout: string;
    stderr: string;
    status: ExecutionResult['status'];
    score: number;
    isSample: boolean;
  }> = [];

  let totalPassed = 0;
  let totalScore = 0;
  let maxExecutionTime = 0;
  let maxMemoryUsed = 0;

  // Execute each test case sequentially
  for (const testCase of testCases) {
    const result = await executeInDocker({
      language,
      sourceCode,
      input: testCase.input,
      timeLimit,
      memoryLimit,
      dockerImage: langConfig.dockerImage,
      compileCommand: langConfig.compileCommand,
      runCommand: langConfig.runCommand,
      fileExtension: langConfig.fileExtension,
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

    // If compilation failed, skip remaining test cases
    if (result.status === 'compile_error') {
      // Mark remaining test cases as failed due to compile error
      for (let i = results.length; i < testCases.length; i++) {
        results.push({
          testCaseId: testCases[i].testCaseId,
          passed: false,
          executionTime: 0,
          memoryUsed: 0,
          stdout: '',
          stderr: result.stderr,
          status: 'compile_error',
          score: 0,
          isSample: testCases[i].isSample,
        });
      }
      break;
    }
  }

  return {
    results,
    totalPassed,
    totalScore,
    maxExecutionTime,
    maxMemoryUsed,
  };
}

/**
 * Check if Docker is available
 */
export async function checkDockerAvailable(): Promise<boolean> {
  try {
    await execPromise('docker --version');
    return true;
  } catch {
    return false;
  }
}

/**
 * Pull required Docker images
 */
export async function pullDockerImages(): Promise<void> {
  const images = Object.values(LANGUAGE_CONFIGS).map(config => config.dockerImage);
  const uniqueImages = [...new Set(images)];

  for (const image of uniqueImages) {
    try {
      console.log(`Pulling Docker image: ${image}`);
      await execPromise(`docker pull ${image}`);
      console.log(`Successfully pulled: ${image}`);
    } catch (error) {
      console.error(`Failed to pull ${image}:`, error);
    }
  }
}
