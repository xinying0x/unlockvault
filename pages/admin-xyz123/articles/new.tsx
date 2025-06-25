import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { useAuth } from '../../../hooks/useAuth';
import AdminLayout from '../../../components/AdminLayout';

const NewArticlePage = () => {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    summary: '',
    content: '',
    image: '',
    author: '',
    category: 'Android Games',
    tags: '',
    published: false
  });

  const categories = ['Android Games', 'Android Apps', 'iOS Software', 'How-to', 'Reviews', 'News'];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  const insertMarkdown = (syntax: string, placeholder: string = '') => {
    const textarea = document.getElementById('content') as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    const replacement = selectedText || placeholder;
    
    let newText = '';
    switch (syntax) {
      case 'bold':
        newText = `**${replacement}**`;
        break;
      case 'italic':
        newText = `*${replacement}*`;
        break;
      case 'heading1':
        newText = `# ${replacement}`;
        break;
      case 'heading2':
        newText = `## ${replacement}`;
        break;
      case 'heading3':
        newText = `### ${replacement}`;
        break;
      case 'link':
        newText = `[${replacement}](URL)`;
        break;
      case 'image':
        newText = `![${replacement}](IMAGE_URL)`;
        break;
      case 'code':
        newText = `\`${replacement}\``;
        break;
      case 'codeblock':
        newText = `\`\`\`\n${replacement}\n\`\`\``;
        break;
      case 'list':
        newText = `- ${replacement}`;
        break;
      case 'quote':
        newText = `> ${replacement}`;
        break;
      default:
        newText = replacement;
    }

    const newContent = textarea.value.substring(0, start) + newText + textarea.value.substring(end);
    setFormData(prev => ({ ...prev, content: newContent }));
    
    // Focus back to textarea
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + newText.length, start + newText.length);
    }, 0);
  };

  const convertMarkdownToHtml = (markdown: string) => {
    return markdown
      .replace(/^### (.*$)/gim, '<h3>$1</h3>')
      .replace(/^## (.*$)/gim, '<h2>$1</h2>')
      .replace(/^# (.*$)/gim, '<h1>$1</h1>')
      .replace(/\*\*(.*)\*\*/gim, '<strong>$1</strong>')
      .replace(/\*(.*)\*/gim, '<em>$1</em>')
      .replace(/!\[([^\]]*)\]\(([^)]*)\)/gim, '<img src="$2" alt="$1" style="max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0;" />')
      .replace(/\[([^\]]*)\]\(([^)]*)\)/gim, '<a href="$2" style="color: #a855f7; text-decoration: underline;">$1</a>')
      .replace(/`([^`]*)`/gim, '<code style="background-color: #374151; color: #f9fafb; padding: 2px 6px; border-radius: 4px; font-size: 14px;">$1</code>')
      .replace(/```([\s\S]*?)```/gim, '<pre style="background-color: #1f2937; color: #f9fafb; padding: 16px; border-radius: 8px; overflow-x: auto; margin: 16px 0;"><code>$1</code></pre>')
      .replace(/^- (.*$)/gim, '<li>$1</li>')
      .replace(/(<li>.*<\/li>)/gim, '<ul style="margin: 16px 0; padding-left: 32px;">$1</ul>')
      .replace(/^> (.*$)/gim, '<blockquote style="border-left: 4px solid #a855f7; padding-left: 16px; margin: 32px 0; font-style: italic; color: #d1d5db;">$1</blockquote>')
      .replace(/\n/gim, '<br>');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      
      const articleData = {
        ...formData,
        tags: tagsArray,
        content: convertMarkdownToHtml(formData.content)
      };

      console.log('Submitting article data:', articleData);

      const response = await fetch('/api/articles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(articleData),
      });

      const responseData = await response.json();
      console.log('API response:', responseData);

      if (response.ok) {
        alert('Article created successfully!');
        router.push('/admin-xyz123/articles');
      } else {
        console.error('Failed to create article:', responseData);
        const errorMessage = responseData.error || responseData.message || 'Unknown error';
        alert(`Failed to create article: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Error creating article:', error);
      alert(`Network error: Failed to create article. ${error instanceof Error ? error.message : 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-xl">Loading...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Head>
        <title>New Article | Admin</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Create New Article</h1>
            <p className="text-gray-400">Write and publish a new blog article</p>
          </div>
          <Link
            href="/admin-xyz123/articles"
            className="text-gray-400 hover:text-white transition-colors"
          >
            ← Back to Articles
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
            <h2 className="text-lg font-semibold text-white">Basic Information</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Article title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Author *</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Author name"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Category *</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Tags</label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="tag1, tag2, tag3"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Image URL *</label>
              <input
                type="url"
                name="image"
                value={formData.image}
                onChange={handleInputChange}
                required
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="https://example.com/image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Summary *</label>
              <textarea
                name="summary"
                value={formData.summary}
                onChange={handleInputChange}
                required
                rows={3}
                className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Brief summary of the article"
              />
            </div>
          </div>

          {/* Content Editor */}
          <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white">Content</h2>
              <button
                type="button"
                onClick={() => setPreviewMode(!previewMode)}
                className="px-4 py-2 bg-purple-600/20 text-purple-300 rounded-lg hover:bg-purple-600/30 transition-colors"
              >
                {previewMode ? 'Edit' : 'Preview'}
              </button>
            </div>

            {!previewMode && (
              <div className="space-y-4">
                {/* Toolbar */}
                <div className="flex flex-wrap gap-2 p-3 bg-gray-700/50 rounded-lg border border-gray-600/50">
                  <button type="button" onClick={() => insertMarkdown('bold', 'Bold text')} className="toolbar-btn">
                    <strong>B</strong>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('italic', 'Italic text')} className="toolbar-btn">
                    <em>I</em>
                  </button>
                  <button type="button" onClick={() => insertMarkdown('heading1', 'Heading 1')} className="toolbar-btn">
                    H1
                  </button>
                  <button type="button" onClick={() => insertMarkdown('heading2', 'Heading 2')} className="toolbar-btn">
                    H2
                  </button>
                  <button type="button" onClick={() => insertMarkdown('heading3', 'Heading 3')} className="toolbar-btn">
                    H3
                  </button>
                  <button type="button" onClick={() => insertMarkdown('link', 'Link text')} className="toolbar-btn">
                    🔗
                  </button>
                  <button type="button" onClick={() => insertMarkdown('image', 'Alt text')} className="toolbar-btn">
                    🖼️
                  </button>
                  <button type="button" onClick={() => insertMarkdown('code', 'code')} className="toolbar-btn">
                    &lt;/&gt;
                  </button>
                  <button type="button" onClick={() => insertMarkdown('list', 'List item')} className="toolbar-btn">
                    📝
                  </button>
                  <button type="button" onClick={() => insertMarkdown('quote', 'Quote text')} className="toolbar-btn">
                    💬
                  </button>
                </div>

                <textarea
                  id="content"
                  name="content"
                  value={formData.content}
                  onChange={handleInputChange}
                  required
                  rows={20}
                  className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-mono"
                  placeholder="Write your article content here using Markdown..."
                />
              </div>
            )}

            {previewMode && (
              <div className="bg-gray-700/30 rounded-lg p-6 border border-gray-600/30 min-h-96">
                <div 
                  className="prose prose-lg prose-invert max-w-none"
                  dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(formData.content) }}
                />
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between">
            <div className="flex items-center">
              <label className="flex items-center gap-2 text-gray-300">
                <input
                  type="checkbox"
                  name="published"
                  checked={formData.published}
                  onChange={handleInputChange}
                  className="rounded border-gray-600 bg-gray-700 text-purple-600 focus:ring-purple-500"
                />
                Publish immediately
              </label>
            </div>

            <div className="flex gap-4">
              <Link
                href="/admin-xyz123/articles"
                className="px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-300 disabled:opacity-50"
              >
                {loading ? 'Creating...' : (formData.published ? 'Publish Article' : 'Save Draft')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <style jsx>{`
        .toolbar-btn {
          padding: 8px 12px;
          background-color: rgba(75, 85, 99, 0.5);
          color: #d1d5db;
          border: 1px solid rgba(107, 114, 128, 0.3);
          border-radius: 6px;
          transition: all 0.2s;
          font-size: 14px;
          min-width: 40px;
        }
        .toolbar-btn:hover {
          background-color: rgba(107, 114, 128, 0.5);
          color: #ffffff;
        }
        .prose {
          color: #e5e7eb;
        }
        .prose h1, .prose h2, .prose h3 {
          color: #ffffff;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
        }
        .prose p {
          margin-bottom: 1.5rem;
          line-height: 1.7;
        }
        .prose strong {
          color: #ffffff;
          font-weight: 600;
        }
      `}</style>
    </AdminLayout>
  );
};

export default NewArticlePage; 