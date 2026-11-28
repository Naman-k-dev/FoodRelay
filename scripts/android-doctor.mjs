import { execSync } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function run(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: ["pipe", "pipe", "ignore"] }).trim();
  } catch {
    return null;
  }
}

console.log("\n=======================================================");
console.log("   FOODRELAY AI — ANDROID DEVELOPMENT DOCTOR");
console.log("=======================================================\n");

// 1. Environment & Tools
const nodeVer = process.version;
const adbPath = run("which adb");
const adbVer = adbPath ? run("adb version | head -n 1") : null;
const javaHome = process.env.JAVA_HOME || "/opt/homebrew/opt/openjdk@21";
const javaVer = run(`JAVA_HOME="${javaHome}" "${javaHome}/bin/java" -version 2>&1 | head -n 1`);
const sdkHome = process.env.ANDROID_HOME || `${process.env.HOME}/Library/Android/sdk`;
const sdkPlatform34 = existsSync(resolve(sdkHome, "platforms/android-34"));
const sdkBuildTools35 = existsSync(resolve(sdkHome, "build-tools/35.0.0"));

console.log("1. Toolchain Status:");
console.log(`   Node.js:          ${nodeVer}  [OK]`);
console.log(`   Java Runtime:     ${javaVer || "Missing"} (${javaHome})`);
console.log(`   ADB Executable:   ${adbPath || "Missing"} (${adbVer || "N/A"})`);
console.log(`   Android SDK Root: ${sdkHome} [${existsSync(sdkHome) ? "Found" : "Missing"}]`);
console.log(`   Platform 34:      ${sdkPlatform34 ? "Installed [OK]" : "Missing"}`);
console.log(`   Build-Tools 35:   ${sdkBuildTools35 ? "Installed [OK]" : "Missing"}`);

// 2. Physical Devices
console.log("\n2. Physical Device Connection:");
const rawDevices = run("adb devices -l");
if (rawDevices) {
  const lines = rawDevices.split("\n").filter((l) => l.trim() && !l.startsWith("List of"));
  if (lines.length > 0) {
    lines.forEach((line) => {
      const isAuth = line.includes("device ");
      console.log(`   Device: ${line} [${isAuth ? "AUTHORIZED" : "UNAUTHORIZED"}]`);
    });
  } else {
    console.log("   No USB devices connected. Please connect your Android phone via USB.");
  }
} else {
  console.log("   ADB server not responding.");
}

// 3. Port Forwarding & Services
console.log("\n3. Network & Services:");
const reverseList = run("adb reverse --list");
console.log(`   ADB Reverse:      ${reverseList || "None configured"}`);

const webStatus = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:3000");
console.log(`   Next.js (3000):   HTTP ${webStatus || "Offline"}`);

const graftStatus = run("curl -s -o /dev/null -w '%{http_code}' http://localhost:8088/mcp");
console.log(`   Graftcode (8088): HTTP ${graftStatus || "Offline"}`);

// 4. APK Status
const apkPath = resolve(process.cwd(), "android/app/build/outputs/apk/debug/app-debug.apk");
console.log(`\n4. APK Status:       ${existsSync(apkPath) ? "Generated [OK] (" + apkPath + ")" : "Not compiled yet"}`);

console.log("\n=======================================================\n");
