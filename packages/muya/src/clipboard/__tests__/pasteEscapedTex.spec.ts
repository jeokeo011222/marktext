// @vitest-environment happy-dom

import type Content from '../../block/base/content';
import type { Muya } from '../../muya';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Muya as MuyaClass } from '../../muya';
import { SelectionDirection } from '../../selection/types';

// Ctrl+V delivers doubly escaped TeX through the text slot. The paste path has
// to rewrite it to $ / $$ before Markdown parsing, otherwise the delimiters are
// pasted verbatim and render as literal text instead of math.

vi.mock('../../utils/prism/index', () => ({
    default: {},
    walkTokens: () => null,
    loadedLanguages: new Set(),
    transformAliasToOrigin: (s: string) => s,
    loadLanguage: () => Promise.resolve([]),
    search: () => [],
}));

vi.mock('../../utils/paste', async (importOriginal) => {
    const actual = await importOriginal<typeof import('../../utils/paste')>();
    return { ...actual, normalizePastedHTML: async (html: string) => html };
});

const bootedHosts: HTMLElement[] = [];
let hadVersion = false;
let originalVersion: string | undefined;

beforeEach(() => {
    hadVersion = 'MUYA_VERSION' in window;
    originalVersion = window.MUYA_VERSION;
    window.MUYA_VERSION = 'test';
});

afterEach(() => {
    while (bootedHosts.length)
        bootedHosts.pop()!.remove();
    if (hadVersion)
        window.MUYA_VERSION = originalVersion as string;
    else
        delete (window as Partial<Window>).MUYA_VERSION;
});

function bootMuya(markdown: string): Muya {
    const host = document.createElement('div');
    document.body.appendChild(host);
    const muya = new MuyaClass(host, { markdown } as ConstructorParameters<typeof MuyaClass>[1]);
    muya.init();
    bootedHosts.push(muya.domNode);
    return muya;
}

function firstContent(muya: Muya): Content {
    return muya.editor.scrollPage!.firstContentInDescendant()!;
}

function stubSelection(muya: Muya, block: Content, start: number, end: number) {
    const path = block.path;
    muya.editor.selection.getTextSelection = () => ({
        anchor: { offset: start, block, path },
        focus: { offset: end, block, path },
        isCollapsed: start === end,
        isSelectionInSameBlock: true,
        direction: SelectionDirection.FORWARD,
    });
}

function pasteEvent(text: string, html: string) {
    return {
        preventDefault() {},
        stopPropagation() {},
        clipboardData: {
            getData: (t: string) => (t === 'text/plain' ? text : html),
            files: [],
            items: [],
        },
    } as unknown as ClipboardEvent;
}

async function pasteInto(muya: Muya, block: Content, text: string, html = '') {
    stubSelection(muya, block, 0, block.text.length);
    await muya.editor.clipboard.pasteHandler(pasteEvent(text, html), text, html);
    await new Promise(r => setTimeout(r, 40));
}

describe('paste — escaped TeX is normalized before parsing', () => {
    it('rewrites escaped inline delimiters from the text slot', async () => {
        const muya = bootMuya('');
        const para = firstContent(muya);

        await pasteInto(muya, para, String.raw`模型为 \\(f\_\theta\\)。`);

        expect(para.text).toBe(String.raw`模型为 $f_\theta$。`);
    });

    it('prefers the normalized text over an HTML copy holding raw delimiters', async () => {
        const muya = bootMuya('');
        const para = firstContent(muya);
        const html = `<span>${String.raw`\\(f\_\theta\\)`}</span>`;

        await pasteInto(muya, para, String.raw`\\(f\_\theta\\)`, html);

        expect(para.text).toBe(String.raw`$f_\theta$`);
    });

    it('pastes ordinary text unchanged', async () => {
        const muya = bootMuya('');
        const para = firstContent(muya);

        await pasteInto(muya, para, '普通文本');

        expect(para.text).toBe('普通文本');
    });
});
