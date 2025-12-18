"use client";

import { useState, useMemo } from "react";
import { useFitnessTrackerContext } from "../../contexts/FitnessTrackerContext";
import { ActivityType, ACTIVITY_TYPES } from "../../hooks/useEncryptedFitnessTracker";

type TimeRange = 'week' | 'month' | 'year';

export default function StatisticsPage() {
  const fitnessTracker = useFitnessTrackerContext();
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [selectedActivity, setSelectedActivity] = useState<ActivityType | 'all'>('all');

  // Calculate statistics data
  const analysisData = useMemo(() => {
    const activityStats = ACTIVITY_TYPES.map((activity) => {
      const clearData = fitnessTracker.clearActivityData[activity.type];
      const minutes = clearData?.clear !== undefined ? Number(clearData.clear) : 0;
      const calories = Math.round(minutes * getCalorieMultiplier(activity.type));
      
      const handle = fitnessTracker.activityHandles[activity.type];
      return {
        ...activity,
        minutes,
        calories,
        isDecrypted: fitnessTracker.isActivityDecrypted(activity.type),
        hasData: Boolean(handle && handle !== "0"),
      };
    });

    const totalMinutes = activityStats.reduce((sum, a) => sum + a.minutes, 0);
    const totalCalories = activityStats.reduce((sum, a) => sum + a.calories, 0);
    const activeTypes = activityStats.filter(a => a.minutes > 0).length;
    
    // Find most active activity
    const mostActive = activityStats.reduce((max, a) => 
      a.minutes > max.minutes ? a : max, activityStats[0]);
    
    // Calculate average duration per session
    const avgPerSession = fitnessTracker.totalActivities && fitnessTracker.totalActivities > 0
      ? Math.round(totalMinutes / fitnessTracker.totalActivities)
      : 0;

    return {
      activityStats,
      totalMinutes,
      totalCalories,
      activeTypes,
      mostActive,
      avgPerSession,
      totalSessions: fitnessTracker.totalActivities ?? 0,
    };
  }, [fitnessTracker.clearActivityData, fitnessTracker.activityHandles, fitnessTracker.totalActivities, fitnessTracker.isActivityDecrypted]);

  if (!fitnessTracker.isConnected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 w-full page-transition">
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div className="text-7xl mb-6">📈</div>
          <h2 className="text-5xl font-bold gradient-text mb-4">
            Statistics
          </h2>
          <p className="text-purple-200 text-xl">
            Connect your wallet to view detailed fitness analytics
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
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-3xl shadow-lg">
            📈
          </div>
          <div>
            <h1 className="text-4xl font-bold gradient-text">Statistics</h1>
            <p className="text-purple-300 mt-1">Deep fitness data analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-6">
          {/* Time Range Selection */}
          <div className="flex bg-gray-800/50 rounded-xl p-1 border border-purple-500/20">
            {(['week', 'month', 'year'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                  timeRange === range
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {range === 'week' ? 'Week' : range === 'month' ? 'Month' : 'Year'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Overview Statistics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <OverviewCard
          icon="⏱️"
          label="Total Duration"
          value={analysisData.totalMinutes}
          unit="min"
          trend="+12%"
          trendUp={true}
        />
        <OverviewCard
          icon="🔥"
          label="Calories Burned"
          value={analysisData.totalCalories}
          unit="kcal"
          trend="+8%"
          trendUp={true}
        />
        <OverviewCard
          icon="📝"
          label="Sessions"
          value={analysisData.totalSessions}
          unit="times"
          trend="+5%"
          trendUp={true}
        />
        <OverviewCard
          icon="⚡"
          label="Avg Duration"
          value={analysisData.avgPerSession}
          unit="min/session"
          trend="+3%"
          trendUp={true}
        />
      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Activity Type Analysis */}
        <div className="lg:col-span-2 card-glass p-6 card-enter">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-2xl">🏋️</span>
              Activity Type Analysis
            </h3>
            <select
              value={selectedActivity}
              onChange={(e) => setSelectedActivity(e.target.value as ActivityType | 'all')}
              className="bg-gray-800/50 border border-purple-500/30 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
            >
              <option value="all">All Activities</option>
              {ACTIVITY_TYPES.map((activity) => (
                <option key={activity.type} value={activity.type}>
                  {activity.label}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-6">
            {analysisData.activityStats
              .filter(a => selectedActivity === 'all' || a.type === selectedActivity)
              .map((activity, index) => (
                <ActivityAnalysisRow
                  key={activity.type}
                  activity={activity}
                  maxMinutes={Math.max(...analysisData.activityStats.map(a => a.minutes), 1)}
                  index={index}
                />
              ))}
          </div>
        </div>

        {/* Sidebar Statistics */}
        <div className="space-y-6">
          {/* Most Active Activity */}
          <div className="card-glass p-6 card-enter border-glow">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🏆</span>
              Most Active
            </h3>
            {analysisData.mostActive.minutes > 0 ? (
              <div className="flex items-center gap-4">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${analysisData.mostActive.color} flex items-center justify-center text-3xl shadow-lg`}>
                  {analysisData.mostActive.label.split(' ')[0]}
                </div>
                <div>
                  <p className="text-white font-bold text-lg">
                    {analysisData.mostActive.label.split(' ')[1]}
                  </p>
                  <p className="text-purple-300">
                    {analysisData.mostActive.minutes} min
                  </p>
                  <p className="text-sm text-gray-400">
                    {analysisData.mostActive.calories} kcal
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-gray-400 text-center py-4">No data yet</p>
            )}
          </div>

          {/* Activity Diversity */}
          <div className="card-glass p-6 card-enter">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">🎯</span>
              Activity Diversity
            </h3>
            <div className="flex items-center justify-center">
              <div className="relative w-32 h-32">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="rgba(147, 51, 234, 0.2)"
                    strokeWidth="12"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="12"
                    strokeLinecap="round"
                    strokeDasharray={`${(analysisData.activeTypes / 6) * 352} 352`}
                    className="transition-all duration-1000"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#9333ea" />
                      <stop offset="100%" stopColor="#ec4899" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{analysisData.activeTypes}</span>
                  <span className="text-xs text-purple-300">/ 6 types</span>
                </div>
              </div>
            </div>
            <p className="text-center text-sm text-gray-400 mt-4">
              Participated in {analysisData.activeTypes} different activity types
            </p>
          </div>

          {/* Health Suggestions */}
          <div className="card-glass p-6 card-enter">
            <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-xl">💡</span>
              Health Tips
            </h3>
            <div className="space-y-3">
              <SuggestionItem
                icon="🏃"
                text={analysisData.totalMinutes < 150 
                  ? "Aim for at least 150 min/week" 
                  : "Great job! Keep it up!"}
                type={analysisData.totalMinutes >= 150 ? 'success' : 'warning'}
              />
              <SuggestionItem
                icon="🎯"
                text={analysisData.activeTypes < 3 
                  ? "Try more activity types" 
                  : "Good variety of activities!"}
                type={analysisData.activeTypes >= 3 ? 'success' : 'info'}
              />
              <SuggestionItem
                icon="⚡"
                text={analysisData.avgPerSession < 20 
                  ? "Aim for 20+ min per session" 
                  : "Session duration is good"}
                type={analysisData.avgPerSession >= 20 ? 'success' : 'warning'}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Data Decryption Notice */}
      {analysisData.activityStats.some(a => a.hasData && !a.isDecrypted) && (
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

function getCalorieMultiplier(activityType: ActivityType): number {
  const multipliers: Record<ActivityType, number> = {
    [ActivityType.Running]: 10,
    [ActivityType.Cycling]: 8,
    [ActivityType.Swimming]: 11,
    [ActivityType.Weightlifting]: 6,
    [ActivityType.Yoga]: 4,
    [ActivityType.Walking]: 5,
  };
  return multipliers[activityType] || 7;
}

function OverviewCard({
  icon,
  label,
  value,
  unit,
  trend,
  trendUp,
}: {
  icon: string;
  label: string;
  value: number;
  unit: string;
  trend: string;
  trendUp: boolean;
}) {
  return (
    <div className="card-glass p-5 card-enter">
      <div className="flex items-center justify-between mb-3">
        <span className="text-2xl">{icon}</span>
        <span className={`text-xs px-2 py-1 rounded-full ${
          trendUp ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
        }`}>
          {trend}
        </span>
      </div>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-sm text-purple-300">{unit}</span>
      </div>
    </div>
  );
}

function ActivityAnalysisRow({
  activity,
  maxMinutes,
  index,
}: {
  activity: {
    type: ActivityType;
    label: string;
    color: string;
    minutes: number;
    calories: number;
    isDecrypted: boolean;
    hasData: boolean;
  };
  maxMinutes: number;
  index: number;
}) {
  const percentage = (activity.minutes / maxMinutes) * 100;

  return (
    <div 
      className="p-4 rounded-xl bg-gray-800/30 border border-purple-500/20 transition-all duration-300 hover:border-purple-500/40 hover:bg-gray-800/50"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${activity.color} flex items-center justify-center text-xl`}>
            {activity.label.split(' ')[0]}
          </div>
          <div>
            <p className="text-white font-medium">{activity.label.split(' ')[1]}</p>
            <p className="text-xs text-gray-400">
              {activity.isDecrypted ? 'Decrypted' : activity.hasData ? 'Pending' : 'No data'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-white font-bold">{activity.minutes} min</p>
          <p className="text-sm text-purple-300">{activity.calories} kcal</p>
        </div>
      </div>
      <div className="h-2 bg-gray-700/50 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${activity.color} rounded-full progress-bar`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

function SuggestionItem({
  icon,
  text,
  type,
}: {
  icon: string;
  text: string;
  type: 'success' | 'warning' | 'info';
}) {
  const colors = {
    success: 'bg-green-500/20 border-green-500/30 text-green-300',
    warning: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300',
    info: 'bg-blue-500/20 border-blue-500/30 text-blue-300',
  };

  return (
    <div className={`p-3 rounded-lg border ${colors[type]} flex items-center gap-2`}>
      <span>{icon}</span>
      <span className="text-sm">{text}</span>
    </div>
  );
}
