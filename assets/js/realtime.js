/**
 * ============================================================
 * FIXJORI | REAL-TIME ENGINE V1.0
 * Meituan-Style · Dense · Information-Rich · Production-Ready
 * ============================================================
 *
 * This module provides a complete real-time update system for the FIXJORI platform,
 * featuring:
 * - WebSocket connection management with auto-reconnect
 * - Fallback to Server-Sent Events (SSE) and long-polling
 * - Event subscription and channel-based routing
 * - Live activity feed with Meituan-style density
 * - Notification system with toasts and badges
 * - Offline detection and message queuing
 * - Heartbeat and keep-alive
 * - Integration with booking, projects, and messaging
 * - Dense UI updates with smooth animations
 *
 * ============================================================
 * USAGE:
 * ============================================================
 *
 * // Initialize real-time engine
 * FJRealtime.init({
 *     url: 'wss://api.fixjori.de/ws',
 *     channels: ['projects', 'messages', 'notifications'],
 *     onMessage: function(event) {
 *         console.log('Real-time event:', event);
 *     },
 *     onConnect: function() {
 *         console.log('Connected to real-time server');
 *     },
 *     onDisconnect: function() {
 *         console.log('Disconnected');
 *     }
 * });
 *
 * // Subscribe to a channel
 * FJRealtime.subscribe('projects', function(data) {
 *     // Handle project update
 * });
 *
 * // Send a message
 * FJRealtime.send({
 *     type: 'project_update',
 *     payload: { id: 123, status: 'completed' }
 * });
 *
 * // Render a live activity feed
 * FJRealtime.renderFeed('#activity-feed', { limit: 10 });
 *
 * ============================================================
 */

