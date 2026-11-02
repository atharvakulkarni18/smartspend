import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

// Register all required Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Global defaults for dark theme
ChartJS.defaults.color = '#9ca3af';
ChartJS.defaults.font.family = "'Inter', sans-serif";
ChartJS.defaults.plugins.tooltip.backgroundColor = '#1f2937';
ChartJS.defaults.plugins.tooltip.titleColor = '#f9fafb';
ChartJS.defaults.plugins.tooltip.bodyColor = '#e5e7eb';
ChartJS.defaults.plugins.tooltip.borderColor = 'rgba(255, 255, 255, 0.1)';
ChartJS.defaults.plugins.tooltip.borderWidth = 1;
ChartJS.defaults.plugins.tooltip.padding = 12;
ChartJS.defaults.plugins.tooltip.cornerRadius = 8;

export default ChartJS;
