import React, { useState, useEffect, useRef } from 'react';
import { Search, MessageSquare, Users, MoreVertical, Paperclip, Send, X } from 'lucide-react';

const Community = () => {
    const [selectedChat, setSelectedChat] = useState(null);
    const [message, setMessage] = useState('');
    const chatEndRef = useRef(null);

    const conversations = [
        { id: 'g1', name: 'CS301 - DBMS Group', type: 'group', lastMsg: 'John Doe: Professor, when is the assignment due?', time: '10:30 AM', unread: 3 },
        { id: 'u1', name: 'John Doe', type: 'personal', lastMsg: 'Thank you for the clarification!', time: 'Yesterday', unread: 0 },
        { id: 'u2', name: 'Jane Smith', type: 'personal', lastMsg: 'I have a doubt in normalization.', time: 'Monday', unread: 1 },
        { id: 'g2', name: 'EE201 - Circuit Group', type: 'group', lastMsg: 'Mark: Labs are cancelled today.', time: 'Last Week', unread: 0 },
        { id: 'u3', name: 'HOD (CSE)', type: 'personal', lastMsg: 'Please submit the monthly report.', time: 'Yesterday', unread: 0 },
    ];

    const messages = [
        { id: 1, sender: 'John Doe', text: 'Professor, I have a doubt regarding the project architecture.', time: '10:25 AM', isMe: false },
        { id: 2, sender: 'You', text: 'Sure John, let me know which part is confusing.', time: '10:27 AM', isMe: true },
        { id: 3, sender: 'John Doe', text: 'The relationship between Student and Enrollment tables, should it be 1:M?', time: '10:28 AM', isMe: false },
        { id: 4, sender: 'You', text: 'Yes, a student can have multiple enrollments across different semesters.', time: '10:30 AM', isMe: true },
    ];

    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [selectedChat, messages]);

    return (
        <div className="h-[calc(100vh-200px)] flex bg-white rounded-2xl border border-gray-100 shadow-xl overflow-hidden animate-in fade-in duration-500">
            {/* Sidebar: Conversations */}
            <div className={`w-full md:w-80 border-r border-gray-100 flex flex-col ${selectedChat ? 'hidden md:flex' : 'flex'}`}>
                <div className="p-4 border-b border-gray-50">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Messages</h2>
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
                    {conversations.map(chat => (
                        <button
                            key={chat.id}
                            onClick={() => setSelectedChat(chat)}
                            className={`w-full p-4 flex gap-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 ${selectedChat?.id === chat.id ? 'bg-primary/5' : ''}`}
                        >
                            <div className={`w-12 h-12 rounded-2xl shrink-0 flex items-center justify-center text-white font-bold ${chat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                {chat.name[0]}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center">
                                    <h4 className="text-sm font-bold text-gray-900 truncate">{chat.name}</h4>
                                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{chat.time}</span>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500 truncate">{chat.lastMsg}</p>
                                    {chat.unread > 0 && <span className="bg-primary text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">{chat.unread}</span>}
                                </div>
                            </div>
                        </button>
                    ))}
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
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${selectedChat.type === 'group' ? 'bg-purple-500' : 'bg-blue-500'}`}>
                                    {selectedChat.name[0]}
                                </div>
                                <div>
                                    <h3 className="text-sm font-bold text-gray-900">{selectedChat.name}</h3>
                                    <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Online</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><Users size={20} /></button>
                                <button className="p-2 text-gray-400 hover:text-primary rounded-lg"><MoreVertical size={20} /></button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-[#f8f9fc] custom-scrollbar">
                            {messages.map(msg => (
                                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[70%] space-y-1`}>
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
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    if (message.trim()) {
                                        // Logic to send message via socket
                                        setMessage('');
                                    }
                                }}
                                className="flex items-center gap-3"
                            >
                                <button type="button" className="p-2 text-gray-400 hover:text-primary transition-colors"><Paperclip size={20} /></button>
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Type your message here..."
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
                        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center text-primary mb-6">
                            <MessageSquare size={40} />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Your Messages</h3>
                        <p className="text-gray-500 max-w-sm">Select a conversation from the left to start chatting with students or faculty groups.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Community;
