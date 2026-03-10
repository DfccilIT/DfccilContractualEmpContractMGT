import Heading from '@/components/ui/heading';
import { Users, DollarSign, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
const data = [
  { name: 'Jan', users: 400 },
  { name: 'Feb', users: 800 },
  { name: 'Mar', users: 650 },
  { name: 'Apr', users: 1200 },
  { name: 'May', users: 900 },
  { name: 'Jun', users: 1400 },
];

const Dashboard = () => {
  const stats = [
    { icon: <Users className="text-blue-600" />, label: 'Active Users', value: '12.3K' },
    { icon: <DollarSign className="text-green-600" />, label: 'Revenue', value: '$45.2K' },
    { icon: <Activity className="text-red-600" />, label: 'Performance', value: '87%' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-row items-center justify-between">
        <div className="space-y-1">
          <Heading type={4}>Dashboard</Heading>
          <p className="text-gray-500">Sub Heading</p>
        </div>
      </div>

      <div className="grid md:grid-cols-3 gap-6 mb-10">
        {stats.map((stat, i) => (
          <div key={i} className="bg-white shadow rounded-xl p-5 flex items-center gap-4 hover:shadow-lg transition-all">
            <div className="p-3 bg-gray-100 rounded-full">{stat.icon}</div>
            <div>
              <p className="text-gray-500 text-sm">{stat.label}</p>
              <h3 className="text-xl font-semibold">{stat.value}</h3>
            </div>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">User Growth</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" stroke="#888" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="users" stroke="#2563eb" strokeWidth={3} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Dashboard;
