import { describe, expect, it } from 'vitest';
import { normalizeEscapedTex } from '../normalizeTexDelimiters';

// Chat UIs and JSON payloads hand back TeX that was escaped together with its
// delimiters, which the editor would paste as literal text instead of math.
describe('normalizeEscapedTex', () => {
    it('rewrites escaped inline delimiters and unescapes the body', () => {
        const { text, converted } = normalizeEscapedTex(String.raw`模型为 \\(f\_\theta\\)，任务 \\(T\\)。`);

        expect(text).toBe(String.raw`模型为 $f_\theta$，任务 $T$。`);
        expect(converted).toBe(2);
    });

    it('rewrites escaped block delimiters onto their own lines', () => {
        const body = String.raw`D_T(H)= \mathbb E_{X} \left[ \ell\big(f_\theta(X)\big) \right]`;
        const { text, converted } = normalizeEscapedTex(
            String.raw`\\[ D_T(H)= \mathbb E\_{X} \left[ \ell\big(f\_\theta(X)\big) \right] \\]`,
        );

        expect(text).toBe(`$$\n${body}\n$$`);
        expect(converted).toBe(1);
    });

    it('keeps block delimiters that wrap several lines', () => {
        const { text } = normalizeEscapedTex([
            String.raw`\\[ \begin{aligned}`,
            String.raw`x &= 1 \\`,
            String.raw`y &= 2`,
            String.raw`\end{aligned} \\]`,
        ].join('\n'));

        expect(text).toBe([
            '$$',
            String.raw`\begin{aligned}`,
            String.raw`x &= 1 \\`,
            String.raw`y &= 2`,
            String.raw`\end{aligned}`,
            '$$',
        ].join('\n'));
    });

    it('leaves fenced code and inline code untouched', () => {
        const escapedTex = String.raw`\\(f\_\theta\\)`;
        const codeLine = `行内代码 \`${escapedTex}\` 保持原样。`;
        const source = [
            String.raw`正文 \\(a^2+b^2\\)。`,
            '```',
            `代码 ${escapedTex} 保持原样`,
            '```',
            codeLine,
        ].join('\n');

        const { text, converted } = normalizeEscapedTex(source);

        expect(converted).toBe(1);
        expect(text).toBe([
            String.raw`正文 $a^2+b^2$。`,
            '```',
            `代码 ${escapedTex} 保持原样`,
            '```',
            codeLine,
        ].join('\n'));
    });

    it('does not touch Markdown that is already well formed', () => {
        const source = String.raw`已有 $f_\theta$ 与 \begin{aligned} x &= 1 \\ y &= 2 \end{aligned}`;
        const { text, converted } = normalizeEscapedTex(source);

        expect(converted).toBe(0);
        expect(text).toBe(source);
    });

    it('leaves escaped literal brackets in prose alone', () => {
        const source = String.raw`这里说明 Markdown 的 \\(注\\) 写法。`;
        const { text, converted } = normalizeEscapedTex(source);

        expect(converted).toBe(0);
        expect(text).toBe(source);
    });

    it('keeps line breaks inside an unescaped matrix', () => {
        const source = ['$$', String.raw`x &= 1 \\`, String.raw`y &= 2`, '$$'].join('\n');
        const { text, converted } = normalizeEscapedTex(source);

        expect(converted).toBe(0);
        expect(text).toBe(source);
    });

    it('ignores an unterminated escaped delimiter', () => {
        const source = String.raw`未闭合 \\[ a + b`;
        const { text, converted } = normalizeEscapedTex(source);

        expect(converted).toBe(0);
        expect(text).toBe(source);
    });

    it('normalizes CRLF before matching', () => {
        const source = `${String.raw`\\[ a \\]`}\r\n后续`;
        const { text } = normalizeEscapedTex(source);

        expect(text).toBe('$$\na\n$$\n后续');
    });
});
