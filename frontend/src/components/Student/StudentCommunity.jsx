import React, { useState, useEffect, useRef } from 'react';
import { Send, User, Users, BookOpen, Search, MessageSquare, Loader2, AlertCircle } from 'lucide-react';
import studentService from '../../services/studentService';
import { useSocketContext } from '../../context/SocketContext';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const StudentCommunity = () => {
    const { user: authUser } = useAuth();
    const socket = useSocketContext();
    const messagesEndRef = useRef(null);

    const [conversations, setConversations] = useState({ courses: [], people: [] });
    const [activeConversation, setActiveConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [messageText, setMessageText] = useState('');
    
    const [loadingConvs, setLoadingConvs] = useState(true);
    const [loadingMsgs, setLoadingMsgs] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    const myId = authUser?.id;

    // 1. Fetch Conversations List on Mount
    useEffect(() => {
        const fetchConvs = async () => {
            try {
                setLoadingConvs(true);
                const response = await studentService.getConversations();
                if (response.data.success) {
                    setConversations(response.data.data);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load community chat contacts.');
            } finally {
                setLoadingConvs(false);
            }
        };
        fetchConvs();
    }, []);

    // 2. Fetch Messages when Active Conversation Changes
    useEffect(() => {
        if (!activeConversation) return;

        const fetchMsgs = async () => {
            try {
                setLoadingMsgs(true);
                const response = await studentService.getMessages(activeConversation.id, activeConversation.type);
                if (response.data.success) {
                    setMessages(response.data.data || []);
                }
            } catch (err) {
                console.error(err);
                toast.error('Failed to load message history.');
            } finally {
                setLoadingMsgs(false);
            }
        };

        fetchMsgs();
    }, [activeConversation]);

    // 3. Listen to Socket Live Incoming Messages
    useEffect(() => {
        if (!socket) return;

        const handleIncomingMessage = (msg) => {
            console.log('Incoming live socket message:', msg);
            
            if (activeConversation) {
                const isCurrentGroup = 
                    msg.type === 'group' && 
                    activeConversation.type === 'group' && 
                    String(msg.course_id) === String(activeConversation.id);

                const isCurrentDirect = 
                    msg.type === 'direct' && 
                    activeConversation.type === 'direct' && 
                    (String(msg.sender_id) === String(activeConversation.id) || 
                     (String(msg.sender_id) === String(myId) && String(msg.receiver_id) === String(activeConversation.id)));

                if (isCurrentGroup || isCurrentDirect) {
                    setMessages(prev => {
                        if (prev.find(m => m.id === msg.id)) return prev;
                        return [...prev, msg];
                    });
                }
            }
        };

        socket.on('receive_message', handleIncomingMessage);

        return () => {
            socket.off('receive_message', handleIncomingMessage);
        };
    }, [socket, activeConversation, myId]);

    // 4. Auto scroll to bottom of messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // 5. Send Message Handler
    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!messageText.trim() || !activeConversation) return;

        const payloadText = messageText;
        setMessageText(''); // Clear input instantly

        try {
            await studentService.sendMessage(activeConversation.id, payloadText, activeConversation.type);
            // Notice: The controller emits to socket.io which fires 'receive_message' back to us, 
            // so we don't manually append to avoid race conditions.
        } catch (err) {
            console.error(err);
            toast.error('Message failed to deliver.');
        }
    };

    // Filter people and courses based on search
    const filteredPeople = conversations.people.filter(p => 
        p.full_name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    const filteredCourses = conversations.courses.filter(c => 
        c.course_name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        c.course_code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="bg-white rounded-3xl border border-gray-150 shadow-xl overflow-hidden flex h-[650px] max-w-6xl mx-auto">
            
            {/* Sidebar Column - Conversation List */}
            <div className="w-80 border-r border-gray-100 flex flex-col shrink-0 bg-gray-50/20">
                {/* Search Header */}
                <div className="p-5 border-b border-gray-50 space-y-4">
                    <h3 className="text-xl font-black text-gray-900">Conversations</h3>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <input
                            type="text"
                            placeholder="Search contacts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-secondary/10 focus:border-secondary text-xs font-bold text-gray-800"
                        />
                    </div>
                </div>

                {/* List Container */}
                <div className="flex-1 overflow-y-auto p-3 space-y-4 custom-scrollbar">
                    {loadingConvs ? (
                        <div className="flex items-center justify-center py-10">
                            <Loader2 className="h-6 w-6 animate-spin text-secondary" />
                        </div>
                    ) : (
                        <>
                            {/* Group Course Channels */}
                            {filteredCourses.length > 0 && (
                                <div>
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                                        <BookOpen size={10} /> Course Group Chats
                                    </h4>
                                    <div className="space-y-1">
                                        {filteredCourses.map(course => (
                                            <button
                                                key={`group-${course.id}`}
                                                onClick={() => setActiveConversation(course)}
                                                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                                                    activeConversation?.id === course.id && activeConversation?.type === 'group'
                                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/15'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    activeConversation?.id === course.id && activeConversation?.type === 'group'
                                                        ? 'bg-white/20 text-white'
                                                        : 'bg-secondary/10 text-secondary'
                                                }`}>
                                                    {course.course_code.slice(0, 2)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-black truncate">{course.course_code}</p>
                                                    <p className={`text-[10px] truncate ${
                                                        activeConversation?.id === course.id && activeConversation?.type === 'group' ? 'text-blue-100' : 'text-gray-400'
                                                    }`}>{course.course_name}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Direct Message Contacts */}
                            {filteredPeople.length > 0 && (
                                <div className="pt-2">
                                    <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-3 mb-2 flex items-center gap-1.5">
                                        <Users size={10} /> Faculty & Classmates
                                    </h4>
                                    <div className="space-y-1">
                                        {filteredPeople.map(person => (
                                            <button
                                                key={`direct-${person.id}`}
                                                onClick={() => setActiveConversation(person)}
                                                className={`w-full text-left p-3 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                                                    activeConversation?.id === person.id && activeConversation?.type === 'direct'
                                                        ? 'bg-secondary text-white shadow-lg shadow-secondary/15'
                                                        : 'hover:bg-gray-50'
                                                }`}
                                            >
                                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
                                                    activeConversation?.id === person.id && activeConversation?.type === 'direct'
                                                        ? 'bg-white/20 text-white'
                                                        : person.role === 'faculty' ? 'bg-amber-50 text-amber-600 border border-amber-100' : 'bg-gray-100 text-gray-600'
                                                }`}>
                                                    {person.full_name.charAt(0)}
                                                </div>
                                                <div className="truncate">
                                                    <p className="text-xs font-black truncate">{person.full_name}</p>
                                                    <p className={`text-[10px] truncate uppercase tracking-widest font-black ${
                                                        activeConversation?.id === person.id && activeConversation?.type === 'direct' ? 'text-blue-100' : 'text-gray-400'
                                                    }`}>{person.role}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Chat Messages Section */}
            <div className="flex-1 flex flex-col h-full bg-white relative">
                {activeConversation ? (
                    <>
                        {/* Conversation Header */}
                        <div className="p-5 border-b border-gray-50 flex items-center gap-3 justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center font-bold">
                                    {activeConversation.type === 'group' ? '#' : activeConversation.full_name?.charAt(0) || activeConversation.course_code?.slice(0, 1)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-black text-gray-900">{activeConversation.full_name || activeConversation.course_code}</h4>
                                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{activeConversation.type === 'group' ? 'Course Channel' : activeConversation.role}</p>
                                </div>
                            </div>
                        </div>

                        {/* Message Feed */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar bg-gray-50/10">
                            {loadingMsgs ? (
                                <div className="flex items-center justify-center h-full">
                                    <Loader2 className="h-8 w-8 animate-spin text-secondary" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 font-bold">
                                    <MessageSquare size={36} className="text-gray-200 mb-2 animate-bounce" />
                                    <span>Say hello! No messages recorded in this chat yet.</span>
                                </div>
                            ) : (
                                messages.map((msg, i) => {
                                    const isMe = String(msg.sender_id) === String(myId);
                                    return (
                                        <div key={msg.id || i} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                                            {/* Sender Metadata (For channels) */}
                                            {activeConversation.type === 'group' && !isMe && (
                                                <span className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mb-1 ml-1.5">
                                                    {msg.sender_name} ({msg.sender_role})
                                                </span>
                                            )}
                                            {/* Bubble */}
                                            <div className={`max-w-[70%] p-4 rounded-3xl text-sm font-medium ${
                                                isMe 
                                                    ? 'bg-secondary text-white rounded-tr-none' 
                                                    : 'bg-white text-gray-800 border border-gray-100 shadow-sm rounded-tl-none'
                                            }`}>
                                                {msg.message}
                                            </div>
                                            {/* Timestamp */}
                                            <span className="text-[9px] text-gray-400 mt-1 mx-1.5 font-semibold">
                                                {msg.created_at ? new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Just now'}
                                            </span>
                                        </div>
                                    );
                                })
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Footer */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-50 flex items-center gap-3">
                            <input
                                type="text"
                                placeholder={`Write a message to ${activeConversation.full_name || activeConversation.course_code}...`}
                                value={messageText}
                                onChange={(e) => setMessageText(e.target.value)}
                                className="flex-grow px-5 py-3 border border-gray-150 rounded-2xl outline-none focus:ring-2 focus:ring-secondary/15 focus:border-secondary transition-all text-xs font-bold text-gray-800"
                            />
                            <button
                                type="submit"
                                className="p-3 bg-secondary hover:bg-secondary/95 text-white rounded-2xl cursor-pointer transition-all shadow-md shadow-secondary/10 shrink-0"
                            >
                                <Send size={16} />
                            </button>
                        </form>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 font-bold">
                        <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-4 text-gray-300 shadow-sm border border-gray-100">
                            <MessageSquare size={28} />
                        </div>
                        <h4 className="text-lg font-black text-gray-900 mb-1">EntitySYS Community Chat</h4>
                        <p className="text-xs text-gray-400 font-bold max-w-xs">Select a course room channel or search direct contacts to start chatting in real-time.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentCommunity;
