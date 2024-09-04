/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox and others.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import { describe, expect, test } from 'vitest';
import { render, RenderResult } from '@testing-library/react';
import React from 'react';
import { MonacoEditorReactComp, TextChanges } from '@typefox/monaco-editor-react';
import { MonacoEditorLanguageClientWrapper, UserConfig } from 'monaco-editor-wrapper';
import { updateExtendedAppPrototyp } from './helper.js';

describe('Test MonacoEditorReactComp', () => {
    test('rerender', async () => {
        updateExtendedAppPrototyp();
        const userConfig: UserConfig = {
            wrapperConfig: {
                editorAppConfig: {
                    $type: 'extended',
                }
            },
            loggerConfig: {
                enabled: true,
                debugEnabled: true,
            }
        };
        const { rerender } = render(<MonacoEditorReactComp userConfig={userConfig} />);
        rerender(<MonacoEditorReactComp userConfig={userConfig} />);
        await Promise.resolve();
        rerender(<MonacoEditorReactComp userConfig={userConfig} />);

        let renderResult: RenderResult;
        // we have to await the full start of the editor with the onLoad callback, then it is save to contine
        const p = await new Promise<void>(resolve => {
            const handleOnLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {
                renderResult.rerender(<MonacoEditorReactComp userConfig={userConfig} />);

                resolve();
            };
            renderResult = render(<MonacoEditorReactComp userConfig={userConfig} onLoad={handleOnLoad} />);
        });
        // void promise is undefined after it was awaited
        expect(p).toBeUndefined();
    });

    test('update onTextChanged', async () => {
        updateExtendedAppPrototyp();
        const userConfig: UserConfig = {
            wrapperConfig: {
                editorAppConfig: {
                    $type: 'extended',
                    codeResources: {
                        main: {
                            text: 'hello world',
                            fileExt: 'js'
                        }
                    }
                }
            },
            loggerConfig: {
                enabled: true,
                debugEnabled: true,
            }
        };

        let renderResult: RenderResult;
        // we have to await the full start of the editor with the onLoad callback, then it is save to contine
        const p = await new Promise<void>(resolve => {
            const handleOnLoad = async (_wrapper: MonacoEditorLanguageClientWrapper) => {

                const p1 = await new Promise<void>(p1Resolve => {
                    const textReceiverHello = (textChanges: TextChanges) => {
                        expect(textChanges.text).toEqual('hello world');
                        p1Resolve();
                    };
                    // because the onTextChanged callback is updated there will be a result even if the text is unchanged
                    renderResult.rerender(<MonacoEditorReactComp userConfig={userConfig} onTextChanged={(textReceiverHello)} />);
                });
                expect(p1).toBeUndefined();

                resolve();
            };
            renderResult = render(<MonacoEditorReactComp userConfig={userConfig} onLoad={handleOnLoad} />);
        });
        // void promise is undefined after it was awaited
        expect(p).toBeUndefined();
    });

    test('update codeResources', async () => {
        updateExtendedAppPrototyp();
        const userConfig: UserConfig = {
            wrapperConfig: {
                editorAppConfig: {
                    $type: 'extended',
                    codeResources: {
                        main: {
                            text: 'hello world',
                            fileExt: 'js'
                        }
                    }
                }
            },
            loggerConfig: {
                enabled: true,
                debugEnabled: true,
            }
        };

        let renderResult: RenderResult;
        // we have to await the full start of the editor with the onLoad callback, then it is save to contine
        const p = await new Promise<void>(resolve => {
            const handleOnLoad = async (wrapper: MonacoEditorLanguageClientWrapper) => {

                // eslint-disable-next-line no-async-promise-executor
                const p1 = await new Promise<void>(async p1Resolve => {
                    await wrapper.updateCodeResources({
                        main: {
                            text: 'goodbye world',
                            fileExt: 'js'
                        }
                    });

                    const textReceiverGoodbye = (textChanges: TextChanges) => {
                        expect(textChanges.text).toBe('goodbye world');
                        p1Resolve();
                    };

                    renderResult.rerender(<MonacoEditorReactComp userConfig={userConfig} onTextChanged={(textReceiverGoodbye)} />);
                });
                expect(p1).toBeUndefined();

                resolve();
            };
            renderResult = render(<MonacoEditorReactComp userConfig={userConfig} onLoad={handleOnLoad} />);
        });
        // void promise is undefined after it was awaited
        expect(p).toBeUndefined();
    });
});
