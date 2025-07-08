// src/components/ChatView.jsx
import React, { useState, useRef, useEffect, useContext } from 'react';
import { useChat } from '../hooks/useChat.js'; // ⭐ UNCOMMENT AND ENSURE .jsx EXTENSION ⭐
import { AuthContext } from '../auth/AuthProvider';
import { toast } from 'react-toastify'; // ⭐ ADD THIS IMPORT ⭐

function ChatView({ selectedChatId, currentUserId }) {
    // currentUserId is already being passed from ProfilePage, but also get user from context
    const { user } = useContext(AuthContext);

    const senderIdForMessages = currentUserId || user?._id;

    // The useChat hook is now correctly imported and used
    const {
        messages,
        chatData,
        isLoading,
        isError,
        fetchError,
        sendMessage,
        isSending,
    } = useChat(selectedChatId, senderIdForMessages);

    const [messageInput, setMessageInput] = useState('');
    const messagesEndRef = useRef(null);

    // Scroll to bottom on new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() && selectedChatId && senderIdForMessages) {
            sendMessage(messageInput);
            setMessageInput('');
        } else {
            console.warn("Cannot send message: Missing input, chat ID, or sender ID.");
            toast.error("Please ensure you're in a chat and logged in.");
        }
    };

    if (isLoading) return <div className="text-gray-600 text-center py-8">Loading chat messages...</div>;
    if (isError) return <div className="text-red-500 text-center py-8">Error loading chat: {fetchError?.message}</div>;
    if (!selectedChatId) return <div className="text-gray-500 text-center py-8">Select a chat to view messages.</div>;
    // If selectedChatId is present but chatData isn't, it might mean the chat doesn't exist or permissions issue
    if (selectedChatId && !chatData) return <div className="text-gray-500 text-center py-8">No chat data found for the selected chat.</div>;


    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <h3 className="text-xl font-semibold text-gray-800 mb-3 border-b pb-2">
                Chat with: {chatData.participants
                ?.filter(p => p._id !== senderIdForMessages)
                .map(p => p.fullName)
                .join(', ') || chatData.name || 'Unknown Chat'}
            </h3>
            <div className="flex-1 overflow-y-auto p-2 bg-gray-50 rounded-md mb-3" style={{ border: '1px solid #e0e0e0' }}>
                {messages.length === 0 ? (
                    <p className="text-gray-600 text-center py-4">No messages yet. Start the conversation!</p>
                ) : (
                    messages.map((message) => (
                        <div
                            key={message._id || message.isOptimistic ? message._id : `temp-${Math.random()}`}
                            style={{
                                textAlign: message.sender._id === senderIdForMessages ? 'right' : 'left',
                                margin: '8px 0',
                                opacity: message.isOptimistic ? 0.7 : 1,
                            }}
                        >
                            <span className={`inline-block p-2 rounded-lg max-w-[70%] ${
                                message.sender._id === senderIdForMessages ? 'bg-[#003366] text-white' : 'bg-gray-200 text-gray-800'
                            }`}>
                                <strong>{message.sender.fullName || 'Unknown User'}</strong>
                                <br />
                                {message.text}
                                <span style={{ fontSize: '0.75em', color: message.sender._id === senderIdForMessages ? '#ccc' : '#555', display: 'block', marginTop: '4px' }}>
                                    {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                            </span>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSendMessage} className="flex">
                <input
                    type="text"
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message..."
                    disabled={isSending || !senderIdForMessages || !selectedChatId}
                    className="flex-1 p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-[#003366]"
                />
                <button
                    type="submit"
                    disabled={isSending || !messageInput.trim() || !senderIdForMessages || !selectedChatId}
                    className="bg-[#003366] text-white px-4 py-2 rounded-r-lg hover:bg-[#002244] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSending ? 'Sending...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default ChatView;