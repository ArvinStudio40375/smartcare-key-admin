import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface ChatMessage {
  id: string;
  sender_id: string;
  sender_type: string;
  receiver_id: string;
  receiver_type: string;
  message: string;
  created_at: string;
  read_by_sender: boolean;
  read_by_receiver: boolean;
}

interface ChatRoom {
  id: string;
  name: string;
  email: string;
  type: "user" | "mitra";
  lastMessage?: string;
  unreadCount: number;
}

const LiveChat = () => {
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchChatRooms();
  }, []);

  useEffect(() => {
    if (selectedRoom) {
      fetchMessages(selectedRoom.id, selectedRoom.type);
    }
  }, [selectedRoom]);

  const fetchChatRooms = async () => {
    try {
      // Fetch users yang pernah chat
      const { data: userChats, error: userError } = await supabase
        .from("chat")
        .select(`
          sender_id,
          users!chat_sender_id_fkey (nama, email)
        `)
        .eq("receiver_type", "admin")
        .eq("sender_type", "user");

      if (userError) throw userError;

      // Fetch mitras yang pernah chat
      const { data: mitraChats, error: mitraError } = await supabase
        .from("chat")
        .select(`
          sender_id,
          mitra!chat_sender_id_fkey (nama_toko, email)
        `)
        .eq("receiver_type", "admin")
        .eq("sender_type", "mitra");

      if (mitraError) throw mitraError;

      // Process and combine chat rooms
      const rooms: ChatRoom[] = [];

      // Add unique users
      const uniqueUsers = userChats?.reduce((acc: any[], chat) => {
        if (!acc.find(u => u.sender_id === chat.sender_id)) {
          acc.push(chat);
        }
        return acc;
      }, []) || [];

      uniqueUsers.forEach((chat) => {
        if (chat.users) {
          rooms.push({
            id: chat.sender_id,
            name: chat.users.nama,
            email: chat.users.email,
            type: "user",
            unreadCount: 0
          });
        }
      });

      // Add unique mitras
      const uniqueMitras = mitraChats?.reduce((acc: any[], chat) => {
        if (!acc.find(m => m.sender_id === chat.sender_id)) {
          acc.push(chat);
        }
        return acc;
      }, []) || [];

      uniqueMitras.forEach((chat) => {
        if (chat.mitra) {
          rooms.push({
            id: chat.sender_id,
            name: chat.mitra.nama_toko,
            email: chat.mitra.email,
            type: "mitra",
            unreadCount: 0
          });
        }
      });

      setChatRooms(rooms);
    } catch (error) {
      console.error("Error fetching chat rooms:", error);
      toast({
        title: "Error",
        description: "Gagal memuat ruang chat",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (userId: string, userType: "user" | "mitra") => {
    try {
      const { data, error } = await supabase
        .from("chat")
        .select("*")
        .or(`and(sender_id.eq.${userId},sender_type.eq.${userType},receiver_type.eq.admin),and(receiver_id.eq.${userId},receiver_type.eq.${userType},sender_type.eq.admin)`)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error("Error fetching messages:", error);
      toast({
        title: "Error",
        description: "Gagal memuat pesan",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || !selectedRoom) return;

    try {
      const { error } = await supabase
        .from("chat")
        .insert({
          sender_id: "admin", // Using a placeholder admin ID
          sender_type: "admin",
          receiver_id: selectedRoom.id,
          receiver_type: selectedRoom.type,
          message: newMessage.trim(),
          read_by_sender: true,
          read_by_receiver: false
        });

      if (error) throw error;

      setNewMessage("");
      // Refresh messages
      fetchMessages(selectedRoom.id, selectedRoom.type);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Gagal mengirim pesan",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Live Chat
        </h2>
        <p className="text-muted-foreground">
          Chat real-time dengan pengguna dan mitra
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6 h-[600px]">
        {/* Chat Rooms List */}
        <Card className="bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">Ruang Chat</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[500px]">
              {chatRooms.length === 0 ? (
                <div className="p-6 text-center text-muted-foreground">
                  Belum ada percakapan
                </div>
              ) : (
                chatRooms.map((room) => (
                  <div
                    key={`${room.id}-${room.type}`}
                    className={`p-4 border-b border-border cursor-pointer hover:bg-secondary/50 transition-colors ${
                      selectedRoom?.id === room.id && selectedRoom?.type === room.type
                        ? "bg-secondary"
                        : ""
                    }`}
                    onClick={() => setSelectedRoom(room)}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-foreground">{room.name}</h4>
                        <p className="text-xs text-muted-foreground">{room.email}</p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <Badge variant={room.type === "user" ? "default" : "secondary"}>
                          {room.type === "user" ? "User" : "Mitra"}
                        </Badge>
                        {room.unreadCount > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            {room.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Chat Messages */}
        <Card className="md:col-span-2 bg-gradient-card border border-border">
          <CardHeader>
            <CardTitle className="text-foreground">
              {selectedRoom ? `Chat dengan ${selectedRoom.name}` : "Pilih ruang chat"}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex flex-col h-[500px]">
            {selectedRoom ? (
              <>
                {/* Messages Area */}
                <ScrollArea className="flex-1 p-4">
                  {messages.length === 0 ? (
                    <div className="text-center text-muted-foreground py-8">
                      Belum ada pesan dalam percakapan ini
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex ${
                            message.sender_type === "admin" ? "justify-end" : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                              message.sender_type === "admin"
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-foreground"
                            }`}
                          >
                            <p className="text-sm">{message.message}</p>
                            <p className="text-xs opacity-70 mt-1">
                              {new Date(message.created_at).toLocaleTimeString("id-ID", {
                                hour: "2-digit",
                                minute: "2-digit"
                              })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>

                {/* Message Input */}
                <div className="p-4 border-t border-border">
                  <div className="flex space-x-2">
                    <Input
                      placeholder="Ketik pesan..."
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                      className="bg-secondary border-border"
                    />
                    <Button
                      onClick={sendMessage}
                      disabled={!newMessage.trim()}
                      className="bg-gradient-primary hover:shadow-glow"
                    >
                      Kirim
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center text-muted-foreground">
                  <div className="text-4xl mb-4">💬</div>
                  <p>Pilih ruang chat untuk mulai percakapan</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LiveChat;