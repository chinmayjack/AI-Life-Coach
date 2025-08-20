import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export default function ScenarioChart({ data }) {
  if (!data) return null;

  const chartData = {
    labels: data.scenarios, // ["Scenario 1", "Scenario 2", "Scenario 3"]
    datasets: [
      {
        label: 'Financial Impact ($)',
        data: data.financial, // [value1, value2, value3]
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
      },
      {
        label: 'Stress Level',
        data: data.stress, // [value1, value2, value3]
        backgroundColor: 'rgba(16, 185, 129, 0.7)',
      },
      {
        label: 'Lifestyle Score',
        data: data.lifestyle, // [value1, value2, value3]
        backgroundColor: 'rgba(239, 68, 68, 0.7)',
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Scenario Comparison' },
    },
  };

  return <Bar data={chartData} options={options} />;
}
