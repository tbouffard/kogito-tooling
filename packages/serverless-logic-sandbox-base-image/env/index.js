/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
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

const { varsWithName, getOrDefault, composeEnv } = require("@kie-tools-scripts/build-env");

module.exports = composeEnv(
  [require("@kie-tools/root-env/env"), require("@kie-tools/serverless-logic-sandbox-base-image-env/env")],
  {
    vars: varsWithName({
      SERVERLESS_LOGIC_SANDBOX__baseImageQuarkusVersion: {
        default: "2.11.1.Final",
        description: "",
      },
      SERVERLESS_LOGIC_SANDBOX__baseImageBuildTags: {
        default: "latest",
        description: "",
      },
    }),
    get env() {
      return {
        serverlessLogicSandboxBaseImage: {
          quarkusVersion: getOrDefault(this.vars.SERVERLESS_LOGIC_SANDBOX__baseImageQuarkusVersion),
          buildTags: getOrDefault(this.vars.SERVERLESS_LOGIC_SANDBOX__baseImageBuildTags),
        },
      };
    },
  }
);
