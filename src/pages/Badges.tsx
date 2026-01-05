import { useAuth } from "@/contexts/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Trophy, Lock, Award, Sparkles, 
  Target, Flame, Layers, Eye, Crown,
  TrendingUp, Star
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BadgeCard from "@/components/BadgeCard";
import ProtectedRoute from "@/components/ProtectedRoute";

interface Badge {
  id: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  required_tier: string | null;
  reward_credits: number;
}

const BadgesContent = () => {
  const { user } = useAuth();
  
  const { data, isLoading, error } = useQuery({
    queryKey: ["badges"],
    queryFn: async () => {
      try {
        const response = await api.getBadges();
        return response;
      } catch (err) {
        console.error('Badges fetch error:', err);
        throw err;
      }
    },
    retry: false,
    enabled: !!user,
  });

  const getCategoryIcon = (category: string) => {
    const icons: Record<string, any> = {
      usage: Target,
      streak: Flame,
      mode: Layers,
      skill: Eye,
      plan: Crown,
    };
    return icons[category] || Trophy;
  };

  const getCategoryName = (category: string) => {
    const names: Record<string, string> = {
      usage: "Gebruik",
      streak: "Streaks",
      mode: "Modi",
      skill: "Vaardigheid",
      plan: "Abonnement",
    };
    return names[category] || category;
  };

  const groupByCategory = (badges: Badge[]) => {
    const grouped: Record<string, Badge[]> = {};
    for (const badge of badges) {
      if (!grouped[badge.category]) {
        grouped[badge.category] = [];
      }
      grouped[badge.category].push(badge);
    }
    return grouped;
  };

  const unlocked = data?.unlocked || [];
  const locked = data?.locked || [];
  const allBadges = [...unlocked, ...locked];

  const groupedAll = groupByCategory(allBadges);
  const groupedUnlocked = groupByCategory(unlocked);
  const groupedLocked = groupByCategory(locked);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Badges laden...</p>
        </div>
      </div>
    );
  }

  if (error) {
    console.error('Badge error details:', error);
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-bold text-foreground mb-2">Kan badges niet laden</h3>
          <p className="text-muted-foreground mb-4">
            Er is een probleem bij het ophalen van badges.
          </p>
          <p className="text-sm text-muted-foreground/70 font-mono">
            {error?.message || 'Onbekende fout'}
          </p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            Probeer opnieuw
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8 py-4 sm:py-8">
        <main className="mx-auto max-w-5xl">
          <AnimatePresence>
            {user ? (
              <motion.div
                key="badges-page"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-4 sm:space-y-8"
              >
                {/* Header */}
                <div>
                  <h1 className="text-xl sm:text-2xl font-bold font-display text-foreground">Badges</h1>
                  <p className="text-sm text-muted-foreground">Verdien badges door analyses te voltooien</p>
                </div>

                {/* Progress Summary */}
                <div className="card-elevated p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br from-primary/30 to-accent/30 flex items-center justify-center">
                        <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl sm:text-2xl font-bold font-display text-foreground">
                          {unlocked.length} / {allBadges.length}
                        </h2>
                        <p className="text-xs sm:text-sm text-muted-foreground">Badges ontgrendeld</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl sm:text-3xl font-bold text-accent">
                        {allBadges.length > 0 ? Math.round((unlocked.length / allBadges.length) * 100) : 0}%
                      </div>
                      <p className="text-[10px] sm:text-xs text-muted-foreground">Voltooid</p>
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 h-auto p-1">
                    <TabsTrigger value="all" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                      <span className="hidden sm:inline">Alle badges</span>
                      <span className="sm:hidden">Alle</span>
                      <span className="ml-1">({allBadges.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="unlocked" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                      <span className="hidden sm:inline">Ontgrendeld</span>
                      <span className="sm:hidden">Open</span>
                      <span className="ml-1">({unlocked.length})</span>
                    </TabsTrigger>
                    <TabsTrigger value="locked" className="text-xs sm:text-sm py-1.5 sm:py-2 px-1 sm:px-3">
                      <span className="hidden sm:inline">Vergrendeld</span>
                      <span className="sm:hidden">Locked</span>
                      <span className="ml-1">({locked.length})</span>
                    </TabsTrigger>
                  </TabsList>

                  {/* All Badges Tab */}
                  <TabsContent value="all" className="space-y-6 sm:space-y-8">
                    {Object.entries(groupedAll).map(([category, badges]) => {
                      const CategoryIcon = getCategoryIcon(category);
                      return (
                        <div key={category}>
                          <h2 className="text-base sm:text-lg font-bold font-display text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                            <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                            {getCategoryName(category)}
                          </h2>
                          <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                            {badges.map((badge) => {
                              const isUnlocked = unlocked.some((u) => u.id === badge.id);
                              const unlockedBadge = unlocked.find((u) => u.id === badge.id);
                              return (
                                <BadgeCard
                                  key={badge.id}
                                  badge={badge}
                                  unlocked={isUnlocked}
                                  unlockedAt={unlockedBadge?.unlocked_at}
                                  size="md"
                                />
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </TabsContent>

                  {/* Unlocked Badges Tab */}
                  <TabsContent value="unlocked" className="space-y-6 sm:space-y-8">
                    {Object.keys(groupedUnlocked).length === 0 ? (
                      <div className="card-elevated p-8 sm:p-12 text-center">
                        <Lock className="h-10 w-10 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-3 sm:mb-4" />
                        <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">Nog geen badges ontgrendeld</h3>
                        <p className="text-muted-foreground mb-4 sm:mb-6 text-xs sm:text-sm">
                          Voltooi je eerste analyse om je eerste badge te verdienen!
                        </p>
                        <Button asChild size="sm">
                          <a href="/dashboard">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Start analyse
                          </a>
                        </Button>
                      </div>
                    ) : (
                      Object.entries(groupedUnlocked).map(([category, badges]) => {
                        const CategoryIcon = getCategoryIcon(category);
                        return (
                          <div key={category}>
                            <h2 className="text-base sm:text-lg font-bold font-display text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-accent" />
                              {getCategoryName(category)}
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                              {badges.map((badge) => {
                                const unlockedBadge = badge as Badge & { unlocked_at: string };
                                return (
                                  <BadgeCard
                                    key={badge.id}
                                    badge={badge}
                                    unlocked={true}
                                    unlockedAt={unlockedBadge.unlocked_at}
                                    size="md"
                                  />
                                );
                              })}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </TabsContent>

                  {/* Locked Badges Tab */}
                  <TabsContent value="locked" className="space-y-6 sm:space-y-8">
                    {Object.keys(groupedLocked).length === 0 ? (
                      <div className="card-elevated p-8 sm:p-12 text-center">
                        <Trophy className="h-10 w-10 sm:h-12 sm:w-12 text-accent mx-auto mb-3 sm:mb-4" />
                        <h3 className="font-bold text-foreground mb-2 text-sm sm:text-base">Alle badges ontgrendeld! 🎉</h3>
                        <p className="text-muted-foreground text-xs sm:text-sm">
                          Geweldig werk! Je hebt alle beschikbare badges verdiend.
                        </p>
                      </div>
                    ) : (
                      Object.entries(groupedLocked).map(([category, badges]) => {
                        const CategoryIcon = getCategoryIcon(category);
                        return (
                          <div key={category}>
                            <h2 className="text-base sm:text-lg font-bold font-display text-foreground mb-3 sm:mb-4 flex items-center gap-2">
                              <CategoryIcon className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
                              {getCategoryName(category)}
                            </h2>
                            <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
                              {badges.map((badge) => (
                                <BadgeCard
                                  key={badge.id}
                                  badge={badge}
                                  unlocked={false}
                                  size="md"
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })
                    )}
                  </TabsContent>
                </Tabs>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

const Badges = () => {
  return (
    <ProtectedRoute requireAuth={true}>
      <BadgesContent />
    </ProtectedRoute>
  );
};

export default Badges;
