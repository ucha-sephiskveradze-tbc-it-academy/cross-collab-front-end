export const MOCK_EVENTS = [
  {
    id: 1,
    eventId: 101,
    title: 'Happy Friday: Retro Game Night',
    description: 'Unwind with classics and snacks.',
    startDateTime: '2025-01-17T18:00:00Z',
    endDateTime: '2025-01-17T21:00:00Z',
    location: 'Recreation Lounge',
    category: { categoryId: 5, categoryName: 'Happy Friday' },
    capacity: 40,
    totalRegistered: 22,
    currentUserStatus: 'REGISTERED',
  },
  {
    id: 2,
    eventId: 102,
    title: 'Team Building: Escape Room Challenge',
    description: 'Solve puzzles together in a timed escape room.',
    startDateTime: '2025-01-20T15:00:00Z',
    endDateTime: '2025-01-20T17:00:00Z',
    location: 'Off-site',
    category: { categoryId: 2, categoryName: 'Team Building' },
    capacity: 20,
    totalRegistered: 10,
    currentUserStatus: 'REGISTERED',
  },
  {
    id: 3,
    eventId: 103,
    title: 'Happy Friday: Karaoke & Pizza',
    description: 'Sing your heart out and enjoy pizza with colleagues.',
    startDateTime: '2025-02-07T19:00:00Z',
    endDateTime: '2025-02-07T22:00:00Z',
    location: 'Training Room B',
    category: { categoryId: 5, categoryName: 'Happy Friday' },
    capacity: 30,
    totalRegistered: 12,
    currentUserStatus: 'REGISTERED',
  },
  {
    id: 4,
    eventId: 104,
    title: 'Team Building: Blindfold Trust Walk',
    description: 'Build trust through guided blindfold activities.',
    startDateTime: '2025-02-12T10:00:00Z',
    endDateTime: '2025-02-12T12:00:00Z',
    location: 'Grand Conference Hall',
    category: { categoryId: 2, categoryName: 'Team Building' },
    capacity: 50,
    totalRegistered: 35,
    currentUserStatus: 'NONE',
  },
  {
    id: 5,
    eventId: 105,
    title: 'Happy Friday: Office Olympics',
    description: 'Compete in fun mini-games across departments.',
    startDateTime: '2025-02-21T16:00:00Z',
    endDateTime: '2025-02-21T18:00:00Z',
    location: 'Training Room A',
    category: { categoryId: 5, categoryName: 'Happy Friday' },
    capacity: 60,
    totalRegistered: 48,
    currentUserStatus: 'REGISTERED',
  },
];
export const DATE_RANGE_OPTIONS = [
  { label: 'Last 7 Days', value: 'last7' },
  { label: 'Last 30 Days', value: 'last30' },
  { label: 'Last 90 Days', value: 'last90' },
];
export const CATEGORY_OPTIONS = [
  { label: 'All Categories', value: 'all' },
  { label: 'Conference', value: 'conference' },
];
export const LOCATION_OPTIONS = [
  { label: 'All Locations', value: 'all' },
  { label: 'Tbilisi', value: 'tbilisi' },
  { label: 'Online', value: 'online' },
];
export const STATUS_OPTIONS = [
  { label: 'All Events', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Published', value: 'published' },
];

export const MOCK_KPIS = [
  {
    key: 'registrations',
    label: 'Total Registrations',
    value: 847,
    change: '+12.5%',
    trend: 'up',
    description: 'vs. previous period',
    icon: 'pi pi-calendar',
  },
  {
    key: 'active',
    label: 'Active Participants',
    value: 342,
    change: '+8.3%',
    trend: 'up',
    description: 'unique employees engaged',
    icon: 'pi pi-users',
  },
  {
    key: 'cancellation',
    label: 'Cancellation Rate',
    value: '12%',
    change: '-3.2%',
    trend: 'down',
    description: 'improved from last period',
    icon: 'pi pi-times',
  },
];

// analytics.data.ts

export const REGISTRATION_TREND_DATA = {
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  datasets: [
    {
      label: 'Registrations',
      data: [120, 150, 180, 210, 170, 260, 200, 180, 230, 210, 195, 180],

      // 🔥 THIS is the trick
      backgroundColor: (ctx: any) => {
        const currentMonthIndex = new Date().getMonth();
        return ctx.dataIndex === currentMonthIndex
          ? '#111111' // current month (black)
          : '#d4d4d4'; // other months (gray)
      },

      borderRadius: 4,
      maxBarThickness: 36,
    },
  ],
};

export const REGISTRATION_TREND_OPTIONS = {
  plugins: {
    legend: { display: false },
  },
  scales: {
    x: {
      grid: { display: false },
    },
    y: {
      grid: { color: '#e5e7eb' },
      ticks: { display: false },
    },
  },
};

export const CATEGORY_CHART_DATA = {
  labels: ['Team Building', 'Workshops', 'Sports', 'Happy Friday', 'Cultural', 'Wellness'],
  datasets: [
    {
      data: [30, 20, 15, 12.5, 10, 12.5],
      backgroundColor: ['#111111', '#4b5563', '#6b7280', '#9ca3af', '#d1d5db', '#e5e7eb'],
      borderWidth: 0,
    },
  ],
};

export const CATEGORY_CHART_OPTIONS = {
  cutout: '70%',
  plugins: {
    legend: {
      position: 'right',
      labels: {
        boxWidth: 10,
        padding: 16,
      },
    },
  },
};
export const TOP_EVENTS = [
  {
    rank: 1,
    name: 'Annual Team Building Summit',
    category: 'Team Building',
    date: 'Jan 18, 2025',
    registrations: 142,
    capacity: 150,
    utilization: 95,
    waitlist: 24,
  },
  {
    rank: 2,
    name: 'Innovation Hackathon 2025',
    category: 'Workshop',
    date: 'Mar 10–12, 2025',
    registrations: 156,
    capacity: 180,
    utilization: 87,
    waitlist: 18,
  },
  {
    rank: 3,
    name: 'Yoga & Meditation Sessions',
    category: 'Wellness',
    date: 'Weekly',
    registrations: 87,
    capacity: 100,
    utilization: 87,
    waitlist: 15,
  },
  {
    rank: 4,
    name: 'Happy Friday: Game Night',
    category: 'Happy Friday',
    date: 'Jan 24, 2025',
    registrations: 50,
    capacity: 50,
    utilization: 100,
    waitlist: 12,
  },
  {
    rank: 5,
    name: 'Annual Company Picnic',
    category: 'Team Building',
    date: 'Feb 15, 2025',
    registrations: 198,
    capacity: 250,
    utilization: 79,
    waitlist: 8,
  },
  {
    rank: 6,
    name: 'Tech Talk: AI in Business Operations',
    category: 'Workshop',
    date: 'Jan 26, 2025',
    registrations: 67,
    capacity: 100,
    utilization: 67,
    waitlist: 3,
  },
  {
    rank: 7,
    name: 'Leadership Workshop: Effective Communication',
    category: 'Workshop',
    date: 'Jan 20, 2025',
    registrations: 28,
    capacity: 30,
    utilization: 93,
    waitlist: 5,
  },
  {
    rank: 8,
    name: 'Cultural Exchange Night',
    category: 'Cultural',
    date: 'Feb 05, 2025',
    registrations: 74,
    capacity: 90,
    utilization: 82,
    waitlist: 6,
  },
  {
    rank: 9,
    name: 'Wellness Week: Mental Health Sessions',
    category: 'Wellness',
    date: 'Feb 10–14, 2025',
    registrations: 120,
    capacity: 150,
    utilization: 80,
    waitlist: 10,
  },
  {
    rank: 10,
    name: 'Sports Day: Indoor Tournament',
    category: 'Sports',
    date: 'Mar 02, 2025',
    registrations: 96,
    capacity: 120,
    utilization: 80,
    waitlist: 7,
  },
];

export const DEPARTMENT_PARTICIPATION = [
  {
    department: 'Engineering',
    totalEmployees: 120,
    activeParticipants: 89,
    participationRate: 74,
    totalRegistrations: 234,
    avgEventsPerEmployee: 2.6,
    trend: '+8%',
  },
  {
    department: 'Sales & Marketing',
    totalEmployees: 85,
    activeParticipants: 67,
    participationRate: 79,
    totalRegistrations: 186,
    avgEventsPerEmployee: 2.8,
    trend: '+12%',
  },
  {
    department: 'Human Resources',
    totalEmployees: 32,
    activeParticipants: 28,
    participationRate: 88,
    totalRegistrations: 94,
    avgEventsPerEmployee: 3.4,
    trend: '+6%',
  },
  {
    department: 'Finance',
    totalEmployees: 45,
    activeParticipants: 28,
    participationRate: 62,
    totalRegistrations: 67,
    avgEventsPerEmployee: 2.4,
    trend: '+3%',
  },
  {
    department: 'Operations',
    totalEmployees: 78,
    activeParticipants: 52,
    participationRate: 67,
    totalRegistrations: 134,
    avgEventsPerEmployee: 2.6,
    trend: '+5%',
  },
  {
    department: 'Product',
    totalEmployees: 65,
    activeParticipants: 43,
    participationRate: 66,
    totalRegistrations: 108,
    avgEventsPerEmployee: 2.5,
    trend: '+7%',
  },
  {
    department: 'Customer Success',
    totalEmployees: 75,
    activeParticipants: 35,
    participationRate: 47,
    totalRegistrations: 24,
    avgEventsPerEmployee: 1.9,
    trend: '-2%',
  },
];
