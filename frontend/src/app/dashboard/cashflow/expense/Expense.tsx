'use client'
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ExpenseForm from './ExpenseForm';
import { format, parseISO } from 'date-fns';
import { FaEdit, FaPlus, FaTrash } from 'react-icons/fa';
import { BsThreeDotsVertical } from "react-icons/bs";

interface Expense {
  documentId: string;
  description: string;
  createdAt: string;
  amount: number;
}

interface ExpenseProps {
  refreshCashflow: () => void;
}

const Expense: React.FC<ExpenseProps> = ({ refreshCashflow }) => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isExpenseFormOpen, setIsExpenseFormOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null);

  useEffect(() => {
    fetchExpenses();
  }, []);

  const fetchExpenses = () => {
    fetch("http://localhost:1337/api/expenses")
      .then((res) => {
        if (!res.ok) {
          throw new Error("Network response was not ok");
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data.data)) {
          setExpenses(data.data);
        } else {
          console.error("Fetched data is not an array");
        }
      })
      .catch((error) => {
        console.error("Error fetching expenses:", error);
      });
  };

  const handleOpenExpenseForm = () => {
    setSelectedExpense(null);
    setIsExpenseFormOpen(true);
  };

  const handleCloseExpenseForm = () => {
    setSelectedExpense(null);
    setIsExpenseFormOpen(false);
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsExpenseFormOpen(true);
  };

  const handleDeleteExpense = async (documentId: string) => {
    try {
      await axios.delete(`http://localhost:1337/api/expenses/${documentId}`);
      setExpenses(expenses.filter((expense) => expense.documentId !== documentId));
      refreshCashflow();
    } catch (error) {
      console.error(error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = parseISO(dateString);
    return format(date, 'yyyy-MM-dd HH:mm:ss');
  };

  const toggleDropdown = (documentId: string) => {
    setDropdownOpen(dropdownOpen === documentId ? null : documentId);
  };

  return (
    <section className="w-1/3 h-screen bg-gray-200">
      <section className="border-b-2 border-gray-300 lg:px-6 py-3 flex justify-between">
        <h1 className="mt-6 text-xl">Expenses</h1>
        <section className="flex mt-6">
          <figure onClick={handleOpenExpenseForm}>
            <FaPlus className="text-gray-600 cursor-pointer" />
          </figure>
        </section>
      </section>
      <article className="w-full px-5">
        {expenses.map((expense) => (
          <article key={expense.documentId} className="h-full border-2 bg-gray-100 rounded-lg mt-4">
            <article className="py-3 px-4 border-l-4 border-red-400">
              <section className="flex flex-col">
                <section className="flex justify-between mb-3">
                  <p className="leading-relaxed font-medium text-lg">{expense.description}</p>
                  <div className="relative inline-block text-left">
                    <button
                      className="p-1"
                      onClick={() => toggleDropdown(expense.documentId)}
                    >
                      <BsThreeDotsVertical
                        className="text-gray-600 cursor-pointer ml-1 w-4 h-4"
                      />
                    </button>
                    {dropdownOpen === expense.documentId && (
                      <div className="origin-top-right absolute right-0 mt-0 mr-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                        <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                          <div
                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleEditExpense(expense)}>
                            <FaEdit className="mr-2 mt-1" />
                            <span>Edit</span>
                          </div>
                          <div
                            className="flex px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleDeleteExpense(expense.documentId)}>
                            <FaTrash className="mr-2 mt-1" />
                            <span>Delete</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </section>
                <section className="flex justify-between mt-2">
                  <span className="text-sm text-gray-500">{formatDate(expense.createdAt)}</span>
                  <h1 className="text-lg font-medium text-red-500">${expense.amount}</h1>
                </section>
              </section>
            </article>
          </article>
        ))}
      </article>
      {isExpenseFormOpen && (
        <ExpenseForm
          isOpen={isExpenseFormOpen}
          onClose={() => {
            handleCloseExpenseForm();
            fetchExpenses(); // Refresh expenses
          }}
          expense={selectedExpense}
          refreshCashflow={() => {
            refreshCashflow();
            fetchExpenses(); // Refresh expenses after cashflow update
          }}
        />
      )}
    </section>
  );
};

export default Expense;