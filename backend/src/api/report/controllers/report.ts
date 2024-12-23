/**
 * report controller
 */

import { factories } from '@strapi/strapi'

export default factories.createCoreController('api::report.report', ({ strapi }) => ({
  async generate(ctx) {
    const { budgets, incomes, expenses } = ctx.request.body;

    if (!budgets.length && !incomes.length && !expenses.length) {
      return ctx.badRequest("No data available to generate report.");
    }

    // Calculate totals and find max expense
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + expense.amount,
      0,
    );
    const totalIncomes = incomes.reduce(
      (sum, income) => sum + income.amount,
      0,
    );

    let maxExpenseCategory = "N/A";
    let maxExpenseAmount = 0;

    if (expenses.length > 0) {
      const maxExpense = expenses.reduce(
        (max, expense) => (expense.amount > max.amount ? expense : max),
        expenses[0],
      );
      maxExpenseCategory = maxExpense.description;
      maxExpenseAmount = maxExpense.amount;
    }

    // Analyze and generate personalized report
    let report = " ";

    // budget report logic
    if (budgets.length > 0) {
      report += "Based on your data: ";
      budgets.forEach((budget) => {
        report += `Your budget for '${budget.category}' is '${budget.amount}', `;
      });
      report += "<br>";
    }

    // income and expenses report logic
    if (expenses.length > 0) {
      report += `You are spending more on ${maxExpenseCategory} than other expenses. <br>`;
      if (totalExpenses >= totalIncomes) {
        report += `You've spent a total of <strong>$${totalExpenses}</strong> on expenses while having an inflow/income of <strong>$${totalIncomes}</strong>, meaning you've spent more than you earned. Oops!🙁. <br>`;
      } else {
        report += `You've spent a total of <strong>$${totalExpenses}</strong> on expenses while having an inflow/income of <strong>$${totalIncomes}</strong>, meaning you managed to spend less than you earned. Kudos 🎉. <br>`;
      }
    }

    const createdReport = await strapi.query("api::report.report").create({
      data: { report },
    });

    return ctx.send({ report: createdReport.report });
  },
}));
