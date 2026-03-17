import React, { useState, useEffect } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { ArrowLeft, Upload, FileSpreadsheet, FileText, CheckCircle2, Plus, Image as ImageIcon, Trash2, Receipt } from 'lucide-react';
import { resizeImage } from '../services/imageService';
import { generateExcel, generatePDF, Expense, Deployment } from '../services/exportService';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = ['Food', 'Travel', 'Lodging', 'Miscellaneous'];
const COLORS = ['#F59E0B', '#10B981', '#3B82F6', '#6366F1'];

export default function DeploymentDetails() {
  const { id } = useParams<{ id: string }>();
  const { user, loading } = useAuth();
  const [deployment, setDeployment] = useState<Deployment | null>(null);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [newExpense, setNewExpense] = useState({
    date: new Date().toISOString().split('T')[0],
    category: 'Food',
    amount: '',
    description: '',
    receiptImage: ''
  });

  const fetchDeploymentData = async () => {
    if (!user || !id) return;
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      const [deploymentRes, expensesRes] = await Promise.all([
        fetch(`/api/deployments/${id}`, { headers }),
        fetch(`/api/expenses/${id}`, { headers })
      ]);

      if (deploymentRes.ok) {
        const deploymentData = await deploymentRes.json();
        setDeployment(deploymentData);
      }
      
      if (expensesRes.ok) {
        const expensesData = await expensesRes.json();
        setExpenses(expensesData);
      }
    } catch (error) {
      console.error("Error fetching deployment data:", error);
    }
  };

  useEffect(() => {
    fetchDeploymentData();
  }, [id, user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (!deployment) return <div className="flex min-h-screen items-center justify-center bg-stone-50">Loading deployment...</div>;

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    setUploadingImage(true);
    try {
      const base64 = await resizeImage(file, 800);
      setNewExpense({ ...newExpense, receiptImage: base64 });
    } catch (error) {
      console.error("Error resizing image:", error);
      alert("Failed to process image. Please try a different one.");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newExpense.amount || isNaN(Number(newExpense.amount))) {
      alert("Please enter a valid amount");
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/expenses', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          deploymentId: id,
          date: newExpense.date,
          category: newExpense.category,
          amount: Number(newExpense.amount),
          description: newExpense.description,
          receiptImage: newExpense.receiptImage
        })
      });

      if (res.ok) {
        await fetchDeploymentData();
        setIsAddingExpense(false);
        setNewExpense({
          date: new Date().toISOString().split('T')[0],
          category: 'Food',
          amount: '',
          description: '',
          receiptImage: ''
        });
      } else {
        throw new Error('Failed to add expense');
      }
    } catch (error) {
      console.error("Error adding expense:", error);
      alert("Failed to add expense");
    }
  };

  const handleCloseDeployment = async () => {
    if (!window.confirm("Are you sure you want to close this deployment? You won't be able to add more expenses.")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/deployments/${id}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: 'Closed' })
      });

      if (res.ok) {
        setDeployment({ ...deployment, status: 'Closed' });
      } else {
        throw new Error('Failed to close deployment');
      }
    } catch (error) {
      console.error("Error closing deployment:", error);
      alert("Failed to close deployment");
    }
  };

  const handleDeleteExpense = async (expenseId: string) => {
    if (!window.confirm("Are you sure you want to delete this expense?")) return;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/expenses/${expenseId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        await fetchDeploymentData();
      } else {
        throw new Error('Failed to delete expense');
      }
    } catch (error) {
      console.error("Error deleting expense:", error);
      alert("Failed to delete expense");
    }
  };

  const summaryData = CATEGORIES.map(cat => ({
    name: cat,
    value: expenses.filter(e => e.category === cat).reduce((sum, e) => sum + e.amount, 0)
  })).filter(d => d.value > 0);

  const totalSpend = expenses.reduce((sum, e) => sum + e.amount, 0);

  const listVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: { opacity: 1, x: 0 }
  };

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
    expense.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200 pb-12">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 text-stone-500 hover:text-stone-900 transition-colors">
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-amber-400 flex items-center justify-center">
              <Receipt className="h-3 w-3 text-stone-900" />
            </div>
            <span className="font-bold tracking-tight text-stone-900 font-heading">My-Claimora</span>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl p-4 md:p-8 pt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 font-heading mb-2">{deployment.projectName}</h1>
            <p className="text-stone-500 flex items-center gap-2">
              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                deployment.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
              }`}>
                {deployment.status}
              </span>
              <span>•</span>
              {deployment.location}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={() => { generateExcel(deployment, expenses); generatePDF(deployment, expenses); }} className="bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900">
              <FileSpreadsheet className="mr-2 h-4 w-4 text-amber-500" />
              Download Pack (Excel + PDF)
            </Button>
            {deployment.status === 'Active' && (
              <Button variant="secondary" onClick={handleCloseDeployment} className="bg-stone-900 text-white hover:bg-stone-800">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Close Deployment
              </Button>
            )}
          </div>
        </motion.div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column: Details & Summary */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="space-y-6 lg:col-span-1">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle className="text-lg">Deployment Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex justify-between text-sm border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Dates</span>
                  <span className="font-medium text-stone-900">{deployment.startDate} to {deployment.endDate}</span>
                </div>
                <div className="flex justify-between text-sm border-b border-stone-100 pb-3">
                  <span className="text-stone-500">Total Expenses</span>
                  <span className="font-medium text-stone-900">{expenses.length} logs</span>
                </div>
                <div className="flex justify-between text-sm pt-1">
                  <span className="text-stone-500">Total Spend</span>
                  <span className="text-2xl font-bold text-stone-900">₹{totalSpend.toFixed(2)}</span>
                </div>
              </CardContent>
            </Card>

            {summaryData.length > 0 && (
              <Card className="bg-white">
                <CardHeader>
                  <CardTitle className="text-lg">Expense Breakdown</CardTitle>
                </CardHeader>
                <CardContent className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={summaryData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {summaryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => `₹${value.toFixed(2)}`} 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Legend iconType="circle" />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </motion.div>

          {/* Right Column: Expenses List */}
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="space-y-6 lg:col-span-2">
            {deployment.status === 'Active' && (
              <Card className="border-amber-200 bg-white shadow-sm">
                <CardHeader className="pb-4 border-b border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <CardTitle className="text-xl">Expenses</CardTitle>
                    <div className="flex items-center gap-3">
                      <Input 
                        placeholder="Search expenses..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full sm:w-64 bg-stone-50"
                      />
                      {!isAddingExpense && (
                        <Button size="sm" onClick={() => setIsAddingExpense(true)} className="shrink-0">
                          <Plus className="mr-2 h-4 w-4" />
                          Add Expense
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <AnimatePresence>
                  {isAddingExpense && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="overflow-hidden"
                    >
                      <CardContent className="border-b border-stone-100 bg-amber-50/30 pt-6 pb-6">
                        <form onSubmit={handleAddExpense} className="grid gap-5 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="date">Date</Label>
                            <Input
                              id="date"
                              type="date"
                              required
                              value={newExpense.date}
                              onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="category">Category</Label>
                            <select
                              id="category"
                              className="flex h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400"
                              value={newExpense.category}
                              onChange={(e) => setNewExpense({ ...newExpense, category: e.target.value })}
                            >
                              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="amount">Amount (₹)</Label>
                            <Input
                              id="amount"
                              type="number"
                              step="0.01"
                              min="0"
                              required
                              placeholder="0.00"
                              value={newExpense.amount}
                              onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })}
                              className="bg-white"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="description">Description</Label>
                            <Input
                              id="description"
                              required
                              placeholder="e.g., Dinner at Airport"
                              value={newExpense.description}
                              onChange={(e) => setNewExpense({ ...newExpense, description: e.target.value })}
                              className="bg-white"
                            />
                          </div>
                          <div className="col-span-full space-y-2">
                            <Label>Receipt Image</Label>
                            <div className="flex items-center gap-4">
                              <label className="flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-stone-300 bg-white px-4 py-8 hover:bg-stone-50 hover:border-amber-300 w-full transition-colors">
                                <div className="flex flex-col items-center gap-3 text-stone-500">
                                  <div className="p-3 bg-amber-100 rounded-full text-amber-600">
                                    <Upload className="h-5 w-5" />
                                  </div>
                                  <span className="text-sm font-medium">
                                    {uploadingImage ? 'Processing...' : 'Click to upload receipt photo'}
                                  </span>
                                </div>
                                <input
                                  type="file"
                                  accept="image/*"
                                  capture="environment"
                                  className="hidden"
                                  onChange={handleImageUpload}
                                  disabled={uploadingImage}
                                />
                              </label>
                              {newExpense.receiptImage && (
                                <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-xl border border-stone-200 shadow-sm">
                                  <img src={newExpense.receiptImage} alt="Receipt preview" className="h-full w-full object-cover" />
                                  <button
                                    type="button"
                                    onClick={() => setNewExpense({ ...newExpense, receiptImage: '' })}
                                    className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white hover:bg-red-600 shadow-sm transition-colors"
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                          <div className="col-span-full flex justify-end gap-3 pt-2">
                            <Button type="button" variant="ghost" onClick={() => setIsAddingExpense(false)}>Cancel</Button>
                            <Button type="submit" disabled={uploadingImage}>Save Expense</Button>
                          </div>
                        </form>
                      </CardContent>
                    </motion.div>
                  )}
                </AnimatePresence>

                <CardContent className="pt-6">
                  {expenses.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <Receipt className="mx-auto h-12 w-12 mb-3 opacity-20" />
                      <p>No expenses logged yet.</p>
                    </div>
                  ) : filteredExpenses.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <p>No expenses match your search.</p>
                    </div>
                  ) : (
                    <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-3">
                      {filteredExpenses.map((expense) => (
                        <motion.div key={expense.id} variants={itemVariants} className="flex items-start justify-between rounded-xl border border-stone-100 bg-white p-4 transition-all hover:shadow-sm hover:border-amber-200">
                          <div className="flex gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-stone-400 border border-stone-100">
                              {expense.receiptImage ? (
                                <img src={expense.receiptImage} alt="Receipt" className="h-full w-full rounded-xl object-cover" />
                              ) : (
                                <ImageIcon className="h-5 w-5" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium text-stone-900">{expense.description}</p>
                              <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                                <span>{expense.date}</span>
                                <span>•</span>
                                <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">{expense.category}</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right font-bold text-stone-900 text-lg">
                              ₹{expense.amount.toFixed(2)}
                            </div>
                            <button
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                              title="Delete Expense"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </CardContent>
              </Card>
            )}
            
            {deployment.status === 'Closed' && (
              <Card className="bg-stone-50/50 border-stone-200">
                <CardHeader className="pb-4 border-b border-stone-100">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">Expenses</CardTitle>
                      <CardDescription>This deployment is closed. Expenses cannot be modified.</CardDescription>
                    </div>
                    <Input 
                      placeholder="Search expenses..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 bg-white"
                    />
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {filteredExpenses.length === 0 ? (
                    <div className="py-12 text-center text-stone-400">
                      <p>No expenses match your search.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {filteredExpenses.map((expense) => (
                      <div key={expense.id} className="flex items-start justify-between rounded-xl border border-stone-200 bg-white p-4 opacity-70 grayscale-[30%]">
                        <div className="flex gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-stone-50 text-stone-400 border border-stone-100">
                            {expense.receiptImage ? (
                              <img src={expense.receiptImage} alt="Receipt" className="h-full w-full rounded-xl object-cover" />
                            ) : (
                              <ImageIcon className="h-5 w-5" />
                            )}
                          </div>
                          <div>
                            <p className="font-medium text-stone-900">{expense.description}</p>
                            <div className="flex items-center gap-2 text-sm text-stone-500 mt-1">
                              <span>{expense.date}</span>
                              <span>•</span>
                              <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-medium text-stone-600">{expense.category}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right font-bold text-stone-900 text-lg">
                          ₹{expense.amount.toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>
                  )}
                </CardContent>
              </Card>
            )}
          </motion.div>
        </div>
      </main>
    </div>
  );
}
