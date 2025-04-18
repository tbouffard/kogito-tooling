/*
 * Copyright 2021 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *        http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as React from "react";
import { PageSection } from "@patternfly/react-core/dist/js/components/Page";
import { Spinner } from "@patternfly/react-core/dist/js/components/Spinner";
import { Text, TextContent, TextVariants } from "@patternfly/react-core/dist/js/components/Text";
import { Bullseye } from "@patternfly/react-core/dist/js/layouts/Bullseye";
import { basename } from "path";
import { useCallback, useEffect, useRef, useState } from "react";
import { useHistory } from "react-router";
import { AuthSourceKeys, useAuthSources, useSelectedAuthSession } from "../authSources/AuthSourceHooks";
import { EditorPageErrorPage } from "../editor/EditorPageErrorPage";
import { useRoutes } from "../navigation/Hooks";
import { QueryParams } from "../navigation/Routes";
import { OnlineEditorPage } from "../pageTemplate/OnlineEditorPage";
import { useQueryParam, useQueryParams } from "../queryParams/QueryParamsContext";
import { useSettingsDispatch } from "../settings/SettingsContext";
import {
  ImportableUrl,
  isPotentiallyGit,
  isSingleFile,
  UrlType,
  useClonableUrl,
  useImportableUrl,
  useImportableUrlValidation,
} from "./ImportableUrlHooks";
import { AdvancedImportModal, AdvancedImportModalRef } from "./AdvancedImportModalContent";
import { fetchSingleFileContent } from "./fetchSingleFileContent";
import { useWorkspaces } from "@kie-tools-core/workspaces-git-fs/dist/context/WorkspacesContext";
import { LocalFile } from "@kie-tools-core/workspaces-git-fs/dist/worker/api/LocalFile";
import { encoder } from "@kie-tools-core/workspaces-git-fs/dist/encoderdecoder/EncoderDecoder";
import { WorkspaceKind } from "@kie-tools-core/workspaces-git-fs/dist/worker/api/WorkspaceOrigin";
import { PromiseStateStatus } from "@kie-tools-core/react-hooks/dist/PromiseState";

export function NewWorkspaceFromUrlPage() {
  const workspaces = useWorkspaces();
  const routes = useRoutes();
  const history = useHistory();
  const authSources = useAuthSources();
  const settingsDispatch = useSettingsDispatch();

  const [importingError, setImportingError] = useState("");

  const queryParams = useQueryParams();

  const queryParamUrl = useQueryParam(QueryParams.URL);
  const queryParamBranch = useQueryParam(QueryParams.BRANCH);
  const queryParamAuthSource = useQueryParam(QueryParams.AUTH_SOURCE);
  const queryParamConfirm = useQueryParam(QueryParams.CONFIRM);

  const { authInfo, authSource } = useSelectedAuthSession(queryParamAuthSource);

  const importableUrl = useImportableUrl(queryParamUrl);
  const clonableUrlObject = useClonableUrl(queryParamUrl, authSource, queryParamBranch);
  const { clonableUrl, selectedGitRefName, gitServerRefsPromise } = clonableUrlObject;

  const setAuthSource = useCallback(
    (newAuthSource) => {
      if (!newAuthSource) {
        history.replace({
          pathname: routes.import.path({}),
          search: queryParams.without(QueryParams.AUTH_SOURCE).toString(),
        });
        return;
      }
      history.replace({
        pathname: routes.import.path({}),
        search: queryParams
          .with(
            QueryParams.AUTH_SOURCE,
            typeof newAuthSource === "function" ? newAuthSource(authSource) : newAuthSource
          )
          .toString(),
      });
    },
    [authSource, history, queryParams, routes.import]
  );

  const setUrl = useCallback(
    (newUrl) => {
      if (!newUrl) {
        history.replace({
          pathname: routes.import.path({}),
          search: queryParams.without(QueryParams.URL).toString(),
        });
        return;
      }
      history.replace({
        pathname: routes.import.path({}),
        search: queryParams
          .with(QueryParams.URL, typeof newUrl === "function" ? newUrl(queryParamUrl ?? "") : newUrl)
          .toString(),
      });
    },
    [history, queryParamUrl, queryParams, routes.import]
  );

  const setGitRefName = useCallback(
    (newGitRefName) => {
      if (!newGitRefName) {
        history.replace({
          pathname: routes.import.path({}),
          search: queryParams.without(QueryParams.BRANCH).toString(),
        });
        return;
      }
      history.replace({
        pathname: routes.import.path({}),
        search: queryParams
          .with(
            QueryParams.BRANCH,
            typeof newGitRefName === "function" ? newGitRefName(selectedGitRefName ?? "") : newGitRefName
          )
          .toString(),
      });
    },
    [history, queryParams, routes.import, selectedGitRefName]
  );

  // Startup the page. Only import if those are set.
  useEffect(() => {
    if (!selectedGitRefName) {
      return;
    }
    history.replace({
      pathname: routes.import.path({}),
      search: queryParams
        .with(QueryParams.BRANCH, selectedGitRefName)
        .with(QueryParams.AUTH_SOURCE, authSource)
        .toString(),
    });
  }, [authSource, history, queryParams, routes.import, selectedGitRefName, setGitRefName]);

  const cloneGitRepository: typeof workspaces.createWorkspaceFromGitRepository = useCallback(
    async (args) => {
      const res = await workspaces.createWorkspaceFromGitRepository(args);

      const { workspace, suggestedFirstFile } = res;

      if (!suggestedFirstFile) {
        history.replace({
          pathname: routes.home.path({}),
          search: routes.home.queryString({ expand: workspace.workspaceId }),
        });
        return res;
      }

      history.replace({
        pathname: routes.workspaceWithFilePath.path({
          workspaceId: workspace.workspaceId,
          fileRelativePath: suggestedFirstFile.relativePathWithoutExtension,
          extension: suggestedFirstFile.extension,
        }),
      });
      return res;
    },
    [routes, history, workspaces]
  );

  const createWorkspaceForFile = useCallback(
    async (file: LocalFile) => {
      workspaces.createWorkspaceFromLocal({ localFiles: [file] }).then(({ workspace, suggestedFirstFile }) => {
        if (!suggestedFirstFile) {
          return;
        }
        history.replace({
          pathname: routes.workspaceWithFilePath.path({
            workspaceId: workspace.workspaceId,
            fileRelativePath: suggestedFirstFile.relativePathWithoutExtension,
            extension: suggestedFirstFile.extension,
          }),
        });
      });
    },
    [routes, history, workspaces]
  );

  const doImportAsSingleFile = useCallback(
    async (importableUrl: ImportableUrl) => {
      const singleFileContent = await fetchSingleFileContent(importableUrl, settingsDispatch.github.octokit);

      if (singleFileContent.error) {
        setImportingError(singleFileContent.error);
        return;
      }

      await createWorkspaceForFile({
        path: basename(decodeURIComponent(singleFileContent.rawUrl!.pathname)),
        fileContents: encoder.encode(singleFileContent.content!),
      });
    },
    [createWorkspaceForFile, settingsDispatch.github.octokit]
  );

  const doImport = useCallback(async () => {
    const singleFile = isSingleFile(importableUrl.type);

    try {
      if (queryParamAuthSource && !authSources.has(queryParamAuthSource as AuthSourceKeys)) {
        setImportingError(`Auth source '${queryParamAuthSource}' not found.`);
        return;
      }

      if (clonableUrl.type === UrlType.INVALID || clonableUrl.type === UrlType.NOT_SUPPORTED) {
        setImportingError(clonableUrl.error);
        return;
      }

      //unknown
      else if (importableUrl.type === UrlType.UNKNOWN) {
        if (gitServerRefsPromise.data?.defaultBranch) {
          await cloneGitRepository({
            origin: {
              kind: WorkspaceKind.GIT,
              url: importableUrl.url.toString(),
              branch: selectedGitRefName ?? gitServerRefsPromise.data.defaultBranch,
            },
            gitConfig: authInfo,
            authInfo: authInfo,
          });
        } else {
          await doImportAsSingleFile(importableUrl);
        }
      }

      // git but not gist
      else if (importableUrl.type === UrlType.GITHUB_DOT_COM || importableUrl.type === UrlType.GIT) {
        if (gitServerRefsPromise.data?.defaultBranch) {
          await cloneGitRepository({
            origin: {
              kind: WorkspaceKind.GIT,
              url: importableUrl.url.toString(),
              branch: selectedGitRefName ?? gitServerRefsPromise.data.defaultBranch,
            },
            gitConfig: authInfo,
            authInfo: authInfo,
          });
        } else {
          setImportingError(`Can't clone. ${gitServerRefsPromise.error}`);
          return;
        }
      }

      // gist
      else if (importableUrl.type === UrlType.GIST_DOT_GITHUB_DOT_COM) {
        importableUrl.url.hash = "";

        if (gitServerRefsPromise.data?.defaultBranch) {
          await cloneGitRepository({
            origin: {
              kind: WorkspaceKind.GITHUB_GIST,
              url: importableUrl.url.toString(),
              branch: queryParamBranch ?? selectedGitRefName ?? gitServerRefsPromise.data.defaultBranch,
            },
            gitConfig: authInfo,
            authInfo: authInfo,
          });
        } else {
          setImportingError(`Can't clone. ${gitServerRefsPromise.error}`);
          return;
        }
      }

      // single file
      else if (singleFile) {
        doImportAsSingleFile(importableUrl);
      } else {
        throw new Error("Invalid UrlType " + importableUrl.type);
      }
    } catch (e) {
      console.error(e);
      setImportingError(e.toString());
      return;
    }
  }, [
    importableUrl,
    queryParamAuthSource,
    authSources,
    clonableUrl.type,
    clonableUrl.error,
    gitServerRefsPromise.data?.defaultBranch,
    gitServerRefsPromise.error,
    cloneGitRepository,
    selectedGitRefName,
    authInfo,
    queryParamBranch,
    doImportAsSingleFile,
  ]);

  useEffect(() => {
    if (!queryParamUrl) {
      history.replace({
        pathname: routes.import.path({}),
        search: queryParams.with(QueryParams.CONFIRM, "true").toString(),
      });
    }
  }, [history, queryParamUrl, queryParams, routes.import]);

  useEffect(() => {
    if ((!queryParamBranch || !queryParamAuthSource) && selectedGitRefName) {
      return;
    }

    if (gitServerRefsPromise.status === PromiseStateStatus.PENDING) {
      return;
    }

    if (!queryParamUrl || (isPotentiallyGit(importableUrl.type) && queryParamConfirm === "true")) {
      advancedImportModalRef.current?.open();
      return;
    }

    setImportingError("");
    doImport();
  }, [
    gitServerRefsPromise.status,
    doImport,
    queryParamConfirm,
    importableUrl.type,
    queryParamUrl,
    queryParamBranch,
    queryParamAuthSource,
    selectedGitRefName,
  ]);

  const validation = useImportableUrlValidation(authSource, queryParamUrl, queryParamBranch, clonableUrlObject);
  const advancedImportModalRef = useRef<AdvancedImportModalRef>(null);

  return (
    <>
      <OnlineEditorPage>
        <PageSection variant={"light"} isFilled={true} padding={{ default: "noPadding" }}>
          {importingError && (
            <EditorPageErrorPage
              title={`Can't import`}
              path={importableUrl.url?.toString() ?? ""}
              errors={[importingError]}
            />
          )}
          {!importingError && queryParamConfirm !== "true" && queryParamUrl && (
            <Bullseye>
              <TextContent>
                <Bullseye>
                  <Spinner />
                </Bullseye>
                <br />
                <Text component={TextVariants.p}>{`Importing '${queryParamUrl}'`}</Text>
              </TextContent>
            </Bullseye>
          )}
          {(queryParamConfirm === "true" || !queryParamUrl) && (
            <AdvancedImportModal
              ref={advancedImportModalRef}
              onSubmit={() => {
                history.replace({
                  pathname: routes.import.path({}),
                  search: queryParams.without(QueryParams.CONFIRM).toString(),
                });
              }}
              onClose={() => {
                history.push({ pathname: routes.home.path({}) });
              }}
              clonableUrl={clonableUrlObject}
              validation={validation}
              authSource={authSource}
              url={queryParamUrl ?? ""}
              gitRefName={selectedGitRefName ?? ""}
              setAuthSource={setAuthSource}
              setUrl={setUrl}
              setGitRefName={setGitRefName}
            />
          )}
        </PageSection>
      </OnlineEditorPage>
    </>
  );
}
