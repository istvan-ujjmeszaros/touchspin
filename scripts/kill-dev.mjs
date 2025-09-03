#!/usr/bin/env node
import { exec } from 'child_process';
import { promisify } from 'util';

(async () => {
const execAsync = promisify(exec);
const port = 8866;

console.log(`Looking for processes using port ${port}...`);

try {
  // Find processes using port 8866
  const { stdout } = await execAsync(`lsof -ti:${port}`, { encoding: 'utf8' });

  if (!stdout.trim()) {
    console.log(`No processes found using port ${port}`);
    process.exit(0);
  }

  // Kill all processes using the port
  const pids = stdout.trim().split('\n').filter(pid => pid);
  console.log(`Found ${pids.length} process(es) using port ${port}: ${pids.join(', ')}`);

  for (const pid of pids) {
    try {
      await execAsync(`kill ${pid}`);
      console.log(`Killed process ${pid}`);
    } catch (error) {
      console.log(`Failed to kill process ${pid}: ${error.message}`);
    }
  }

  console.log('Development server stopped');

} catch (error) {
  if (error.code === 1 && error.stderr === '') {
    // lsof returns exit code 1 when no processes are found
    console.log(`No processes found using port ${port}`);
  } else {
    console.error('Error stopping development server:', error.message);
    process.exit(1);
  }
}
})();