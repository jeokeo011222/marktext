// Text copied from chat UIs, JSON payloads or log output is often escaped one
// time too many: the delimiters arrive as \\( ... \\) / \\[ ... \\] and the math
// body keeps escaped underscores, so the editor would show the raw source
// instead of math. Rewrite those payloads to the $ / $$ delimiters it parses.

const ESCAPED_BLOCK = /\\\\\[([\s\S]*?)\\\\\]/g;
const ESCAPED_INLINE = /\\\\\(([\s\S]*?)\\\\\)/g;
// A body escaped together with its delimiters always carries one of these.
const ESCAPE_HINT = /\\_|\\\\[a-z]/i;
const INLINE_CODE = /`[^`\n]*`/g;
const FENCE = /^\s*(?:```|~~~)/;
// Escaped literal brackets in prose, e.g. \\(注\\) documenting Markdown itself,
// must not be promoted to math.
const CJK = /[\u3000-\u303F\u4E00-\u9FFF\uFF00-\uFFEF]/;
// Private-use sentinels keep masked code spans out of reach of the matchers.
const MASK_OPEN = '\uE000';
const MASK_CLOSE = '\uE001';
const MASK_RESTORE = /\uE000(\d+)\uE001/g;

export interface INormalizeTexResult {
    text: string;
    /** Number of math spans rewritten; 0 means the payload was left untouched. */
    converted: number;
}

function unescapeTex(tex: string): string {
    return tex
        .replace(/\\\\/g, '\\')
        .replace(/\\_/g, '_')
        .replace(/\\&/g, '&')
        .replace(/\\%/g, '%')
        .replace(/\\#/g, '#');
}

// Only invert the escaping when the body shows it actually happened; a plain
// `\\` line break inside an unescaped matrix must survive untouched.
function fixBody(body: string): string {
    const tex = body.trim();

    return ESCAPE_HINT.test(tex) ? unescapeTex(tex) : tex;
}

function isMathBody(body: string): boolean {
    const tex = body.trim();

    return tex !== '' && !CJK.test(tex);
}

export function normalizeEscapedTex(source: string): INormalizeTexResult {
    // Cheap guard: without a doubled backslash there is nothing to rewrite.
    if (!source.includes('\\\\'))
        return { text: source, converted: 0 };

    let converted = 0;
    const normalizedSource = source.replace(/\r\n?/g, '\n');

    const convertInline = (line: string): string => {
        const codes: string[] = [];
        const masked = line.replace(INLINE_CODE, (code) => {
            codes.push(code);

            return `${MASK_OPEN}${codes.length - 1}${MASK_CLOSE}`;
        });
        const replaced = masked.replace(ESCAPED_INLINE, (match, body: string) => {
            if (!isMathBody(body))
                return match;

            converted += 1;

            return `$${fixBody(body)}$`;
        });

        return replaced.replace(MASK_RESTORE, (_, index: string) => codes[Number(index)]);
    };

    const convertSegment = (segment: string[]): string[] => {
        if (segment.length === 0)
            return [];

        // Block delimiters may wrap several lines, so match them before splitting.
        const withBlocks = segment.join('\n').replace(ESCAPED_BLOCK, (match, body: string) => {
            if (!isMathBody(body))
                return match;

            converted += 1;

            return `$$\n${fixBody(body)}\n$$`;
        });

        return withBlocks.split('\n').map(line => convertInline(line));
    };

    const lines: string[] = [];
    let segment: string[] = [];
    let inFence = false;

    for (const line of normalizedSource.split('\n')) {
        if (FENCE.test(line)) {
            lines.push(...convertSegment(segment));
            segment = [];
            lines.push(line);
            inFence = !inFence;
        }
        else if (inFence) {
            lines.push(line);
        }
        else {
            segment.push(line);
        }
    }

    lines.push(...convertSegment(segment));

    return { text: lines.join('\n'), converted };
}
