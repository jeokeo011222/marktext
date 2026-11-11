import katex from 'katex';
import { beforeEach, describe, expect, it } from 'vitest';
import { resetMathNumbering, toKaTeXCompatible } from '../katexCompat';
import 'katex/dist/contrib/mhchem.mjs';

// Typora compiles a whole document with MathJax; KaTeX sees one formula at a
// time. These cases pin down the rewrite that closes that gap without touching
// constructs KaTeX already handles natively.
describe('toKaTeXCompatible', () => {
    beforeEach(() => resetMathNumbering());

    const renders = (tex: string, macros: Record<string, string> = {}): void => {
        // `\tag` and the align/gather environments are display-only in KaTeX.
        const displayMode = /\\tag|\\begin\{(?:align|gather|equation)/.test(tex);
        expect(() => katex.renderToString(tex, { throwOnError: true, displayMode, macros })).not.toThrow();
    };

    it('numbers a labelled display formula and resolves later references', () => {
        const equation = toKaTeXCompatible('E = mc^2 \\label{eq:mass}', { displayMode: true });
        expect(equation.tex).toContain('\\tag{1}');
        expect(equation.tex).not.toContain('\\label');
        renders(equation.tex, equation.macros);

        const ref = toKaTeXCompatible('see \\ref{eq:mass}');
        expect(ref.tex).toBe('see 1');
        const eqref = toKaTeXCompatible('see \\eqref{eq:mass}');
        expect(eqref.tex).toBe('see \\text{(1)}');
        renders(eqref.tex, eqref.macros);
    });

    it('keeps numbering stable across repeats and resets with the document', () => {
        expect(toKaTeXCompatible('a \\label{eq:a}', { displayMode: true }).tex).toContain('\\tag{1}');
        expect(toKaTeXCompatible('b \\label{eq:b}', { displayMode: true }).tex).toContain('\\tag{2}');
        expect(toKaTeXCompatible('a \\label{eq:a}', { displayMode: true }).tex).toContain('\\tag{1}');

        resetMathNumbering();
        expect(toKaTeXCompatible('c \\label{eq:c}', { displayMode: true }).tex).toContain('\\tag{1}');
    });

    it('binds a label to an explicit tag instead of allocating a new number', () => {
        const equation = toKaTeXCompatible('E = mc^2 \\tag{A.1} \\label{eq:mass}', { displayMode: true });
        expect(equation.tex).toContain('\\tag{A.1}');
        expect(equation.tex).not.toContain('\\tag{1}');
        renders(equation.tex, equation.macros);

        expect(toKaTeXCompatible('\\eqref{eq:mass}').tex).toContain('A.1');
    });

    it('renders an unresolved reference instead of failing the whole formula', () => {
        const { tex, macros } = toKaTeXCompatible('see \\ref{eq:missing}');
        expect(tex).toContain('??');
        renders(tex, macros);
    });

    it('does not number an inline formula that carries a label', () => {
        const { tex } = toKaTeXCompatible('$x$ has \\label{eq:inline}', { displayMode: false });
        expect(tex).not.toContain('\\tag');
        expect(tex).not.toContain('\\label');
    });

    it('lifts newcommand and def into KaTeX macros', () => {
        const { tex, macros } = toKaTeXCompatible('\\newcommand{\\R}{\\mathbb{R}} \\def\\half{\\frac{1}{2}} \\R + \\half');
        expect(tex).not.toContain('\\newcommand');
        expect(tex).not.toContain('\\def');
        expect(macros['\\R']).toBe('\\mathbb{R}');
        expect(macros['\\half']).toBe('\\frac{1}{2}');
        renders(tex, macros);
    });

    it('handles nested braces in a macro body', () => {
        const { tex, macros } = toKaTeXCompatible('\\newcommand{\\norm}[1]{\\left\\lVert #1 \\right\\rVert} \\norm{x}');
        expect(macros['\\norm']).toBe('\\left\\lVert #1 \\right\\rVert');
        renders(tex, macros);
    });

    it('strips document-level commands that KaTeX cannot parse', () => {
        const { tex, macros } = toKaTeXCompatible(
            '\\numberwithin{equation}{section} \\begin{align} a &= b \\nonumber \\\\ c &= d \\end{align}',
        );
        expect(tex).not.toContain('\\nonumber');
        expect(tex).not.toContain('\\numberwithin');
        renders(tex, macros);
    });

    it('leaves environments and mhchem commands KaTeX already supports untouched', () => {
        const align = '\\begin{align} a &= b \\\\ c &= d \\end{align}';
        expect(toKaTeXCompatible(align, { displayMode: true }).tex).toBe(align);

        const chem = '\\ce{Zn^2+ <=> Zn(OH)2}';
        expect(toKaTeXCompatible(chem).tex).toBe(chem);
    });

    it('can number every display formula when explicitly asked', () => {
        const first = toKaTeXCompatible('a + b', { displayMode: true, autoNumberAll: true });
        const second = toKaTeXCompatible('c + d', { displayMode: true, autoNumberAll: true });
        expect(first.tex).toContain('\\tag{1}');
        expect(second.tex).toContain('\\tag{2}');
        renders(first.tex, first.macros);
        renders(second.tex, second.macros);
    });

    it('leaves plain formulas byte-for-byte alone', () => {
        const plain = '\\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}';
        const { tex, macros } = toKaTeXCompatible(plain, { displayMode: true });
        expect(tex).toBe(plain);
        expect(macros).toEqual({});
        renders(tex, macros);
    });
});
