import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { 
  Calendar, Clock, Tag, ArrowLeft, ArrowRight, Share2, 
  Facebook, Twitter, Linkedin, Copy, Check, FileText
} from 'lucide-react';
import axios from 'axios';

export default function BlogPost() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    fetchPost();
  }, [slug]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching blog post with slug:', slug);
      const { data } = await axios.get(`/api/blog/${slug}`);
      console.log('Blog post data:', data);
      setPost(data.post);
      setRelatedPosts(data.relatedPosts || []);
    } catch (error) {
      console.error('Failed to fetch post:', error);
      console.error('Error response:', error.response);
      console.error('Error status:', error.response?.status);
      console.error('Error data:', error.response?.data);
      if (error.response?.status === 404) {
        setError('Post not found');
      } else if (error.response?.status === 400) {
        setError('Invalid request: ' + (error.response?.data?.error || 'Bad request'));
      } else if (error.response?.status === 500) {
        setError('Server error: ' + (error.response?.data?.error || 'Internal server error'));
      } else {
        setError('Failed to load post: ' + (error.message || 'Unknown error'));
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateReadTime = (content) => {
    if (!content) return 1;
    const text = content.replace(/<[^>]*>/g, '');
    const words = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil(words / 200));
  };

  const handleShare = (platform) => {
    const url = window.location.href;
    const title = post?.title || '';
    
    const shareUrls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    };

    if (shareUrls[platform]) {
      window.open(shareUrls[platform], '_blank', 'width=600,height=400');
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse">
              <div className="bg-gray-200 h-8 w-32 rounded mb-4"></div>
              <div className="bg-gray-200 h-12 rounded mb-4"></div>
              <div className="bg-gray-200 h-6 w-48 rounded mb-8"></div>
              <div className="bg-gray-200 h-64 rounded-xl mb-8"></div>
              <div className="space-y-4">
                <div className="bg-gray-200 h-4 rounded"></div>
                <div className="bg-gray-200 h-4 rounded w-5/6"></div>
                <div className="bg-gray-200 h-4 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <div className="pt-24 pb-16 px-4">
          <div className="max-w-3xl mx-auto text-center py-16">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{error || 'Post not found'}</h1>
            <p className="text-gray-600 mb-6">
              The blog post you're looking for doesn't exist or has been removed.
            </p>
            <Link
              to="/blog"
              className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>{post?.title || 'Blog Post'} - Verified Homeowner Blog</title>
        <meta name="description" content={post?.excerpt || post?.title || ''} />
        <meta property="og:title" content={post?.title || ''} />
        <meta property="og:description" content={post?.excerpt || post?.title || ''} />
        {post?.bannerImage && <meta property="og:image" content={post.bannerImage} />}
        <meta property="og:type" content="article" />
        <meta property="article:published_time" content={post?.publishedAt || ''} />
        {post?.category && <meta property="article:section" content={post.category} />}
      </Helmet>

      <Navbar />

      {/* Article */}
      <article className="pt-24 pb-16">
        {/* Header */}
        <header className="max-w-3xl mx-auto px-4 mb-8">
          {/* Back link */}
          <Link
            to="/blog"
            className="inline-flex items-center text-gray-600 hover:text-blue-600 mb-6 transition"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Link>

          {/* Category */}
          {post?.category && (
            <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-4">
              {post.category}
            </span>
          )}

          {/* Title */}
          <h1 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4 leading-tight">
            {post?.title}
          </h1>

          {/* Meta */}
          <div className="flex flex-wrap items-center gap-4 text-gray-500 mb-6">
            <span className="flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              {post?.publishedAt ? formatDate(post.publishedAt) : ''}
            </span>
            <span className="flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              {calculateReadTime(post?.content)} min read
            </span>
          </div>

          {/* Tags */}
          {post?.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm"
                >
                  <Tag className="w-3 h-3 mr-1" />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        {/* Banner Image */}
        {post?.bannerImage && (
          <div className="max-w-4xl mx-auto px-4 mb-12">
            <img
              src={post.bannerImage}
              alt={post?.title || ''}
              className="w-full h-auto rounded-2xl shadow-lg"
            />
          </div>
        )}

        {/* Content */}
        <div className="max-w-3xl mx-auto px-4">
          <div 
            className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900 prose-img:rounded-xl"
            dangerouslySetInnerHTML={{ __html: post?.content || '' }}
          />
        </div>

        {/* Share */}
        <div className="max-w-3xl mx-auto px-4 mt-12 pt-8 border-t border-gray-200">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <span className="text-gray-600 font-medium flex items-center">
              <Share2 className="w-4 h-4 mr-2" />
              Share this article
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleShare('facebook')}
                className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                title="Share on Facebook"
              >
                <Facebook className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('twitter')}
                className="p-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition"
                title="Share on Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => handleShare('linkedin')}
                className="p-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition"
                title="Share on LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={handleCopyLink}
                className="p-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition"
                title="Copy link"
              >
                {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map(relatedPost => (
                <Link
                  key={relatedPost.id}
                  to={`/blog/${relatedPost.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all">
                    <div className="h-40 overflow-hidden bg-gray-100">
                      {relatedPost.bannerImage ? (
                        <img
                          src={relatedPost.bannerImage}
                          alt={relatedPost.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
                          <FileText className="w-10 h-10 text-blue-400" />
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-gray-500 mt-2">
                        {formatDate(relatedPost.publishedAt)}
                      </p>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 px-4 bg-gradient-to-r from-blue-700 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Get Verified Homeowner Leads?
          </h2>
          <p className="text-blue-100 mb-8">
            Join hundreds of wholesalers who close more deals with our verified leads.
          </p>
          <Link
            to="/register"
            className="inline-flex items-center bg-orange-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-orange-600 transition shadow-lg"
          >
            Start Free Trial
            <ArrowRight className="ml-2 w-5 h-5" />
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
