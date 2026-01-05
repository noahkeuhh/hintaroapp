import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { formatDistanceToNow } from "date-fns";
import {
  Search,
  Bookmark,
  Copy,
  Trash2,
  Check,
  Loader2,
} from "lucide-react";

const SavedRepliesContent = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ["savedReplies"],
    queryFn: () => api.getSavedReplies(),
    refetchInterval: false, // Disable auto-refresh to prevent flickering
    staleTime: 60000, // Consider data fresh for 60 seconds
  });

  const replies = data?.replies || [];

  const filteredReplies = replies.filter((reply) =>
    reply.reply_text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast({
      title: "Copied!",
      description: "Reply copied to clipboard",
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      await api.deleteSavedReply(id);
      queryClient.invalidateQueries({ queryKey: ["savedReplies"] });
      toast({
        title: "Deleted",
        description: "Reply has been deleted",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not delete reply",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar - hidden on mobile, shown when toggle is clicked */}
      <div className={`fixed lg:static inset-y-0 left-0 z-50 lg:z-0 transform transition-transform duration-300 lg:transform-none ${
        isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      } lg:block`}>
        <DashboardSidebar onNavigate={() => setIsMobileSidebarOpen(false)} />
      </div>
      
      <div className="flex-1 flex flex-col min-w-0">
        <DashboardHeader onMenuClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)} />
        
        <main className="flex-1 p-3 sm:p-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {/* Header */}
            <div className="flex flex-col gap-3 mb-4 sm:mb-6">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Saved Replies</h1>
                <p className="text-sm text-muted-foreground">Your favorite replies</p>
              </div>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  className="pl-10 w-full sm:w-64"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Saved replies grid */}
            {isLoading ? (
              <div className="card-elevated p-12 text-center">
                <Loader2 className="h-8 w-8 animate-spin text-accent mx-auto mb-4" />
                <p className="text-muted-foreground">Loading saved replies...</p>
              </div>
            ) : error ? (
              <div className="card-elevated p-12 text-center">
                <p className="text-destructive">Error loading saved replies</p>
              </div>
            ) : filteredReplies.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
                {filteredReplies.map((reply, index) => (
                  <motion.div
                    key={reply.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="card-elevated p-3 sm:p-5 group"
                  >
                    <div className="flex items-center justify-between mb-2 sm:mb-3">
                      <span className="text-xs sm:text-sm font-medium text-accent">
                        {reply.reply_type || "General"}
                      </span>
                      <span className="text-[10px] sm:text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(reply.created_at), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <p className="text-sm sm:text-base text-foreground mb-3 sm:mb-4 leading-relaxed line-clamp-3">{reply.reply_text}</p>
                    
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-muted-foreground hover:text-destructive h-8 px-2"
                        onClick={() => handleDelete(reply.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-8 text-xs sm:text-sm"
                        onClick={() => handleCopy(reply.id, reply.reply_text)}
                      >
                        {copiedId === reply.id ? (
                          <>
                            <Check className="h-3 w-3 sm:h-4 sm:w-4 text-success mr-1 sm:mr-2" />
                            <span className="hidden sm:inline">Copied</span>
                            <span className="sm:hidden">OK</span>
                          </>
                        ) : (
                          <>
                            <Copy className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                            <span>Copy</span>
                          </>
                        )}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="card-elevated p-12 text-center">
                <Bookmark className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {searchQuery ? "No results found" : "No saved replies yet"}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery
                    ? "Try a different search term."
                    : "Click the star on a reply to save it here."}
                </p>
              </div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const SavedReplies = () => {
  return (
    <ProtectedRoute requireAuth={true}>
      <SavedRepliesContent />
    </ProtectedRoute>
  );
};

export default SavedReplies;
