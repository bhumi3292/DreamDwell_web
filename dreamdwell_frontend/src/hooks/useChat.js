// src/hooks/useChat.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { toast } from 'react-toastify';
import { getChatById } from '../api/chatApi';
import chatSocketService from '../services/chatSocketService';


export const useChat = (chatId, currentUserId) => {
    const queryClient = useQueryClient();
    const chatQueryKey = ['chat', chatId];

    const {
        data: chatData,
        status,
        error: fetchError,
        isLoading,
        isError,
        isFetching,
        refetch
    } = useQuery({
        queryKey: chatQueryKey,
        queryFn: () => getChatById(chatId),
        enabled: !!chatId, // Only enable if chatId is provided
    });

    const messages = chatData?.messages || [];

    useEffect(() => {
        if (!chatId) return;

        chatSocketService.connect();
        chatSocketService.joinChat(chatId);

        const cleanupNewMessage = chatSocketService.onNewMessage((newMessage) => {
            // Check if the incoming message belongs to the current chat being viewed
            // The backend should typically send `newMessage.chat` as the chat's ID
            if (newMessage.chat === chatId) {
                queryClient.setQueryData(chatQueryKey, (oldChat) => {
                    if (oldChat && oldChat.messages) {
                        // Filter out the optimistic message if a real message with the same ID arrives
                        // This handles cases where backend might send an _id very quickly
                        const existingMessageIndex = oldChat.messages.findIndex(
                            msg => msg.isOptimistic && msg.text === newMessage.text && msg.sender?._id === newMessage.sender?._id
                        );

                        let updatedMessages = [...oldChat.messages];
                        if (existingMessageIndex !== -1) {
                            updatedMessages[existingMessageIndex] = newMessage; // Replace optimistic with real message
                        } else {
                            updatedMessages = [...updatedMessages, newMessage]; // Add new message
                        }

                        return {
                            ...oldChat,
                            messages: updatedMessages,
                            lastMessage: newMessage.text,
                            lastMessageAt: newMessage.createdAt,
                        };
                    }
                    return oldChat; // Return oldChat if no messages array or no oldChat
                });
            }
        });

        const cleanupMessageError = chatSocketService.onMessageError((error) => {
            console.error("Server-side chat error:", error.message);
            toast.error(`Chat error: ${error.message}`);
        });

        return () => {
            cleanupNewMessage();
            cleanupMessageError();
            chatSocketService.leaveChat(chatId);
        };
    }, [chatId, queryClient, chatQueryKey]);

    const { mutateAsync: sendMessage, isPending: isSending } = useMutation({
        mutationFn: async (text) => {
            if (!currentUserId) {
                throw new Error("Sender ID is required to send a message.");
            }
            if (!chatId) {
                throw new Error("Chat ID is required to send a message.");
            }
            // ⭐ CORRECTED: Pass arguments individually as per chatSocketService.sendMessage signature ⭐
            chatSocketService.sendMessage(chatId, currentUserId, text);
        },
        onMutate: async (text) => {
            await queryClient.cancelQueries({ queryKey: chatQueryKey });
            const previousChat = queryClient.getQueryData(chatQueryKey);

            queryClient.setQueryData(chatQueryKey, (oldChat) => {
                if (oldChat) {
                    const tempMessage = {
                        _id: `temp-${Date.now()}-${Math.random()}`, // More robust temporary ID
                        sender: { _id: currentUserId, fullName: 'You', profilePicture: null }, // Dummy sender info
                        text: text,
                        createdAt: new Date().toISOString(),
                        isOptimistic: true,
                    };
                    return {
                        ...oldChat,
                        messages: [...oldChat.messages, tempMessage],
                        lastMessage: text,
                        lastMessageAt: tempMessage.createdAt,
                    };
                }
                return oldChat;
            });
            return { previousChat };
        },
        onError: (err, variables, context) => {
            toast.error(`Failed to send message: ${err.message}`);
            if (context?.previousChat) {
                queryClient.setQueryData(chatQueryKey, context.previousChat);
            }
        },
        onSettled: () => {
            // After mutation (success or error), you might want to invalidate to refetch if optimistic update failed
            // or if you want to ensure data consistency with backend if socket updates are not guaranteed
            // However, with real-time socket updates, this is often not needed for the message list itself.
        }
    });

    return {
        messages,
        chatData,
        status,
        isLoading,
        isError,
        fetchError,
        isFetching,
        refetch,
        sendMessage,
        isSending,
    };
};