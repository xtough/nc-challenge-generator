import { Challenge } from './types';

export abstract class OutputFormatter {
  abstract format(challenge: Challenge): string;

  protected formatCategoryItems(items: string[]): string {
    return items.join('\n');
  }
}

export class PrettyPrintFormatter extends OutputFormatter {
  format(challenge: Challenge): string {
    let output = '\n';
    output += '═'.repeat(60) + '\n';
    output += `🏗️  BUILD A PROMPT 🏗️  ${challenge.theme} ${challenge.emoji}\n`;
    output += '═'.repeat(60) + '\n\n';

    output += `📌 Mandatory Keyword: ${challenge.mandatoryKeyword}\n\n`;

    output += '✨ Pick 1 item from each category below:\n\n';

    for (const [categoryName, items] of Object.entries(challenge.categories)) {
      output += `📍 ${categoryName.toUpperCase()}:\n`;
      items.forEach((item, index) => {
        output += `   ${index + 1}. ${item}\n`;
      });
      output += '\n';
    }

    output += '═'.repeat(60) + '\n\n';

    return output;
  }
}

export class MarkdownFormatter extends OutputFormatter {
  format(challenge: Challenge): string {
    let output = `# 🏗️ BUILD A PROMPT 🏗️ ${challenge.theme} ${challenge.emoji}\n\n`;

    output += `**Mandatory Keyword:** ${challenge.mandatoryKeyword}\n\n`;

    output += '## Instructions\n';
    output += 'Pick **1 item** from each category below to build your prompt.\n\n';

    for (const [categoryName, items] of Object.entries(challenge.categories)) {
      output += `### ${categoryName.charAt(0).toUpperCase() + categoryName.slice(1)}\n`;
      output += items.map((item) => `- ${item}`).join('\n');
      output += '\n\n';
    }

    output += '---\n';
    output += `*Generated on ${new Date(challenge.generatedAt).toLocaleString()}*\n`;

    return output;
  }
}

export class JsonFormatter extends OutputFormatter {
  format(challenge: Challenge): string {
    return JSON.stringify(challenge, null, 2);
  }
}

export class OutputFormatterFactory {
  static create(format: 'pretty-print' | 'markdown' | 'json'): OutputFormatter {
    switch (format) {
      case 'markdown':
        return new MarkdownFormatter();
      case 'json':
        return new JsonFormatter();
      case 'pretty-print':
        return new PrettyPrintFormatter();
      default:
        throw new Error(`Unknown output format: ${format}. Valid formats: pretty-print, markdown, json`);
    }
  }
}
