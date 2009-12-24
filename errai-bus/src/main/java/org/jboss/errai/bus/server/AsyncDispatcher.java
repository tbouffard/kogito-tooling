package org.jboss.errai.bus.server;

import com.google.inject.Inject;
import com.google.inject.Singleton;
import org.jboss.errai.bus.WorkerFactory;
import org.jboss.errai.bus.client.CommandMessage;
import org.jboss.errai.bus.client.protocols.MessageParts;
import org.jboss.errai.bus.server.service.ErraiService;

/**
 * The <tt>AsyncDispatcher</tt> provides asynchronous message delivery into the bus.  This means that incoming remote
 * requests do not block, and processing of the request continues even after the incoming network conversation has
 * ended.
 * </p>
 * This dispatcher implementation can be used with the {@link org.jboss.errai.bus.server.servlet.DefaultBlockingServlet}
 * as this pertains to incoming--as opposed to outgoing--message handling. Note: some appservers or servlet environments
 * may restrict thread creation within the container, in which case this implementation cannot be used.
 */
@Singleton
public class AsyncDispatcher implements RequestDispatcher {
    private WorkerFactory workerFactory;
    private ErraiService service;

    @Inject
    public AsyncDispatcher(ErraiService service) {
        this.service = service;
        this.workerFactory = new WorkerFactory(service);
    }

    public void deliver(CommandMessage message) {
        if (message.hasPart(MessageParts.PriorityProcessing)) {
            service.getBus().sendGlobal(message);
        } else {
            workerFactory.deliver(message);
        }
    }
}
