import * as fs from 'fs';
import * as path from 'path';

export class OutputManager {
  /**
   * Write output to stdout
   */
  static writeToStdout(content: string): void {
    console.log(content);
  }

  /**
   * Write output to file
   */
  static writeToFile(filePath: string, content: string): void {
    try {
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✓ Output written to: ${filePath}`);
    } catch (error) {
      throw new Error(`Failed to write to file ${filePath}: ${error}`);
    }
  }

  /**
   * Resolve output path
   */
  static resolvePath(filePath: string): string {
    if (path.isAbsolute(filePath)) {
      return filePath;
    }
    return path.resolve(process.cwd(), filePath);
  }

  /**
   * Check if path is writable
   */
  static isWritable(filePath: string): boolean {
    try {
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      return true;
    } catch {
      return false;
    }
  }
}
