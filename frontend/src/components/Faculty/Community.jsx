import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Users, MoreVertical, Paperclip, Send, X } from 'lucide-react';
import { useAuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';

const Community = ({ courses = [], socketRef }) => {
    const { user } = useAuthContext();
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState({}); // maps chat room (e.g. course_id) to messages array
    const chatEndRef = useRef(null);

    // Populate conversations from assigned courses
    const conversations = courses.map(c => ({
        id: `course_${c.id}`,
        courseId: c.id,
        name: `${c.course_code} - ${c.course_name} Discussion`,
        type: 'group',
        lastMsg: 'Welcome to the course discussion room!',
        time: 'Now',
        unread: 0
    }));

    useEffect(() => {
        if (socketRef && socketRef.current) {
            const socket = socketRef.current;

            socket.on('receive_message', (data) => {
                const { room, text, sender, time, id } = data;
                setChatMessages(prev => {
                    const roomMsgs = prev[room] || [];
                    return {
                        ...prev,
                        [room]: [...roomMsgs, { id, sender, text, time, isMe: false }]
                    };
                });
            });

            return () => {
                socket.off('receive_message');
            };
        }
    }, [socketRef]);

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, chatMessages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (!message.trim() || !selectedChat) return;

        const room = selectedChat.id;
        const newMsg = {
            id: Date.now() + Math.random(),
            sender: 'You',
            text: message,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            isMe: true
        };

        // Add to local state
        setChatMessages(prev => {
            const roomMsgs = prev[room] || [];
            return {
                ...prev,
                [room]: [...roomMsgs, newMsg]
            };
        });

        // Emit via socket
        if (socketRef && socketRef.current) {
            socketRef.current.emit('send_message', {
                room,
                text: message,
                sender: user?.full_name || 'Faculty'
            });
        } else {
            toast.error('Socket not connected');
        }

        setMessage('');
    };

    const currentMessages = selectedChat ? (chatMessages[selectedChat.id] || []) : [];

    return (
        <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
            {/* Sidebar: Conversations */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-50 bg-gray-50/10">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Class Discussion Rooms</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            type="text"
                            placeholder="Search chats..."
                            className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                        />
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {conversations.length > 0 ? conversations.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selectedChat?.id === chat.id ? 'bg-primary/5' : ''}`}
                        >
                            <div className="w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold bg-primary bg-gradient-to-tr from-primary to-primary-light">
                                {chat.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                                </div>
                            </div>
                        </button>
                    )) : (
                        <div className="p-8 text-center text-gray-400 text-sm font-semibold">No courses assigned to establish groups.</div>
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${!selectedChat ? 'hidden md:flex bg-gray-50/50' : 'flex'}`}>
                {selectedChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-100 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <button onClick={() => setSelectedChat(null)} className="md:hidden p-2 text-gray-500"><X size={20} /></button>
                                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm bg-primary bg-gradient-to-tr from-primary to-primary-light">
                                    {selectedChat.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{selectedChat.name}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Socket Room</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><Users size={20} /></button>
                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9fc] custom-scrollbar">
                            <div className="text-center py-2">
                                <span className="text-[10px] font-bold text-gray-400 bg-white px-3 py-1 rounded-full border border-gray-100 uppercase tracking-widest">
                                    Start of Discussion Board
                                </span>
                            </div>
                            {currentMessages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className="max-w-[70%] space-y-1">
                                        {!msg.isMe && <p className="text-[10px] font-bold text-gray-500 ml-1">{msg.sender}</p>}
                                        <div className={`
                                            px-4 py-3 rounded-2xl text-sm shadow-sm
                                            ${msg.isMe
                                                ? 'bg-primary text-white rounded-tr-none shadow-primary/10'
                                                : 'bg-white text-gray-700 rounded-tl-none border border-gray-100'}
                                        `}>
                                            {msg.text}
                                        </div>
                                        <p className={`text-[10px] text-gray-400 ${msg.isMe ? 'text-right mr-1' : 'ml-1'}`}>{msg.time}</p>
                                    </div>
                                </div>
                            ))}
                            <div ref={chatEndRef} />
                        </div>

                        {/* Chat Input */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSendMessage} className="flex items-center gap-3">
                                <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your discussion post here..."
                                    className="flex-1 bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
                                />
                                <button
                                    type="submit"
                                    className="p-3 bg-primary text-white rounded-xl shadow-lg shadow-primary/20 hover:bg-primary-dark transition-all"
                                >
                                    <Send size={20} />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6 animate-pulse">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Classroom Group Discussions</h3>
                        <p className="text-gray-500 max-w-sm">Select a course discussion board from the left to start sending real-time messages to your students.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
