/**
 * Paper-grade LaTeX compatibility for KaTeX.
 *
 * MathJax (Typora) compiles a whole document, so `\label`, `\ref`, `\eqref`,
 * `\newcommand` and automatic numbering work there by construction. KaTeX
 * renders one formula at a time and knows none of them. Rather than swap the
 * engine — it is inlined into the renderer bundle and swapping would cost the
 * editor's responsiveness — rewrite those constructs into the equivalents
 * KaTeX does understand (`\tag`, `macros`, literal numbers).
 *
 * Deliberately NOT rewritten: `align`/`gather`/`alignat`/`equation`
 * environments are already valid KaTeX, and `\ce{}` is registered by the
 * mhchem contrib module the math renderers import.
 *
 * Cross-formula state lives in a registry because a renderer only ever sees
 * one formula. Numbering is assigned on first sight of a `\label` and reused
 * for every `\ref`; an unresolved reference renders as `??` instead of making
 * the whole formula fail to parse. A formula that references a label defined
 * later resolves on the next render, the same two-pass behaviour LaTeX has.
 */

export interface IKaTeXCompatOptions {
    displayMode?: boolean;
    /** Number every display formula, not only labelled ones. Off by default. */
    autoNumberAll?: boolean;
}

export interface IKaTeXCompatResult {
    tex: string;
    macros: Record<string, string>;
}

const LABEL_RE = /\\label\s*\{([^{}]+)\}/g;
const REF_RE = /\\eqref\s*\{([^{}]+)\}|\\ref\s*\{([^{}]+)\}/g;
const TAG_RE = /\\tag\s*(?:\{([^{}]*)\}|[^\s\\])/;
const NEWCOMMAND_RE = /\\(?:newcommand|renewcommand|providecommand)\s*(?:\*\s*)?\{?\\([A-Za-z@]+)\}?\s*(?:\[\d+\]\s*)?\{/g;
const DEF_RE = /\\def\s*\\([A-Za-z@]+)\s*\{/g;
// Document-level commands have no meaning inside a single rendered formula.
const DOCUMENT_COMMAND_RE = /\\(?:numberwithin|allowdisplaybreaks|nonumber|notag)\s*(?:\{[^{}]*\}\s*\{[^{}]*\}|\{[^{}]*\})?/g;

class MathRegistry {
    private readonly _labels = new Map<string, string>();
    private _counter = 0;
    readonly macros: Record<string, string> = {};

    resolve(label: string): string | null {
        return this._labels.get(label) ?? null;
    }

    /** Bind a label to an explicit `\tag` text without consuming a counter. */
    bind(label: string, value: string): void {
        if (!this._labels.has(label))
            this._labels.set(label, value);
    }

    numberFor(label: string): string {
        const known = this._labels.get(label);
        if (known)
            return known;
        const number = String(++this._counter);
        this._labels.set(label, number);
        return number;
    }

    nextNumber(): string {
        return String(++this._counter);
    }
}

let registry = new MathRegistry();

/** Drop accumulated labels, numbers and macros, e.g. when a document is replaced. */
export function resetMathNumbering(): void {
    registry = new MathRegistry();
}

/** Read a balanced `{...}` group, so nested braces in macro bodies survive. */
function readGroup(source: string, open: number): { body: string; end: number } | null {
    if (source[open] !== '{')
        return null;
    let depth = 0;
    for (let i = open; i < source.length; i++) {
        const char = source[i];
        if (char === '\\') {
            i++;
            continue;
        }
        if (char === '{') {
            depth++;
        }
        else if (char === '}') {
            depth--;
            if (depth === 0)
                return { body: source.slice(open + 1, i), end: i + 1 };
        }
    }
    return null;
}

/**
 * Lift `\newcommand`/`\renewcommand`/`\providecommand` and parameterless
 * `\def` out of the formula into KaTeX's `macros` option.
 */
function stripMacros(input: string, re: RegExp, macros: Record<string, string>): string {
    re.lastIndex = 0;
    let output = '';
    let cursor = 0;
    let match = re.exec(input);
    while (match !== null) {
        // Every matcher above ends on the macro body's opening brace.
        const group = readGroup(input, re.lastIndex - 1);
        if (!group) {
            match = re.exec(input);
            continue;
        }
        // KaTeX keys include the leading backslash; a bare name would be
        // treated as a single-letter macro and expand recursively.
        macros[`\\${match[1]}`] = group.body;
        output += input.slice(cursor, match.index);
        cursor = group.end;
        re.lastIndex = group.end;
        match = re.exec(input);
    }
    return output + input.slice(cursor);
}

export function toKaTeXCompatible(
    source: string,
    options: IKaTeXCompatOptions = {},
): IKaTeXCompatResult {
    const { displayMode = false, autoNumberAll = false } = options;
    const macros: Record<string, string> = {};
    let tex = stripMacros(source, NEWCOMMAND_RE, macros);
    tex = stripMacros(tex, DEF_RE, macros);
    Object.assign(registry.macros, macros);
    tex = tex.replace(DOCUMENT_COMMAND_RE, '');

    // References first: an unresolved one stays legible instead of making the
    // whole formula fail to parse.
    tex = tex.replace(REF_RE, (_full, eqLabel: string | undefined, refLabel: string | undefined) => {
        const number = registry.resolve(eqLabel ?? refLabel ?? '');
        if (!number)
            return '\\text{??}';
        return eqLabel ? `\\text{(${number})}` : number;
    });

    const tagText = tex.match(TAG_RE)?.[1] ?? '';
    const hasTag = TAG_RE.test(tex);
    let firstLabelPlaced = false;
    tex = tex.replace(LABEL_RE, (_full, label: string) => {
        if (hasTag && tagText) {
            registry.bind(label, tagText);
            return '';
        }
        const number = registry.numberFor(label);
        // Keep the number where the `\label` was: that position is valid even
        // inside `align` rows, whereas appending after `\end{align}` is not.
        if (displayMode && !firstLabelPlaced) {
            firstLabelPlaced = true;
            return `\\tag{${number}}`;
        }
        return '';
    });

    if (autoNumberAll && displayMode && !hasTag && !firstLabelPlaced) {
        tex += ` \\tag{${registry.nextNumber()}}`;
    }

    return { tex, macros: { ...registry.macros } };
}
