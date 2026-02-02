import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useAuth } from '../context/AuthContext'; 
import { API_URL } from '../config';
import { MessageCircle, X, Send, Users, Shield, Maximize2, Minimize2, Pin, Trash2 } from 'lucide-react';
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
    // const [isLoadingHistory, setIsLoadingHistory] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user) {
            socket.on('connect', () => { /* console.log('Connected to socket') */ });
            socket.connect();
            
            let rooms = [];
            if (user.role === 'STUDENT') {
                rooms.push({ id: user.class, name: user.class, type: 'CLASS' });
                setActiveRoom(user.class);
            } else if (user.role === 'TEACHER' || user.role === 'ADMIN') {
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
        
        socket.emit('join_room', activeRoom);
        
        const fetchRoomData = async () => {
            // setIsLoadingHistory(true);
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
            // setIsLoadingHistory(false);
        };

        fetchRoomData();

        const handleReceiveMessage = (data) => {
            setMessages((list) => [...list, data]);
        };

        socket.on('receive_message', handleReceiveMessage);
        
        // Listen for Instant Room Status Updates
        socket.on('room_status_update', (data) => {
            if (data.room === activeRoom) {
                setIsRoomDisabled(data.isDisabled);
            }
        });

        // Listen for Flagged Message Feedback
        socket.on('message_flagged', (data) => {
             alert(data.message); // Simple alert for now
        });

        // Listen for Deletions
        socket.on('message_deleted', (data) => {
            setMessages(prev => prev.filter(m => m.id !== data.messageId));
        });

        // Listen for Global Open Chat Event (from Navbar)
        const handleOpenChat = () => setIsOpen(true);
        window.addEventListener('open-chat', handleOpenChat);

        return () => {
             socket.off('receive_message', handleReceiveMessage);
             socket.off('room_status_update');
             socket.off('message_flagged');
             socket.off('message_deleted');
             window.removeEventListener('open-chat', handleOpenChat);
        };
    }, [activeRoom]);

    // ... (useEffect for scroll)

    const sendMessage = async () => {
        if (currentMessage.trim() !== "" && !isRoomDisabled) {
            const tempId = `temp-${Date.now()}`;
            const messageData = {
                room: activeRoom,
                author: user.name,
                authorId: user.id || user._id, 
                message: currentMessage,
                type: 'TEXT',
                time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                id: tempId, // Temporary ID
                authorRole: user.role
            };

            // 1. Optimistic Update (Show Immediately)
            setMessages((list) => [...list, messageData]);
            setCurrentMessage("");

            // 2. Send to Server with Acknowledgement
            socket.emit('send_message', messageData, (serverData) => {
                if (serverData && serverData.id) {
                    // Update the temp message with real data from server
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

    // Helper to format mentions
    const formatMessage = (text) => {
        if (!text) return null;
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.match(/^@\w+$/)) {
                return <span key={i} style={{ color: '#2563eb', fontWeight: 'bold' }}>{part}</span>;
            }
            return part;
        });
    };

    const deleteMessage = async (msgId) => {
        if (!window.confirm("Are you sure you want to delete this message?")) return;
        try {
            const token = localStorage.getItem('token');
            const res = await fetch(`${API_URL}/chat/delete`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ messageId: msgId })
            });
            // Success handled by socket
            if (!res.ok) alert("Failed to delete. You might not have permission.");
        } catch (err) { /* console.error("Failed to delete", err); */ }
    };


    if (!user) return null;

    const pinnedMessages = messages.filter(m => m.isPinned);

    return (
        <div style={{ 
            position: 'fixed', 
            // On mobile, if open -> 0 (full screen). If closed -> 80px (above nav).
            // On desktop, if open/expanded -> 0. If normal -> 20px.
            bottom: (isOpen && (isMobile || isExpanded)) ? '0' : (isMobile ? '85px' : '20px'), 
            right: (isOpen && (isMobile || isExpanded)) ? '0' : '20px', 
            zIndex: 1000, 
            fontFamily: 'Inter, sans-serif'
        }}>
            
            {/* Chat Window */}
            {isOpen && (
                <div style={{ 
                    position: (isMobile || isExpanded) ? 'fixed' : 'absolute', 
                    top: (isMobile || isExpanded) ? '0' : 'auto',
                    bottom: (isMobile || isExpanded) ? '0' : '70px', 
                    left: (isMobile || isExpanded) ? '0' : 'auto',
                    right: (isMobile || isExpanded) ? '0' : '0', 
                    width: (isMobile || isExpanded) ? '100vw' : '400px', 
                    height: (isMobile || isExpanded) ? '100vh' : '500px', 
                    maxHeight: (isMobile || isExpanded) ? '100vh' : '800px',
                    borderRadius: (isMobile || isExpanded) ? '0' : '16px', 
                    
                    background: 'var(--surface, #fff)', 
                    color: 'var(--text-main, #000)',
                    boxShadow: '0 10px 25px rgba(0,0,0,0.2)',
                    display: 'flex', flexDirection: 'column',
                    overflow: 'hidden',
                    border: (isMobile || isExpanded) ? 'none' : '1px solid var(--border-color, #e2e8f0)',
                    transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)'
                }}>
                    {/* Header */}
                    <div style={{ 
                        padding: '12px 16px', 
                        background: '#2563eb', // Force Blue for contrast
                        color: 'white',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{ 
                                width: '36px', height: '36px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', 
                                display: 'flex', alignItems: 'center', justifyContent: 'center'
                            }}>
                                <Users size={20} />
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                <span style={{ fontWeight: 600, fontSize: '1rem' }}>
                                    {activeRoom === 'Teachers' ? 'Teacher Community' : `${activeRoom}`}
                                </span>
                                <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>
                                    {isRoomDisabled ? 'Read Only Mode' : (activeRoom === 'Teachers' ? 'Staff Only' : 'Student Group')}
                                </span>
                            </div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {(user.role === 'ADMIN') && (
                                <button 
                                    onClick={toggleRoomStatus}
                                    title={isRoomDisabled ? "Enable Chat" : "Disable Chat"}
                                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}
                                >
                                    {isRoomDisabled ? <Shield size={18} fill="currentColor" /> : <Shield size={18} />}
                                </button>
                            )}
                            
                            {!isMobile && (
                                <button 
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    title={isExpanded ? "Minimize" : "Expand"}
                                    style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}
                                >
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                            )}

                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer', padding: '6px' }}>
                                <X size={22} />
                            </button>
                        </div>
                    </div>

                    {/* Room Selector */}
                    {(user.role === 'TEACHER' || user.role === 'ADMIN') && (
                        <div style={{ 
                            padding: '10px', 
                            borderBottom: '1px solid var(--border-color)', 
                            display: 'flex', gap: '8px', overflowX: 'auto', 
                            background: 'var(--surface-hover, #f8fafc)'
                        }}>
                             {availableRooms.map(room => (
                                 <button 
                                    key={room.id}
                                    onClick={() => { setActiveRoom(room.id); setMessages([]); }} 
                                    style={{ 
                                        padding: '6px 14px', borderRadius: '20px',
                                        background: activeRoom === room.id ? '#2563eb' : 'var(--surface)',
                                        color: activeRoom === room.id ? 'white' : 'var(--text-muted)',
                                        fontSize: '0.8rem', whiteSpace: 'nowrap', cursor: 'pointer',
                                        boxShadow: activeRoom === room.id ? '0 2px 4px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0,0,0,0.05)',
                                        border: activeRoom === room.id ? 'none' : '1px solid var(--border-color)',
                                        fontWeight: activeRoom === room.id ? 500 : 400
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
                            background: 'rgba(255, 193, 7, 0.15)', 
                            borderBottom: '1px solid rgba(255, 193, 7, 0.3)',
                            padding: '8px 12px',
                            fontSize: '0.85rem',
                            display: 'flex', alignItems: 'center', gap: '8px'
                        }}>
                            <Pin size={14} color="var(--text-main)" style={{ flexShrink: 0 }} />
                            <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <span style={{ fontWeight: 600 }}>Pinned: </span>
                                {pinnedMessages[pinnedMessages.length - 1].message}
                            </div>
                        </div>
                    )}

                    {/* Chat Area */}
                    <div style={{ 
                        flex: 1, padding: '16px', overflowY: 'auto', 
                        display: 'flex', flexDirection: 'column', gap: '8px', 
                        background: theme === 'dark' ? '#0f172a' : '#f1f5f9',
                        backgroundBlendMode: 'overlay',
                    }}>
                        {messages.map((msg, idx) => {
                             const isMe = msg.authorId === (user.id || user._id);
                             const isStaff = msg.authorRole === 'TEACHER' || msg.authorRole === 'ADMIN';
                             const showName = !isMe && (idx === 0 || messages[idx-1].authorId !== msg.authorId);
                             
                             return (
                                 <div key={idx} style={{ 
                                     alignSelf: isMe ? 'flex-end' : 'flex-start', 
                                     maxWidth: isMobile ? '85%' : '80%',
                                     display: 'flex', flexDirection: 'column',
                                     alignItems: isMe ? 'flex-end' : 'flex-start'
                                 }}>
                                     {showName && (
                                         <div style={{ 
                                             fontSize: '0.75rem', 
                                             color: isStaff ? '#ef4444' : 'var(--text-muted)', 
                                             fontWeight: isStaff ? 700 : 500,
                                             marginBottom: '2px', marginLeft: '8px', marginRight: '8px'
                                         }}>
                                             {msg.author} {isStaff && '(Teacher)'}
                                         </div>
                                     )}
                                     
                                     <div className="message-bubble" style={{ 
                                         position: 'relative',
                                         padding: '8px 12px', 
                                         borderRadius: '12px', 
                                         borderTopRightRadius: isMe ? '0px' : '12px',
                                         borderTopLeftRadius: !isMe ? '0px' : '12px',
                                         background: isMe ? '#2563eb' : (
                                            msg.isPinned ? (theme === 'dark' ? 'rgba(234, 179, 8, 0.2)' : '#fff9c4') : 'var(--surface, white)'
                                         ),
                                         color: isMe ? 'white' : 'var(--text-main, #1e293b)',
                                         boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
                                         fontSize: '0.95rem',
                                         lineHeight: 1.5,
                                         wordBreak: 'break-word',
                                         minWidth: '60px'
                                     }}>
                                         {formatMessage(msg.message)}
                                         {msg.isPinned && <Pin size={12} style={{ position: 'absolute', top: -6, right: -6, background: '#f59e0b', color: 'white', padding: 2, borderRadius: '50%' }} />}

                                         <div style={{ 
                                             fontSize: '0.65rem', 
                                             color: isMe ? 'rgba(255,255,255,0.8)' : 'var(--text-muted)', 
                                             textAlign: 'right', 
                                             marginTop: '4px',
                                             display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px'
                                         }}>
                                             {msg.time}
                                             {(user.role === 'ADMIN' || user.role === 'TEACHER') && msg.id && (
                                                <>
                                                 <button 
                                                    onClick={() => togglePin(msg.id)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5 }}
                                                    title={msg.isPinned ? "Unpin" : "Pin"}
                                                 >
                                                     <Pin size={10} color={isMe ? 'white' : 'black'} fill={msg.isPinned ? 'currentColor' : 'none'} />
                                                 </button>
                                                 {(user.role === 'ADMIN' || (user.role === 'TEACHER' && !isStaff)) && ( // Teacher can delete student msgs
                                                    <button 
                                                        onClick={() => deleteMessage(msg.id)}
                                                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, opacity: 0.5, marginLeft: '4px' }}
                                                        title="Delete"
                                                    >
                                                        <Trash2 size={10} color={isMe ? 'white' : '#ef4444'} />
                                                    </button>
                                                 )}
                                                </>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             );
                        })}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div style={{ 
                        padding: '12px', 
                        background: 'var(--surface, #fff)', 
                        borderTop: '1px solid var(--border-color)',
                        color: 'var(--text-main, #000)' 
                    }}>
                         {isRoomDisabled ? (
                             <div style={{ textAlign: 'center', fontSize: '0.9rem', color: '#ef4444', padding: '10px', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '8px' }}>
                                 <Shield size={16} style={{ verticalAlign: 'text-top', marginRight: '6px' }}/>
                                 Chat is disabled by admin.
                             </div>
                         ) : (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--surface-hover)', padding: '8px 14px', borderRadius: '24px', border: '1px solid var(--border-color)' }}>
                                <input 
                                    type="text"
                                    value={currentMessage}
                                    onChange={(e) => setCurrentMessage(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                    placeholder="Type a message... (@name to mention)"
                                    style={{ 
                                        flex: 1, border: 'none', background: 'transparent', outline: 'none',
                                        fontSize: '0.95rem', color: 'var(--text-main)'
                                    }} 
                                />
                                <button 
                                    onClick={sendMessage} 
                                    disabled={!currentMessage.trim()}
                                    style={{ 
                                        border: 'none', 
                                        background: '#2563eb', // Explicit Blue
                                        color: 'white', cursor: 'pointer', 
                                        width: '36px', height: '36px', borderRadius: '50%',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        opacity: currentMessage.trim() ? 1 : 0.7, // Higher opacity for disabled state
                                        transition: 'opacity 0.2s'
                                    }}
                                >
                                    <Send size={18} />
                                </button>
                            </div>
                         )}
                    </div>
                </div>
            )}

            {/* FAB */}
            <button 
                onClick={() => setIsOpen(!isOpen)}
                style={{ 
                    width: '60px', height: '60px', 
                    borderRadius: '50%', 
                    background: '#2563eb', // Force Blue
                    color: 'white', 
                    border: 'none', 
                    boxShadow: '0 4px 14px rgba(37, 99, 235, 0.4)',
                    cursor: 'pointer',
                    display: isOpen && isMobile ? 'none' : 'flex', 
                    alignItems: 'center', justifyContent: 'center',
                    transition: 'transform 0.2s',
                    zIndex: 1000 // Ensure FAB above everything
                }}
            >
                {isOpen ? <X size={28} /> : <MessageCircle size={30} />}
            </button>
        </div>
    );
};

export default ChatWidget;
