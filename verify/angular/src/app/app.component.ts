/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for license information.
 * ------------------------------------------------------------------------------------------ */

import { AfterViewInit, Component } from '@angular/core';
// import { buildWorkerDefinition } from 'monaco-editor-workers';
// buildWorkerDefinition('./assets/monaco-editor-workers/workers', window.location.href + '../..', false);
import { startEditor } from 'monaco-languageclient-examples';
import { useWorkerFactory } from 'monaco-editor-wrapper/workerFactory';
useWorkerFactory({
    rootPath: window.location.href + '../..',
    basePath: '../assets',
});
import { jsonClientUserConfig } from 'monaco-languageclient-examples/json-client';

const codeMain = `{
    "$schema": "http://json.schemastore.org/coffeelint",
    "line_endings": {"value": "windows"}
}`;

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class MonacoEditorComponent implements AfterViewInit {
    title = 'angular-client';
    initDone = false;

    async ngAfterViewInit(): Promise<void> {
        const htmlElement = document.getElementById('monaco-editor-root');
        startEditor(jsonClientUserConfig, htmlElement, codeMain);
    }
}
