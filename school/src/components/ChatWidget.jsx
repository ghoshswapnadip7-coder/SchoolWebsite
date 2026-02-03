import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext'; 
import { API_URL } from '../config';
import { MessageCircle, X, Send, Users, Shield, Maximize2, Minimize2, Pin, Trash2, MoreVertical, Paperclip } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

const socket = io(API_URL.replace('/api', ''), {
    autoConnect: false,
    withCredentials: true
});

const ChatWidget = () => {
    const { user } = useAuth();
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [activeRoom, setActiveRoom] = useState('');
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState('');
    const [availableRooms, setAvailableRooms] = useState([]);
    const [isRoomDisabled, setIsRoomDisabled] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [isHovered, setIsHovered] = useState(false);

    const messagesEndRef = useRef(null);
    const chatContainerRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Prevent background scrolling when chat is full screen or mobile
    useEffect(() => {
        if (isOpen && (isMobile || isExpanded)) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen, isMobile, isExpanded]);

    useEffect(() => {
        if (user) {
            socket.on('connect', () => { /* console.log('Connected to socket') */ });
            socket.connect();
            
            let rooms = [];
            if (user.role === 'STUDENT') {
                rooms.push({ id: user.class, name: user.class, type: 'CLASS' });
                setActiveRoom(user.class);
            } else if (user.role?.toUpperCase() === 'TEACHER' || user.role === 'ADMIN') {
                rooms.push({ id: 'Teachers', name: 'Teachers Lounge', type: 'STAFF' });
                ['Class-10', 'Class-11', 'Class-12'].forEach(c => rooms.push({ id: c, name: c, type: 'CLASS' }));
                setActiveRoom('Teachers'); 
            }
            setAvailableRooms(rooms);
        }

        return () => {
            socket.disconnect();
        };
    }, [user]);

    useEffect(() => {
        if (!activeRoom) return;
        
        const joinRoom = () => socket.emit('join_room', activeRoom);
        
        // Initial join
        if (socket.connected) {
            joinRoom();
        } else {
            socket.on('connect', joinRoom);
        }
        
        const fetchRoomData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                const resHist = await fetch(`${API_URL}/chat/history/${activeRoom}`, {
                     headers: { Authorization: `Bearer ${token}` }
                });
                if (resHist.ok) {
                    const data = await resHist.json();
                    setMessages(data.map(m => ({
                        id: m._id,
                        room: m.room,
                        author: m.senderName || 'Unknown',
                        authorId: m.sender,
                        authorRole: m.senderRole,
                        message: m.content,
                        type: m.type,
                        isPinned: m.isPinned,
                        time: new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                    })));
                }

                const resStatus = await fetch(`${API_URL}/chat/status/${activeRoom}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (resStatus.ok) {
                    const statusData = await resStatus.json();
                    setIsRoomDisabled(statusData.isDisabled);
                }

            } catch (err) { /* console.error("Failed to load chat data", err); */ }
        };

        fetchRoomData();

        const handleReceiveMessage = (data) => {
            console.log("Msg received", data);
            // Ignore own messages to prevent duplication (handled optimistically)
            if (data.authorId === (user.id || user._id)) return;
            setMessages((list) => [...list, data]);
        };

        // Ensure we listen for messages
        socket.on('receive_message', handleReceiveMessage);
        
        socket.on('room_status_update', (data) => {
            if (data.room === activeRoom) setIsRoomDisabled(data.isDisabled);
        });
        socket.on('message_flagged', (data) => alert(data.message));
        socket.on('message_deleted', (data) => {
            setMessages(prev => prev.filter(m => m.id !== data.messageId));
        });

        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);

        return () => {
             // Cleanup listeners
             socket.off('connect', joinRoom);
             socket.off('receive_message', handleReceiveMessage);
             socket.off('room_status_update');
             socket.off('message_flagged');
             socket.off('message_deleted');
             window.removeEventListener('open-chat', handleOpenChat);
        };
    }, [activeRoom]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isOpen]);

    const sendMessage = async () => {
        if (currentMessage.trim() !== "" && !isRoomDisabled) {
            const tempId = `temp-${Date.now()}`;
            const messageData = {
                room: activeRoom,
                author: user.name || user.email || 'Unknown',
                authorId: user.id || user._id, 
                message: currentMessage,
                type: 'TEXT',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: tempId,
                authorRole: user.role?.toUpperCase() || 'STUDENT'
            };

            setMessages((list) => [...list, messageData]);
            setCurrentMessage("");

            socket.emit('send_message', messageData, (serverData) => {
                if (serverData && serverData.id) {
                    setMessages((list) => list.map(msg => 
                        msg.id === tempId ? { ...msg, ...serverData } : msg
                    ));
                }
            });
        }
    };

    const toggleRoomStatus = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/toggle`, {
               method: 'POST',
               headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
               body: JSON.stringify({ room: activeRoom })
           });
           
           if (res.ok) {
               const data = await res.json();
               setIsRoomDisabled(data.isDisabled);
           }
       } catch (err) { alert("Failed to toggle"); }
    };

    const togglePin = async (messageId) => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/pin`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ messageId })
            });

            if (res.ok) {
                const updatedMsg = await res.json();
                setMessages(prev => prev.map(m => m.id === updatedMsg._id ? { ...m, isPinned: updatedMsg.isPinned } : m));
            }
        } catch (err) { /* console.error("Failed to pin", err); */ }
    };

    const deleteMessage = async (msgId) => {
        if (!window.confirm("Delete this message?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ messageId: msgId })
            });
            if (!res.ok) alert("Failed to delete.");
        } catch (err) { /* console.error("Failed to delete", err); */ }
    };

    const formatMessage = (text) => {
        if (!text) return null;
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.match(/^@\w+$/)) {
                return <span key={i} className="mention">{part}</span>;
            }
            return part;
        });
    };

    if (!user) return null;

    const pinnedMessages = messages.filter(m => m.isPinned);

    return (
        <div style={{ zIndex: 9999 }}>
            
            <style>{`
                @keyframes slideInUp {
                    from { transform: translateY(20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes pulse-soft {
                    0% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0.4); }
                    70% { box-shadow: 0 0 0 10px rgba(37, 99, 235, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(37, 99, 235, 0); }
                }

                .chat-container {
                    animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                }

                .message-enter {
                    animation: slideInUp 0.3s ease-out forwards;
                }

                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent; 
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(156, 163, 175, 0.5); 
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(156, 163, 175, 0.8); 
                }

                .mention {
                    color: #bae6fd;
                    font-weight: 700;
                    background: rgba(37, 99, 235, 0.2);
                    padding: 0 4px;
                    border-radius: 4px;
                }
                
                .message-bubble {
                    position: relative;
                    transition: transform 0.2s;
                }
                .message-bubble:hover {
                    transform: translateY(-1px);
                }
                
                .room-btn {
                    transition: all 0.2s;
                }
                .room-btn:hover {
                    transform: translateY(-2px);
                }

                /* Mobile Optimization */
                @media (max-width: 768px) {
                    .chat-header-title {
                        max-width: 120px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                    }
                }
            `}</style>

            {/* Main Chat Window */}
            {isOpen && (
                <div 
                    ref={chatContainerRef}
                    className="chat-container"
                    style={{ 
                        position: 'fixed',
                        top: isExpanded || isMobile ? '0' : 'auto',
                        bottom: isExpanded ? '0' : (isMobile ? '0' : '25px'),
                        right: isExpanded ? '0' : (isMobile ? '0' : '30px'),
                        left: isExpanded || isMobile ? '0' : 'auto',
                        width: isExpanded || isMobile ? '100vw' : '380px',
                        height: isExpanded || isMobile ? '100vh' : 'min(650px, calc(100vh - 60px))',
                        maxHeight: '100vh', 
                        background: theme === 'dark' ? 'rgba(15, 23, 42, 0.98)' : 'rgba(255, 255, 255, 0.98)',
                        borderRadius: isExpanded || isMobile ? '0' : '24px',
                        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                        display: 'flex', flexDirection: 'column',
                        overflow: 'hidden',
                        border: isExpanded || isMobile ? 'none' : '1px solid var(--border-color)',
                        zIndex: 100000 
                    }}
                >
                    {/* Header */}
                    <div style={{ 
                        padding: '12px 16px', 
                        background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)',
                        color: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                        zIndex: 20
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '10px', background: 'rgba(255,255,255,0.2)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                backdropFilter: 'blur(4px)', flexShrink: 0
                            }}>
                                <Users size={20} fill="white" fillOpacity={0.5} />
                            </div>
                            <div style={{ overflow: 'hidden' }}>
                                <h3 className="chat-header-title" style={{ margin: 0, fontSize: '0.95rem', fontWeight: 700, letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                                    {activeRoom === 'Teachers' ? 'Staff Lounge' : activeRoom}
                                </h3>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={{ 
                                        width: '6px', height: '6px', borderRadius: '50%', 
                                        background: isRoomDisabled ? '#ef4444' : '#22c55e',
                                        boxShadow: isRoomDisabled ? '0 0 6px #ef4444' : '0 0 6px #22c55e'
                                    }}></span>
                                    <span style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: 500 }}>
                                        {isRoomDisabled ? 'ReadOnly' : 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0 }}>
                            {user.role === 'ADMIN' && (
                                <button 
                                    onClick={toggleRoomStatus}
                                    style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '8px', transition: 'background 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    title={isRoomDisabled ? "Enable Chat" : "Disable Chat"}
                                >
                                    {isRoomDisabled ? <Shield size={16} fill="currentColor" /> : <Shield size={16} />}
                                </button>
                            )}
                            
                            {!isMobile && (
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', opacity: 0.8, hover: { opacity: 1 }, display: 'flex' }}
                                >
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                            )}

                            <button 
                                onClick={() => setIsOpen(false)} 
                                style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white', cursor: 'pointer', padding: '8px', borderRadius: '50%', marginLeft: '4px', display: 'flex' }}
                            >
                                <X size={18} />
                            </button>
                        </div>
                    </div>

                    {/* Room Selector Pills */}
                    {(user.role?.toUpperCase() === 'TEACHER' || user.role === 'ADMIN') && (
                        <div style={{ 
                            padding: '10px 12px', 
                            display: 'flex', gap: '8px', overflowX: 'auto', 
                            background: theme === 'dark' ? 'rgba(0,0,0,0.3)' : 'rgba(241, 245, 249, 0.95)',
                            borderBottom: '1px solid var(--border-color)',
                            scrollbarWidth: 'none',
                            zIndex: 15
                        }}>
                             {availableRooms.map(room => (
                                 <button 
                                    key={room.id}
                                    onClick={() => { setActiveRoom(room.id); setMessages([]); }} 
                                    className="room-btn"
                                    style={{ 
                                        padding: '6px 14px', borderRadius: '20px',
                                        background: activeRoom === room.id ? 'var(--primary)' : 'var(--surface)',
                                        color: activeRoom === room.id ? 'var(--background)' : 'var(--text-muted)',
                                        border: activeRoom === room.id ? 'none' : '1px solid var(--border-color)',
                                        fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer',
                                        fontWeight: activeRoom === room.id ? 700 : 500,
                                        boxShadow: activeRoom === room.id ? '0 2px 5px rgba(0,0,0,0.2)' : 'none',
                                        flexShrink: 0
                                    }}
                                 >
                                     {room.name}
                                 </button>
                             ))}
                        </div>
                    )}

                    {/* Pinned Messages */}
                    {pinnedMessages.length > 0 && (
                        <div style={{ 
                            background: 'rgba(234, 179, 8, 0.1)', 
                            borderLeft: '4px solid #eab308',
                            padding: '8px 12px',
                            fontSize: '0.8rem',
                            display: 'flex', alignItems: 'center', gap: '10px',
                            backdropFilter: 'blur(5px)',
                            zIndex: 15
                        }}>
                            <Pin size={14} color="#eab308" fill="#eab308" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontWeight: 500, color: 'var(--text-main)' }}>
                                {pinnedMessages[pinnedMessages.length - 1].message}
                            </div>
                        </div>
                    )}

                    {/* Chat Area - New Background */}
                    <div className="custom-scrollbar" style={{ 
                        flex: 1, padding: '16px', overflowY: 'auto', 
                        display: 'flex', flexDirection: 'column', gap: '14px',
                        // New Vector Pattern Background
                        backgroundImage: theme === 'dark' 
                            ? `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2364748b' fill-opacity='0.07' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`
                            : `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%239ca3af' fill-opacity='0.1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
                        zIndex: 10
                    }}>
                        {messages.length === 0 && (
                            <div style={{ margin: 'auto', textAlign: 'center', opacity: 0.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                                <MessageCircle size={48} strokeWidth={1} />
                                <p>Start the conversation</p>
                            </div>
                        )}
                        
                        {messages.map((msg, idx) => {
                             const isMe = msg.authorId === (user.id || user._id);
                             const isStaff = msg.authorRole === 'TEACHER' || msg.authorRole === 'ADMIN';
                             const showName = !isMe && (idx === 0 || messages[idx-1].authorId !== msg.authorId);
                             
                             return (
                                 <div key={idx} className="message-enter" style={{ 
                                     alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                     maxWidth: '85%',
                                     display: 'flex', flexDirection: 'column',
                                     alignItems: isMe ? 'flex-end' : 'flex-start'
                                 }}>
                                     {showName && (
                                         <div style={{ 
                                             fontSize: '0.7rem', 
                                             color: msg.authorRole === 'ADMIN' ? '#ef4444' : (msg.authorRole === 'TEACHER' ? '#22c55e' : 'var(--text-muted)'), 
                                             fontWeight: 700,
                                             marginBottom: '4px', marginLeft: '12px',
                                             display: 'flex', alignItems: 'center', gap: '4px',
                                             textShadow: msg.authorRole === 'TEACHER' ? '0 0 10px rgba(34, 197, 94, 0.6)' : 'none'
                                         }}>
                                             {msg.authorRole === 'ADMIN' && <Shield size={10} />}
                                             {msg.author.split(' ')[0]}
                                         </div>
                                     )}
                                     
                                     <div className="message-bubble" style={{ 
                                         padding: '8px 14px', 
                                         borderRadius: '16px', 
                                         borderTopRightRadius: isMe ? '2px' : '16px',
                                         borderTopLeftRadius: !isMe ? '2px' : '16px',
                                         background: isMe 
                                            ? 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)' 
                                            : (msg.isPinned ? '#fffbeb' : 'var(--surface)'),
                                         color: isMe ? 'white' : 'var(--text-main)',
                                         boxShadow: isMe ? '0 4px 15px -3px rgba(59, 130, 246, 0.4)' : '0 2px 5px rgba(0,0,0,0.05)',
                                         border: isMe ? 'none' : '1px solid var(--border-color)',
                                         fontSize: '0.9rem',
                                         lineHeight: 1.4,
                                         wordBreak: 'break-word'
                                     }}>
                                         {formatMessage(msg.message)}
                                         
                                         {/* Message Meta & Actions */}
                                         <div style={{ 
                                             fontSize: '0.65rem', 
                                             color: isMe ? 'rgba(255,255,255,0.7)' : 'var(--text-muted)', 
                                             textAlign: 'right', 
                                             marginTop: '2px',
                                             display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '6px'
                                         }}>
                                             {msg.time}
                                             {(user.role === 'ADMIN' || user.role === 'TEACHER') && msg.id && (
                                                <div style={{ display: 'flex', gap: '6px', marginLeft: '6px', opacity: 0.8 }}>
                                                    <button onClick={() => togglePin(msg.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                                        <Pin size={10} color={isMe ? 'white' : 'var(--text-muted)'} fill={msg.isPinned ? 'currentColor' : 'none'} />
                                                    </button>
                                                    {(user.role === 'ADMIN' || (user.role === 'TEACHER' && !isStaff)) && (
                                                        <button onClick={() => deleteMessage(msg.id)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}>
                                                            <Trash2 size={10} color={isMe ? 'white' : '#ef4444'} />
                                                        </button>
                                                    )}
                                                </div>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Floating Input Area */}
                    <div style={{ 
                        padding: '12px 16px 16px 16px', 
                        background: theme === 'dark' ? 'rgba(30, 41, 59, 0.95)' : 'rgba(255, 255, 255, 0.95)', 
                        backdropFilter: 'blur(10px)',
                        borderTop: '1px solid var(--border-color)',
                        zIndex: 20
                    }}>
                         {isRoomDisabled ? (
                             <div style={{ 
                                 textAlign: 'center', fontSize: '0.85rem', color: '#ef4444', 
                                 padding: '12px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '12px',
                                 fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                             }}>
                                 <Shield size={16} /> Chat is currently disabled.
                             </div>
                         ) : (
                            <div style={{ 
                                display: 'flex', alignItems: 'center', gap: '10px', 
                                background: 'var(--surface-hover)', 
                                padding: '6px 6px 6px 16px', 
                                borderRadius: '30px', 
                                border: '1px solid var(--border-color)',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
                                transition: 'all 0.2s',
                            }} className="input-container">
                                <input 
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message..."
                                    style={{ 
                                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                                        fontSize: '0.95rem', color: 'var(--text-main)'
                                    }} 
                                    autoFocus={!isMobile}
                                />
                                <button 
                                    onClick={sendMessage} 
                                    disabled={!currentMessage.trim()}
                                    style={{ 
                                        border: 'none', 
                                        background: currentMessage.trim() ? 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)' : 'var(--text-muted)', 
                                        color: 'white', cursor: currentMessage.trim() ? 'pointer' : 'default', 
                                        width: '40px', height: '40px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        transition: 'all 0.2s',
                                        transform: currentMessage.trim() ? 'scale(1)' : 'scale(0.95)',
                                        opacity: currentMessage.trim() ? 1 : 0.5,
                                        flexShrink: 0
                                    }}
                                >
                                    <Send size={18} style={{ marginLeft: '2px' }} />
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            )}

            {/* Modern FAB - Hidden when open */}
            {!isOpen && (
                <button 
                    onClick={() => setIsOpen(true)}
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    style={{ 
                        position: 'fixed',
                        bottom: '25px', right: '25px',
                        width: '60px', height: '60px', 
                        borderRadius: '24px', 
                        background: 'linear-gradient(135deg, #4f46e5 0%, #2563eb 100%)', 
                        color: 'white', 
                        border: 'none', 
                        boxShadow: isHovered ? '0 10px 25px -5px rgba(37, 99, 235, 0.6)' : '0 10px 25px -5px rgba(37, 99, 235, 0.4)',
                        cursor: 'pointer',
                        display: 'flex', 
                        alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transform: isHovered ? 'scale(1.1) rotate(-5deg)' : 'scale(1)',
                        zIndex: 10000,
                        animation: 'pulse-soft 2s infinite'
                    }}
                >
                    <MessageCircle size={30} strokeWidth={2.5} />
                    
                    {/* Notification Dot (Mockup) */}
                    <span style={{
                        position: 'absolute', top: -4, right: -4,
                        width: '14px', height: '14px',
                        background: '#ef4444',
                        borderRadius: '50%',
                        border: '2px solid white'
                    }}></span>
                </button>
            )}
        </div>
    );
};

export default ChatWidget;
