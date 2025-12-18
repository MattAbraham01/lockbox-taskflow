"use client";

import { useState, useEffect, useMemo } from "react";
import { useFitnessTrackerContext } from "../../contexts/FitnessTrackerContext";
import { ActivityType, ACTIVITY_TYPES } from "../../hooks/useEncryptedFitnessTracker";

export default function DashboardPage() {
  const fitnessTracker = useFitnessTrackerContext();
  const [animatedValues, setAnimatedValues] = useState<Record<string, number>>({});

  // Calculate real statistics from contract data
  const stats = useMemo(() => {
    let totalMinutes = 0;
    let activitiesWithData = 0;
    let mostActiveType: ActivityType | null = null;
    let maxMinutes = 0;

    ACTIVITY_TYPES.forEach((activity) => {
      const clearData = fitnessTracker.clearActivityData[activity.type];
      if (clearData?.clear !== undefined) {
        const minutes = Number(clearData.clear);
        totalMinutes += minutes;
        if (minutes > 0) {
          activitiesWithData++;
          if (minutes > maxMinutes) {
            maxMinutes = minutes;
            mostActiveType = activity.type;
          }
        }
      }
    });

    const avgMinutesPerActivity = activitiesWithData > 0 ? Math.round(totalMinutes / activitiesWithData) : 0;
    const caloriesBurned = Math.round(totalMinutes * 7.5); // Estimated calories
    const weeklyGoal = 300; // Weekly goal in minutes
    const goalProgress = Math.min(100, Math.round((totalMinutes / weeklyGoal) * 100));

    return {
      totalMinutes,
      activitiesWithData,
      avgMinutesPerActivity,
      caloriesBurned,
      mostActiveType,
      goalProgress,
      weeklyGoal,
      totalActivities: fitnessTracker.totalActivities ?? 0,
    };
  }, [fitnessTracker.clearActivityData, fitnessTracker.totalActivities]);

  // Number animation effect
  useEffect(() => {
    const targets = {
      totalMinutes: stats.totalMinutes,
      caloriesBurned: stats.caloriesBurned,
      goalProgress: stats.goalProgress,
      totalActivities: stats.totalActivities,
    };

    Object.entries(targets).forEach(([key, target]) => {
      let current = 0;
      const increment = target / 30;
      const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
          current = target;
          clearInterval(timer);
        }
        setAnimatedValues(prev => ({ ...prev, [key]: Math.round(current) }));
      }, 30);
    });
  }, [stats]);

  if (!fitnessTracker.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full page-transition">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="text-7xl mb-6">📊</div>
          <h2 className="text-5xl font-bold gradient-text mb-4">
            Data Dashboard
          </h2>
          <p className="text-purple-200 text-xl">
            Connect your wallet to view fitness statistics
          </p>
        </div>
        <button
          className="btn-primary text-white font-bold py-4 px-8 rounded-2xl shadow-2xl text-lg"
          onClick={fitnessTracker.connect}
        >
          🔗 Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 px-4 md:px-6 py-8 page-transition">
      {/* Page Header */}
      <div className="card-glass p-8 slide-in-right">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-3xl shadow-lg">
            📊
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Dashboard</h1>
            <p className="text-purple-300 mt-1">Real-time fitness data overview</p>
          </div>
        </div>
      </div>

      {/* Main Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="⏱️"
          label="Total Duration"
          value={`${animatedValues.totalMinutes ?? 0}`}
          unit="min"
          color="from-blue-500 to-cyan-500"
          delay={0}
        />
        <StatCard
          icon="🔥"
          label="Calories Burned"
          value={`${animatedValues.caloriesBurned ?? 0}`}
          unit="kcal"
          color="from-orange-500 to-red-500"
          delay={1}
        />
        <StatCard
          icon="🎯"
          label="Weekly Goal"
          value={`${animatedValues.goalProgress ?? 0}`}
          unit="%"
          color="from-green-500 to-emerald-500"
          delay={2}
          showProgress
          progress={stats.goalProgress}
        />
        <StatCard
          icon="📝"
          label="Records"
          value={`${animatedValues.totalActivities ?? 0}`}
          unit="times"
          color="from-purple-500 to-pink-500"
          delay={3}
        />
      </div>

      {/* Activity Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Activity Duration Chart */}
        <div className="card-glass p-6 card-enter" style={{ animationDelay: '0.4s' }}>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">📈</span>
            Activity Duration Distribution
          </h3>
          <div className="space-y-4">
            {ACTIVITY_TYPES.map((activity, index) => {
              const clearData = fitnessTracker.clearActivityData[activity.type];
              const minutes = clearData?.clear !== undefined ? Number(clearData.clear) : 0;
              const maxMinutes = Math.max(...ACTIVITY_TYPES.map(a => {
                const d = fitnessTracker.clearActivityData[a.type];
                return d?.clear !== undefined ? Number(d.clear) : 0;
              }), 1);
              const percentage = (minutes / maxMinutes) * 100;

              return (
                <div key={activity.type} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-300 flex items-center gap-2">
                      <span>{activity.label.split(' ')[0]}</span>
                      <span>{activity.label.split(' ')[1]}</span>
                    </span>
                    <span className="text-sm font-bold text-white">{minutes} min</span>
                  </div>
                  <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
                    <div
                      className={`h-full bg-gradient-to-r ${activity.color} rounded-full progress-bar`}
                      style={{ 
                        width: `${percentage}%`,
                        animationDelay: `${index * 0.1}s`
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Activity Status Overview */}
        <div className="card-glass p-6 card-enter" style={{ animationDelay: '0.5s' }}>
          <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <span className="text-2xl">🎯</span>
            Activity Status Overview
          </h3>
          <div className="grid grid-cols-2 gap-4">
            {ACTIVITY_TYPES.map((activity) => {
              const handle = fitnessTracker.activityHandles[activity.type];
              const hasData = handle && handle !== "0";
              const isDecrypted = fitnessTracker.isActivityDecrypted(activity.type);
              const clearData = fitnessTracker.clearActivityData[activity.type];

              return (
                <div
                  key={activity.type}
                  className={`p-4 rounded-xl border transition-all duration-300 ${
                    hasData
                      ? 'bg-gradient-to-br from-gray-800/80 to-gray-900/80 border-purple-500/40'
                      : 'bg-gray-800/30 border-gray-700/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-2xl">{activity.label.split(' ')[0]}</span>
                    <span className="text-sm font-medium text-white">{activity.label.split(' ')[1]}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasData ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                        <span className="text-xs text-green-400">
                          {isDecrypted ? `${clearData?.clear} min` : 'Encrypted'}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="w-2 h-2 rounded-full bg-gray-500" />
                        <span className="text-xs text-gray-500">No data</span>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="card-glass p-6 card-enter" style={{ animationDelay: '0.6s' }}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-xl">
              ⏰
            </div>
            <div>
              <p className="text-sm text-gray-400">Last Updated</p>
              <p className="text-white font-medium">
                {fitnessTracker.lastUpdateTime
                  ? new Date(Number(fitnessTracker.lastUpdateTime) * 1000).toLocaleString('en-US')
                  : 'No records yet'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-400">Weekly Goal</p>
              <p className="text-white font-medium">{stats.weeklyGoal} min</p>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl ${
              stats.goalProgress >= 100 
                ? 'bg-gradient-to-br from-green-500 to-emerald-500' 
                : 'bg-gradient-to-br from-yellow-500 to-orange-500'
            }`}>
              {stats.goalProgress >= 100 ? '🏆' : '💪'}
            </div>
          </div>
        </div>
      </div>

      {/* Decryption Notice */}
      {ACTIVITY_TYPES.some(a => {
        const handle = fitnessTracker.activityHandles[a.type];
        const hasData = handle && handle !== "0";
        const isDecrypted = fitnessTracker.isActivityDecrypted(a.type);
        return hasData && !isDecrypted;
      }) && (
        <div className="card-glass p-4 border border-yellow-500/30 bg-yellow-500/10">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔐</span>
            <div>
              <p className="text-yellow-300 font-medium">Some data is not decrypted</p>
              <p className="text-sm text-yellow-200/70">
                Go to Activities page to decrypt data for complete statistics
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  unit,
  color,
  delay,
  showProgress,
  progress,
}: {
  icon: string;
  label: string;
  value: string;
  unit: string;
  color: string;
  delay: number;
  showProgress?: boolean;
  progress?: number;
}) {
  return (
    <div 
      className="card-glass p-6 card-enter"
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center text-2xl shadow-lg`}>
          {icon}
        </div>
        <span className="text-xs text-purple-400 bg-purple-500/20 px-2 py-1 rounded-full">
          Live
        </span>
      </div>
      <div className="space-y-1">
        <p className="text-sm text-gray-400">{label}</p>
        <div className="flex items-baseline gap-1">
          <span className="stat-value count-up">{value}</span>
          <span className="text-lg text-purple-300">{unit}</span>
        </div>
      </div>
      {showProgress && progress !== undefined && (
        <div className="mt-4">
          <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${color} rounded-full progress-bar`}
              style={{ width: `${Math.min(100, progress)}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
