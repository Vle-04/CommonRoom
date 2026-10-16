import { spawn } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
const env = {
  ...process.env,
  NODE_ENV: 'development',
  DATABASE_URL: process.env.DATABASE_URL ?? 'postgresql://postgres:postgres@localhost:5432/commonroom?schema=public',
  JWT_SECRET: process.env.JWT_SECRET ?? 'local-development-only-secret-change-before-deploy-2026',
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN ?? 'http://localhost:5173',
  PORT: process.env.PORT ?? '4000',
}

const children = ['dev:server', 'dev:client'].map(script => {
  const child = spawn(npm, ['run', script], { stdio: 'inherit', env, shell: process.platform === 'win32' })
  child.on('error', error => { console.error(`${script} failed to start:`, error); stop(1) })
  child.on('exit', code => { if (!stopping) stop(code ?? 1) })
  return child
})
let stopping = false
function stop(code = 0) {
  if (stopping) return
  stopping = true
  for (const child of children) if (!child.killed) child.kill('SIGTERM')
  process.exitCode = code
}
process.on('SIGINT', () => stop(0))
process.on('SIGTERM', () => stop(0))
