import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { LogOut, Plus, Briefcase, MapPin, Calendar, Receipt } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [deployments, setDeployments] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newDeployment, setNewDeployment] = useState({
    projectName: '',
    location: '',
    startDate: '',
    endDate: ''
  });

  const fetchDeployments = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/deployments', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setDeployments(data);
      }
    } catch (error) {
      console.error("Error fetching deployments:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchDeployments();
    }
  }, [user]);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/deployments', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...newDeployment,
          status: 'Active'
        })
      });
      
      if (res.ok) {
        const data = await res.json();
        await fetchDeployments();
        setIsCreating(false);
        setNewDeployment({ projectName: '', location: '', startDate: '', endDate: '' });
        navigate(`/deployment/${data.id}`);
      } else {
        throw new Error('Failed to create deployment');
      }
    } catch (error) {
      console.error("Error creating deployment:", error);
      alert("Failed to create deployment");
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.05 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-stone-50 selection:bg-amber-200">
      {/* Navbar */}
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-stone-200/50">
        <div className="max-w-6xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-amber-400 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-stone-900" />
            </div>
            <span className="text-xl font-bold tracking-tight text-stone-900 font-heading">My-Claimora</span>
          </Link>
          <Button variant="ghost" onClick={logout} className="text-stone-500 hover:text-stone-900">
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl p-4 md:p-8 pt-8">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-stone-900 font-heading mb-2">Deployments</h1>
            <p className="text-stone-500">Manage your work trips and track expenses seamlessly.</p>
          </div>
          <Button onClick={() => setIsCreating(true)} className="shrink-0">
            <Plus className="mr-2 h-4 w-4" />
            New Deployment
          </Button>
        </motion.div>

        {/* Summary Stats */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
        >
          <Card className="bg-white border-stone-100 shadow-sm">
            <CardContent className="p-6">
              <div className="text-stone-500 text-sm font-medium mb-1">Total Deployments</div>
              <div className="text-3xl font-bold text-stone-900 font-heading">{deployments.length}</div>
            </CardContent>
          </Card>
          <Card className="bg-white border-stone-100 shadow-sm">
            <CardContent className="p-6">
              <div className="text-stone-500 text-sm font-medium mb-1">Active Deployments</div>
              <div className="text-3xl font-bold text-amber-600 font-heading">
                {deployments.filter(d => d.status === 'Active').length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white border-stone-100 shadow-sm">
            <CardContent className="p-6">
              <div className="text-stone-500 text-sm font-medium mb-1">Closed Deployments</div>
              <div className="text-3xl font-bold text-stone-900 font-heading">
                {deployments.filter(d => d.status === 'Closed').length}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 32 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className="overflow-hidden"
            >
              <Card className="border-amber-200 bg-amber-50/30 shadow-sm">
                <CardHeader>
                  <CardTitle>Create New Deployment</CardTitle>
                  <CardDescription>Enter the details for your upcoming work trip.</CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleCreate} className="grid gap-5 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="projectName">Project Name</Label>
                      <Input
                        id="projectName"
                        required
                        placeholder="e.g., 30-Day Site Visit"
                        value={newDeployment.projectName}
                        onChange={(e) => setNewDeployment({ ...newDeployment, projectName: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        required
                        placeholder="e.g., Austin, TX"
                        value={newDeployment.location}
                        onChange={(e) => setNewDeployment({ ...newDeployment, location: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input
                        id="startDate"
                        type="date"
                        required
                        value={newDeployment.startDate}
                        onChange={(e) => setNewDeployment({ ...newDeployment, startDate: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="endDate">End Date</Label>
                      <Input
                        id="endDate"
                        type="date"
                        required
                        value={newDeployment.endDate}
                        onChange={(e) => setNewDeployment({ ...newDeployment, endDate: e.target.value })}
                        className="bg-white"
                      />
                    </div>
                    <div className="col-span-full flex justify-end gap-3 pt-4">
                      <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancel</Button>
                      <Button type="submit">Create Deployment</Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {deployments.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {deployments.map((deployment) => (
              <div key={deployment._id || deployment.id}>
                <Link to={`/deployment/${deployment._id || deployment.id}`} className="block h-full">
                  <Card className="h-full group hover:border-amber-300 transition-colors">
                    <CardHeader className="pb-4">
                      <div className="flex items-start justify-between gap-4">
                        <CardTitle className="line-clamp-2 text-xl leading-tight group-hover:text-amber-600 transition-colors">{deployment.projectName}</CardTitle>
                        <span className={`shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                          deployment.status === 'Active' ? 'bg-amber-100 text-amber-800' : 'bg-stone-100 text-stone-600'
                        }`}>
                          {deployment.status}
                        </span>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 text-sm text-stone-500">
                      <div className="flex items-center gap-2.5">
                        <MapPin className="h-4 w-4 text-amber-400 shrink-0" />
                        <span className="truncate">{deployment.location}</span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Calendar className="h-4 w-4 text-amber-400 shrink-0" />
                        <span>{deployment.startDate} to {deployment.endDate}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          !isCreating && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}
              className="rounded-3xl border border-dashed border-stone-200 bg-white p-12 text-center text-stone-500 shadow-sm"
            >
              <div className="mx-auto mb-6 h-16 w-16 rounded-2xl bg-stone-50 flex items-center justify-center">
                <Briefcase className="h-8 w-8 text-stone-300" />
              </div>
              <h3 className="mb-2 text-xl font-bold text-stone-900 font-heading">No deployments yet</h3>
              <p className="mb-6 max-w-sm mx-auto">Create a new deployment to start tracking your expenses and generating reports.</p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Deployment
              </Button>
            </motion.div>
          )
        )}
      </main>
    </div>
  );
}
