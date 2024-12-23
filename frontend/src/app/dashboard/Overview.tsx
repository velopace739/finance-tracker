'use client'
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BarChart from './budget/BarChart';
import PieChart from './budget/PieChart';

const Overview: React.FC = () => {
  const [budgets, setBudgets] = useState<{ category: string; amount: number; }[]>([]);
  const [chartType, setChartType] = useState<'bar' | 'pie'>('bar');
  const [incomes, setIncomes] = useState<{ description: string; amount: number; }[]>([]);
  const [expenses, setExpenses] = useState<{ description: string; amount: number; }[]>([]);
  const [report, setReport] = useState('');

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await axios.get('http://localhost:1337/api/budgets');
        const data = res.data.data.map((budget: any) => ({
          category: budget.category,
          amount: budget.amount,
        }));
        setBudgets(data);
      } catch (error) {
        console.error('Error fetching budgets:', error);
      }
    };

    const fetchIncomesAndExpenses = async () => {
      try {
        const incomeRes = await axios.get('http://localhost:1337/api/incomes');
        const expenseRes = await axios.get('http://localhost:1337/api/expenses');

        const incomeData = incomeRes.data.data.map((income: any) => ({
          description: income.description,
          amount: income.amount,
        }));

        const expenseData = expenseRes.data.data.map((expense: any) => ({
          description: expense.description,
          amount: expense.amount,
        }));

        setIncomes(incomeData);
        setExpenses(expenseData);
      } catch (error) {
        console.error('Error fetching incomes and expenses:', error);
      }
    };

    fetchBudgets();
    fetchIncomesAndExpenses();
  }, []);

  const generateReport = async () => {
    try {
      const res = await axios.post("http://localhost:1337/api/generate-report", {
        budgets,
        incomes,
        expenses,
      });

      setReport(res.data.report);
    } catch (error) {
      console.error("Failed to generate report:", error);
      alert("Failed to generate report");
    }
  };

  const categories = budgets.map(budget => budget.category);
  const amounts = budgets.map(budget => budget.amount);

  return (
    <main className="flex-1 overflow-x-hidden overflow-y-auto pl-8">
      <div className="container mx-auto py-6">
        <section className="w-full flex flex-row justify-between py-4 px-[15px]">
          <h2 className="text-2xl text-gray-700 font-medium">OVERVIEW</h2>
          <div>
            <button onClick={() => setChartType('bar')} className={`mx-2 py-2 px-3 ${chartType === 'bar' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-lg`}>
              Bar Chart
            </button>
            <button onClick={() => setChartType('pie')} className={`mx-2 py-2 px-3 ${chartType === 'pie' ? 'bg-teal-500 text-white' : 'bg-gray-200 text-gray-700'} rounded-lg`}>
              Pie Chart
            </button>
          </div>
        </section>
        <section className="mt-5">
          {chartType === 'bar' ? (
            <BarChart categories={categories} amounts={amounts} />
          ) : (
            <PieChart categories={categories} amounts={amounts} />
          )}
        </section>

        <div className="container mx-auto py-5 flex justify-center">
          <button
            onClick={generateReport}
            className="bg-teal-500 text-white py-2 px-4 rounded-lg"
          >
            Generate Report
          </button>
        </div>

        {report && (
          <div className="mb-10 p-5 bg-gray-100 rounded-lg">
            <h3 className="text-xl font-semibold mb-2">Financial Report</h3>
            <div id="report-content" dangerouslySetInnerHTML={{ __html: report }}></div>
            <button
              // onClick={printReport}
              className="mt-4 bg-teal-500 text-white py-2 px-4 rounded-lg"
            >
              Export as PDF
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default Overview;