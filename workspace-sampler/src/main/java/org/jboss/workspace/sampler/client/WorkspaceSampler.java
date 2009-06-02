package org.jboss.workspace.sampler.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.core.client.GWT;
import com.google.gwt.user.client.ui.Image;
import com.google.gwt.user.client.ui.Widget;
import org.jboss.workspace.client.ToolSet;
import org.jboss.workspace.client.Workspace;
import org.jboss.workspace.client.framework.Tool;
import org.jboss.workspace.client.layout.WorkspaceLayout;
import org.jboss.workspace.client.listeners.TabOpeningClickHandler;
import org.jboss.workspace.client.widgets.WSTree;
import org.jboss.workspace.client.widgets.WSTreeItem;
import org.jboss.workspace.sampler.client.imagebrowser.ImageBrowser;
import org.jboss.workspace.sampler.client.minibrowser.MiniBrowserWidget;
import org.jboss.workspace.sampler.client.servicecontrol.ServiceControlTool;
import org.jboss.workspace.sampler.client.tabledemo.TableDemo;


public class WorkspaceSampler implements EntryPoint {
    public void onModuleLoad() {
        Workspace ws = new Workspace();
        final WorkspaceLayout layout = ws.init(null);
        layout.setRpcSync(false);

        layout.addToolSet(new ToolSet() {
            public Tool[] getAllProvidedTools() {
                return new Tool[]{new ServiceControlTool(), new TableDemo()};
            }

            public String getToolSetName() {
                return "Controls";
            }

            public Widget getWidget() {
                return null;
            }
        });


        layout.addToolSet(new ToolSet() {
            public Tool[] getAllProvidedTools() {
                return new Tool[0];
            }

            public String getToolSetName() {
                return "Navigation";
            }

            public Widget getWidget() {
                MiniBrowserWidget widget = new MiniBrowserWidget();

                WSTree tree = widget.getTree();

                Image defaultIcon = new Image(GWT.getModuleBaseURL() + "/images/ui/icons/application_double.png");

                WSTreeItem tItem = new WSTreeItem(defaultIcon, "Resources");
                tree.addItem(tItem);

                Image cameraIcon = new Image(GWT.getModuleBaseURL() + "/images/ui/icons/camera_go.png");
                WSTreeItem imagesItem = new WSTreeItem(cameraIcon, "Images");
                tItem.addItem(imagesItem);
                tree.attachListener(imagesItem, new TabOpeningClickHandler(layout, new ImageBrowser()));

                Image audioIcon = new Image(GWT.getModuleBaseURL() + "/images/ui/icons/control_play_blue.png");
                tItem.addItem(new WSTreeItem(audioIcon, "Audio"));

                Image videoIcon = new Image(GWT.getModuleBaseURL() + "/images/ui/icons/television.png");
                tItem.addItem(new WSTreeItem(videoIcon, "Video"));

                return widget;
            }
        });

        layout.pack();
    }

}