(function(global) {
    'use strict';

    // ──────────────────────────────────────────────────────────────
    // 1. CONFIGURATION
    // ──────────────────────────────────────────────────────────────

    const CONFIG = {
        /** WebSocket URL */
        wsUrl: null,

        /** SSE endpoint URL */
        sseUrl: null,

        /** Polling endpoint URL */
        pollingUrl: null,

        /** Channels to subscribe to by default */
        defaultChannels: ['projects', 'messages', 'notifications', 'system'],

        /** Reconnect interval in milliseconds */
        reconnectInterval: 3000,

        /** Max reconnect attempts (0 = infinite) */
        maxReconnectAttempts: 10,

        /** Heartbeat interval in milliseconds */
        heartbeatInterval: 30000,

        /** Connection timeout in milliseconds */
        connectionTimeout: 10000,

        /** Enable debug logging */
        debug: false,

        /** Enable offline queueing */
        offlineQueue: true,

        /** Max queue size for offline messages */
        maxQueueSize: 100,

        /** Meituan-style dense mode for notifications */
        denseMode: true,

        /** Show live activity feed */
        showActivityFeed: true,

        /** Max feed items to keep in memory */
        maxFeedItems: 50,

        /** Notification duration in milliseconds */
        notificationDuration: 5000,

        /** Enable sound notifications */
        soundNotifications: false,

        /** Storage key for connection state */
        stateStorageKey: 'fj_realtime_state',
    };

    // ──────────────────────────────────────────────────────────────
    // 2. STATE
    // ──────────────────────────────────────────────────────────────

    /** Connection state */
    const state = {
        isConnected: false,
        isConnecting: false,
        reconnectAttempts: 0,
        lastMessageId: 0,
        channels: new Set(),
        subscriptions: new Map(),
        offlineQueue: [],
        feedItems: [],
        notificationCount: 0,
    };

    /** WebSocket instance */
    let ws = null;

    /** EventSource instance (SSE) */
    let eventSource = null;

    /** Heartbeat timer */
    let heartbeatTimer = null;

    /** Reconnect timer */
    let reconnectTimer = null;

    /** Connection timeout timer */
    let connectionTimeoutTimer = null;

    /** Unique message ID counter */
    let messageIdCounter = 0;

    /** Callbacks registry */
    const callbacks = {
        onConnect: null,
        onDisconnect: null,
        onMessage: null,
        onError: null,
        onReconnect: null,
        onNotification: null,
        onFeedUpdate: null,
    };

    /** Active event listeners */
    const eventListeners = new Map();

    /** DOM elements for live feed */
    let feedContainer = null;
    let feedItems = [];

    // ──────────────────────────────────────────────────────────────
    // 3. UTILITY FUNCTIONS
    // ──────────────────────────────────────────────────────────────

    /**
     * Log debug messages
     */
    function debugLog(...args) {
        if (CONFIG.debug) {
            console.log('[FJRealtime]', ...args);
        }
    }

    /**
     * Generate a unique message ID
     */
    function generateMessageId() {
        return ++messageIdCounter;
    }

    /**
     * Generate a unique ID
     */
    function generateId() {
        return 'fj-rt-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    }

    /**
     * Escape HTML entities
     */
    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Format time ago
     */
    function timeAgo(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        if (seconds < 60) return 'vor ' + seconds + 's';
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return 'vor ' + minutes + 'm';
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return 'vor ' + hours + 'h';
        const days = Math.floor(hours / 24);
        if (days < 7) return 'vor ' + days + 'd';
        return new Date(date).toLocaleDateString('de-DE');
    }

    /**
     * Check if the browser is online
     */
    function isOnline() {
        return navigator.onLine !== false;
    }

    /**
     * Save state to localStorage
     */
    function saveState() {
        try {
            const data = {
                lastMessageId: state.lastMessageId,
                channels: Array.from(state.channels),
                notificationCount: state.notificationCount,
            };
            localStorage.setItem(CONFIG.stateStorageKey, JSON.stringify(data));
        } catch (e) { /* ignore */ }
    }

    /**
     * Load state from localStorage
     */
    function loadState() {
        try {
            const stored = localStorage.getItem(CONFIG.stateStorageKey);
            if (stored) {
                const data = JSON.parse(stored);
                state.lastMessageId = data.lastMessageId || 0;
                state.notificationCount = data.notificationCount || 0;
                if (data.channels) {
                    data.channels.forEach(ch => state.channels.add(ch));
                }
            }
        } catch (e) { /* ignore */ }
    }

    /**
     * Play notification sound
     */
    function playNotificationSound() {
        if (!CONFIG.soundNotifications) return;
        try {
            const audio = new Audio('/sounds/notification.mp3');
            audio.volume = 0.3;
            audio.play().catch(() => {});
        } catch (e) { /* ignore */ }
    }

    // ──────────────────────────────────────────────────────────────
    // 4. CONNECTION MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    /**
     * Connect to the real-time server
     */
    function connect(options) {
        if (state.isConnected || state.isConnecting) {
            debugLog('Already connected or connecting');
            return;
        }

        state.isConnecting = true;
        debugLog('Connecting...');

        // Use WebSocket if available, otherwise fallback to SSE/polling
        const wsUrl = options?.wsUrl || CONFIG.wsUrl;
        if (wsUrl && window.WebSocket) {
            connectWebSocket(wsUrl);
        } else {
            // Fallback to SSE or polling
            const sseUrl = options?.sseUrl || CONFIG.sseUrl;
            if (sseUrl && window.EventSource) {
                connectSSE(sseUrl);
            } else {
                connectPolling(options?.pollingUrl || CONFIG.pollingUrl);
            }
        }

        // Set connection timeout
        connectionTimeoutTimer = setTimeout(() => {
            if (!state.isConnected) {
                debugLog('Connection timeout');
                handleDisconnect('timeout');
            }
        }, CONFIG.connectionTimeout);

        // Start heartbeat
        startHeartbeat();
    }

    /**
     * Connect via WebSocket
     */
    function connectWebSocket(url) {
        try {
            ws = new WebSocket(url);
            ws.binaryType = 'arraybuffer';

            ws.onopen = function() {
                handleConnect();
            };

            ws.onmessage = function(event) {
                handleMessage(event.data);
            };

            ws.onclose = function() {
                handleDisconnect('closed');
            };

            ws.onerror = function(error) {
                debugLog('WebSocket error:', error);
                if (callbacks.onError) {
                    callbacks.onError(error);
                }
            };
        } catch (e) {
            debugLog('WebSocket connection failed:', e);
            handleDisconnect('error');
        }
    }

    /**
     * Connect via Server-Sent Events
     */
    function connectSSE(url) {
        try {
            eventSource = new EventSource(url);

            eventSource.onopen = function() {
                handleConnect();
            };

            eventSource.onmessage = function(event) {
                try {
                    const data = JSON.parse(event.data);
                    handleMessage(data);
                } catch (e) {
                    debugLog('SSE parse error:', e);
                }
            };

            eventSource.onerror = function(error) {
                debugLog('SSE error:', error);
                if (eventSource.readyState === EventSource.CLOSED) {
                    handleDisconnect('closed');
                }
            };
        } catch (e) {
            debugLog('SSE connection failed:', e);
            handleDisconnect('error');
        }
    }

    /**
     * Connect via long-polling
     */
    function connectPolling(url) {
        debugLog('Using long-polling fallback');
        // Polling implementation - set up interval
        const pollInterval = setInterval(() => {
            if (!isOnline() || !url) {
                return;
            }
            fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
            })
                .then(response => response.json())
                .then(data => {
                    if (data && data.messages) {
                        data.messages.forEach(msg => handleMessage(msg));
                    }
                })
                .catch(() => {});
        }, 5000);
        // Store for cleanup
        state._pollInterval = pollInterval;
        // Assume connected after first poll
        setTimeout(handleConnect, 100);
    }

    /**
     * Handle successful connection
     */
    function handleConnect() {
        state.isConnected = true;
        state.isConnecting = false;
        state.reconnectAttempts = 0;

        if (connectionTimeoutTimer) {
            clearTimeout(connectionTimeoutTimer);
            connectionTimeoutTimer = null;
        }

        // Subscribe to default channels
        CONFIG.defaultChannels.forEach(ch => {
            subscribe(ch);
        });

        // Process offline queue
        processOfflineQueue();

        // Trigger callback
        if (callbacks.onConnect) {
            callbacks.onConnect();
        }

        // Update UI
        updateConnectionStatus(true);

        debugLog('Connected successfully');
    }

    /**
     * Handle disconnection
     */
    function handleDisconnect(reason) {
        state.isConnected = false;
        state.isConnecting = false;

        if (connectionTimeoutTimer) {
            clearTimeout(connectionTimeoutTimer);
            connectionTimeoutTimer = null;
        }

        // Clean up WebSocket
        if (ws) {
            try {
                ws.close();
            } catch (e) {}
            ws = null;
        }

        // Clean up SSE
        if (eventSource) {
            try {
                eventSource.close();
            } catch (e) {}
            eventSource = null;
        }

        // Clean up polling
        if (state._pollInterval) {
            clearInterval(state._pollInterval);
            state._pollInterval = null;
        }

        // Stop heartbeat
        stopHeartbeat();

        // Trigger callback
        if (callbacks.onDisconnect) {
            callbacks.onDisconnect(reason);
        }

        // Update UI
        updateConnectionStatus(false);

        debugLog('Disconnected:', reason);

        // Attempt reconnect
        scheduleReconnect();
    }

    /**
     * Schedule reconnection
     */
    function scheduleReconnect() {
        if (reconnectTimer) return;

        if (CONFIG.maxReconnectAttempts > 0 &&
            state.reconnectAttempts >= CONFIG.maxReconnectAttempts) {
            debugLog('Max reconnect attempts reached');
            return;
        }

        state.reconnectAttempts++;
        const delay = CONFIG.reconnectInterval * Math.min(state.reconnectAttempts, 5);

        debugLog('Reconnecting in ' + delay + 'ms (attempt ' + state.reconnectAttempts + ')');

        reconnectTimer = setTimeout(() => {
            reconnectTimer = null;
            if (!state.isConnected && isOnline()) {
                connect();
                if (callbacks.onReconnect) {
                    callbacks.onReconnect(state.reconnectAttempts);
                }
            }
        }, delay);
    }

    /**
     * Start heartbeat
     */
    function startHeartbeat() {
        if (heartbeatTimer) return;
        heartbeatTimer = setInterval(() => {
            if (state.isConnected && ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(JSON.stringify({
                        type: 'heartbeat',
                        timestamp: Date.now(),
                    }));
                } catch (e) {}
            }
        }, CONFIG.heartbeatInterval);
    }

    /**
     * Stop heartbeat
     */
    function stopHeartbeat() {
        if (heartbeatTimer) {
            clearInterval(heartbeatTimer);
            heartbeatTimer = null;
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 5. MESSAGE HANDLING
    // ──────────────────────────────────────────────────────────────

    /**
     * Handle incoming message
     */
    function handleMessage(data) {
        // If data is a string, try to parse JSON
        if (typeof data === 'string') {
            try {
                data = JSON.parse(data);
            } catch (e) {
                debugLog('Invalid JSON message:', data);
                return;
            }
        }

        // Increment message ID
        state.lastMessageId++;

        // Extract event type
        const eventType = data.type || data.event || 'message';
        const payload = data.payload || data.data || data;

        // Trigger global message callback
        if (callbacks.onMessage) {
            callbacks.onMessage(eventType, payload);
        }

        // Route to channel subscriptions
        const channel = data.channel || data.topic || 'system';
        const subscribers = state.subscriptions.get(channel) || [];
        subscribers.forEach(callback => {
            try {
                callback(payload, eventType);
            } catch (e) {
                debugLog('Subscriber error:', e);
            }
        });

        // Route to general subscriptions (wildcard)
        const wildcardSubscribers = state.subscriptions.get('*') || [];
        wildcardSubscribers.forEach(callback => {
            try {
                callback(data, eventType);
            } catch (e) {
                debugLog('Wildcard subscriber error:', e);
            }
        });

        // Handle specific event types
        switch (eventType) {
            case 'notification':
                handleNotification(payload);
                break;
            case 'project_update':
                handleProjectUpdate(payload);
                break;
            case 'message':
                handleMessageEvent(payload);
                break;
            case 'system':
                handleSystemEvent(payload);
                break;
        }

        // Add to feed
        addToFeed(data);

        // Save state
        saveState();
    }

    /**
     * Handle notification event
     */
    function handleNotification(payload) {
        state.notificationCount++;
        updateNotificationBadge(state.notificationCount);

        // Show toast notification
        showToastNotification(payload);

        // Play sound
        playNotificationSound();

        // Trigger callback
        if (callbacks.onNotification) {
            callbacks.onNotification(payload);
        }
    }

    /**
     * Handle project update event
     */
    function handleProjectUpdate(payload) {
        // Update project list in UI if applicable
        const projectId = payload.id || payload.projectId;
        if (projectId) {
            // Find and update project card
            const projectCard = document.querySelector(`[data-project-id="${projectId}"]`);
            if (projectCard) {
                // Update status, progress, etc.
                if (payload.status) {
                    const statusEl = projectCard.querySelector('.project-status');
                    if (statusEl) {
                        statusEl.textContent = payload.status;
                        statusEl.className = 'project-status status-' + payload.status;
                    }
                }
                if (payload.progress !== undefined) {
                    const progressEl = projectCard.querySelector('.project-progress-fill');
                    if (progressEl) {
                        progressEl.style.width = payload.progress + '%';
                        progressEl.setAttribute('aria-valuenow', payload.progress);
                    }
                    const progressText = projectCard.querySelector('.project-progress-text');
                    if (progressText) {
                        progressText.textContent = payload.progress + '%';
                    }
                }
                // Highlight card
                projectCard.classList.add('fj-updated');
                setTimeout(() => {
                    projectCard.classList.remove('fj-updated');
                }, 2000);
            }
        }
    }

    /**
     * Handle message event (chat)
     */
    function handleMessageEvent(payload) {
        // Update chat UI
        const messageContainer = document.querySelector('.fj-chat-messages');
        if (messageContainer) {
            const messageEl = document.createElement('div');
            messageEl.className = 'fj-message fj-message-received';
            messageEl.innerHTML = `
                <div class="fj-message-avatar">
                    <img src="${payload.avatar || '/images/default-avatar.png'}" alt="${payload.sender || 'User'}" />
                </div>
                <div class="fj-message-content">
                    <div class="fj-message-header">
                        <span class="fj-message-sender">${escapeHtml(payload.sender || 'Unbekannt')}</span>
                        <span class="fj-message-time">${timeAgo(payload.timestamp || Date.now())}</span>
                    </div>
                    <div class="fj-message-text">${escapeHtml(payload.text || '')}</div>
                </div>
            `;
            messageContainer.appendChild(messageEl);
            messageContainer.scrollTop = messageContainer.scrollHeight;

            // Update unread count
            const unreadBadge = document.querySelector('.fj-chat-unread');
            if (unreadBadge) {
                const count = parseInt(unreadBadge.textContent) || 0;
                unreadBadge.textContent = count + 1;
                unreadBadge.style.display = 'inline';
            }
        }
    }

    /**
     * Handle system event
     */
    function handleSystemEvent(payload) {
        // System-level events (maintenance, updates, etc.)
        if (payload.type === 'maintenance') {
            const banner = document.createElement('div');
            banner.className = 'fj-system-banner';
            banner.innerHTML = `
                <i class="fas fa-info-circle"></i>
                <span>${escapeHtml(payload.message || 'Wartungsarbeiten demnächst.')}</span>
                <button class="fj-banner-close"><i class="fas fa-times"></i></button>
            `;
            document.body.prepend(banner);
            banner.querySelector('.fj-banner-close').addEventListener('click', () => {
                banner.remove();
            });
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 6. NOTIFICATIONS & TOASTS (Meituan-style)
    // ──────────────────────────────────────────────────────────────

    /**
     * Show a toast notification (Meituan-style dense)
     */
    function showToastNotification(payload) {
        const container = document.querySelector('.fj-toast-container') || createToastContainer();

        const toast = document.createElement('div');
        toast.className = 'fj-toast fj-toast-' + (payload.type || 'info');

        const iconMap = {
            info: 'fa-info-circle',
            success: 'fa-check-circle',
            warning: 'fa-exclamation-triangle',
            error: 'fa-times-circle',
            message: 'fa-envelope',
            project: 'fa-project-diagram',
        };

        const icon = iconMap[payload.type] || iconMap.info;

        toast.innerHTML = `
            <div class="fj-toast-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="fj-toast-content">
                <div class="fj-toast-title">${escapeHtml(payload.title || 'Benachrichtigung')}</div>
                <div class="fj-toast-message">${escapeHtml(payload.message || payload.body || '')}</div>
                <div class="fj-toast-time">${timeAgo(payload.timestamp || Date.now())}</div>
            </div>
            <button class="fj-toast-close"><i class="fas fa-times"></i></button>
        `;

        // Click to dismiss
        toast.querySelector('.fj-toast-close').addEventListener('click', () => {
            toast.remove();
        });

        // Auto-dismiss after duration
        const duration = payload.duration || CONFIG.notificationDuration;
        setTimeout(() => {
            toast.classList.add('fj-toast-hide');
            setTimeout(() => toast.remove(), 300);
        }, duration);

        container.appendChild(toast);

        // Play sound
        if (CONFIG.soundNotifications) {
            playNotificationSound();
        }
    }

    /**
     * Create toast container if not exists
     */
    function createToastContainer() {
        let container = document.querySelector('.fj-toast-container');
        if (!container) {
            container = document.createElement('div');
            container.className = 'fj-toast-container';
            document.body.appendChild(container);
        }
        return container;
    }

    /**
     * Update notification badge count
     */
    function updateNotificationBadge(count) {
        const badges = document.querySelectorAll('.fj-notification-dot, .fj-badge-notification');
        badges.forEach(badge => {
            if (count > 0) {
                badge.textContent = count > 9 ? '9+' : count;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        });
    }

    // ──────────────────────────────────────────────────────────────
    // 7. ACTIVITY FEED (Meituan-style dense feed)
    // ──────────────────────────────────────────────────────────────

    /**
     * Add an item to the activity feed
     */
    function addToFeed(data) {
        const item = {
            id: data.id || generateId(),
            type: data.type || data.event || 'activity',
            title: data.title || data.message || 'Update',
            message: data.message || data.body || '',
            timestamp: data.timestamp || Date.now(),
            channel: data.channel || data.topic || 'system',
            payload: data,
        };

        state.feedItems.unshift(item);
        if (state.feedItems.length > CONFIG.maxFeedItems) {
            state.feedItems.pop();
        }

        // Render feed if container exists
        renderFeed();

        // Trigger callback
        if (callbacks.onFeedUpdate) {
            callbacks.onFeedUpdate(item);
        }
    }

    /**
     * Render the activity feed
     */
    function renderFeed(container, options) {
        const targetContainer = container || feedContainer;
        if (!targetContainer) return;

        const limit = options?.limit || 10;
        const items = state.feedItems.slice(0, limit);

        // If no items, show empty state
        if (items.length === 0) {
            targetContainer.innerHTML = `
                <div class="fj-feed-empty">
                    <i class="fas fa-rss"></i>
                    <span>Keine Aktivitäten</span>
                </div>
            `;
            return;
        }

        // Build HTML with dense Meituan-style
        let html = '';
        items.forEach(item => {
            const iconMap = {
                notification: 'fa-bell',
                project: 'fa-project-diagram',
                message: 'fa-envelope',
                system: 'fa-cog',
                user: 'fa-user',
                booking: 'fa-calendar-check',
                payment: 'fa-credit-card',
            };
            const icon = iconMap[item.type] || 'fa-circle';

            html += `
                <div class="fj-feed-item" data-feed-id="${item.id}">
                    <div class="fj-feed-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="fj-feed-content">
                        <div class="fj-feed-title">${escapeHtml(item.title)}</div>
                        ${item.message ? `<div class="fj-feed-message">${escapeHtml(item.message)}</div>` : ''}
                        <div class="fj-feed-meta">
                            <span class="fj-feed-channel">${escapeHtml(item.channel)}</span>
                            <span class="fj-feed-time">${timeAgo(item.timestamp)}</span>
                        </div>
                    </div>
                </div>
            `;
        });

        targetContainer.innerHTML = html;
    }

    /**
     * Set feed container
     */
    function setFeedContainer(selector) {
        feedContainer = typeof selector === 'string' ?
            document.querySelector(selector) :
            selector;
        return feedContainer;
    }

    // ──────────────────────────────────────────────────────────────
    // 8. OFFLINE QUEUE
    // ──────────────────────────────────────────────────────────────

    /**
     * Queue a message for offline sending
     */
    function queueOfflineMessage(message) {
        if (!CONFIG.offlineQueue) return;

        state.offlineQueue.push({
            message: message,
            timestamp: Date.now(),
            attempts: 0,
        });

        if (state.offlineQueue.length > CONFIG.maxQueueSize) {
            state.offlineQueue.shift();
        }
    }

    /**
     * Process offline queue when reconnected
     */
    function processOfflineQueue() {
        if (state.offlineQueue.length === 0) return;

        debugLog('Processing offline queue, ' + state.offlineQueue.length + ' messages');

        const queue = [...state.offlineQueue];
        state.offlineQueue = [];

        queue.forEach(item => {
            sendMessage(item.message)
                .catch(() => {
                    // Re-queue if failed
                    if (item.attempts < 3) {
                        item.attempts++;
                        state.offlineQueue.push(item);
                    }
                });
        });
    }

    // ──────────────────────────────────────────────────────────────
    // 9. SEND MESSAGE
    // ──────────────────────────────────────────────────────────────

    /**
     * Send a message to the server
     */
    function sendMessage(message) {
        return new Promise((resolve, reject) => {
            if (!state.isConnected) {
                if (CONFIG.offlineQueue) {
                    queueOfflineMessage(message);
                    resolve({ queued: true });
                } else {
                    reject(new Error('Not connected'));
                }
                return;
            }

            const msg = {
                id: generateMessageId(),
                timestamp: Date.now(),
                ...message,
            };

            if (ws && ws.readyState === WebSocket.OPEN) {
                try {
                    ws.send(JSON.stringify(msg));
                    resolve({ sent: true, id: msg.id });
                } catch (e) {
                    reject(e);
                }
            } else if (eventSource) {
                // SSE doesn't support sending, use POST
                const url = CONFIG.sseUrl || '/api/events';
                fetch(url, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(msg),
                })
                    .then(res => res.json())
                    .then(data => resolve(data))
                    .catch(reject);
            } else {
                reject(new Error('No active connection'));
            }
        });
    }

    // ──────────────────────────────────────────────────────────────
    // 10. SUBSCRIPTION MANAGEMENT
    // ──────────────────────────────────────────────────────────────

    /**
     * Subscribe to a channel
     */
    function subscribe(channel, callback) {
        state.channels.add(channel);

        if (callback) {
            if (!state.subscriptions.has(channel)) {
                state.subscriptions.set(channel, []);
            }
            state.subscriptions.get(channel).push(callback);
        }

        // Send subscription message if connected
        if (state.isConnected) {
            sendMessage({
                type: 'subscribe',
                channel: channel,
            }).catch(() => {});
        }

        return {
            unsubscribe: () => unsubscribe(channel, callback),
        };
    }

    /**
     * Unsubscribe from a channel
     */
    function unsubscribe(channel, callback) {
        const subscribers = state.subscriptions.get(channel);
        if (subscribers) {
            if (callback) {
                const index = subscribers.indexOf(callback);
                if (index !== -1) {
                    subscribers.splice(index, 1);
                }
            } else {
                state.subscriptions.delete(channel);
            }
        }

        // If no more subscribers, unsubscribe from server
        if (!state.subscriptions.has(channel) || state.subscriptions.get(channel).length === 0) {
            state.channels.delete(channel);
            if (state.isConnected) {
                sendMessage({
                    type: 'unsubscribe',
                    channel: channel,
                }).catch(() => {});
            }
        }
    }

    /**
     * Register a global event listener
     */
    function on(event, callback) {
        if (!eventListeners.has(event)) {
            eventListeners.set(event, []);
        }
        eventListeners.get(event).push(callback);
        return () => off(event, callback);
    }

    /**
     * Remove a global event listener
     */
    function off(event, callback) {
        const listeners = eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index !== -1) {
                listeners.splice(index, 1);
            }
        }
    }

    /**
     * Trigger a global event
     */
    function trigger(event, data) {
        const listeners = eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (e) {
                    debugLog('Event handler error:', e);
                }
            });
        }
    }

    // ──────────────────────────────────────────────────────────────
    // 11. UI UPDATES (Connection status)
    // ──────────────────────────────────────────────────────────────

    /**
     * Update connection status UI
     */
    function updateConnectionStatus(connected) {
        const statusElements = document.querySelectorAll('.fj-connection-status');
        statusElements.forEach(el => {
            if (connected) {
                el.classList.add('is-connected');
                el.classList.remove('is-disconnected');
                el.innerHTML = '<span class="fj-status-dot"></span> Verbunden';
            } else {
                el.classList.add('is-disconnected');
                el.classList.remove('is-connected');
                el.innerHTML = '<span class="fj-status-dot"></span> Verbindung getrennt';
            }
        });
    }

    // ──────────────────────────────────────────────────────────────
    // 12. PUBLIC API
    // ──────────────────────────────────────────────────────────────

    const FJRealtime = {
        // Core
        init: function(options) {
            if (options) {
                if (options.wsUrl) CONFIG.wsUrl = options.wsUrl;
                if (options.sseUrl) CONFIG.sseUrl = options.sseUrl;
                if (options.pollingUrl) CONFIG.pollingUrl = options.pollingUrl;
                if (options.channels) CONFIG.defaultChannels = options.channels;
                if (options.debug !== undefined) CONFIG.debug = options.debug;
                if (options.onConnect) callbacks.onConnect = options.onConnect;
                if (options.onDisconnect) callbacks.onDisconnect = options.onDisconnect;
                if (options.onMessage) callbacks.onMessage = options.onMessage;
                if (options.onError) callbacks.onError = options.onError;
                if (options.onReconnect) callbacks.onReconnect = options.onReconnect;
                if (options.onNotification) callbacks.onNotification = options.onNotification;
                if (options.onFeedUpdate) callbacks.onFeedUpdate = options.onFeedUpdate;
            }

            loadState();
            connect();
            return this;
        },

        connect: connect,
        disconnect: function() {
            if (reconnectTimer) {
                clearTimeout(reconnectTimer);
                reconnectTimer = null;
            }
            handleDisconnect('manual');
            return this;
        },

        send: sendMessage,

        subscribe: subscribe,
        unsubscribe: unsubscribe,

        on: on,
        off: off,
        trigger: trigger,

        // Feed
        renderFeed: function(container, options) {
            const target = typeof container === 'string' ?
                document.querySelector(container) :
                container;
            if (target) {
                setFeedContainer(target);
                renderFeed(target, options);
            }
            return this;
        },

        setFeedContainer: setFeedContainer,

        addFeedItem: function(data) {
            addToFeed(data);
            return this;
        },

        getFeed: function() {
            return [...state.feedItems];
        },

        // Notifications
        showNotification: showToastNotification,

        getNotificationCount: function() {
            return state.notificationCount;
        },

        clearNotifications: function() {
            state.notificationCount = 0;
            updateNotificationBadge(0);
            saveState();
            return this;
        },

        // Status
        isConnected: function() {
            return state.isConnected;
        },

        getState: function() {
            return {
                isConnected: state.isConnected,
                isConnecting: state.isConnecting,
                reconnectAttempts: state.reconnectAttempts,
                channels: Array.from(state.channels),
                feedItems: state.feedItems.length,
                notificationCount: state.notificationCount,
                queueSize: state.offlineQueue.length,
            };
        },

        // Configuration
        configure: function(options) {
            Object.assign(CONFIG, options);
            return this;
        },

        getConfig: function() {
            return { ...CONFIG };
        },

        // Version
        version: '1.0.0',

        // Debug
        debug: CONFIG.debug,
    };

    // ──────────────────────────────────────────────────────────────
    // 13. EXPOSE TO GLOBAL
    // ──────────────────────────────────────────────────────────────

    global.FJRealtime = FJRealtime;

    if (typeof module !== 'undefined' && module.exports) {
        module.exports = FJRealtime;
    }

    // ──────────────────────────────────────────────────────────────
    // 14. MEITUAN-STYLE CONSOLE BANNER
    // ──────────────────────────────────────────────────────────────

    console.log('%c📡 FIXJORI Real-Time Engine v' + FJRealtime.version,
        'font-size:16px;font-weight:bold;color:#0D9488;');

    console.log('%c📊 Meituan-Style · Dense · Information-Rich · Live Updates',
        'font-size:12px;color:#94A3B8;');

    console.log('%c⚡ ' + (CONFIG.wsUrl ? 'WebSocket enabled' : 'WebSocket not configured') +
        ' | ' + (CONFIG.offlineQueue ? 'Offline Queue ON' : 'Offline Queue OFF') +
        ' | ' + (CONFIG.soundNotifications ? 'Sound ON' : 'Sound OFF'),
        'font-size:11px;color:#64748B;');

    debugLog('Real-time engine ready. Use FJRealtime.init() to start.');

    // ──────────────────────────────────────────────────────────────
    // END OF REALTIME
    // ──────────────────────────────────────────────────────────────

})(typeof window !== 'undefined' ? window : this);