import React, { createContext, useContext, useEffect, useState } from 'react';

const StatsContext = createContext(null);

export const useStats = () => useContext(StatsContext);

const initialStats = {
  xp: 0,
  streak: 0,
  lastActiveDate: null,
  badges: [],
};

const computeBadges = (xp, streak) => {
  const badges = [];
  if (xp >= 50) badges.push('Beginner');
  if (streak >= 5) badges.push('Consistent Learner');
  if (xp >= 300) badges.push('Quiz Master');
  return badges;
};

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(initialStats);

  useEffect(() => {
    const stored = localStorage.getItem('qq_stats');
    if (stored) {
      try {
        setStats(JSON.parse(stored));
      } catch {
        setStats(initialStats);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('qq_stats', JSON.stringify(stats));
  }, [stats]);

  const ensureStreakForToday = () => {
    const today = new Date().toISOString().slice(0, 10);
    setStats(prev => {
      if (!prev.lastActiveDate) {
        return { ...prev, streak: 1, lastActiveDate: today };
      }
      if (prev.lastActiveDate === today) return prev;

      const prevDate = new Date(prev.lastActiveDate);
      const diffMs = new Date(today).getTime() - prevDate.getTime();
      const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

      const newStreak = diffDays === 1 ? prev.streak + 1 : 1;
      return { ...prev, streak: newStreak, lastActiveDate: today };
    });
  };

  const awardXP = (amount, reason) => {
    setStats(prev => {
      const base = { ...prev };
      const nextXp = base.xp + amount;
      const next = {
        ...base,
        xp: nextXp,
      };
      next.badges = computeBadges(nextXp, next.streak);
      return next;
    });
    ensureStreakForToday();
  };

  const value = {
    stats,
    awardXP,
  };

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

