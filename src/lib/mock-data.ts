export interface TrendData {
    date: string;
    amount: number;
}

export interface SourceData {
    name: string;
    value: number;
    color: string;
}

// Mock Data for Politician (Mayor Johnson)
export const politicianTrends: TrendData[] = [
    { date: 'Jan 2024', amount: 150000 },
    { date: 'Feb 2024', amount: 320000 },
    { date: 'Mar 2024', amount: 480000 },
    { date: 'Apr 2024', amount: 650000 },
    { date: 'May 2024', amount: 890000 },
    { date: 'Jun 2024', amount: 1245000 },
];

export const politicianSources: SourceData[] = [
    { name: 'PACs', value: 450000, color: '#3b82f6' }, // Blue
    { name: 'Labor', value: 350000, color: '#a855f7' }, // Purple
    { name: 'Corporate', value: 250000, color: '#f59e0b' }, // Amber
    { name: 'Individual', value: 195000, color: '#10b981' }, // Emerald
];

// Mock Data for City (Palm Springs)
export const cityTrends: TrendData[] = [
    { date: '2020', amount: 8500000 },
    { date: '2021', amount: 4200000 }, // Off-cycle
    { date: '2022', amount: 9800000 },
    { date: '2023', amount: 5100000 }, // Off-cycle
    { date: '2024', amount: 12500000 },
];

export const citySources: SourceData[] = [
    { name: 'Residents', value: 4500000, color: '#6366f1' }, // Indigo
    { name: 'Non-Residents', value: 3200000, color: '#ec4899' }, // Pink
    { name: 'Business Entities', value: 3800000, color: '#06b6d4' }, // Cyan
    { name: 'PACs', value: 1000000, color: '#f43f5e' }, // Rose
];
