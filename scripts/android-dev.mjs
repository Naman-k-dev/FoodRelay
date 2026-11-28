import { execSync, spawn } from "node:child_process";
import { existsSync } from "node:fs";
import { resolve } from "node:path";

function exec(cmd) {
  try {
    return execSync(cmd, { encoding: "utf8" }).trim();
  } catch (err) {
    return null;
  }
}

console.log("Starting FoodRelay Android Development Environment...");

// 1. Check Device
const devices = exec("adb devices -l");
if (!devices || !devices.includes("device ")) {
  console.error("ERROR: No authorized Android device connected via USB.");
  process.exit(1);
}

// 2. Configure USB reverse proxy
console.log("Configuring ADB reverse port forwarding (tcp:3000 -> tcp:3000)...");
exec("adb reverse tcp:3000 tcp:3000");

// 3. Launch App
console.log("Launching FoodRelay AI on connected Android device...");
exec("adb shell am start -n com.impactforge.foodrelay/com.impactforge.foodrelay.MainActivity");

console.log("FoodRelay AI is active on your phone!");
