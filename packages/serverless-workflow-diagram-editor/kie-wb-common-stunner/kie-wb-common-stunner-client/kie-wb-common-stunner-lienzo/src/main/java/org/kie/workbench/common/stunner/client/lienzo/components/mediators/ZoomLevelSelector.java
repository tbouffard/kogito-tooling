/*
 * Copyright 2019 Red Hat, Inc. and/or its affiliates.
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

package org.kie.workbench.common.stunner.client.lienzo.components.mediators;

import java.util.Objects;

import javax.annotation.PostConstruct;
import javax.annotation.PreDestroy;
import javax.enterprise.context.Dependent;
import javax.inject.Inject;

import com.google.gwt.user.client.ui.IsWidget;
import com.google.gwt.user.client.ui.Widget;
import org.uberfire.client.mvp.UberView;
import org.uberfire.mvp.Command;

@Dependent
public class ZoomLevelSelector implements IsWidget {

    public interface View extends UberView<ZoomLevelSelector> {

        void setText(String text);

        void add(String text,
                 Command onClick);

        void clear();

        void setEnabled(boolean enabled);

        void dropUp();
    }

    private final View view;
    private Command onScaleToFit;
    private Command onDecreaseLevel;
    private Command onIncreaseLevel;

    @Inject
    public ZoomLevelSelector(final View view) {
        this.view = view;
        this.onScaleToFit = () -> {
        };
        this.onIncreaseLevel = () -> {
        };
        this.onDecreaseLevel = () -> {
        };
    }

    @PostConstruct
    public void init() {
        view.init(this);
        view.setEnabled(true);
    }

    public ZoomLevelSelector onDecreaseLevel(final Command onDecreaseLevel) {
        checkNotNull("onDecreaseLevel", onDecreaseLevel);
        this.onDecreaseLevel = onDecreaseLevel;
        return this;
    }

    public ZoomLevelSelector onIncreaseLevel(final Command onIncreaseLevel) {
        checkNotNull("onIncreaseLevel", onIncreaseLevel);
        this.onIncreaseLevel = onIncreaseLevel;
        return this;
    }

    public ZoomLevelSelector onScaleToFitSize(final Command onScaleToFit) {
        checkNotNull("onScaleToFit", onScaleToFit);
        this.onScaleToFit = onScaleToFit;
        return this;
    }

    private static <T> T checkNotNull(String objName, T obj) {
        return Objects.requireNonNull(obj, "Parameter named '" + objName + "' should be not null!");
    }

    public ZoomLevelSelector setText(final String text) {
        view.setText(text);
        return this;
    }

    public ZoomLevelSelector dropUp() {
        view.dropUp();
        return this;
    }

    public ZoomLevelSelector add(final String text,
                                 final Command onClick) {
        view.add(text, onClick);
        return this;
    }

    public ZoomLevelSelector clear() {
        view.clear();
        return this;
    }

    public ZoomLevelSelector setEnabled(boolean enabled) {
        view.setEnabled(enabled);
        return this;
    }

    @Override
    public Widget asWidget() {
        return view.asWidget();
    }

    void onScaleToFitSize() {
        onScaleToFit.execute();
    }

    void onIncreaseLevel() {
        onIncreaseLevel.execute();
    }

    void onDecreaseLevel() {
        onDecreaseLevel.execute();
    }

    @PreDestroy
    public void destroy() {
        onIncreaseLevel = null;
        onDecreaseLevel = null;
    }
}
