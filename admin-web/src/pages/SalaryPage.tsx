import React, { useEffect, useState } from 'react';
import {
  Banknote,
  Calendar as CalendarIcon,
  Search,
  CheckCircle2,
  Clock,
  Printer,
  DollarSign,
  X,
  CreditCard,
  Sparkles,
  Edit2,
  Eye,
  Download,
  Building2,
  Coins,
  PlusCircle,
  Trash2,
  HandCoins,
  Info,
} from 'lucide-react';
import apiClient from '../api/client';
import type { StaffMember, SalarySlip } from '../types';

const MONTHS = [
  { value: 1, label: 'January' },
  { value: 2, label: 'February' },
  { value: 3, label: 'March' },
  { value: 4, label: 'April' },
  { value: 5, label: 'May' },
  { value: 6, label: 'June' },
  { value: 7, label: 'July' },
  { value: 8, label: 'August' },
  { value: 9, label: 'September' },
  { value: 10, label: 'October' },
  { value: 11, label: 'November' },
  { value: 12, label: 'December' },
];

const CURRENT_YEAR = new Date().getFullYear();
const YEARS = [CURRENT_YEAR - 1, CURRENT_YEAR, CURRENT_YEAR + 1];

const STATUS_BADGE_STYLE: Record<string, { bg: string; color: string; border: string }> = {
  PRESENT: { bg: 'rgba(52, 211, 153, 0.15)', color: '#34D399', border: 'rgba(52, 211, 153, 0.3)' },
  LATE: { bg: 'rgba(45, 212, 191, 0.15)', color: '#2DD4BF', border: 'rgba(45, 212, 191, 0.3)' },
  HALF_DAY: { bg: 'rgba(251, 146, 60, 0.15)', color: '#FB923C', border: 'rgba(251, 146, 60, 0.3)' },
  PAID_LEAVE: { bg: 'rgba(99, 102, 241, 0.15)', color: '#818CF8', border: 'rgba(99, 102, 241, 0.3)' },
  UNPAID_LEAVE: { bg: 'rgba(248, 113, 113, 0.15)', color: '#F87171', border: 'rgba(248, 113, 113, 0.3)' },
  ABSENT: { bg: 'rgba(239, 68, 68, 0.15)', color: '#F87171', border: 'rgba(239, 68, 68, 0.3)' },
  HOLIDAY: { bg: 'rgba(168, 85, 247, 0.15)', color: '#C084FC', border: 'rgba(168, 85, 247, 0.3)' },
  WEEKEND: { bg: 'rgba(148, 163, 184, 0.15)', color: '#94A3B8', border: 'rgba(148, 163, 184, 0.3)' },
  UPCOMING: { bg: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-muted)', border: 'rgba(255, 255, 255, 0.1)' },
};

function numberToWordsInRupees(num: number): string {
  if (!num || isNaN(num) || num <= 0) return 'Rupees Zero Only';

  const a = [
    '', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten',
    'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function inWords(n: number): string {
    if (n < 20) return a[n];
    if (n < 100) return b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : '');
    if (n < 1000) return a[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + inWords(n % 100) : '');
    if (n < 100000) return inWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 !== 0 ? ' ' + inWords(n % 1000) : '');
    if (n < 10000000) return inWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 !== 0 ? ' ' + inWords(n % 100000) : '');
    return inWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 !== 0 ? ' ' + inWords(n % 10000000) : '');
  }

  return `Rupees ${inWords(Math.round(num))} Only`;
}

interface RecordedAdvanceItem {
  id: string;
  user?: StaffMember;
  amount: number;
  date: string;
  paymentMode: string;
  remarks?: string;
  isDeducted: boolean;
}

interface StaffSummaryItem {
  staff: {
    id: string;
    name: string;
    employeeId: string;
    designation: string;
    department: string;
    email?: string;
    phone?: string;
    baseSalary: number;
    bankDetails?: {
      bankName?: string;
      accountNumber?: string;
      ifscCode?: string;
      upiId?: string;
      panNumber?: string;
    };
  };
  month: number;
  year: number;
  totalDaysInMonth: number;
  perDaySalary: number;
  counts: {
    presentDays: number;
    absentDays: number;
    halfDays: number;
    paidLeaveDays: number;
    unpaidLeaveDays: number;
    holidayDays: number;
    weekendDays: number;
  };
  calculated: {
    baseSalary: number;
    perDaySalary: number;
    effectiveUnpaidDays: number;
    leaveDeductions: number;
    advanceDeduction: number;
    deductions: number;
    netSalary: number;
  };
  recordedAdvances?: Array<{
    id: string;
    amount: number;
    date: string;
    paymentMode: string;
    remarks?: string;
    isDeducted: boolean;
  }>;
  calendar: Array<{
    day: number;
    date: string;
    dayOfWeek: string;
    status: 'PRESENT' | 'LATE' | 'ABSENT' | 'HALF_DAY' | 'PAID_LEAVE' | 'UNPAID_LEAVE' | 'HOLIDAY' | 'WEEKEND' | 'UPCOMING';
    note?: string;
  }>;
  existingSlip: SalarySlip | null;
  status: 'PAID' | 'GENERATED' | 'PENDING' | 'NOT_GENERATED';
}

