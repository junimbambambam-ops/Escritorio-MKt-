import { useState, useEffect, useMemo } from 'react';
import { io } from 'socket.io-client';
import type { Socket } from 'socket.io-client';
import { 
  Users, 
  MessageSquare, 
  Settings, 
  Coffee, 
  Briefcase, 
  Zap, 
  Shield, 
  DoorOpen,
  LogOut,
  ChevronRight,
  Circle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface User {
  id: string;
  name: string;
  avatar: string;
  status: 'available' | 'busy' | 'meeting';
  room: string;
}

const ROOMS = [
  { name: 'General', icon: DoorOpen, color: 'bg-blue-500' },
  { name: 'Meeting', icon: Users, color: 'bg-purple-500' },
  { name: 'Focus', icon: Zap, color: 'bg-amber-500' },
  { name: 'Break Room', icon: Coffee, color: 'bg-emerald-500' },
];

const STATUS_COLORS = {
  available: 'bg-green-500',
  busy: 'bg-red-500',
  meeting: 'bg-purple-500',
};

// --- Components ---

export default function App() {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeRoom, setActiveRoom] = useState('General');
  const [isConfiguring, setIsConfiguring] = useState(true);
  const [name, setName] = useState('');

  useEffect(() => {
    const newSocket = io();
    setSocket(newSocket);

    newSocket.on('office-update', (updatedUsers: User[]) => {
      setUsers(updatedUsers);
      const me = updatedUsers.find(u => u.id === newSocket.id);
      if (me) setCurrentUser(me);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  const handleJoin = () => {
    if (!name.trim()) return;
    socket?.emit('join-office', { name, room: 'General', status: 'available' });
    setIsConfiguring(false);
  };

  const changeStatus = (status: User['status']) => {
    socket?.emit('update-status', status);
  };

  const changeRoom = (roomName: string) => {
    setActiveRoom(roomName);
    socket?.emit('change-room', roomName);
  };

  const usersInActiveRoom = useMemo(() => {
    return users.filter(u => u.room === activeRoom);
  }, [users, activeRoom]);

  if (isConfiguring) {
    return (
      <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center p-6 font-sans">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-zinc-900 border border-zinc-800 p-8 rounded-2xl shadow-2xl"
        >
          <div className="flex items-center gap-3 mb-8">
            <div className="p-3 bg-emerald-500/10 rounded-xl">
              <Briefcase className="w-8 h-8 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Virtual Office</h1>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">Seu Nome</label>
              <input 
                type="text" 
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
              />
            </div>
            
            <button 
              onClick={handleJoin}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Entrar no Escritório
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans overflow-hidden">
      {/* Header */}
      <header className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/50 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Briefcase className="w-6 h-6 text-emerald-500" />
          <span className="font-bold text-lg tracking-tight">Virtual Office</span>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-zinc-800 px-3 py-1.5 rounded-full border border-zinc-700">
            <div className={cn("w-2 h-2 rounded-full", STATUS_COLORS[currentUser?.status || 'available'])} />
            <select 
              value={currentUser?.status}
              onChange={(e) => changeStatus(e.target.value as any)}
              className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer"
            >
              <option value="available">Disponível</option>
              <option value="busy">Ocupado</option>
              <option value="meeting">Em Reunião</option>
            </select>
          </div>
          <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
            <Settings className="w-5 h-5 text-zinc-400" />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Rooms */}
        <aside className="w-64 border-r border-zinc-800 p-4 flex flex-col gap-2 bg-zinc-900/30">
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-2 px-2">Salas</h2>
          {ROOMS.map((room) => (
            <button
              key={room.name}
              onClick={() => changeRoom(room.name)}
              className={cn(
                "flex items-center justify-between p-3 rounded-xl transition-all group",
                activeRoom === room.name 
                  ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20" 
                  : "hover:bg-zinc-800 text-zinc-400"
              )}
            >
              <div className="flex items-center gap-3">
                <room.icon className="w-5 h-5" />
                <span className="font-medium">{room.name}</span>
              </div>
              <span className="text-xs bg-zinc-800 px-2 py-0.5 rounded-md group-hover:bg-zinc-700">
                {users.filter(u => u.room === room.name).length}
              </span>
            </button>
          ))}
        </aside>

        {/* Main Content - Room View */}
        <main className="flex-1 p-6 overflow-y-auto bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/10 via-zinc-950 to-zinc-950">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">{activeRoom}</h1>
            <p className="text-zinc-500">Colaborando com {usersInActiveRoom.length} pessoas</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence mode="popLayout">
              {usersInActiveRoom.map((user) => (
                <motion.div
                  key={user.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className={cn(
                    "bg-zinc-900 border border-zinc-800 p-4 rounded-2xl flex items-center gap-4 hover:border-zinc-700 transition-all group relative overflow-hidden",
                    user.id === socket?.id && "ring-1 ring-emerald-500/50"
                  )}
                >
                  <div className="relative">
                    <img 
                      src={user.avatar} 
                      alt={user.name}
                      className="w-12 h-12 rounded-xl bg-zinc-800"
                    />
                    <div className={cn(
                      "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-zinc-900",
                      STATUS_COLORS[user.status]
                    )} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">
                      {user.name} {user.id === socket?.id && <span className="text-xs text-emerald-500 font-normal ml-1">(Você)</span>}
                    </h3>
                    <p className="text-xs text-zinc-500 capitalize">{user.status}</p>
                  </div>

                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      title="Chat no WhatsApp"
                      onClick={() => {
                        window.parent.postMessage({ type: "OPEN_WHATSAPP_CHAT", phone: "5511999999999" }, "*"); // Example phone
                      }}
                      className="p-2 hover:bg-emerald-500/10 hover:text-emerald-500 rounded-lg transition-colors"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </main>
      </div>

      {/* Footer / Quick Actions */}
      <footer className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-zinc-500">
          <div className="flex items-center gap-1">
            <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500" />
            <span>{users.length} Online</span>
          </div>
          <span>•</span>
          <span>Escritório Virtual v1.0</span>
        </div>
        
        <button 
          onClick={() => setIsConfiguring(true)}
          className="flex items-center gap-2 text-xs font-medium text-zinc-400 hover:text-zinc-100 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sair
        </button>
      </footer>
    </div>
  );
}
