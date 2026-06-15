import { useEffect, useState } from 'react'
import { ArrowLeft, ExternalLink, X } from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { getPost, listPosts } from '../../content/registry'
import './LearnDrawer.css'

interface Props {
  open: boolean
  onClose: () => void
}

const LearnDrawer = ({ open, onClose }: Props) => {
  const [activeId, setActiveId] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null

  const posts = listPosts()
  const post = activeId ? getPost(activeId) : null

  return (
    <>
      <div
        className="ul-learn__backdrop"
        onClick={onClose}
        role="presentation"
        data-testid="ul-learn-backdrop"
      />
      <aside
        className="ul-learn"
        role="dialog"
        aria-label="Learn"
        data-testid="ul-learn"
      >
        <div className="ul-learn__header">
          {post ? (
            <button
              type="button"
              className="ul-learn__back"
              onClick={() => setActiveId(null)}
              data-testid="ul-learn-back"
            >
              <ArrowLeft size={14} /> All posts
            </button>
          ) : (
            <h2 className="ul-learn__title">Learn</h2>
          )}
          <button
            type="button"
            className="ul-learn__close"
            onClick={onClose}
            aria-label="Close learn drawer"
          >
            <X size={16} />
          </button>
        </div>

        <div className="ul-learn__body">
          {post ? (
            <article className="ul-learn__post" data-testid={`ul-learn-post-${post.id}`}>
              <ReactMarkdown
                components={{
                  a: ({ href, children, ...rest }) => (
                    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
                      {children}
                    </a>
                  ),
                }}
              >
                {post.body}
              </ReactMarkdown>
              {post.source && (
                <a
                  className="ul-learn__source"
                  href={post.source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink size={14} />
                  Source: {post.source.label}
                </a>
              )}
            </article>
          ) : (
            <div className="ul-learn__list" role="list">
              {posts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  role="listitem"
                  className="ul-learn__card"
                  onClick={() => setActiveId(p.id)}
                  data-testid={`ul-learn-card-${p.id}`}
                >
                  <h3 className="ul-learn__card-title">{p.title}</h3>
                  <p className="ul-learn__card-summary">{p.summary}</p>
                  <div className="ul-learn__card-meta">
                    <span>Updated {p.updatedAt}</span>
                    {p.tags.map((t) => (
                      <span key={t} className="ul-learn__tag">
                        {t}
                      </span>
                    ))}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </aside>
    </>
  )
}

export default LearnDrawer