export const SalaryPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'generate' | 'advances' | 'payout'>('overview');

  // Filters
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState<number>(CURRENT_YEAR);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('');

  // Bulk Data state
  const [bulkSummaries, setBulkSummaries] = useState<StaffSummaryItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Salary Advances list state
  const [salaryAdvancesList, setSalaryAdvancesList] = useState<RecordedAdvanceItem[]>([]);
  const [isAdvancesLoading, setIsAdvancesLoading] = useState(false);

  // Record Advance Modal States
  const [showRecordAdvanceModal, setShowRecordAdvanceModal] = useState(false);
  const [advanceStaffId, setAdvanceStaffId] = useState('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(2000);
  const [advanceDate, setAdvanceDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [advancePaymentMode, setAdvancePaymentMode] = useState<string>('Cash');
  const [advanceRemarks, setAdvanceRemarks] = useState<string>('');
  const [isSavingAdvance, setIsSavingAdvance] = useState(false);

  // Tab 2 Generator States
  const [selectedStaffId, setSelectedStaffId] = useState<string>('');
  const [summaryData, setSummaryData] = useState<any>(null);
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);

  // Form itemized inputs for salary slip generation
  const [baseSalaryInput, setBaseSalaryInput] = useState<number>(0);
  const [hraInput, setHraInput] = useState<number>(0);
  const [transportInput, setTransportInput] = useState<number>(0);
  const [specialAllowanceInput, setSpecialAllowanceInput] = useState<number>(0);
  const [bonusInput, setBonusInput] = useState<number>(0);

  const [leaveDeductionInput, setLeaveDeductionInput] = useState<number>(0);
  const [advanceDeductionInput, setAdvanceDeductionInput] = useState<number>(0); // Same month advance taken (अग्रिम वेतन)
  const [latePenaltyInput, setLatePenaltyInput] = useState<number>(0);
  const [pfDeductionInput, setPfDeductionInput] = useState<number>(0);
  const [taxDeductionInput, setTaxDeductionInput] = useState<number>(0);

  const [remarksInput, setRemarksInput] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string>('');
  const [actionError, setActionError] = useState<string>('');

  // Modals
  const [viewSlip, setViewSlip] = useState<SalarySlip | null>(null);
  const [payModalSlip, setPayModalSlip] = useState<SalarySlip | null>(null);
  const [paymentMode, setPaymentMode] = useState<string>('Bank Transfer');
  const [paymentDate, setPaymentDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [transactionRef, setTransactionRef] = useState<string>('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Modal: Quick Edit Base Salary
  const [editSalaryStaff, setEditSalaryStaff] = useState<StaffSummaryItem | null>(null);
  const [newBaseSalaryInput, setNewBaseSalaryInput] = useState<string>('0');
  const [isSavingSalary, setIsSavingSalary] = useState(false);

  // Modal: Detail Calendar View for Staff
  const [detailModalStaff, setDetailModalStaff] = useState<StaffSummaryItem | null>(null);

  // Modal: Calendar Override for specific day
  const [calendarOverrideTarget, setCalendarOverrideTarget] = useState<{
    userId: string;
    employeeName: string;
    employeeId: string;
    date: string;
    status: string;
    notes: string;
  } | null>(null);

  // Fetch all staff summaries for Tab 1 (Overview)
  const fetchBulkSummaries = async () => {
    setIsLoading(true);
    try {
      const res: any = await apiClient.get(
        `/salary/summary/all?month=${selectedMonth}&year=${selectedYear}`
      );
      setBulkSummaries(res.data?.staffSummaries || []);
    } catch {
      setBulkSummaries([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recorded salary advances for current month
  const fetchSalaryAdvances = async () => {
    setIsAdvancesLoading(true);
    try {
      const res: any = await apiClient.get(`/salary/advance?month=${selectedMonth}&year=${selectedYear}`);
      setSalaryAdvancesList(res.data || []);
    } catch {
      setSalaryAdvancesList([]);
    } finally {
      setIsAdvancesLoading(false);
    }
  };

  useEffect(() => {
    fetchBulkSummaries();
    fetchSalaryAdvances();
  }, [selectedMonth, selectedYear]);

  // Record a new Salary Advance (अग्रिम वेतन दर्ज करें)
  const handleRecordAdvance = async () => {
    if (!advanceStaffId || !advanceAmount || advanceAmount <= 0) {
      alert('Please select staff member and enter valid advance amount.');
      return;
    }

    setIsSavingAdvance(true);
    try {
      await apiClient.post('/salary/advance', {
        userId: advanceStaffId,
        amount: advanceAmount,
        date: advanceDate,
        paymentMode: advancePaymentMode,
        remarks: advanceRemarks,
      });

      setShowRecordAdvanceModal(false);
      setAdvanceRemarks('');
      fetchBulkSummaries();
      fetchSalaryAdvances();
      if (activeTab === 'generate' && selectedStaffId === advanceStaffId) {
        fetchEmployeeSummary();
      }
      alert('Salary Advance recorded successfully! It will be automatically deducted in this month’s salary slip.');
    } catch (err: any) {
      alert(err?.message || 'Failed to record salary advance.');
    } finally {
      setIsSavingAdvance(false);
    }
  };

  // Delete a recorded advance
  const handleDeleteAdvance = async (advanceId: string) => {
    if (!window.confirm('Are you sure you want to delete this recorded salary advance entry?')) return;
    try {
      await apiClient.delete(`/salary/advance/${advanceId}`);
      fetchSalaryAdvances();
      fetchBulkSummaries();
    } catch (err: any) {
      alert(err?.message || 'Failed to delete advance record.');
    }
  };

  // Fetch single employee monthly summary calculation for Tab 2
  const fetchEmployeeSummary = async () => {
    if (!selectedStaffId) return;
    setIsSummaryLoading(true);
    setActionSuccess('');
    setActionError('');
    try {
      const res: any = await apiClient.get(
        `/salary/summary?userId=${selectedStaffId}&month=${selectedMonth}&year=${selectedYear}`
      );
      const data = res.data;
      setSummaryData(data);

      const slip = data.existingSlip;
      setBaseSalaryInput(slip?.earnings?.baseSalary ?? data.calculated?.baseSalary ?? 0);
      setHraInput(slip?.earnings?.hra ?? 0);
      setTransportInput(slip?.earnings?.transportAllowance ?? 0);
      setSpecialAllowanceInput(slip?.earnings?.specialAllowance ?? 0);
      setBonusInput(slip?.earnings?.bonus ?? slip?.bonus ?? 0);

      setLeaveDeductionInput(slip?.deductionsBreakdown?.leaveDeduction ?? data.calculated?.leaveDeductions ?? 0);
      setAdvanceDeductionInput(slip?.deductionsBreakdown?.advanceDeduction ?? slip?.advanceDeduction ?? data.calculated?.advanceDeduction ?? 0);
      setLatePenaltyInput(slip?.deductionsBreakdown?.latePenalty ?? data.calculated?.latePenalty ?? 0);
      setPfDeductionInput(slip?.deductionsBreakdown?.pfDeduction ?? 0);
      setTaxDeductionInput(slip?.deductionsBreakdown?.taxDeduction ?? 0);

      setRemarksInput(slip?.remarks || '');
    } catch (err: any) {
      setSummaryData(null);
      setActionError(err?.message || 'Failed to calculate monthly attendance summary.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'generate' && selectedStaffId) {
      fetchEmployeeSummary();
    }
  }, [activeTab, selectedStaffId, selectedMonth, selectedYear]);

  // Quick Edit Base Salary
  const handleSaveBaseSalary = async () => {
    if (!editSalaryStaff) return;
    setIsSavingSalary(true);
    try {
      const numericSalary = Math.max(0, Number(newBaseSalaryInput) || 0);
      await apiClient.patch(`/staff/${editSalaryStaff.staff.id}`, {
        baseSalary: numericSalary,
      });
      setEditSalaryStaff(null);
      fetchBulkSummaries();
      if (selectedStaffId === editSalaryStaff.staff.id && activeTab === 'generate') {
        fetchEmployeeSummary();
      }
    } catch (err: any) {
      alert(err?.message || 'Failed to update base salary.');
    } finally {
      setIsSavingSalary(false);
    }
  };

  // Generate Salary Slip submit with itemized breakdown & same-month advance deduction
  const handleGenerateSlip = async (staffId?: string, overrideBase?: number) => {
    const targetId = staffId || selectedStaffId;
    if (!targetId) return;

    setIsGenerating(true);
    setActionSuccess('');
    setActionError('');
    try {
      const payload: any = {
        userId: targetId,
        month: selectedMonth,
        year: selectedYear,
      };

      if (staffId) {
        if (overrideBase !== undefined) payload.baseSalary = overrideBase;
      } else {
        payload.earnings = {
          baseSalary: baseSalaryInput,
          hra: hraInput,
          transportAllowance: transportInput,
          specialAllowance: specialAllowanceInput,
          bonus: bonusInput,
        };

        payload.deductionsBreakdown = {
          leaveDeduction: leaveDeductionInput,
          advanceDeduction: advanceDeductionInput,
          latePenalty: latePenaltyInput,
          pfDeduction: pfDeductionInput,
          taxDeduction: taxDeductionInput,
        };

        payload.remarks = remarksInput;
      }

      await apiClient.post('/salary/generate', payload);
      setActionSuccess('Salary Slip generated & issued successfully!');
      fetchBulkSummaries();
      fetchSalaryAdvances();
      if (activeTab === 'generate') fetchEmployeeSummary();
    } catch (err: any) {
      setActionError(err?.message || 'Failed to generate salary slip.');
    } finally {
      setIsGenerating(false);
    }
  };

  // Export Direct Bank Payout CSV
  const handleExportBankPayoutCSV = async () => {
    try {
      const res: any = await apiClient.get(`/salary/export-payout?month=${selectedMonth}&year=${selectedYear}`);
      const data = res.data;
      if (!data || !data.rows || data.rows.length === 0) {
        alert('No staff payout records found to export.');
        return;
      }

      const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;

      let csv = 'Employee ID,Staff Name,Designation,Department,Bank Name,Account Number,IFSC Code,UPI ID,PAN Number,Base Salary,Leave Cut,Salary Advance Taken,Total Deductions,Net Payable,Slip Status,Payment Mode,Transaction Ref\n';
      data.rows.forEach((r: any) => {
        csv += `"${r.employeeId}","${r.staffName}","${r.designation}","${r.department}","${r.bankName}","${r.accountNumber}","${r.ifscCode}","${r.upiId}","${r.panNumber}",${r.baseSalary},${r.leaveDeductions || 0},${r.advanceDeduction || 0},${r.totalDeductions},${r.netPayable},"${r.slipStatus}","${r.paymentMode}","${r.paymentRef}"\n`;
      });

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `School_Salary_Bank_Payout_${monthName}_${selectedYear}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert(err?.message || 'Failed to export bank payout sheet.');
    }
  };

  // Update Salary Status
  const handleUpdateStatus = async () => {
    if (!payModalSlip) return;
    setIsUpdatingStatus(true);
    try {
      await apiClient.patch(`/salary/${payModalSlip.id}/status`, {
        status: 'PAID',
        paymentDate,
        paymentMode,
        transactionRef,
      });
      setPayModalSlip(null);
      fetchBulkSummaries();
    } catch (err: any) {
      alert(err?.message || 'Failed to update payment status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Bulk Generate Payroll
  const [isBulkGenerating, setIsBulkGenerating] = useState(false);
  const handleBulkGenerate = async () => {
    const monthName = MONTHS.find((m) => m.value === selectedMonth)?.label;
    if (
      !window.confirm(
        `Are you sure you want to generate/re-calculate salary slips for ALL active staff members for ${monthName} ${selectedYear}?`
      )
    ) {
      return;
    }
    setIsBulkGenerating(true);
    try {
      const res: any = await apiClient.post('/salary/generate-bulk', {
        month: selectedMonth,
        year: selectedYear,
      });
      alert(`Success: ${res?.message || 'Bulk payroll slips generated successfully!'}`);
      fetchBulkSummaries();
    } catch (err: any) {
      alert(err?.message || 'Failed to generate bulk payroll.');
    } finally {
      setIsBulkGenerating(false);
    }
  };

  // Filtered staff summaries list
  const filteredSummaries = bulkSummaries.filter((item) => {
    const matchesSearch =
      !search ||
      item.staff.name.toLowerCase().includes(search.toLowerCase()) ||
      item.staff.employeeId.toLowerCase().includes(search.toLowerCase()) ||
      item.staff.designation.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = !statusFilter || item.status === statusFilter;
    const matchesDept = !departmentFilter || item.staff.department === departmentFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  // Overview Totals
  const totalBasePayroll = bulkSummaries.reduce((sum, item) => sum + item.calculated.baseSalary, 0);
  const totalNetPayroll = bulkSummaries.reduce((sum, item) => sum + item.calculated.netSalary, 0);
  const totalDeductions = bulkSummaries.reduce((sum, item) => sum + item.calculated.deductions, 0);
  const totalAdvancesTaken = bulkSummaries.reduce((sum, item) => sum + (item.calculated.advanceDeduction || item.existingSlip?.advanceDeduction || 0), 0);
  const paidSlipsCount = bulkSummaries.filter((item) => item.status === 'PAID').length;

  const departmentsList = Array.from(
    new Set(bulkSummaries.map((item) => item.staff.department).filter(Boolean))
  );

  // Tab 2 Live Math
  const totalEarningsComputed = (baseSalaryInput || 0) + (hraInput || 0) + (transportInput || 0) + (specialAllowanceInput || 0) + (bonusInput || 0);
  const totalDeductionsComputed = (leaveDeductionInput || 0) + (advanceDeductionInput || 0) + (latePenaltyInput || 0) + (pfDeductionInput || 0) + (taxDeductionInput || 0);
  const netPayableComputed = Math.max(0, totalEarningsComputed - totalDeductionsComputed);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Printable CSS styles */}
      <style>{`
        @media print {
          body * { visibility: hidden; }
          #printable-payslip, #printable-payslip * { visibility: visible; }
          #printable-payslip { position: absolute; left: 0; top: 0; width: 100%; color: #000 !important; background: #fff !important; }
          .no-print { display: none !important; }
        }
      `}</style>

      {/* Header Tabs & Filters */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '6px', background: 'rgba(255,255,255,0.05)', padding: '4px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap' }}>
          <button
            onClick={() => setActiveTab('overview')}
            className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Banknote size={16} /> Staff Payroll Overview
          </button>
          <button
            onClick={() => {
              setActiveTab('generate');
              if (bulkSummaries.length > 0 && !selectedStaffId) {
                setSelectedStaffId(bulkSummaries[0].staff.id);
              }
            }}
            className={`btn ${activeTab === 'generate' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <CalendarIcon size={16} /> Generator & Calendar
          </button>
          <button
            onClick={() => setActiveTab('advances')}
            className={`btn ${activeTab === 'advances' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <HandCoins size={16} /> Monthly Advances List ({salaryAdvancesList.length})
          </button>
          <button
            onClick={() => setActiveTab('payout')}
            className={`btn ${activeTab === 'payout' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ borderRadius: '8px', padding: '8px 14px', fontSize: '0.85rem' }}
          >
            <Building2 size={16} /> Bank Payout Sheet
          </button>
        </div>

        {/* Global Action & Month/Year selector */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* Prominent RECORD SALARY ADVANCE BUTTON */}
          <button
            onClick={() => {
              setShowRecordAdvanceModal(true);
              if (bulkSummaries.length > 0 && !advanceStaffId) {
                setAdvanceStaffId(bulkSummaries[0].staff.id);
              }
            }}
            className="btn btn-primary"
            style={{ gap: '6px', backgroundColor: '#FB923C', fontSize: '0.88rem', fontWeight: 700 }}
          >
            <PlusCircle size={18} /> Record Salary Advance
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: 'var(--bg-input)', padding: '6px 10px 6px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <CalendarIcon size={16} color="var(--primary-500)" style={{ flexShrink: 0 }} />
              <select
                className="input-field"
                style={{ border: 'none', backgroundColor: 'transparent', padding: '2px 28px 2px 4px', width: 'auto', fontWeight: 700, fontSize: '0.9rem' }}
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
              >
                {MONTHS.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>
            <div style={{ backgroundColor: 'var(--bg-input)', padding: '6px 10px 6px 14px', borderRadius: '10px', border: '1px solid var(--border-subtle)' }}>
              <select
                className="input-field"
                style={{ border: 'none', backgroundColor: 'transparent', padding: '2px 28px 2px 4px', width: 'auto', fontWeight: 700, fontSize: '0.9rem' }}
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
              >
                {YEARS.map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleBulkGenerate}
            disabled={isBulkGenerating}
            className="btn btn-primary"
            style={{ gap: '6px', backgroundColor: '#6366F1', fontSize: '0.85rem' }}
          >
            <Sparkles size={16} />
            {isBulkGenerating ? 'Generating Payroll…' : 'Generate Bulk Payroll'}
          </button>
        </div>
      </div>

      {/* TAB 1: ALL STAFF PAYROLL OVERVIEW */}
      {activeTab === 'overview' && (
        <>
          {/* KPI Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '16px' }}>
            <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(99,102,241,0.15), rgba(79,70,229,0.05))', border: '1px solid rgba(99,102,241,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Net Payable</span>
                <DollarSign size={20} color="#818CF8" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FFF' }}>
                ₹{totalNetPayroll.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Base Salary Total: ₹{totalBasePayroll.toLocaleString('en-IN')}
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(185,28,28,0.05))', border: '1px solid rgba(239,68,68,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Total Deductions & Cuts</span>
                <Clock size={20} color="#F87171" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#F87171' }}>
                -₹{totalDeductions.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Unpaid Absences & Same-Month Advances
              </div>
            </div>

            <div
              className="card"
              style={{
                padding: '20px',
                background: 'linear-gradient(135deg, rgba(251,146,60,0.18), rgba(217,119,6,0.08))',
                border: '1px solid rgba(251,146,60,0.35)',
                cursor: 'pointer',
              }}
              onClick={() => setActiveTab('advances')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Salary Advances Given</span>
                <Coins size={20} color="#FB923C" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FB923C' }}>
                ₹{totalAdvancesTaken.toLocaleString('en-IN')}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#FB923C', marginTop: '4px', fontWeight: 600 }}>
                {salaryAdvancesList.length} advance payment(s) recorded this month
              </div>
            </div>

            <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(52,211,153,0.15), rgba(16,185,129,0.05))', border: '1px solid rgba(52,211,153,0.25)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 600 }}>Paid Salaries</span>
                <CheckCircle2 size={20} color="#34D399" />
              </div>
              <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#34D399' }}>
                {paidSlipsCount} / {bulkSummaries.length}
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                Staff members marked PAID
              </div>
            </div>
          </div>

          {/* Search & Filter Controls + Export CSV */}
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                className="input-field"
                style={{ paddingLeft: '40px' }}
                type="text"
                placeholder="Search staff by name, ID, designation..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>

            <select
              className="input-field"
              style={{ width: 'auto' }}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
            >
              <option value="">All Departments</option>
              {departmentsList.map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <select
              className="input-field"
              style={{ width: 'auto' }}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="PAID">PAID</option>
              <option value="GENERATED">GENERATED</option>
              <option value="NOT_GENERATED">NOT GENERATED (Draft)</option>
            </select>

            <button
              onClick={handleExportBankPayoutCSV}
              className="btn btn-secondary"
              style={{ gap: '6px', color: '#34D399', border: '1px solid rgba(52,211,153,0.3)', background: 'rgba(52,211,153,0.1)' }}
            >
              <Download size={16} /> Export Bank CSV
            </button>
          </div>

          {/* Staff Payroll Table */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {isLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                Loading Staff Payroll Calculations...
              </div>
            ) : filteredSummaries.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Banknote size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No staff records match your criteria.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table className="data-table" style={{ minWidth: '1100px' }}>
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Base Salary</th>
                      <th>Working Days</th>
                      <th>Salary Advance Taken</th>
                      <th>Total Deductions</th>
                      <th>Net Payable</th>
                      <th>Bank Payout Status</th>
                      <th>Status</th>
                      <th style={{ position: 'sticky', right: 0, backgroundColor: '#0F172A', zIndex: 5, boxShadow: '-4px 0 8px rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredSummaries.map((item) => {
                      const staff = item.staff;
                      const isGenerated = !!item.existingSlip;
                      const isPaid = item.status === 'PAID';
                      const hasBank = !!(staff.bankDetails?.accountNumber);
                      const advanceDeducted = Math.max(
                        item.calculated.advanceDeduction || 0,
                        item.existingSlip?.advanceDeduction || 0
                      );

                    return (
                      <tr key={staff.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{staff.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {staff.employeeId} • {staff.designation} ({staff.department})
                          </div>
                        </td>

                        <td>
                          {item.calculated.baseSalary > 0 ? (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ fontWeight: 700, color: '#FFF' }}>
                                ₹{item.calculated.baseSalary.toLocaleString('en-IN')}
                              </span>
                              <button
                                onClick={() => {
                                  setEditSalaryStaff(item);
                                  setNewBaseSalaryInput(String(item.calculated.baseSalary || 0));
                                }}
                                title="Edit Base Monthly Salary"
                                style={{
                                  background: 'transparent',
                                  border: 'none',
                                  color: 'var(--primary-400)',
                                  cursor: 'pointer',
                                  padding: '2px',
                                }}
                              >
                                <Edit2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setEditSalaryStaff(item);
                                setNewBaseSalaryInput('0');
                              }}
                              className="btn btn-secondary btn-sm"
                              style={{
                                gap: '4px',
                                fontSize: '0.75rem',
                                color: '#818CF8',
                                border: '1px dashed rgba(99,102,241,0.4)',
                                background: 'rgba(99,102,241,0.1)',
                              }}
                            >
                              <Edit2 size={12} /> Set Salary
                            </button>
                          )}
                        </td>

                        <td>
                          {(item.totalDaysInMonth - item.calculated.effectiveUnpaidDays) > 0 ? (
                            <div>
                              <span style={{ color: '#34D399', fontWeight: 700 }}>
                                {item.totalDaysInMonth - item.calculated.effectiveUnpaidDays} / {item.totalDaysInMonth} Days Earned
                              </span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {item.counts.presentDays} Present • {item.counts.paidLeaveDays} Paid Leave
                              </div>
                            </div>
                          ) : (
                            <div>
                              <span style={{ color: '#F87171', fontWeight: 700 }}>
                                0 / {item.totalDaysInMonth} Days Earned
                              </span>
                              <div style={{ fontSize: '0.72rem', color: '#F87171' }}>
                                0 Present (0% Earned)
                              </div>
                            </div>
                          )}
                        </td>

                        <td>
                          {advanceDeducted > 0 ? (
                            <span style={{ fontWeight: 800, color: '#FB923C' }}>
                              -₹{advanceDeducted.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹0</span>
                          )}
                        </td>

                        <td>
                          {item.calculated.deductions > 0 ? (
                            <div>
                              <span style={{ color: '#F87171', fontWeight: 700 }}>
                                -₹{item.calculated.deductions.toLocaleString('en-IN')}
                              </span>
                              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                                {item.calculated.effectiveUnpaidDays} Days Cut {advanceDeducted > 0 ? `+ ₹${advanceDeducted} Adv.` : ''}
                              </div>
                            </div>
                          ) : (
                            <span style={{ color: '#34D399', fontSize: '0.82rem', fontWeight: 600 }}>
                              No Deductions (₹0)
                            </span>
                          )}
                        </td>

                        <td>
                          {item.calculated.netSalary > 0 ? (
                            <span style={{ fontSize: '1.05rem', fontWeight: 900, color: '#34D399' }}>
                              ₹{item.calculated.netSalary.toLocaleString('en-IN')}
                            </span>
                          ) : (
                            <div>
                              <span style={{ fontSize: '1.05rem', fontWeight: 900, color: item.calculated.baseSalary > 0 ? '#F87171' : 'var(--text-muted)' }}>
                                ₹0
                              </span>
                              {item.calculated.baseSalary > 0 && (
                                <div style={{ fontSize: '0.7rem', color: '#F87171', fontWeight: 700 }}>
                                  100% Unpaid Cut
                                </div>
                              )}
                            </div>
                          )}
                        </td>

                        <td>
                          {hasBank ? (
                            <div>
                              <span style={{ fontSize: '0.78rem', color: '#34D399', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                <Building2 size={13} /> {staff.bankDetails?.bankName || 'Bank Ready'}
                              </span>
                              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                                A/C: ••••{staff.bankDetails?.accountNumber?.slice(-4)}
                              </div>
                            </div>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: '#FB923C', background: 'rgba(251,146,60,0.1)', padding: '2px 6px', borderRadius: '4px' }}>
                              Cash Payout (No A/C)
                            </span>
                          )}
                        </td>

                        <td>
                          <span
                            className="badge"
                            style={{
                              backgroundColor: isPaid
                                ? 'rgba(52, 211, 153, 0.15)'
                                : isGenerated
                                ? 'rgba(99, 102, 241, 0.15)'
                                : 'rgba(251, 146, 60, 0.15)',
                              color: isPaid ? '#34D399' : isGenerated ? '#818CF8' : '#FB923C',
                              border: `1px solid ${
                                isPaid
                                  ? 'rgba(52, 211, 153, 0.3)'
                                  : isGenerated
                                  ? 'rgba(99, 102, 241, 0.3)'
                                  : 'rgba(251, 146, 60, 0.3)'
                              }`,
                            }}
                          >
                            {isPaid ? 'PAID' : isGenerated ? 'GENERATED' : 'DRAFT'}
                          </span>
                        </td>

                        <td style={{ position: 'sticky', right: 0, backgroundColor: '#0F172A', zIndex: 4, boxShadow: '-4px 0 8px rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                            <button
                              onClick={() => setDetailModalStaff(item)}
                              className="btn btn-secondary btn-sm"
                              style={{ gap: '4px', fontSize: '0.75rem', padding: '4px 8px' }}
                              title="View full calendar"
                            >
                              <Eye size={14} />
                            </button>

                            {isGenerated && item.existingSlip ? (
                              <>
                                <button
                                  onClick={() => setViewSlip(item.existingSlip!)}
                                  className="btn btn-secondary btn-sm"
                                  style={{ gap: '4px', fontSize: '0.75rem', padding: '4px 8px' }}
                                >
                                  <Printer size={14} /> Slip
                                </button>
                                {!isPaid && (
                                  <button
                                    onClick={() => {
                                      setPayModalSlip(item.existingSlip!);
                                      setPaymentMode(hasBank ? 'Bank Transfer' : 'Cash');
                                      setPaymentDate(new Date().toISOString().split('T')[0]);
                                      setTransactionRef('');
                                    }}
                                    className="btn btn-primary btn-sm"
                                    style={{
                                      gap: '4px',
                                      fontSize: '0.75rem',
                                      padding: '4px 8px',
                                      backgroundColor: '#10B981',
                                    }}
                                  >
                                    <CreditCard size={14} /> Pay
                                  </button>
                                )}
                              </>
                            ) : (
                              <button
                                onClick={() => handleGenerateSlip(staff.id, item.calculated.baseSalary)}
                                disabled={isGenerating}
                                className="btn btn-primary btn-sm"
                                style={{ gap: '4px', fontSize: '0.75rem', padding: '4px 8px', backgroundColor: '#6366F1' }}
                              >
                                <Sparkles size={14} /> Issue Slip
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </>
    )}

      {/* TAB 2: SINGLE STAFF GENERATOR & ITEMIZATION CALENDAR */}
      {activeTab === 'generate' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px' }}>
          {actionError && (
            <div style={{ gridColumn: '1 / -1', backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 14px', color: '#F87171', fontSize: '0.88rem' }}>
              {actionError}
            </div>
          )}
          {/* Main Left Column: Staff Selector & Attendance Calendar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div className="card" style={{ padding: '20px' }}>
              <label className="input-label" style={{ marginBottom: '8px', fontSize: '0.9rem', fontWeight: 700 }}>
                Select Staff Member *
              </label>
              <select
                className="input-field"
                style={{ fontSize: '1rem', padding: '12px' }}
                value={selectedStaffId}
                onChange={(e) => setSelectedStaffId(e.target.value)}
              >
                {bulkSummaries.map((item) => (
                  <option key={item.staff.id} value={item.staff.id}>
                    {item.staff.name} ({item.staff.employeeId}) — {item.staff.designation} ({item.staff.department})
                  </option>
                ))}
              </select>

              {summaryData?.staff && (
                <div
                  style={{
                    marginTop: '16px',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(99,102,241,0.1)',
                    padding: '14px 18px',
                    borderRadius: '12px',
                    border: '1px solid rgba(99,102,241,0.2)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>
                      {summaryData.staff.name}
                    </div>
                    <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      ID: {summaryData.staff.employeeId} • {summaryData.staff.designation} ({summaryData.staff.department})
                    </div>
                    {summaryData.staff.bankDetails?.accountNumber && (
                      <div style={{ fontSize: '0.78rem', color: '#34D399', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Building2 size={13} /> {summaryData.staff.bankDetails.bankName} (A/C: {summaryData.staff.bankDetails.accountNumber} • IFSC: {summaryData.staff.bankDetails.ifscCode})
                      </div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Monthly Base Salary
                    </div>
                    <div style={{ fontSize: '1.25rem', fontWeight: 800, color: '#34D399' }}>
                      ₹{(summaryData.staff.baseSalary || 0).toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Attendance Calendar Card */}
            <div className="card" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon size={20} color="var(--primary-400)" />
                  Attendance Calendar ({MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear})
                </h3>
                {summaryData?.calculated?.perDaySalary !== undefined && (
                  <div style={{ fontSize: '0.82rem', color: '#C7D2FE', background: 'rgba(99,102,241,0.15)', padding: '4px 10px', borderRadius: '8px' }}>
                    Per Day Rate: <strong>₹{summaryData.calculated.perDaySalary} / day</strong>
                  </div>
                )}
              </div>

              {isSummaryLoading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Calculating attendance calendar…</div>
              ) : !summaryData ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Select a staff member to display calendar.</div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', textAlign: 'center', fontWeight: 700, fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                    <div>SUN</div><div>MON</div><div>TUE</div><div>WED</div><div>THU</div><div>FRI</div><div>SAT</div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px' }}>
                    {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                      <div key={`empty-${i}`} style={{ height: '64px', borderRadius: '10px', opacity: 0.2, background: 'rgba(255,255,255,0.02)' }} />
                    ))}

                    {summaryData.calendar.map((item: any) => {
                      const style = STATUS_BADGE_STYLE[item.status] || STATUS_BADGE_STYLE.UPCOMING;
                      return (
                        <div
                          key={item.day}
                          onClick={() => {
                            setCalendarOverrideTarget({
                              userId: summaryData.staff.id,
                              employeeName: summaryData.staff.name,
                              employeeId: summaryData.staff.employeeId,
                              date: item.date,
                              status: item.status !== 'UPCOMING' && item.status !== 'WEEKEND' ? item.status : 'PRESENT',
                              notes: item.note || '',
                            });
                          }}
                          title={`Click to mark/override attendance for ${item.date}`}
                          style={{
                            height: '68px',
                            borderRadius: '10px',
                            backgroundColor: style.bg,
                            border: `1px solid ${style.border}`,
                            padding: '6px 8px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between',
                            cursor: 'pointer',
                            transition: 'transform 0.15s ease',
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>{item.day}</span>
                            <span style={{ fontSize: '0.65rem', fontWeight: 700, color: style.color, textTransform: 'uppercase' }}>
                              {item.status.replace('_LEAVE', '').replace('_', ' ')}
                            </span>
                          </div>
                          {item.note && (
                            <div style={{ fontSize: '0.65rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {item.note}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right Column: Detailed Itemized Computation with Same-Month Advance Input */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {summaryData && (
              <div
                className="card"
                style={{
                  padding: '20px',
                  border: '1px solid rgba(99,102,241,0.3)',
                  background: 'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(15,23,42,0.6) 100%)',
                }}
              >
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FFF', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <DollarSign size={18} color="#34D399" />
                  Salary Slip Computation
                </h3>

                {actionSuccess && (
                  <div style={{ backgroundColor: 'rgba(52,211,153,0.15)', border: '1px solid rgba(52,211,153,0.3)', borderRadius: '8px', padding: '10px 12px', color: '#34D399', fontSize: '0.82rem', marginBottom: '14px' }}>
                    {actionSuccess}
                  </div>
                )}

                {/* EARNINGS BLOCK */}
                <div style={{ marginBottom: '18px' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    1. Earnings / Allowances (+)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <div className="input-group">
                      <label className="input-label" style={{ fontSize: '0.78rem' }}>Base Salary (₹)</label>
                      <input className="input-field" type="number" value={baseSalaryInput} onChange={(e) => setBaseSalaryInput(Number(e.target.value))} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>HRA (₹)</label>
                        <input className="input-field" type="number" value={hraInput} onChange={(e) => setHraInput(Number(e.target.value))} />
                      </div>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>Transport (₹)</label>
                        <input className="input-field" type="number" value={transportInput} onChange={(e) => setTransportInput(Number(e.target.value))} />
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>Special Duty (₹)</label>
                        <input className="input-field" type="number" value={specialAllowanceInput} onChange={(e) => setSpecialAllowanceInput(Number(e.target.value))} />
                      </div>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>Bonus (₹)</label>
                        <input className="input-field" type="number" value={bonusInput} onChange={(e) => setBonusInput(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* DEDUCTIONS BLOCK WITH SALARY ADVANCE */}
                <div style={{ marginBottom: '18px', paddingTop: '12px', borderTop: '1px dashed rgba(255,255,255,0.1)' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#F87171', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    2. Deductions & Advances (-)
                  </span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '8px' }}>
                    <div className="input-group">
                      <label className="input-label" style={{ fontSize: '0.78rem' }}>
                        Leave Cut ({summaryData.calculated.effectiveUnpaidDays} Unpaid Days)
                      </label>
                      <input className="input-field" type="number" style={{ color: '#F87171' }} value={leaveDeductionInput} onChange={(e) => setLeaveDeductionInput(Number(e.target.value))} />
                    </div>

                    <div className="input-group" style={{ background: 'rgba(251,146,60,0.08)', padding: '10px', borderRadius: '8px', border: '1px solid rgba(251,146,60,0.2)' }}>
                      <label className="input-label" style={{ fontSize: '0.82rem', color: '#FB923C', fontWeight: 700 }}>
                        Salary Advance Taken This Month (₹)
                      </label>
                      <input
                        className="input-field"
                        type="number"
                        min="0"
                        placeholder="Enter advance taken by staff in this month"
                        style={{ color: '#FB923C', fontWeight: 800, fontSize: '1.05rem', backgroundColor: '#0F172A' }}
                        value={advanceDeductionInput}
                        onChange={(e) => setAdvanceDeductionInput(Number(e.target.value))}
                      />
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Info size={11} /> Auto-populated from recorded advances given to staff during this month.
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>Late Fine (₹)</label>
                        <input className="input-field" type="number" value={latePenaltyInput} onChange={(e) => setLatePenaltyInput(Number(e.target.value))} />
                        {summaryData?.counts?.lateDays !== undefined && (
                          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '3px', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Info size={10} /> Auto: {summaryData.counts.lateDays} Late Day(s) • {summaryData.counts.totalLateMinutes || 0} Late Min(s)
                          </span>
                        )}
                      </div>
                      <div className="input-group">
                        <label className="input-label" style={{ fontSize: '0.78rem' }}>PF / Tax (₹)</label>
                        <input className="input-field" type="number" value={pfDeductionInput + taxDeductionInput} onChange={(e) => setPfDeductionInput(Number(e.target.value))} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* NET MATH SUMMARY */}
                <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '12px', padding: '14px', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    <span>Gross Earnings:</span>
                    <strong style={{ color: '#FFF' }}>₹{totalEarningsComputed.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#F87171', marginTop: '4px' }}>
                    <span>Total Deductions:</span>
                    <strong>-₹{totalDeductionsComputed.toLocaleString('en-IN')}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <span style={{ fontSize: '0.9rem', fontWeight: 800, color: '#FFF' }}>Net Payable:</span>
                    <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34D399' }}>₹{netPayableComputed.toLocaleString('en-IN')}</span>
                  </div>
                </div>

                <div className="input-group" style={{ marginBottom: '14px' }}>
                  <label className="input-label" style={{ fontSize: '0.78rem' }}>Remarks / Note</label>
                  <textarea className="input-field" rows={2} placeholder="e.g. ₹3000 advance taken on 15th minus in final pay" value={remarksInput} onChange={(e) => setRemarksInput(e.target.value)} />
                </div>

                <button
                  onClick={() => handleGenerateSlip()}
                  disabled={isGenerating}
                  className="btn btn-primary"
                  style={{ width: '100%', padding: '12px', fontSize: '0.95rem', fontWeight: 700 }}
                >
                  {isGenerating ? 'Saving Slip…' : 'Generate & Issue Salary Slip'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: RECORDED SALARY ADVANCES LIST */}
      {activeTab === 'advances' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(251,146,60,0.12), rgba(15,23,42,0.8))', border: '1px solid rgba(251,146,60,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <HandCoins size={22} color="#FB923C" />
                  Salary Advances Recorded for {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear}
                </h3>
                <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  List of cash/UPI advances given to staff members during this month. These are automatically minus-ed from their monthly salary slip!
                </p>
              </div>

              <button
                onClick={() => {
                  setShowRecordAdvanceModal(true);
                  if (bulkSummaries.length > 0 && !advanceStaffId) {
                    setAdvanceStaffId(bulkSummaries[0].staff.id);
                  }
                }}
                className="btn btn-primary"
                style={{ gap: '6px', backgroundColor: '#FB923C', padding: '10px 18px', fontWeight: 700 }}
              >
                <PlusCircle size={18} /> + Record Salary Advance
              </button>
            </div>
          </div>

          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            {isAdvancesLoading ? (
              <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading recorded advances…</div>
            ) : salaryAdvancesList.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <Coins size={40} color="var(--text-muted)" style={{ marginBottom: '12px' }} />
                <p style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>No salary advances recorded for this month.</p>
                <button
                  onClick={() => {
                    setShowRecordAdvanceModal(true);
                    if (bulkSummaries.length > 0 && !advanceStaffId) {
                      setAdvanceStaffId(bulkSummaries[0].staff.id);
                    }
                  }}
                  className="btn btn-secondary btn-sm"
                  style={{ marginTop: '12px', color: '#FB923C', border: '1px solid rgba(251,146,60,0.4)' }}
                >
                  <PlusCircle size={14} /> Record First Advance
                </button>
              </div>
            ) : (
              <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
                <table className="data-table" style={{ minWidth: '950px' }}>
                  <thead>
                    <tr>
                      <th>Staff Member</th>
                      <th>Advance Amount</th>
                      <th>Date Paid</th>
                      <th>Payment Mode</th>
                      <th>Remarks</th>
                      <th>Status in Slip</th>
                      <th style={{ position: 'sticky', right: 0, backgroundColor: '#0F172A', zIndex: 5, boxShadow: '-4px 0 8px rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salaryAdvancesList.map((adv) => (
                      <tr key={adv.id}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#FFF' }}>{adv.user?.name || 'Staff Member'}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                            ID: {adv.user?.employeeId} • {adv.user?.designation}
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: '1.05rem', fontWeight: 800, color: '#FB923C' }}>
                            ₹{adv.amount.toLocaleString('en-IN')}
                          </span>
                        </td>
                        <td style={{ color: '#C7D2FE', fontWeight: 600 }}>
                          {new Date(adv.date).toLocaleDateString('en-IN')}
                        </td>
                        <td>
                          <span style={{ fontSize: '0.8rem', background: 'rgba(255,255,255,0.06)', padding: '2px 8px', borderRadius: '6px' }}>
                            {adv.paymentMode}
                          </span>
                        </td>
                        <td style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                          {adv.remarks || '—'}
                        </td>
                        <td>
                          <span className={`badge ${adv.isDeducted ? 'badge-present' : 'badge-pending'}`}>
                            {adv.isDeducted ? 'Deducted in Slip' : 'Pending Slip Deduction'}
                          </span>
                        </td>
                        <td style={{ position: 'sticky', right: 0, backgroundColor: '#0F172A', zIndex: 4, boxShadow: '-4px 0 8px rgba(0,0,0,0.4)', borderLeft: '1px solid rgba(255,255,255,0.1)' }}>
                          <button
                            onClick={() => handleDeleteAdvance(adv.id)}
                            className="btn btn-secondary btn-sm"
                            style={{ color: '#F87171', border: '1px solid rgba(239,68,68,0.3)', padding: '4px 8px' }}
                            title="Delete entry"
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: BANK PAYOUT & DISBURSAL SHEET */}
      {activeTab === 'payout' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div className="card" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(99,102,241,0.12), rgba(15,23,42,0.8))', border: '1px solid rgba(99,102,241,0.3)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Building2 size={22} color="#818CF8" />
                  Corporate Bank Salary Payout Sheet ({MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear})
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Export CSV batch payment files for direct upload to HDFC, ICICI, SBI Corporate Banking portals.
                </p>
              </div>

              <button
                onClick={handleExportBankPayoutCSV}
                className="btn btn-primary"
                style={{ gap: '8px', padding: '12px 20px', fontSize: '0.95rem', fontWeight: 700 }}
              >
                <Download size={18} /> Export Bank Payout CSV Sheet
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', width: '100%', WebkitOverflowScrolling: 'touch' }}>
              <table className="data-table" style={{ minWidth: '1050px' }}>
                <thead>
                  <tr>
                    <th>Employee ID</th>
                    <th>Staff Name</th>
                    <th>Bank Name</th>
                    <th>Account Number</th>
                    <th>IFSC Code</th>
                    <th>Salary Advance Taken</th>
                    <th>Total Deductions</th>
                    <th>Net Payable</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                {bulkSummaries.map((item) => {
                  const b = item.staff.bankDetails || {};
                  const adv = item.existingSlip?.advanceDeduction || item.calculated.advanceDeduction || 0;
                  return (
                    <tr key={item.staff.id}>
                      <td><code style={{ color: '#C7D2FE', fontFamily: 'var(--font-mono)' }}>{item.staff.employeeId}</code></td>
                      <td style={{ fontWeight: 700, color: '#FFF' }}>{item.staff.name}</td>
                      <td>{b.bankName || <span style={{ color: 'var(--text-muted)' }}>Not Set</span>}</td>
                      <td><code style={{ fontFamily: 'var(--font-mono)' }}>{b.accountNumber || '—'}</code></td>
                      <td><code style={{ fontFamily: 'var(--font-mono)', color: '#818CF8' }}>{b.ifscCode || '—'}</code></td>
                      <td style={{ fontWeight: 700, color: adv > 0 ? '#FB923C' : 'var(--text-muted)' }}>
                        {adv > 0 ? `-₹${adv.toLocaleString('en-IN')}` : '₹0'}
                      </td>
                      <td style={{ fontWeight: 700, color: '#F87171' }}>-₹{item.calculated.deductions.toLocaleString('en-IN')}</td>
                      <td style={{ fontWeight: 900, color: '#34D399' }}>₹{item.calculated.netSalary.toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`badge ${item.status === 'PAID' ? 'badge-present' : 'badge-pending'}`}>
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )}

      {/* MODAL: RECORD SALARY ADVANCE (अग्रिम वेतन दर्ज करें) */}
      {showRecordAdvanceModal && (
        <div className="modal-overlay" onClick={() => setShowRecordAdvanceModal(false)}>
          <div className="modal-content" style={{ maxWidth: '480px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <PlusCircle size={20} color="#FB923C" />
                <span className="modal-title">Record Salary Advance</span>
              </div>
              <button onClick={() => setShowRecordAdvanceModal(false)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="input-group">
                <label className="input-label">Select Staff Member *</label>
                <select
                  className="input-field"
                  style={{ fontSize: '0.95rem', padding: '10px' }}
                  value={advanceStaffId}
                  onChange={(e) => setAdvanceStaffId(e.target.value)}
                >
                  {bulkSummaries.map((item) => (
                    <option key={item.staff.id} value={item.staff.id}>
                      {item.staff.name} ({item.staff.employeeId}) — {item.staff.designation}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Advance Amount Given (₹) *</label>
                <input
                  className="input-field"
                  type="number"
                  min="1"
                  placeholder="e.g. 3000"
                  style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FB923C' }}
                  value={advanceAmount}
                  onChange={(e) => setAdvanceAmount(Number(e.target.value))}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="input-group">
                  <label className="input-label">Date Paid *</label>
                  <input
                    className="input-field"
                    type="date"
                    value={advanceDate}
                    onChange={(e) => setAdvanceDate(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Payment Mode *</label>
                  <select
                    className="input-field"
                    value={advancePaymentMode}
                    onChange={(e) => setAdvancePaymentMode(e.target.value)}
                  >
                    <option value="Cash">Cash</option>
                    <option value="UPI">UPI (GPay / PhonePe)</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                  </select>
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Remarks / Note (Reason)</label>
                <textarea
                  className="input-field"
                  rows={2}
                  placeholder="e.g. Festival emergency cash advance taken on 15th"
                  value={advanceRemarks}
                  onChange={(e) => setAdvanceRemarks(e.target.value)}
                />
              </div>

              <div style={{ fontSize: '0.8rem', color: '#FB923C', background: 'rgba(251,146,60,0.1)', padding: '10px 12px', borderRadius: '8px', border: '1px solid rgba(251,146,60,0.2)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Info size={14} color="#FB923C" style={{ flexShrink: 0 }} />
                <span><strong>Note:</strong> Recorded advance will be automatically deducted from this staff member's net salary when issuing the monthly salary slip.</span>
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setShowRecordAdvanceModal(false)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleRecordAdvance}
                disabled={isSavingAdvance}
                className="btn btn-primary"
                style={{ backgroundColor: '#FB923C', fontWeight: 700 }}
              >
                {isSavingAdvance ? 'Recording…' : 'Record Advance'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STAFF BASE SALARY */}
      {editSalaryStaff && (
        <div className="modal-overlay" onClick={() => setEditSalaryStaff(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Edit Monthly Base Salary</span>
              <button onClick={() => setEditSalaryStaff(null)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(99,102,241,0.1)', padding: '12px 14px', borderRadius: '10px', border: '1px solid rgba(99,102,241,0.2)' }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#FFF' }}>{editSalaryStaff.staff.name}</div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  ID: {editSalaryStaff.staff.employeeId} • {editSalaryStaff.staff.designation}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Monthly Base Salary (₹) *</label>
                <input
                  className="input-field"
                  type="number"
                  min="0"
                  placeholder="Enter monthly base salary (e.g. 25000)"
                  value={newBaseSalaryInput}
                  onChange={(e) => setNewBaseSalaryInput(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-footer">
              <button onClick={() => setEditSalaryStaff(null)} className="btn btn-secondary">Cancel</button>
              <button onClick={handleSaveBaseSalary} disabled={isSavingSalary} className="btn btn-primary">
                {isSavingSalary ? 'Saving…' : 'Update Salary'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: STAFF DETAIL CALENDAR */}
      {detailModalStaff && (
        <div className="modal-overlay" onClick={() => setDetailModalStaff(null)}>
          <div className="modal-content" style={{ maxWidth: '750px', backgroundColor: '#0F172A' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <span className="modal-title" style={{ fontSize: '1.2rem', fontWeight: 800, color: '#FFF' }}>
                  {detailModalStaff.staff.name} — Attendance Breakdown
                </span>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Month of {MONTHS.find((m) => m.value === selectedMonth)?.label} {selectedYear} • ID: {detailModalStaff.staff.employeeId}
                </p>
              </div>
              <button onClick={() => setDetailModalStaff(null)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>

            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center' }}>
                <div style={{ background: 'rgba(52,211,153,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#34D399' }}>PRESENT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{detailModalStaff.counts.presentDays} Days</div>
                </div>
                <div style={{ background: 'rgba(99,102,241,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#818CF8' }}>PAID LEAVES</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#FFF' }}>{detailModalStaff.counts.paidLeaveDays} Days</div>
                </div>
                <div style={{ background: 'rgba(248,113,113,0.1)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: '#F87171' }}>UNPAID / ABSENT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F87171' }}>
                    {detailModalStaff.counts.unpaidLeaveDays + detailModalStaff.counts.absentDays} Days
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '10px', borderRadius: '8px' }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>TOTAL CUT</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F87171' }}>
                    -₹{detailModalStaff.calculated.deductions.toLocaleString('en-IN')}
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '6px' }}>
                {Array.from({ length: new Date(selectedYear, selectedMonth - 1, 1).getDay() }).map((_, i) => (
                  <div key={`empty-modal-${i}`} style={{ height: '54px', borderRadius: '8px', opacity: 0.15, background: 'rgba(255,255,255,0.02)' }} />
                ))}

                {detailModalStaff.calendar.map((item: any) => {
                  const style = STATUS_BADGE_STYLE[item.status] || STATUS_BADGE_STYLE.UPCOMING;
                  return (
                    <div
                      key={item.day}
                      onClick={() => {
                        setCalendarOverrideTarget({
                          userId: detailModalStaff.staff.id,
                          employeeName: detailModalStaff.staff.name,
                          employeeId: detailModalStaff.staff.employeeId,
                          date: item.date,
                          status: item.status !== 'UPCOMING' && item.status !== 'WEEKEND' ? item.status : 'PRESENT',
                          notes: item.note || '',
                        });
                      }}
                      title={`Click to mark/override attendance for ${item.date}`}
                      style={{
                        height: '56px',
                        borderRadius: '8px',
                        backgroundColor: style.bg,
                        border: `1px solid ${style.border}`,
                        padding: '4px 6px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                        cursor: 'pointer',
                        transition: 'transform 0.15s ease',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1.0)'}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: 800, color: '#FFF' }}>{item.day}</span>
                        <span style={{ fontSize: '0.58rem', fontWeight: 700, color: style.color, textTransform: 'uppercase' }}>
                          {item.status.replace('_LEAVE', '').replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setDetailModalStaff(null)} className="btn btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: VIEW & PRINT PROFESSIONAL A4 SALARY PAY SLIP */}
      {viewSlip && (
        <div className="modal-overlay" onClick={() => setViewSlip(null)}>
          <div
            className="modal-content"
            style={{ maxWidth: '720px', backgroundColor: '#FFF', color: '#1E293B', padding: 0, borderRadius: '16px', overflow: 'hidden' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Printable Container */}
            <div id="printable-payslip" style={{ padding: '32px' }}>
              {/* School Header */}
              <div style={{ borderBottom: '2px solid #0F172A', paddingBottom: '16px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h1 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    SCHOOL ACADEMY SYSTEM
                  </h1>
                  <p style={{ fontSize: '0.8rem', color: '#64748B' }}>Official Employee Monthly Salary Pay Slip</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: '#6366F1' }}>PAY SLIP</div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#334155' }}>
                    {MONTHS.find((m) => m.value === viewSlip.month)?.label} {viewSlip.year}
                  </div>
                </div>
              </div>

              {/* Employee & Bank Info Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '16px',
                  backgroundColor: '#F8FAFC',
                  padding: '16px',
                  borderRadius: '10px',
                  marginBottom: '20px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.85rem',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Employee Name:</span>
                    <strong style={{ color: '#0F172A' }}>{viewSlip.user?.name}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Employee ID:</span>
                    <strong style={{ color: '#0F172A' }}>{viewSlip.user?.employeeId}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Designation:</span>
                    <span>{viewSlip.user?.designation || 'Staff'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Department:</span>
                    <span>{viewSlip.user?.department || 'Academics'}</span>
                  </div>
                </div>

                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Bank Name:</span>
                    <strong>{viewSlip.bankDetailsSnapshot?.bankName || viewSlip.user?.bankDetails?.bankName || 'Direct Transfer'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>Account No:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{viewSlip.bankDetailsSnapshot?.accountNumber || viewSlip.user?.bankDetails?.accountNumber || '—'}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                    <span style={{ color: '#64748B' }}>IFSC Code:</span>
                    <span style={{ fontFamily: 'monospace' }}>{viewSlip.bankDetailsSnapshot?.ifscCode || viewSlip.user?.bankDetails?.ifscCode || '—'}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Payment Mode:</span>
                    <span style={{ fontWeight: 700, color: '#4338CA' }}>{viewSlip.paymentMode || 'Bank Transfer'}</span>
                  </div>
                </div>
              </div>

              {/* Attendance Statistics Strip */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', textAlign: 'center', marginBottom: '20px', fontSize: '0.8rem' }}>
                <div style={{ background: '#ECFDF5', padding: '8px', borderRadius: '6px', border: '1px solid #A7F3D0' }}>
                  <div style={{ color: '#047857', fontSize: '0.7rem' }}>PRESENT</div>
                  <div style={{ fontWeight: 800, color: '#065F46' }}>{viewSlip.presentDays} Days</div>
                </div>
                <div style={{ background: '#EEF2FF', padding: '8px', borderRadius: '6px', border: '1px solid #C7D2FE' }}>
                  <div style={{ color: '#4338CA', fontSize: '0.7rem' }}>PAID LEAVES</div>
                  <div style={{ fontWeight: 800, color: '#3730A3' }}>{viewSlip.paidLeaveDays} Days</div>
                </div>
                <div style={{ background: '#FEF2F2', padding: '8px', borderRadius: '6px', border: '1px solid #FECACA' }}>
                  <div style={{ color: '#B91C1C', fontSize: '0.7rem' }}>UNPAID / ABSENT</div>
                  <div style={{ fontWeight: 800, color: '#991B1B' }}>{viewSlip.unpaidLeaveDays + viewSlip.absentDays} Days</div>
                </div>
                <div style={{ background: '#F8FAFC', padding: '8px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                  <div style={{ color: '#64748B', fontSize: '0.7rem' }}>TOTAL DAYS</div>
                  <div style={{ fontWeight: 800, color: '#334155' }}>{viewSlip.totalDaysInMonth} Days</div>
                </div>
              </div>

              {/* Itemized Earnings & Deductions 2-Column Table */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                {/* Earnings Table */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#ECFDF5', borderBottom: '2px solid #10B981', color: '#065F46', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>EARNINGS</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px' }}>Base Monthly Salary</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{(viewSlip.earnings?.baseSalary ?? viewSlip.baseSalary).toLocaleString('en-IN')}</td>
                    </tr>
                    {viewSlip.earnings?.hra ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>House Rent Allowance (HRA)</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{viewSlip.earnings.hra.toLocaleString('en-IN')}</td>
                      </tr>
                    ) : null}
                    {viewSlip.earnings?.transportAllowance ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>Transport Allowance</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{viewSlip.earnings.transportAllowance.toLocaleString('en-IN')}</td>
                      </tr>
                    ) : null}
                    {viewSlip.earnings?.specialAllowance ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>Special Duty Allowance</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{viewSlip.earnings.specialAllowance.toLocaleString('en-IN')}</td>
                      </tr>
                    ) : null}
                    {viewSlip.bonus > 0 && (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>Performance Bonus</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{viewSlip.bonus.toLocaleString('en-IN')}</td>
                      </tr>
                    )}
                  </tbody>
                </table>

                {/* Deductions Table with Same-Month Advance Deduction */}
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#FEF2F2', borderBottom: '2px solid #EF4444', color: '#991B1B', textAlign: 'left' }}>
                      <th style={{ padding: '8px' }}>DEDUCTIONS</th>
                      <th style={{ padding: '8px', textAlign: 'right' }}>AMOUNT (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                      <td style={{ padding: '8px' }}>Unpaid Leave & Absence Cut</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                        ₹{(viewSlip.deductionsBreakdown?.leaveDeduction ?? (viewSlip.deductions - (viewSlip.advanceDeduction || 0))).toLocaleString('en-IN')}
                      </td>
                    </tr>
                    {(viewSlip.advanceDeduction || viewSlip.deductionsBreakdown?.advanceDeduction) ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0', background: '#FFF7ED' }}>
                        <td style={{ padding: '8px', color: '#C2410C', fontWeight: 700 }}>
                          - Salary Advance Taken
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 800, color: '#C2410C' }}>
                          -₹{(viewSlip.advanceDeduction || viewSlip.deductionsBreakdown?.advanceDeduction || 0).toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ) : null}
                    {viewSlip.deductionsBreakdown?.latePenalty ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>Late Check-in Fine</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600, color: '#DC2626' }}>
                          ₹{viewSlip.deductionsBreakdown.latePenalty.toLocaleString('en-IN')}
                        </td>
                      </tr>
                    ) : null}
                    {viewSlip.deductionsBreakdown?.pfDeduction ? (
                      <tr style={{ borderBottom: '1px solid #E2E8F0' }}>
                        <td style={{ padding: '8px' }}>Provident Fund (PF)</td>
                        <td style={{ padding: '8px', textAlign: 'right', fontWeight: 600 }}>₹{viewSlip.deductionsBreakdown.pfDeduction.toLocaleString('en-IN')}</td>
                      </tr>
                    ) : null}
                  </tbody>
                </table>
              </div>

              {/* Net Payable Banner */}
              <div style={{ backgroundColor: '#0F172A', color: '#FFF', padding: '16px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94A3B8', textTransform: 'uppercase' }}>NET SALARY DISBURSED</div>
                  <div style={{ fontSize: '0.88rem', fontWeight: 600, color: '#34D399', marginTop: '2px' }}>
                    {numberToWordsInRupees(viewSlip.netSalary)}
                  </div>
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399' }}>
                  ₹{viewSlip.netSalary.toLocaleString('en-IN')}
                </div>
              </div>

              {/* School Stamp & Signatures */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '40px', paddingTop: '20px', borderTop: '1px solid #E2E8F0', fontSize: '0.8rem' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '120px', borderBottom: '1px dashed #64748B', marginBottom: '6px' }} />
                  <span>Employee Signature</span>
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: '140px', borderBottom: '1px dashed #64748B', marginBottom: '6px' }} />
                  <span style={{ fontWeight: 700, color: '#0F172A' }}>Principal / Accounts Seal</span>
                </div>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="no-print" style={{ background: '#F8FAFC', padding: '16px 28px', borderTop: '1px solid #E2E8F0', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
              <button onClick={() => setViewSlip(null)} className="btn btn-secondary" style={{ color: '#0F172A' }}>
                Close
              </button>
              <button onClick={() => window.print()} className="btn btn-primary" style={{ gap: '6px', backgroundColor: '#6366F1' }}>
                <Printer size={16} /> Print / Download PDF
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: MARK SALARY PAID */}
      {payModalSlip && (
        <div className="modal-overlay" onClick={() => setPayModalSlip(null)}>
          <div className="modal-content" style={{ maxWidth: '450px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Mark Salary as Paid</span>
              <button onClick={() => setPayModalSlip(null)} className="btn btn-secondary btn-icon btn-sm">
                <X size={16} />
              </button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{ background: 'rgba(52,211,153,0.1)', padding: '14px', borderRadius: '10px', border: '1px solid rgba(52,211,153,0.2)' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Paying Staff Member:</div>
                <div style={{ fontSize: '1rem', fontWeight: 800, color: '#FFF' }}>
                  {payModalSlip.user?.name} ({payModalSlip.user?.employeeId})
                </div>
                <div style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399', marginTop: '6px' }}>
                  Net Amount: ₹{payModalSlip.netSalary.toLocaleString('en-IN')}
                </div>
              </div>

              <div className="input-group">
                <label className="input-label">Payment Mode *</label>
                <select className="input-field" value={paymentMode} onChange={(e) => setPaymentMode(e.target.value)}>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS/IMPS)</option>
                  <option value="UPI">UPI / GPay / PhonePe</option>
                  <option value="Cheque">Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Payment Date *</label>
                <input
                  className="input-field"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Transaction Ref / Cheque No. (Optional)</label>
                <input
                  className="input-field"
                  type="text"
                  placeholder="e.g. UTR123456789 or Cheque #4521"
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                />
              </div>
            </div>

            <div className="modal-footer">
              <button onClick={() => setPayModalSlip(null)} className="btn btn-secondary">
                Cancel
              </button>
              <button
                onClick={handleUpdateStatus}
                disabled={isUpdatingStatus}
                className="btn btn-primary"
                style={{ backgroundColor: '#10B981' }}
              >
                {isUpdatingStatus ? 'Saving…' : 'Confirm Salary Paid'}
              </button>
            </div>
          </div>
        </div>
      )}
      {calendarOverrideTarget && (
        <AttendanceOverrideModal
          target={calendarOverrideTarget}
          onClose={() => setCalendarOverrideTarget(null)}
          onSave={() => {
            fetchEmployeeSummary();
            fetchBulkSummaries();
          }}
        />
      )}
    </div>
  );
};

// ── Quick Override Modal for Salary Calendar Grid ─────────────
const PRESET_REASONS_SALARY = [
  'Phone Battery Empty',
  'Phone Left at Home',
  'Approved by Principal',
  'Network / App Sync Issue',
  'Health / Medical Emergency',
];

const AttendanceOverrideModal: React.FC<{
  target: { userId: string; employeeName: string; employeeId: string; date: string; status: string; notes: string };
  onClose: () => void;
  onSave: () => void;
}> = ({ target, onClose, onSave }) => {
  const [form, setForm] = useState({
    status: target.status || 'PRESENT',
    checkInAt: `${target.date}T09:00`,
    checkOutAt: '',
    notes: target.notes || '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSave = async () => {
    if (!form.notes.trim()) { setError('Admin override reason / notes are required.'); return; }
    setIsLoading(true); setError('');
    try {
      const payload: any = {
        userId: target.userId,
        date: target.date,
        notes: form.notes,
        status: form.status,
      };
      if (form.checkInAt) payload.checkInAt = new Date(form.checkInAt).toISOString();
      if (form.checkOutAt) payload.checkOutAt = new Date(form.checkOutAt).toISOString();

      await apiClient.patch(`/attendance/admin/temp_${target.userId}_${target.date}/override`, payload);
      onSave();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Attendance override failed.');
    } finally {
      setIsLoading(false);
    }
  };

  const statusOptions = [
    { id: 'PRESENT', label: 'PRESENT', color: '#34D399', bg: 'rgba(52, 211, 153, 0.15)', border: 'rgba(52, 211, 153, 0.3)' },
    { id: 'LATE', label: 'LATE', color: '#FACC15', bg: 'rgba(250, 204, 21, 0.15)', border: 'rgba(250, 204, 21, 0.3)' },
    { id: 'HALF_DAY', label: 'HALF DAY', color: '#FB923C', bg: 'rgba(251, 146, 60, 0.15)', border: 'rgba(251, 146, 60, 0.3)' },
    { id: 'ON_LEAVE', label: 'ON LEAVE', color: '#818CF8', bg: 'rgba(129, 140, 248, 0.15)', border: 'rgba(129, 140, 248, 0.3)' },
    { id: 'ABSENT', label: 'ABSENT', color: '#F87171', bg: 'rgba(248, 113, 113, 0.15)', border: 'rgba(248, 113, 113, 0.3)' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} style={{ backdropFilter: 'blur(10px)', zIndex: 1000 }}>
      <div className="modal-content" style={{ maxWidth: '560px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.15)', boxShadow: '0 25px 60px rgba(0,0,0,0.6)' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header" style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #F59E0B, #D97706)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(245,158,11,0.4)' }}>
              <Edit2 size={18} color="#FFF" />
            </div>
            <div>
              <span className="modal-title" style={{ fontSize: '1.1rem', fontWeight: 800 }}>Override Attendance ({target.date})</span>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                Staff: <strong style={{ color: '#FFF' }}>{target.employeeName}</strong> ({target.employeeId})
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-secondary btn-icon btn-sm"><X size={16} /></button>
        </div>

        <div className="modal-body" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{ backgroundColor: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 16px', color: '#F87171', fontSize: '0.88rem', fontWeight: 600 }}>
              ⚠️ {error}
            </div>
          )}

          {/* Select Status Buttons */}
          <div>
            <label className="input-label" style={{ marginBottom: '10px', fontSize: '0.85rem', fontWeight: 700 }}>Select Attendance Status *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px' }}>
              {statusOptions.map(opt => {
                const isSelected = form.status === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setForm(p => ({ ...p, status: opt.id }))}
                    style={{
                      padding: '10px 4px',
                      borderRadius: '10px',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      color: isSelected ? '#FFF' : opt.color,
                      backgroundColor: isSelected ? opt.color : opt.bg,
                      border: `1px solid ${isSelected ? opt.color : opt.border}`,
                      cursor: 'pointer',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 4px 12px ${opt.color}50` : 'none',
                      textAlign: 'center',
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#34D399" /> Check-In Time
              </label>
              <input className="input-field" type="datetime-local" value={form.checkInAt} onChange={e => setForm(p => ({ ...p, checkInAt: e.target.value }))} />
            </div>
            <div className="input-group">
              <label className="input-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Clock size={14} color="#2DD4BF" /> Check-Out Time (Optional)
              </label>
              <input className="input-field" type="datetime-local" value={form.checkOutAt} onChange={e => setForm(p => ({ ...p, checkOutAt: e.target.value }))} />
            </div>
          </div>

          {/* Preset Reason Chips */}
          <div>
            <label className="input-label" style={{ marginBottom: '8px', fontSize: '0.8rem' }}>Quick Preset Reasons (Click to fill):</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {PRESET_REASONS_SALARY.map(r => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setForm(p => ({ ...p, notes: r }))}
                  style={{
                    fontSize: '0.75rem',
                    padding: '4px 10px',
                    borderRadius: '8px',
                    backgroundColor: 'rgba(255,255,255,0.06)',
                    border: '1px solid rgba(255,255,255,0.12)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary-400)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.12)'}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Admin Reason / Override Notes *</label>
            <textarea className="input-field" rows={3} placeholder="Reason for admin override (e.g. Phone battery empty, approved by Principal)..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} style={{ resize: 'vertical' }} />
          </div>
        </div>

        <div className="modal-footer" style={{ padding: '16px 24px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <button onClick={onClose} className="btn btn-secondary">Cancel</button>
          <button onClick={handleSave} disabled={isLoading} className="btn btn-primary" style={{ minWidth: '140px' }}>
            {isLoading ? 'Saving…' : 'Save Attendance'}
          </button>
        </div>
      </div>
    </div>
  );
};

