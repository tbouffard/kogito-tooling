/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { EditorEnvelopeLocator, EnvelopeMapping } from "@kie-tools-core/editor/dist/api/EditorEnvelopeLocator";

export class EditorEnvelopeLocatorFactory {
  public create(args: { targetOrigin: string }) {
    return new EditorEnvelopeLocator(args.targetOrigin, [
      new EnvelopeMapping({
        type: "bpmn",
        filePathGlob: "**/*.bpmn?(2)",
        resourcesPathPrefix: "gwt-editors/bpmn",
        envelopePath: "bpmn-envelope.html",
      }),
      new EnvelopeMapping({
        type: "dmn",
        filePathGlob: "**/*.dmn",
        resourcesPathPrefix: "gwt-editors/dmn",
        envelopePath: "dmn-envelope.html",
      }),
      new EnvelopeMapping({
        type: "pmml",
        filePathGlob: "**/*.pmml",
        resourcesPathPrefix: "",
        envelopePath: "pmml-envelope.html",
      }),
    ]);
  }
}
