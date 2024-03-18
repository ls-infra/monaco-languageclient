/* --------------------------------------------------------------------------------------------
 * Copyright (c) 2024 TypeFox GmbH (http://www.typefox.io). All rights reserved.
 * Licensed under the MIT License. See LICENSE in the package root for license information.
 * ------------------------------------------------------------------------------------------ */

import { editor, Uri } from 'monaco-editor';
import 'vscode/localExtensionHost';
import getConfigurationServiceOverride from '@codingame/monaco-vscode-configuration-service-override';
import { OpenEditor } from '@codingame/monaco-vscode-editor-service-override';
import { mergeServices, InitializeServiceConfig } from 'monaco-languageclient/vscode/services';
import { Logger } from '../logger.js';

/**
 * Child classes are allow to override the services configuration implementation.
 */
export const configureServices = async (input?: InitializeServiceConfig, specificServices?: editor.IEditorOverrideServices, logger?: Logger): Promise<InitializeServiceConfig> => {
    const serviceConfig = input ?? {};
    // configure log level
    serviceConfig.debugLogging = logger?.isEnabled() === true && (serviceConfig.debugLogging === true || logger?.isDebugEnabled() === true);

    // always set required services if not configured
    serviceConfig.userServices = serviceConfig.userServices ?? {};
    const configureService = serviceConfig.userServices.configurationService ?? undefined;
    const workspaceConfig = serviceConfig.workspaceConfig ?? undefined;

    if (!configureService) {
        const mlcDefautServices = {
            ...getConfigurationServiceOverride()
        };
        mergeServices(mlcDefautServices, serviceConfig.userServices);

        if (workspaceConfig) {
            throw new Error('You provided a workspaceConfig without using the configurationServiceOverride');
        }
    }
    // adding the default workspace config if not provided
    if (!workspaceConfig) {
        serviceConfig.workspaceConfig = {
            workspaceProvider: {
                trusted: true,
                workspace: {
                    workspaceUri: Uri.file('/workspace')
                },
                async open() {
                    return false;
                }
            }
        };
    }
    mergeServices(specificServices ?? {}, serviceConfig.userServices);

    return serviceConfig;
};

export const useOpenEditorStub: OpenEditor = async (modelRef, options, sideBySide) => {
    console.log('Received open editor call with parameters: ', modelRef, options, sideBySide);
    return undefined;
};

export const checkServiceConsistency = (userServices?: editor.IEditorOverrideServices) => {
    const haveThemeService = Object.keys(userServices ?? {}).includes('themeService');
    const haveTextmateService = Object.keys(userServices ?? {}).includes('textMateTokenizationFeature');
    const haveMarkersService = Object.keys(userServices ?? {}).includes('markersService');
    const haveViewsService = Object.keys(userServices ?? {}).includes('viewsService');

    // theme requires textmate
    if (haveThemeService && !haveTextmateService) {
        throw new Error('"theme" service requires "textmate" service. Please add it to the "userServices".');
    }

    // markers service requires views service
    if (haveMarkersService && !haveViewsService) {
        throw new Error('"markers" service requires "views" service. Please add it to the "userServices".');
    }

    // we end up here if no exceptions were thrown
    return true;
};