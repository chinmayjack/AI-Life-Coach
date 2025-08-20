import { useState } from 'react';

export default function ScenarioForm({ onSubmit }) {
  const [scenario, setScenario] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(scenario);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="bg-white shadow-2xl rounded-3xl p-8 w-full max-w-xl mx-auto mt-10 transform transition hover:scale-105 duration-300"
    >
      <label className="block text-2xl font-semibold mb-4 text-gray-800">
        Describe your decision or situation:
      </label>
      <textarea
        value={scenario}
        onChange={(e) => setScenario(e.target.value)}
        rows="6"
        className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-indigo-500 focus:outline-none text-gray-700"
        placeholder="E.g., I am considering moving to a new city for work..."
      />
      <button 
        type="submit" 
        className="mt-6 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white py-3 px-6 rounded-2xl shadow-lg hover:scale-105 hover:shadow-xl transition transform duration-300 font-semibold"
      >
        Analyze
      </button>
    </form>
  );
}
