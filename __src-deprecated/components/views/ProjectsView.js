'use client';

import { useState } from 'react';
import { Presentation, Search, Plus, Folder, Calendar, Image } from 'lucide-react';

export default function ProjectsView() {
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: 'Fantasy Characters',
      description: 'Character design exploration',
      images: 127,
      lastModified: '2 hours ago',
      thumbnail: null
    },
    {
      id: 2,
      name: 'Landscape Studies',
      description: 'Nature and environment concepts',
      images: 84,
      lastModified: '1 day ago',
      thumbnail: null
    },
    {
      id: 3,
      name: 'Product Renders',
      description: 'Commercial product visualization',
      images: 45,
      lastModified: '3 days ago',
      thumbnail: null
    }
  ]);

  return (
    <div className="view-container">
      <div className="view-header">
        <div className="view-title">
          <Presentation size={28} />
          <h1>Projects</h1>
          <span className="count">{projects.length}</span>
        </div>
        <div className="header-actions">
          <div className="search-box">
            <Search size={16} />
            <input type="text" placeholder="Search projects..." />
          </div>
          <button className="btn-primary">
            <Plus size={18} />
            New Project
          </button>
        </div>
      </div>

      <div className="view-content">
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className="project-card">
              <div className="project-thumbnail">
                {project.thumbnail ? (
                  <img src={project.thumbnail} alt={project.name} />
                ) : (
                  <div className="thumbnail-placeholder">
                    <Folder size={48} />
                  </div>
                )}
                <div className="image-count">
                  <Image size={14} />
                  {project.images}
                </div>
              </div>
              <div className="project-info">
                <h3>{project.name}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-meta">
                  <Calendar size={14} />
                  {project.lastModified}
                </div>
              </div>
            </div>
          ))}

          <div className="project-card add-project">
            <Plus size={48} />
            <p>Create New Project</p>
          </div>
        </div>
      </div>

      <style jsx>{`
        .view-container {
          flex: 1;
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        .view-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid #e0e0e0;
        }

        .view-title {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .view-title h1 {
          margin: 0;
          font-size: 24px;
          font-weight: 600;
        }

        .count {
          background: #f0f0f0;
          padding: 4px 12px;
          border-radius: 12px;
          font-size: 14px;
          font-weight: 500;
          color: #666;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 16px;
          background: #f5f5f5;
          border: 1px solid #e0e0e0;
          border-radius: 6px;
        }

        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 200px;
          font-size: 14px;
        }

        .btn-primary {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 10px 20px;
          background: #ff5f57;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 14px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-primary:hover {
          background: #ff4540;
        }

        .view-content {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
        }

        .projects-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 24px;
        }

        .project-card {
          background: white;
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.2s;
          cursor: pointer;
        }

        .project-card:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          border-color: #ff5f57;
        }

        .project-card.add-project {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 280px;
          color: #999;
        }

        .project-card.add-project:hover {
          color: #ff5f57;
        }

        .project-card.add-project p {
          margin-top: 12px;
          font-size: 14px;
          font-weight: 500;
        }

        .project-thumbnail {
          width: 100%;
          height: 180px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          position: relative;
          overflow: hidden;
        }

        .thumbnail-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.8);
        }

        .project-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .image-count {
          position: absolute;
          top: 12px;
          right: 12px;
          background: rgba(0, 0, 0, 0.7);
          color: white;
          padding: 4px 10px;
          border-radius: 4px;
          font-size: 13px;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .project-info {
          padding: 20px;
        }

        .project-info h3 {
          margin: 0 0 8px 0;
          font-size: 17px;
          font-weight: 600;
        }

        .project-description {
          margin: 0 0 12px 0;
          font-size: 14px;
          color: #666;
          line-height: 1.4;
        }

        .project-meta {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #999;
        }
      `}</style>
    </div>
  );
}
