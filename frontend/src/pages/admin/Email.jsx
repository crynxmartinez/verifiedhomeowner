import { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import { adminAPI } from '../../lib/api';
import { 
  Mail, 
  FileText, 
  Zap, 
  Plus, 
  Edit2, 
  Trash2, 
  Send, 
  Clock, 
  Repeat, 
  ToggleLeft, 
  ToggleRight,
  X,
  Loader2,
  Eye,
  CheckCircle
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

const TRIGGERS = [
  { id: 'after_register', name: 'After Registration', description: 'Send X hours after user registers' },
  { id: 'not_verified', name: 'Not Verified', description: 'User has not verified their email' },
  { id: 'on_free_plan', name: 'On Free Plan', description: 'User is still on free plan' },
  { id: 'inactive_7d', name: 'Inactive 7 Days', description: 'User has not logged in for 7+ days' },
  { id: 'inactive_30d', name: 'Inactive 30 Days', description: 'User has not logged in for 30+ days' },
  { id: 'before_expiry', name: 'Before Subscription Expiry', description: 'X hours before subscription expires' },
  { id: 'monthly', name: 'Monthly Digest', description: 'Sent on 1st of each month' },
];

const AVAILABLE_VARIABLES = [
  '{{name}}', '{{full_name}}', '{{email}}', '{{plan}}',
  '{{days_since_register}}', '{{leads_count}}', '{{leads_this_month}}',
  '{{login_url}}', '{{upgrade_url}}', '{{marketplace_url}}', '{{unsubscribe_url}}',
  '{{month}}', '{{year}}'
];

export default function Email() {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState([]);
  const [automations, setAutomations] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Template modal state
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [templateForm, setTemplateForm] = useState({
    name: '',
    display_name: '',
    subject: '',
    html_content: '',
    text_content: '',
  });
  const [savingTemplate, setSavingTemplate] = useState(false);

  // Test send state
  const [testEmail, setTestEmail] = useState('');
  const [sendingTest, setSendingTest] = useState(false);

  // Automation modal state
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [editingAutomation, setEditingAutomation] = useState(null);
  const [automationForm, setAutomationForm] = useState({
    name: '',
    description: '',
    template_id: '',
    trigger: 'after_register',
    delay_hours: 0,
    repeat_interval_hours: 0,
    max_sends: 1,
    is_active: true,
  });
  const [savingAutomation, setSavingAutomation] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [templatesRes, automationsRes] = await Promise.all([
        adminAPI.getEmailTemplates(),
        adminAPI.getEmailAutomations(),
      ]);
      setTemplates(templatesRes.data.templates);
      setAutomations(automationsRes.data.automations);
      setStats(automationsRes.data.stats);
    } catch (error) {
      console.error('Failed to fetch email data:', error);
      toast.error('Failed to load email data');
    } finally {
      setLoading(false);
    }
  };

  // Template handlers
  const openTemplateModal = (template = null) => {
    if (template) {
      setEditingTemplate(template);
      setTemplateForm({
        name: template.name,
        display_name: template.display_name,
        subject: template.subject,
        html_content: template.html_content,
        text_content: template.text_content,
      });
    } else {
      setEditingTemplate(null);
      setTemplateForm({
        name: '',
        display_name: '',
        subject: '',
        html_content: '',
        text_content: '',
      });
    }
    setTestEmail('');
    setShowTemplateModal(true);
  };

  const saveTemplate = async () => {
    if (!templateForm.name || !templateForm.display_name || !templateForm.subject || !templateForm.html_content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingTemplate(true);
    try {
      if (editingTemplate) {
        await adminAPI.updateEmailTemplate({ id: editingTemplate.id, ...templateForm });
        toast.success('Template updated successfully');
      } else {
        await adminAPI.createEmailTemplate(templateForm);
        toast.success('Template created successfully');
      }
      setShowTemplateModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save template');
    } finally {
      setSavingTemplate(false);
    }
  };

  const deleteTemplate = async (id) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    
    try {
      await adminAPI.deleteEmailTemplate(id);
      toast.success('Template deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete template');
    }
  };

  const toggleTemplateStatus = async (template) => {
    try {
      await adminAPI.updateEmailTemplate({ 
        id: template.id, 
        is_active: !template.is_active 
      });
      toast.success(`Template ${template.is_active ? 'deactivated' : 'activated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update template status');
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !editingTemplate) {
      toast.error('Please enter an email address');
      return;
    }

    setSendingTest(true);
    try {
      await adminAPI.sendTestEmail(editingTemplate.id, testEmail);
      toast.success(`Test email sent to ${testEmail}`);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to send test email');
    } finally {
      setSendingTest(false);
    }
  };

  // Automation handlers
  const openAutomationModal = (automation = null) => {
    if (automation) {
      setEditingAutomation(automation);
      setAutomationForm({
        name: automation.name,
        description: automation.description || '',
        template_id: automation.template_id,
        trigger: automation.trigger,
        delay_hours: automation.delay_hours,
        repeat_interval_hours: automation.repeat_interval_hours,
        max_sends: automation.max_sends,
        is_active: automation.is_active,
      });
    } else {
      setEditingAutomation(null);
      setAutomationForm({
        name: '',
        description: '',
        template_id: templates[0]?.id || '',
        trigger: 'after_register',
        delay_hours: 0,
        repeat_interval_hours: 0,
        max_sends: 1,
        is_active: true,
      });
    }
    setShowAutomationModal(true);
  };

  const saveAutomation = async () => {
    if (!automationForm.name || !automationForm.template_id || !automationForm.trigger) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSavingAutomation(true);
    try {
      if (editingAutomation) {
        await adminAPI.updateEmailAutomation({ id: editingAutomation.id, ...automationForm });
        toast.success('Automation updated successfully');
      } else {
        await adminAPI.createEmailAutomation(automationForm);
        toast.success('Automation created successfully');
      }
      setShowAutomationModal(false);
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to save automation');
    } finally {
      setSavingAutomation(false);
    }
  };

  const toggleAutomation = async (automation) => {
    try {
      await adminAPI.updateEmailAutomation({ 
        id: automation.id, 
        is_active: !automation.is_active 
      });
      toast.success(`Automation ${automation.is_active ? 'paused' : 'activated'}`);
      fetchData();
    } catch (error) {
      toast.error('Failed to update automation');
    }
  };

  const deleteAutomation = async (id) => {
    if (!confirm('Are you sure you want to delete this automation?')) return;
    
    try {
      await adminAPI.deleteEmailAutomation(id);
      toast.success('Automation deleted');
      fetchData();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to delete automation');
    }
  };

  const formatTimeAgo = (date) => {
    if (!date) return 'Never';
    const now = new Date();
    const then = new Date(date);
    const diffMs = now - then;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const formatDelay = (hours) => {
    if (hours === 0) return 'Immediate';
    if (hours < 24) return `${hours}h`;
    return `${Math.floor(hours / 24)}d`;
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Email Automation</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage email templates and automated campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Templates</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.total_templates || 0}</p>
              </div>
              <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-xl">
                <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sent Today</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.sent_today || 0}</p>
              </div>
              <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-xl">
                <Send className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Sent This Week</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.sent_this_week || 0}</p>
              </div>
              <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-xl">
                <Mail className="h-6 w-6 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Active Automations</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{stats?.active_automations || 0}</p>
              </div>
              <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-xl">
                <Zap className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b dark:border-gray-700">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('templates')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'templates'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="inline-block h-5 w-5 mr-2" />
              Templates
            </button>
            <button
              onClick={() => setActiveTab('automations')}
              className={`px-4 py-3 font-medium border-b-2 transition ${
                activeTab === 'automations'
                  ? 'border-purple-600 text-purple-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              <Zap className="inline-block h-5 w-5 mr-2" />
              Automations
            </button>
          </nav>
        </div>

        {/* Templates Tab */}
        {activeTab === 'templates' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openTemplateModal()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <Plus size={18} />
                New Template
              </button>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Name</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Subject</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Used By</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 dark:text-gray-300 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y dark:divide-gray-700">
                  {templates.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                        No templates yet. Create your first template!
                      </td>
                    </tr>
                  ) : (
                    templates.map((template) => (
                      <tr key={template.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 dark:text-white">{template.display_name}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{template.name}</p>
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {template.subject}
                        </td>
                        <td className="px-4 py-4 text-sm text-gray-600 dark:text-gray-300">
                          {template.automations_count} automation{template.automations_count !== 1 ? 's' : ''}
                        </td>
                        <td className="px-4 py-4">
                          <button
                            onClick={() => toggleTemplateStatus(template)}
                            className={`${template.is_active ? 'text-green-500' : 'text-gray-400'}`}
                            title={template.is_active ? 'Click to deactivate' : 'Click to activate'}
                          >
                            {template.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                          </button>
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openTemplateModal(template)}
                              className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                              title="Edit"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => deleteTemplate(template.id)}
                              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                              title="Delete"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Automations Tab */}
        {activeTab === 'automations' && (
          <div className="space-y-4">
            <div className="flex justify-end">
              <button
                onClick={() => openAutomationModal()}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
                disabled={templates.length === 0}
              >
                <Plus size={18} />
                New Automation
              </button>
            </div>

            {templates.length === 0 && (
              <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 text-amber-800 dark:text-amber-300">
                Create at least one template before creating automations.
              </div>
            )}

            <div className="space-y-4">
              {automations.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 rounded-xl p-8 text-center text-gray-500 dark:text-gray-400 border dark:border-gray-700">
                  No automations yet. Create your first automation!
                </div>
              ) : (
                automations.map((automation) => (
                  <div key={automation.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border dark:border-gray-700 p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <button
                          onClick={() => toggleAutomation(automation)}
                          className={`mt-1 ${automation.is_active ? 'text-green-500' : 'text-gray-400'}`}
                          title={automation.is_active ? 'Click to pause' : 'Click to activate'}
                        >
                          {automation.is_active ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                        </button>
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                            {automation.name}
                          </h3>
                          {automation.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{automation.description}</p>
                          )}
                          <div className="flex flex-wrap gap-3 mt-3 text-sm text-gray-600 dark:text-gray-300">
                            <span className="flex items-center gap-1">
                              <FileText size={14} />
                              {automation.template_display_name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Zap size={14} />
                              {TRIGGERS.find(t => t.id === automation.trigger)?.name || automation.trigger}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={14} />
                              Delay: {formatDelay(automation.delay_hours)}
                            </span>
                            {automation.repeat_interval_hours > 0 && (
                              <span className="flex items-center gap-1">
                                <Repeat size={14} />
                                Every {formatDelay(automation.repeat_interval_hours)}
                              </span>
                            )}
                            <span className="flex items-center gap-1">
                              Max: {automation.max_sends === 0 ? '∞' : automation.max_sends}
                            </span>
                          </div>
                          <div className="flex gap-4 mt-3 text-xs text-gray-500 dark:text-gray-400">
                            <span>Total sent: {automation.total_sent}</span>
                            <span>Last run: {formatTimeAgo(automation.last_run_at)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => openAutomationModal(automation)}
                          className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => deleteAutomation(automation.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-800 px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingTemplate ? 'Edit Template' : 'New Template'}
              </h2>
              <button onClick={() => setShowTemplateModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Name (slug) *
                  </label>
                  <input
                    type="text"
                    value={templateForm.name}
                    onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                    placeholder="welcome_email"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    disabled={editingTemplate}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Display Name *
                  </label>
                  <input
                    type="text"
                    value={templateForm.display_name}
                    onChange={(e) => setTemplateForm({ ...templateForm, display_name: e.target.value })}
                    placeholder="Welcome Email"
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={templateForm.subject}
                  onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
                  placeholder="Welcome to Verified Homeowner! 🎉"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  HTML Content *
                </label>
                <textarea
                  value={templateForm.html_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, html_content: e.target.value })}
                  placeholder="<h1>Hey {{name}}!</h1><p>Welcome to Verified Homeowner...</p>"
                  rows={10}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Plain Text Content
                </label>
                <textarea
                  value={templateForm.text_content}
                  onChange={(e) => setTemplateForm({ ...templateForm, text_content: e.target.value })}
                  placeholder="Hey {{name}}! Welcome to Verified Homeowner..."
                  rows={4}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono text-sm"
                />
              </div>

              <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Available Variables:</p>
                <div className="flex flex-wrap gap-2">
                  {AVAILABLE_VARIABLES.map((v) => (
                    <code key={v} className="px-2 py-1 bg-gray-200 dark:bg-gray-600 rounded text-xs text-gray-700 dark:text-gray-300">
                      {v}
                    </code>
                  ))}
                </div>
              </div>

              {/* Test Send Section */}
              {editingTemplate && (
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">Send Test Email</p>
                  <div className="flex gap-2">
                    <input
                      type="email"
                      value={testEmail}
                      onChange={(e) => setTestEmail(e.target.value)}
                      placeholder="test@example.com"
                      className="flex-1 px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    />
                    <button
                      onClick={sendTestEmail}
                      disabled={sendingTest || !testEmail}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition"
                    >
                      {sendingTest ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                      Send Test
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="sticky bottom-0 bg-white dark:bg-gray-800 px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveTemplate}
                disabled={savingTemplate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {savingTemplate ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Automation Modal */}
      {showAutomationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-lg">
            <div className="px-6 py-4 border-b dark:border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                {editingAutomation ? 'Edit Automation' : 'New Automation'}
              </h2>
              <button onClick={() => setShowAutomationModal(false)} className="text-gray-500 hover:text-gray-700">
                <X size={24} />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Automation Name *
                </label>
                <input
                  type="text"
                  value={automationForm.name}
                  onChange={(e) => setAutomationForm({ ...automationForm, name: e.target.value })}
                  placeholder="Welcome Email"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={automationForm.description}
                  onChange={(e) => setAutomationForm({ ...automationForm, description: e.target.value })}
                  placeholder="Sends welcome email to new users"
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Email Template *
                </label>
                <select
                  value={automationForm.template_id}
                  onChange={(e) => setAutomationForm({ ...automationForm, template_id: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="">Select a template</option>
                  {templates.map((t) => (
                    <option key={t.id} value={t.id}>{t.display_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Trigger *
                </label>
                <select
                  value={automationForm.trigger}
                  onChange={(e) => setAutomationForm({ ...automationForm, trigger: e.target.value })}
                  className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {TRIGGERS.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {TRIGGERS.find(t => t.id === automationForm.trigger)?.description}
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Delay (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={automationForm.delay_hours}
                    onChange={(e) => setAutomationForm({ ...automationForm, delay_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Repeat (hours)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={automationForm.repeat_interval_hours}
                    onChange={(e) => setAutomationForm({ ...automationForm, repeat_interval_hours: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = no repeat</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Max Sends
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={automationForm.max_sends}
                    onChange={(e) => setAutomationForm({ ...automationForm, max_sends: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                  <p className="text-xs text-gray-500 mt-1">0 = unlimited</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={automationForm.is_active}
                  onChange={(e) => setAutomationForm({ ...automationForm, is_active: e.target.checked })}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <label htmlFor="is_active" className="text-sm text-gray-700 dark:text-gray-300">
                  Active (automation will run)
                </label>
              </div>
            </div>

            <div className="px-6 py-4 border-t dark:border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => setShowAutomationModal(false)}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={saveAutomation}
                disabled={savingAutomation}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50"
              >
                {savingAutomation ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                {editingAutomation ? 'Update Automation' : 'Create Automation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}
