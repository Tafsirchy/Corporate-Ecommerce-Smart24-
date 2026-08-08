const { execSync } = require('child_process');

const statusOutput = execSync('git status --porcelain').toString().trim();
if (!statusOutput) {
  console.log('No changes to commit.');
  process.exit(0);
}

const lines = statusOutput.split('\n');
let count = 0;

for (const line of lines) {
  if (!line.trim()) continue;
  
  const action = line.substring(0, 2).trim();
  const file = line.substring(3).trim();

  const segments = file.split('/');
  const fileName = file.endsWith('/') ? segments[segments.length - 2] : segments[segments.length - 1];
  
  let msg = `refactor: update ${fileName} with audit remediations`;

  if (action === 'D') {
    msg = `chore: remove unused or deprecated file ${fileName}`;
  } else if (action === '??' || action === 'A') {
    msg = `feat: add new module or components in ${fileName}`;
  } else if (file.includes('controller.ts')) {
    msg = `refactor(api): secure ${fileName} and extract userId safely`;
  } else if (file.includes('service.ts')) {
    msg = `refactor(service): add pagination and transactional safety to ${fileName}`;
  } else if (file.includes('page.tsx')) {
    msg = `refactor(ui): update ${fileName} to support backend pagination`;
  } else if (file.includes('schema.prisma')) {
    msg = `chore(db): update ${fileName} with onDelete constraints`;
  }

  console.log(`[${count + 1}/${lines.length}] Committing ${file}...`);
  try {
    execSync(`git add "${file}"`);
    execSync(`git commit -m "${msg}"`);
    count++;
  } catch (err) {
    console.error(`Failed to commit ${file}:`, err.message);
  }
}

console.log(`Successfully created ${count} commits.`);
try {
  execSync('git push origin HEAD');
  console.log('Successfully pushed to remote.');
} catch (err) {
  console.log('Could not push to remote. You might need to set up upstream branch.');
}
