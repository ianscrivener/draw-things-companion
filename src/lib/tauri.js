/**
 * Tauri API helpers for DrawThings Companion
 *
 * This module provides wrapper functions for Tauri plugins:
 * - Shell commands (bash, jq, mv, ls, cp, mkdir, xz, zip, rm, openssl, shasum)
 * - File system operations (read, write, remove, etc.)
 * - SQLite database operations
 */

import { invoke } from '@tauri-apps/api/core';
import { Command } from '@tauri-apps/plugin-shell';
import * as fs from '@tauri-apps/plugin-fs';

// ============================================================================
// SHELL COMMANDS
// ============================================================================

/**
 * Execute a bash command
 * @param {string[]} args - Command arguments
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export async function executeBash(args) {
  const command = Command.create('bash', args);
  const output = await command.execute();
  return output;
}

/**
 * Execute jq for JSON processing
 * @param {string[]} args - jq arguments
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export async function executeJq(args) {
  const command = Command.create('jq', args);
  const output = await command.execute();
  return output;
}

/**
 * Move files or directories
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
export async function moveFile(source, destination) {
  const command = Command.create('mv', [source, destination]);
  return await command.execute();
}

/**
 * List directory contents
 * @param {string[]} args - ls arguments (e.g., ['-la', '/path'])
 */
export async function listDirectory(args) {
  const command = Command.create('ls', args);
  const output = await command.execute();
  return output;
}

/**
 * Copy files or directories
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 * @param {boolean} recursive - Copy recursively
 */
export async function copyFile(source, destination, recursive = false) {
  const args = recursive ? ['-r', source, destination] : [source, destination];
  const command = Command.create('cp', args);
  return await command.execute();
}

/**
 * Create directory
 * @param {string} path - Directory path
 * @param {boolean} createParents - Create parent directories if needed
 */
export async function makeDirectory(path, createParents = true) {
  const args = createParents ? ['-p', path] : [path];
  const command = Command.create('mkdir', args);
  return await command.execute();
}

/**
 * Compress with xz
 * @param {string[]} args - xz arguments
 */
export async function compressXz(args) {
  const command = Command.create('xz', args);
  return await command.execute();
}

/**
 * Create zip archive
 * @param {string[]} args - zip arguments
 */
export async function createZip(args) {
  const command = Command.create('zip', args);
  return await command.execute();
}

/**
 * Remove files or directories
 * @param {string} path - Path to remove
 * @param {boolean} recursive - Remove recursively
 * @param {boolean} force - Force removal
 */
export async function removeFile(path, recursive = false, force = false) {
  let args = [];
  if (recursive) args.push('-r');
  if (force) args.push('-f');
  args.push(path);

  const command = Command.create('rm', args);
  return await command.execute();
}

/**
 * Execute openssl command
 * @param {string[]} args - openssl arguments (e.g., ['dgst', '-sha256', 'file.txt'])
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export async function executeOpenssl(args) {
  const command = Command.create('openssl', args);
  return await command.execute();
}

/**
 * Calculate file checksum using shasum
 * @param {string} filePath - Path to file
 * @param {string} algorithm - Hash algorithm (1, 256, 384, 512) default is 256
 * @returns {Promise<{stdout: string, stderr: string, code: number}>}
 */
export async function calculateShasum(filePath, algorithm = '256') {
  const command = Command.create('shasum', [`-a`, algorithm, filePath]);
  return await command.execute();
}

/**
 * Calculate SHA256 checksum of a file
 * @param {string} filePath - Path to file
 * @returns {Promise<string>} The SHA256 hash
 */
export async function getFileSha256(filePath) {
  const result = await calculateShasum(filePath, '256');
  if (result.code === 0) {
    // shasum output format: "hash  filename"
    return result.stdout.split(/\s+/)[0];
  }
  throw new Error(`Failed to calculate SHA256: ${result.stderr}`);
}

// ============================================================================
// FILE SYSTEM OPERATIONS (using Tauri FS plugin)
// ============================================================================

