import fs from "fs";
import path from "path";

const imgBuf = fs.readFileSync("./public/university-logo.png");
const b64 = imgBuf.toString("base64");

const fileContent = `// Base64 del logotipo oficial de la Corporación Universitaria Latinoamericana (CUL)
export const UNIVERSITY_LOGO_BASE64 = "${b64}";

export function getUniversityLogoUint8Array(): Uint8Array {
  const binaryString = atob(UNIVERSITY_LOGO_BASE64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}
`;

fs.writeFileSync("./src/lib/university-logo.ts", fileContent);
console.log("Created src/lib/university-logo.ts successfully!");
