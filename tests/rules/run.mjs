// Firestore · Storage 에뮬레이터를 띄워 보안 규칙 테스트를 돌림 (npm run test:rules)
import { spawnSync } from 'node:child_process';
import path from 'node:path';

// Windows의 Oracle javapath\java.exe는 진짜 java.exe를 자식으로 다시 띄우는 중계 프로그램이에요.
// firebase-tools는 테스트가 끝나면 중계 프로그램만 끄므로 진짜 java.exe(에뮬레이터)가 남아요.
// java가 알려 주는 java.home의 bin을 PATH 맨 앞에 둬서 진짜 java.exe를 바로 띄우게 해요.
const getJavaHome = () => {
  const { stderr } = spawnSync('java', ['-XshowSettings:properties', '-version'], {
    encoding: 'utf8',
  });
  return stderr?.match(/java\.home = (.+)/)?.[1].trim();
};

const env = { ...process.env };
const javaHome = getJavaHome();
if (javaHome) {
  // Windows에서는 환경 변수 이름이 Path일 수 있음
  const pathKey = Object.keys(env).find((key) => key.toUpperCase() === 'PATH') ?? 'PATH';
  env[pathKey] = path.join(javaHome, 'bin') + path.delimiter + env[pathKey];
}

const { status } = spawnSync(
  'firebase emulators:exec --only firestore,storage --project demo-alcoholic "node --test tests/rules/*.test.mjs"',
  { env, shell: true, stdio: 'inherit' }
);
process.exit(status ?? 1);
