/*
 * Copyright 2022 Red Hat, Inc. and/or its affiliates.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package org.kie.workbench.common.stunner.sw.definition;

import jsinterop.annotations.JsIgnore;
import jsinterop.annotations.JsType;
import org.jboss.errai.databinding.client.api.Bindable;
import org.kie.workbench.common.stunner.core.definition.annotation.Definition;
import org.kie.workbench.common.stunner.core.definition.annotation.morph.Morph;

/**
 * ForEach states can be used to execute actions for each element of a data set.
 * Each iteration of the ForEach state is by default executed in parallel by default.
 * However, executing iterations sequentially is also possible by setting the value of the mode property to sequential.
 *
 * @see <a href="https://github.com/serverlessworkflow/specification/blob/main/specification.md#ForEach-State"> ForEach state </a>
 */
@Bindable
@Definition
@Morph(base = State.class)
@JsType
public class ForEachState extends State {

    @JsIgnore
    public static final String TYPE_FOR_EACH = "foreach";

    // Missing inputCollection, mode

    /**
     * Actions to be executed for each of the elements of inputCollection.
     */
    public ActionNode[] actions;

    public ForEachState() {
        this.type = TYPE_FOR_EACH;
    }

    public ActionNode[] getActions() {
        return actions;
    }

    public void setActions(ActionNode[] actions) {
        this.actions = actions;
    }
}
