import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getSupabase } from './supabase';

export const generateKerdosPDF = async () => {
  const doc = new jsPDF();
  
  // Try to get theme color
  const theme = localStorage.getItem("kerdos_theme") || "neon";
  let themeColor: [number, number, number] = [0, 255, 194]; // Neon
  let themeHex = "#00ffc2";
  if (theme === "amber") { themeColor = [255, 176, 0]; themeHex = "#ffb000"; }
  if (theme === "blue") { themeColor = [0, 212, 255]; themeHex = "#00d4ff"; }
  if (theme === "violet") { themeColor = [176, 0, 255]; themeHex = "#b000ff"; }

  // Try to get current data
  let expenses = [];
  let incomes = [];
  const supabase = getSupabase();
  if (supabase) {
    const { data: expData } = await supabase.from('expenses').select('*');
    const { data: incData } = await supabase.from('incomes').select('*');
    expenses = expData || [];
    incomes = incData || [];
  } else {
    expenses = JSON.parse(localStorage.getItem("kerdos_expenses") || '[]');
    incomes = JSON.parse(localStorage.getItem("kerdos_incomes") || '[]');
  }
  
  const userData = JSON.parse(localStorage.getItem("kerdos_onboarding_data") || '{}');
  const currency = localStorage.getItem("kerdos_currency") || "BRL";
  
  const formatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency });

  // Deep dark theme for PDF to match app aesthetic
  const darkBg = '#020408';
  const cardBg = '#0a1a2f';

  // Draw Header Background
  doc.setFillColor(2, 4, 8); // #020408
  doc.rect(0, 0, 210, 297, 'F'); // Full dark background

  // Header Box
  doc.setFillColor(10, 26, 47); // #0a1a2f
  doc.rect(10, 10, 190, 40, 'F');
  
  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text('KERDOS', 20, 28);
  
  // Subtitle
  doc.setFontSize(9);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('A.E.G.I.S. TERMINAL | RELATÓRIO CONSOLIDADO', 20, 35);

  // Logo / System Info
  doc.setFontSize(10);
  doc.setTextColor(150, 150, 150);
  doc.text('GERADO VIA SISTEMA CENTRAL', 140, 25);
  doc.text(`DATA: ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR')}`, 140, 32);

  // User Info Block
  doc.setFillColor(10, 26, 47);
  doc.rect(10, 55, 190, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('OPERADOR:', 20, 65);
  doc.setFont('helvetica', 'bold');
  doc.text(`${userData.name?.toUpperCase() || 'DESCONHECIDO'}`, 50, 65);

  doc.setFont('helvetica', 'normal');
  doc.text('OBJETIVO:', 20, 75);
  doc.setFont('helvetica', 'bold');
  doc.text(`${userData.goal ? userData.goal.toUpperCase() : 'NÃO DEFINIDO'}`, 50, 75);

  // Totals Calculation (matching SmartDashboard logic approximately)
  const baseIncome = Number(userData.income) || 0;
  const customIncomeTotal = incomes.reduce((acc: number, inc: any) => acc + (inc.amount || 0), 0);
  const totalIncome = baseIncome + (baseIncome * 0.038) + customIncomeTotal;
  
  const customExpenseTotal = expenses.reduce((acc: number, exp: any) => acc + (exp.amount || 0), 0);
  const baseExpenses = (baseIncome * 0.2976) + (baseIncome * 0.10125) + (baseIncome * 0.0369);
  const totalExpense = baseExpenses + customExpenseTotal;
  
  const balance = totalIncome - totalExpense;
  const totalAssets = baseIncome * 8.578024;

  // Executive Summary Cards
  doc.setFontSize(14);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('RESUMO EXECUTIVO', 10, 95);

  // AutoTable for Summary
  autoTable(doc, {
    startY: 100,
    head: [['PATRIMÔNIO', 'RECEITAS', 'DESPESAS', 'SALDO LIVRE']],
    body: [
      [formatter.format(totalAssets), formatter.format(totalIncome), formatter.format(totalExpense), formatter.format(balance)]
    ],
    theme: 'grid',
    headStyles: { fillColor: themeColor, textColor: [0, 0, 0], fontStyle: 'bold', halign: 'center' },
    bodyStyles: { fillColor: [10, 26, 47], textColor: [255, 255, 255], fontStyle: 'bold', halign: 'center', fontSize: 11 },
    styles: { lineColor: [themeColor[0]/2, themeColor[1]/2, themeColor[2]/2], lineWidth: 0.5 }
  });

  // Recent Transactions Table (Custom Incomes and Expenses)
  let tableData = [];
  
  expenses.forEach((exp: any) => {
    tableData.push([
      new Date(exp.date).toLocaleDateString('pt-BR'),
      'SAÍDA',
      exp.description.toUpperCase(),
      exp.category ? exp.category.toUpperCase() : '-',
      formatter.format(exp.amount)
    ]);
  });

  incomes.forEach((inc: any) => {
    tableData.push([
      new Date(inc.date).toLocaleDateString('pt-BR'),
      'ENTRADA',
      inc.description.toUpperCase(),
      '-',
      formatter.format(inc.amount)
    ]);
  });

  // Sort by date (mocking sort by simply listing, usually we'd parse)
  
  doc.setFontSize(14);
  doc.setTextColor(themeColor[0], themeColor[1], themeColor[2]);
  doc.text('LANÇAMENTOS RECENTES MANUAIS', 10, (doc as any).lastAutoTable.finalY + 15);

  if (tableData.length > 0) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['DATA', 'TIPO', 'DESCRIÇÃO', 'CATEGORIA', 'VALOR']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [20, 40, 70], textColor: [255, 255, 255], fontStyle: 'bold' },
      bodyStyles: { fillColor: [10, 26, 47], textColor: [200, 200, 200] },
      alternateRowStyles: { fillColor: [15, 30, 55] },
      styles: { lineColor: [30, 50, 80], lineWidth: 0.1, fontSize: 9 },
      didParseCell: function(data) {
        if (data.section === 'body' && data.column.index === 1) {
          if (data.cell.raw === 'ENTRADA') {
            data.cell.styles.textColor = [0, 255, 194];
          } else {
            data.cell.styles.textColor = [255, 100, 100];
          }
        }
      }
    });
  } else {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text('Nenhum lançamento manual registrado via assistente.', 10, (doc as any).lastAutoTable.finalY + 25);
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text(`KERDOS - INTELIGÊNCIA DE SALDOS | SISTEMA A.E.G.I.S. | PÁGINA ${i} DE ${pageCount}`, 105, 290, { align: 'center' });
  }

  doc.save(`KERDOS_RELATORIO_${new Date().getTime()}.pdf`);
};
