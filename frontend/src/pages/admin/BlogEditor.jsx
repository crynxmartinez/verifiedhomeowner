import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import Layout from '../../components/Layout';
import { 
  ArrowLeft, Save, Send, Clock, Image, X, Eye, Calendar,
  FileText, Tag, Loader2
} from 'lucide-react';
import { adminAPI } from '../../lib/api';

const CATEGORIES = [
  'Tips & Tricks',
  'Industry News',
  'Success Stories',
  'Product Updates',
  'Market Insights',
  'How-To Guides',
];

export default function BlogEditor() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [post, setPost] = useState({
    title: '',
    excerpt: '',
    content: '',
    bannerImage: '',
    category: '',
    tags: [],
    status: 'draft',
    scheduledAt: '',
  });
  const [tagInput, setTagInput] = useState('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('09:00');
  const [previewMode, setPreviewMode] = useState(false);

  // Quill editor modules
  const modules = useMemo(() => ({
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      ['blockquote', 'code-block'],
      ['link', 'image'],
      [{ 'align': [] }],
      ['clean']
    ],
  }), []);

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike',
    'list', 'bullet',
    'blockquote', 'code-block',
    'link', 'image',
    'align'
  ];

  useEffect(() => {
    if (isEditing) {
      fetchPost();
    }
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const { data } = await adminAPI.get(`/blog/${id}`);
      const fetchedPost = data.post;
      setPost({
        title: fetchedPost.title || '',
        excerpt: fetchedPost.excerpt || '',
        content: fetchedPost.content || '',
        bannerImage: fetchedPost.bannerImage || '',
        category: fetchedPost.category || '',
        tags: fetchedPost.tags || [],
        status: fetchedPost.status || 'draft',
        scheduledAt: fetchedPost.scheduledAt || '',
      });
      if (fetchedPost.scheduledAt) {
        const date = new Date(fetchedPost.scheduledAt);
        setScheduleDate(date.toISOString().split('T')[0]);
        setScheduleTime(date.toTimeString().slice(0, 5));
      }
    } catch (error) {
      console.error('Failed to fetch post:', error);
      alert('Failed to load post');
      navigate('/admin/blog');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (newStatus = null) => {
    if (!post.title.trim()) {
      alert('Title is required');
      return;
    }
    if (!post.content.trim()) {
      alert('Content is required');
      return;
    }

    try {
      setSaving(true);
      const payload = {
        ...post,
        status: newStatus || post.status,
      };

      if (isEditing) {
        payload.id = id;
        await adminAPI.patch('/blog', payload);
      } else {
        await adminAPI.post('/blog', payload);
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Failed to save post:', error);
      alert(error.response?.data?.error || 'Failed to save post');
    } finally {
      setSaving(false);
    }
  };

  const handleSchedule = async () => {
    if (!scheduleDate || !scheduleTime) {
      alert('Please select date and time');
      return;
    }

    const scheduledAt = new Date(`${scheduleDate}T${scheduleTime}`);
    if (scheduledAt <= new Date()) {
      alert('Scheduled date must be in the future');
      return;
    }

    setPost(prev => ({ ...prev, scheduledAt: scheduledAt.toISOString() }));
    setShowScheduleModal(false);
    
    // Save with scheduled status
    try {
      setSaving(true);
      const payload = {
        ...post,
        status: 'scheduled',
        scheduledAt: scheduledAt.toISOString(),
      };

      if (isEditing) {
        payload.id = id;
        await adminAPI.patch('/blog', payload);
      } else {
        await adminAPI.post('/blog', payload);
      }

      navigate('/admin/blog');
    } catch (error) {
      console.error('Failed to schedule post:', error);
      alert(error.response?.data?.error || 'Failed to schedule post');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTag = (e) => {
    e.preventDefault();
    if (tagInput.trim() && !post.tags.includes(tagInput.trim())) {
      setPost(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setPost(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tagToRemove) }));
  };

  // Calculate reading time
  const readingTime = useMemo(() => {
    const text = post.content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    const minutes = Math.ceil(words / 200);
    return minutes;
  }, [post.content]);

  if (loading) {
    return (
      <Layout role="admin">
        <div className="flex items-center justify-center min-h-screen">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout role="admin">
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/admin/blog')}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {isEditing ? 'Edit Post' : 'New Post'}
                </h1>
                <p className="text-sm text-gray-500">
                  {readingTime} min read • {post.status === 'draft' ? 'Draft' : post.status === 'scheduled' ? 'Scheduled' : 'Published'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPreviewMode(!previewMode)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                  previewMode
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <Eye className="w-4 h-4 inline mr-1" />
                Preview
              </button>
              <button
                onClick={() => handleSave('draft')}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <Save className="w-4 h-4 inline mr-1" />
                Save Draft
              </button>
              <button
                onClick={() => setShowScheduleModal(true)}
                disabled={saving}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg text-sm font-medium transition disabled:opacity-50"
              >
                <Clock className="w-4 h-4 inline mr-1" />
                Schedule
              </button>
              <button
                onClick={() => handleSave('published')}
                disabled={saving}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 inline mr-1 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 inline mr-1" />
                )}
                Publish
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Editor */}
            <div className="lg:col-span-2 space-y-6">
              {/* Title */}
              <div>
                <input
                  type="text"
                  placeholder="Post title..."
                  value={post.title}
                  onChange={(e) => setPost(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent focus:border-blue-500 focus:ring-0 text-gray-900 dark:text-white placeholder-gray-400 pb-4"
                />
              </div>

              {/* Excerpt */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Excerpt (optional)
                </label>
                <textarea
                  placeholder="Brief description for previews..."
                  value={post.excerpt}
                  onChange={(e) => setPost(prev => ({ ...prev, excerpt: e.target.value }))}
                  rows={2}
                  maxLength={300}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                />
                <p className="text-xs text-gray-500 mt-1">{post.excerpt.length}/300</p>
              </div>

              {/* Rich Text Editor */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Content
                </label>
                {previewMode ? (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-6 min-h-[400px]">
                    <div 
                      className="prose dark:prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                  </div>
                ) : (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
                    <ReactQuill
                      theme="snow"
                      value={post.content}
                      onChange={(content) => setPost(prev => ({ ...prev, content }))}
                      modules={modules}
                      formats={formats}
                      placeholder="Write your blog post content here..."
                      className="h-[400px]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Banner Image */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Image className="w-4 h-4 inline mr-2" />
                  Banner Image
                </label>
                {post.bannerImage ? (
                  <div className="relative">
                    <img
                      src={post.bannerImage}
                      alt="Banner preview"
                      className="w-full h-40 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => setPost(prev => ({ ...prev, bannerImage: '' }))}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                    <Image className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Paste image URL below</p>
                  </div>
                )}
                <input
                  type="url"
                  placeholder="https://example.com/image.jpg"
                  value={post.bannerImage}
                  onChange={(e) => setPost(prev => ({ ...prev, bannerImage: e.target.value }))}
                  className="w-full mt-3 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {/* Category */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <FileText className="w-4 h-4 inline mr-2" />
                  Category
                </label>
                <select
                  value={post.category}
                  onChange={(e) => setPost(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select category</option>
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              {/* Tags */}
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  <Tag className="w-4 h-4 inline mr-2" />
                  Tags
                </label>
                <form onSubmit={handleAddTag} className="flex gap-2 mb-3">
                  <input
                    type="text"
                    placeholder="Add tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition"
                  >
                    Add
                  </button>
                </form>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        onClick={() => handleRemoveTag(tag)}
                        className="ml-1.5 hover:text-blue-900 dark:hover:text-blue-200"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Schedule Info */}
              {post.status === 'scheduled' && post.scheduledAt && (
                <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl border border-yellow-200 dark:border-yellow-800 p-4">
                  <div className="flex items-center gap-2 text-yellow-800 dark:text-yellow-400">
                    <Calendar className="w-5 h-5" />
                    <span className="font-medium">Scheduled</span>
                  </div>
                  <p className="text-sm text-yellow-700 dark:text-yellow-500 mt-2">
                    {new Date(post.scheduledAt).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Schedule Modal */}
        {showScheduleModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-xl max-w-md w-full p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                <Calendar className="w-5 h-5 inline mr-2" />
                Schedule Post
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date
                  </label>
                  <input
                    type="date"
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Time
                  </label>
                  <input
                    type="time"
                    value={scheduleTime}
                    onChange={(e) => setScheduleTime(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <p className="text-sm text-gray-500">
                  Post will be published automatically at the scheduled time.
                </p>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowScheduleModal(false)}
                  className="px-4 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSchedule}
                  disabled={saving}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {saving ? 'Scheduling...' : 'Schedule Post'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Custom styles for Quill */}
      <style>{`
        .ql-container {
          font-size: 16px;
          min-height: 350px;
        }
        .ql-editor {
          min-height: 350px;
        }
        .dark .ql-toolbar {
          border-color: #374151;
          background: #1f2937;
        }
        .dark .ql-container {
          border-color: #374151;
          background: #1f2937;
        }
        .dark .ql-editor {
          color: #fff;
        }
        .dark .ql-editor.ql-blank::before {
          color: #9ca3af;
        }
        .dark .ql-stroke {
          stroke: #9ca3af;
        }
        .dark .ql-fill {
          fill: #9ca3af;
        }
        .dark .ql-picker-label {
          color: #9ca3af;
        }
        .dark .ql-picker-options {
          background: #374151;
          border-color: #4b5563;
        }
        .dark .ql-picker-item {
          color: #d1d5db;
        }
        .dark .ql-picker-item:hover {
          color: #fff;
        }
      `}</style>
    </Layout>
  );
}