/**
 * Read file contents as text
 * @param {string} path - File path
 * @returns {Promise<string>}
 */
export async function readTextFile(path) {
  return await fs.readTextFile(path);
}

/**
 * Write text to file
 * @param {string} path - File path
 * @param {string} contents - File contents
 */
export async function writeTextFile(path, contents) {
  return await fs.writeTextFile(path, contents);
}

/**
 * Read file contents as binary
 * @param {string} path - File path
 * @returns {Promise<Uint8Array>}
 */
export async function readBinaryFile(path) {
  return await fs.readFile(path);
}

/**
 * Write binary data to file
 * @param {string} path - File path
 * @param {Uint8Array} contents - Binary contents
 */
export async function writeBinaryFile(path, contents) {
  return await fs.writeFile(path, contents);
}

/**
 * Check if file/directory exists
 * @param {string} path - Path to check
 * @returns {Promise<boolean>}
 */
export async function exists(path) {
  return await fs.exists(path);
}

/**
 * Create directory (using FS plugin)
 * @param {string} path - Directory path
 * @param {object} options - Options (recursive, etc.)
 */
export async function createDir(path, options = { recursive: true }) {
  return await fs.mkdir(path, options);
}

/**
 * Read directory contents
 * @param {string} path - Directory path
 * @returns {Promise<Array>}
 */
export async function readDir(path) {
  return await fs.readDir(path);
}

/**
 * Remove file (using FS plugin)
 * @param {string} path - File path
 */
export async function remove(path) {
  return await fs.remove(path);
}

/**
 * Rename/move file
 * @param {string} oldPath - Old path
 * @param {string} newPath - New path
 */
export async function rename(oldPath, newPath) {
  return await fs.rename(oldPath, newPath);
}

/**
 * Copy file (using FS plugin)
 * @param {string} source - Source path
 * @param {string} destination - Destination path
 */
export async function copy(source, destination) {
  return await fs.copyFile(source, destination);
}

// ============================================================================
// SQLITE DATABASE OPERATIONS
// ============================================================================

/**
 * Load SQLite database
 * @param {string} path - Database file path
 * @returns {Promise<Database>} Database instance
 */
export async function loadDatabase(path) {
  const Database = (await import('@tauri-apps/plugin-sql')).default;
  return await Database.load(`sqlite:${path}`);
}

/**
 * Execute SQL query
 * @param {Database} db - Database instance
 * @param {string} query - SQL query
 * @param {Array} params - Query parameters
 * @returns {Promise<Array>}
 */
export async function executeQuery(db, query, params = []) {
  return await db.select(query, params);
}

/**
 * Execute SQL statement (INSERT, UPDATE, DELETE)
 * @param {Database} db - Database instance
 * @param {string} statement - SQL statement
 * @param {Array} params - Statement parameters
 */
export async function executeStatement(db, statement, params = []) {
  return await db.execute(statement, params);
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get DrawThings application directory path
 * This is typically ~/Library/Containers/com.liuliu.draw-things/Data/Documents
 * or similar depending on the platform
 */
export async function getDrawThingsPath() {
  // This is a placeholder - implement platform-specific path detection
  const homeDir = await invoke('plugin:path|resolve', {
    directory: 'Home'
  });

  // macOS path
  return `${homeDir}/Library/Containers/com.liuliu.draw-things/Data/Documents`;
}

/**
 * Scan for model files in DrawThings directory
 * @param {string} modelType - Type of model (models, loras, controlnets, etc.)
 * @returns {Promise<Array>}
 */
export async function scanModelFiles(modelType) {
  const drawThingsPath = await getDrawThingsPath();
  const modelPath = `${drawThingsPath}/${modelType}`;

  if (await exists(modelPath)) {
    const entries = await readDir(modelPath);
    return entries.filter(entry =>
      entry.name.endsWith('.ckpt') ||
      entry.name.endsWith('.safetensors') ||
      entry.name.endsWith('.pt')
    );
  }

  return [];
}
