'use client';

import { useState } from 'react';
import {
  executeBash,
  listDirectory,
  readTextFile,
  writeTextFile,
  exists,
  readDir,
  scanModelFiles
} from '@/lib/tauri';

/**
 * Test component to verify Tauri backend integration
 * This component demonstrates:
 * - Shell command execution
 * - File system operations
 * - Model scanning
 */
export default function TauriTest() {
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);

  const runTest = async (testName, testFn) => {
    setLoading(true);
    setOutput(`Running ${testName}...\n`);
    try {
      const result = await testFn();
      setOutput(prev => prev + `✓ ${testName} succeeded:\n${JSON.stringify(result, null, 2)}\n\n`);
    } catch (error) {
      setOutput(prev => prev + `✗ ${testName} failed:\n${error.message}\n\n`);
    } finally {
      setLoading(false);
    }
  };

  const tests = {
    'Test Shell - Echo': async () => {
      const result = await executeBash(['-c', 'echo "Hello from Tauri!"']);
      return { stdout: result.stdout, code: result.code };
    },

    'Test Shell - List Current Dir': async () => {
      const result = await listDirectory(['-la']);
      return { stdout: result.stdout.substring(0, 200) + '...', code: result.code };
    },

    'Test FS - Check Home Exists': async () => {
      const homeExists = await exists(process.env.HOME || '/Users');
      return { exists: homeExists };
    },

    'Test FS - Read Directory': async () => {
      const entries = await readDir('/Users');
      return { count: entries.length, first5: entries.slice(0, 5).map(e => e.name) };
    },

    'Test Model Scan': async () => {
      // This will fail if DrawThings isn't installed, but demonstrates the API
      try {
        const models = await scanModelFiles('models');
        return { found: models.length, models: models.slice(0, 3) };
      } catch (error) {
        return { error: 'DrawThings not found (expected)', message: error.message };
      }
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '16px' }}>
        Tauri Backend Integration Tests
      </h2>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {Object.entries(tests).map(([name, testFn]) => (
          <button
            key={name}
            onClick={() => runTest(name, testFn)}
            disabled={loading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#0066cc',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.5 : 1
            }}
          >
            {name}
          </button>
        ))}
      </div>

      <div
        style={{
          backgroundColor: '#1e1e1e',
          color: '#d4d4d4',
          padding: '16px',
          borderRadius: '4px',
          fontFamily: 'monospace',
          fontSize: '12px',
          whiteSpace: 'pre-wrap',
          minHeight: '200px',
          maxHeight: '400px',
          overflow: 'auto'
        }}
      >
        {output || 'Click a test button to run tests...'}
      </div>

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p><strong>Available Commands:</strong></p>
        <ul style={{ marginTop: '8px', marginLeft: '20px' }}>
          <li>Shell: bash, jq, mv, ls, cp, mkdir, xz, zip, rm</li>
          <li>File System: read, write, remove, mkdir, rename, copy, exists, readDir</li>
          <li>SQLite: load, select, execute</li>
        </ul>
      </div>
    </div>
  );
}
