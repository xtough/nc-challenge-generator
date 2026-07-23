import { Challenge } from './types';

export abstract class OutputFormatter {
  abstract format(challenge: Challenge): string;

  protected buildFlatBulletList(challenge: Challenge): string {
    const categoryOrder = ['subject', 'setting', 'medium', 'style', 'mood', 'artist'];
    const lines: string[] = [];

    lines.push(`- ${challenge.mandatoryKeyword} (required)`);
    for (const key of categoryOrder) {
      const items = challenge.categories[key];
      if (items && items.length > 0) {
        lines.push(`- ${items.join(', ')}`);
      }
    }

    const example = [challenge.mandatoryKeyword];
    for (const key of categoryOrder) {
      const items = challenge.categories[key];
      if (items && items.length > 0) example.push(items[0]);
    }

    return lines.join('\n') + '\n\n' + `Example: ${example.join(', ')}`;
  }
}

export class PrettyPrintFormatter extends OutputFormatter {
  format(challenge: Challenge): string {
    const header = [
      `🏗️  BUILD A PROMPT — ${challenge.theme.toUpperCase()} ${challenge.emoji}`,
      '',
      'For your prompt, choose 1 item from each list below. You MAY then add ONLY 3 additional words, PLUS 1 additional artist of your choice. You MAY also use any negative prompt.',
      '• PLEASE USE YOUR PROMPT AS YOUR ENTRY TITLE OR RISK BEING DOWNVOTED •',
      '• PLEASE VOTE FAIRLY •',
      '✅ Change word order, adjust weights, any negative prompt, evolve/inpaint',
      '❌ Presets, Uploads, NSFW, LoRAs, Creative/Clarity Upscaler, Pro models, Prompt Magic',
      '',
    ].join('\n');

    return '\n' + header + this.buildFlatBulletList(challenge) + '\n';
  }
}

export class MarkdownFormatter extends OutputFormatter {
  format(challenge: Challenge): string {
    const header = [
      `# 🏗️ BUILD A PROMPT — ${challenge.theme.toUpperCase()} ${challenge.emoji}`,
      '',
      'For your prompt, choose 1 item from each list below. You MAY then add ONLY 3 additional words, PLUS 1 additional artist of your choice. You MAY also use any negative prompt.',
      '• PLEASE USE YOUR PROMPT AS YOUR ENTRY TITLE OR RISK BEING DOWNVOTED •',
      '• PLEASE VOTE FAIRLY •',
      '✅ Change word order, adjust weights, any negative prompt, evolve/inpaint',
      '❌ Presets, Uploads, NSFW, LoRAs, Creative/Clarity Upscaler, Pro models, Prompt Magic',
      '',
    ].join('\n');

    return header + this.buildFlatBulletList(challenge) + '\n';
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
